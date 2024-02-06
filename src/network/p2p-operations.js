import { createLibp2p } from 'libp2p'
import { createHelia } from "helia";
import {createOrbitDB, OrbitDBAccessController, useAccessController} from '@orbitdb/core';
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers'
import { config } from "../config.js";
import {
    libp2p,
    helia,
    orbitdb,
    masterSeed,
    seedPhrase,
    identities,
    ourIdentity,
    myAddressBook,
    dbMyAddressBook,
    subscription,
    connectedPeers,
    handle,
    progressText,
    progressState,
    subscriberList, dbMessages, selectedTab, recordsSynced, synced, syncedDevices, addressRecordsSynced,
} from "../stores.js";

import AddressBookAccessController from "./AddressBookAccessController.js"
import { confirm } from "../lib/components/modal.js"
import { generateSeed, ENTER_EXISTING, GENERATE_NEW } from "../lib/components/seedModal.js"
import { convertTo32BitSeed, generateMasterSeed, notify, sha256 } from "../utils/utils.js";
import createIdentityProvider from "./identityProvider.js";
import { generateMnemonic } from "bip39";


let blockstore = new LevelBlockstore("./helia-blocks")
let datastore = new LevelDatastore("./helia-data")

// export const CONTENT_TOPIC = "/dContact/3/message/proto";

const FIND_HANDLE = 'FIND_HANDLE';
const SEND_ADDRESS_REQUEST = 'SEND_ADDRESS_REQUEST';
const RECEIVE_ADDRESS = 'RECEIVE_ADDRESS';

export const getIdentityAndCreateOrbitDB = async (_type, _seed, _helia) => {
    const identitySeed = convertTo32BitSeed(_seed)
    const idProvider = await createIdentityProvider(_type, identitySeed, _helia)
    _ourIdentity = idProvider.identity
    _identities = idProvider.identities
    ourIdentity.set(_ourIdentity)
    window.identity = _ourIdentity

    _orbitdb = await createOrbitDB({
        ipfs: _helia,
        identity: _ourIdentity,
        identities: _identities,
        directory: './deContact' })
    orbitdb.set(_orbitdb)
    window.orbitdb = _orbitdb
}

async function fetchTransformAndSetAddressRecords() {
    try {
        const addressRecords = await _dbMyAddressBook.all();
        const transformedRecords = addressRecords.map(record => ({
            ...record.value,
            id: record.value._id
        }));
        myAddressBook.set(transformedRecords);
        console.log("records in dbMyAddressBook ",addressRecords)
    } catch (e) {
        console.log("something isn't yet correctly setup inside dbMessages")
    }
}

async function fetchTransformAndSetMessageRecords() {
    try {
        const msgRecords = await _dbMessages.all();
        const transformedRecords = msgRecords.map(record => ({
            ...record.value,
            id: record.value._id
        }));
        recordsSynced.set(transformedRecords)
        console.log("recordsSynced",transformedRecords)
    } catch (e) {
        console.log("something isn't yet correctly setup inside dbMessages")
    }
}

export async function startNetwork() {

    if(!localStorage.getItem("testConfirmation")){
        const result = await confirm({ data: {
                text: "Note: This is still experimental software. " +
                    "This peer-to-peer only progressive web app (PWA) is not (yet) intended for use in production environments " +
                    "or for use where real money or real contact data are at stake! \n" +
                    "Please contact developers for questions. " } })
        if(result===true) localStorage.setItem("testConfirmation",result)
    }

    if(!localStorage.getItem("seedPhrase")){
        const result = await generateSeed({ data: {
                text: "We couldn't find a master seed phrase inside your browser storage. " +
                    "Do you want to generate a new master seed phrase? Or maybe you have an existing one?"} })

        switch (result) {
            case ENTER_EXISTING:
                notify("enter existing masterSeed phrase in settings please!")
                selectedTab.set(2)
                break;
            case GENERATE_NEW:
                _seedPhrase = generateMnemonic();
                seedPhrase.set(_seedPhrase)
                selectedTab.set(2)
                notify(`generated a new seed phrase ${_seedPhrase}`)
                break;
        }
        masterSeed.set(_masterSeed)
    }
    _masterSeed = generateMasterSeed(_seedPhrase,"password")
    masterSeed.set(_masterSeed)
    progressText.set("starting libp2p node")
    progressState.set(1)
    _libp2p =  await createLibp2p(config)
    libp2p.set(_libp2p)

    progressText.set("starting Helia (IPFS) node")
    progressState.set(2)
    _helia = await createHelia({
        libp2p: _libp2p,
        blockstore,
        datastore,
        blockBrokers: [bitswap()]
    });
    helia.set(_helia)
    window.helia = _helia

    progressText.set("creating Identity and starting OrbitDB")
    const identitySeed = convertTo32BitSeed(_masterSeed)
    console.log("identitySeed",identitySeed)
    await getIdentityAndCreateOrbitDB('ed25519',identitySeed,_helia)
    progressState.set(3)

    progressText.set("subscribing to pub sub topic")
    // _libp2p.services.pubsub.subscribe(CONTENT_TOPIC)
    progressState.set(4)

    _libp2p.addEventListener('connection:open',  async (c) => {
        console.log("connection:open",c.detail.remoteAddr.toString())
        connectedPeers.update(n => n + 1);

        if(_connectedPeers>1) {
                await fetchTransformAndSetAddressRecords();
                progressState.set(6)
        }
    });

    _libp2p.addEventListener('connection:close', (c) => {
        console.log("connection:close",c.detail.id)
        connectedPeers.update(n => n - 1);
    });
    progressText.set(`opening peer-to-peer storage protocol`)

    useAccessController(AddressBookAccessController)
    _dbMessages = await _orbitdb.open("dbMessages", {
        type: 'documents',
        sync: true,
        identities: _identities,
        identity: _ourIdentity,
        AccessController: AddressBookAccessController(_orbitdb, _identities, _subscriberList) //this should be almost same as OrbitDBAccessController but should use id's if me and all ids I am following (as soon as Alice receives Bobs contact data, his data will be added to the log) (this happens in the moment alice allows it by buton click)
    })
    dbMessages.set(_dbMessages)
    window.dbMessages = _dbMessages

    await fetchTransformAndSetMessageRecords()

    useAccessController(OrbitDBAccessController)
    const myDBName = await sha256(_orbitdb.identity.id)
    _dbMyAddressBook = await _orbitdb.open("/myAddressBook/"+myDBName, {
        type: 'documents',
        sync: true,
        identities: _identities,
        identity: _ourIdentity,
        AccessController: OrbitDBAccessController({ write: [_orbitdb.identity.id]})
    })
    window.dbMyAddressBook = _dbMyAddressBook
    const addressRecords = await _dbMyAddressBook.all()
    myAddressBook.set(addressRecords.map(record => ({
        ...record.value,
        id: record.value._id
    })))

    console.log("_dbMyAddressBook",_dbMyAddressBook)
    dbMyAddressBook.set(_dbMyAddressBook)
    window.dbMyAddresses = _dbMyAddressBook

    _dbMyAddressBook.events.on('join', async (peerId, heads) => {
        console.log("one of my devices joined and synced myaddressbook",peerId)
        syncedDevices.set(true)
        fetchTransformAndSetAddressRecords()
    })

    _dbMyAddressBook.events.on('update', async (entry) => {
        fetchTransformAndSetAddressRecords()
    })

    _dbMessages.events.on('join', async (peerId, heads) => {
        console.log("join storage protocol",peerId)
        synced.set(true)
        await fetchTransformAndSetMessageRecords()
    })

    _dbMessages.events.on('update', async (entry) => {
        console.log("update",entry)
        const OP = entry.payload.op
        if(OP==="PUT"){ //we only handle PUT messages (no DEL) //TODO this should go into AccessController
            const message = entry.payload.value
            console.log("processing message of storage protocol via orbitdb",message)
            handleMessage(message)
        }
        // Full replication is achieved by explicitly retrieving all records from db1.
        const records = await _dbMessages.all()
        recordsSynced.set(records)
    })
    progressState.set(5)
}
async function handleMessage (messageObj) {
    if (!messageObj) return;
    if (messageObj.recipient === messageObj.sender) return;

    let result;
    if (messageObj.recipient === _orbitdb?.identity?.id){
        switch (messageObj.command) {
            case SEND_ADDRESS_REQUEST: //we received a SEND_ADDRESS_REQUEST and sending our address
                result = await confirm({data:messageObj})
                if(result){
                    const contact = _myAddressBook.find((entry) => entry.owner === _orbitdb?.identity?.id)
                    sendMyAddress(messageObj.sender,contact);
                    if(_subscriberList.indexOf(messageObj.sender)===-1)
                        _subscriberList.push(messageObj.sender)
                    console.log("_subscriberList",_subscriberList)
                    subscriberList.set(_subscriberList) //keep subscribers
                }
            break;
            case RECEIVE_ADDRESS: //we received an address and add it to our address book //TODO show address sender in modal
                result = await confirm({data:messageObj})
                if(result) {
                    updateAddressBook(messageObj);
                }
            break;
            default:
                console.error(`Unknown command: ${messageObj.command}`);
        }
    }
}

async function createMessage(command, recipient, data = null) {
    const message = {
        timestamp: Date.now(),
        command,
        sender: _orbitdb?.identity?.id,
        recipient,
        data: data ? JSON.stringify(data) : null,
    };
    message._id = await sha256(JSON.stringify(message));
    // message.publicKey = _ourIdentity.publicKey;
    return message;
}

export const sendAddress = async (identity, scannedAddress) => {
    try {
        console.log("request sendAddress from", _orbitdb?.identity?.id);
        const addr = await createMessage(SEND_ADDRESS_REQUEST, scannedAddress);
        const hash = await _dbMessages.put(addr);
        notify(`sent SEND_ADDRESS_REQUEST ${hash}`);
    } catch (error) {
        console.error('Error in sendAddress:', error);
    }
}

export async function sendMyAddress(recipient, data) {
    try {
        const myAddress = await createMessage(RECEIVE_ADDRESS, recipient, data);
        const hash = await _dbMessages.put(myAddress);
        notify(`sent RECEIVE_NEW_ADDRESS ${hash}`);
    } catch (error) {
        console.error('Error in sendMyAddress:', error);
    }
}

function updateAddressBook(messageObj) {
    const msg = messageObj
    const contactData = JSON.parse(messageObj.data);
    console.log("updating myAddressBook ",_myAddressBook)
    const newAddrBook = _myAddressBook.filter( el => el.id !== contactData.id )
    newAddrBook.push({
        id: contactData.id,
        firstName: contactData.firstName,
        middleName: contactData.middleName,
        lastName: contactData.lastName,
        organization: contactData.organization,
        workPhone: contactData.workPhone,
        birthday: contactData.birthday,
        title: contactData.title,
        url: contactData.url,
        note: contactData.note,
        street: contactData.street,
        city: contactData.city,
        stateProvince: contactData.stateProvince,
        postalCode: contactData.postalCode,
        countryRegion: contactData.countryRegion,
        timestamp: msg.timestamp,
        owner: msg.sender
    });
    const hash = _dbMyAddressBook.put(newAddrBook)
    notify(`address updated to local ipfs${hash}`)
}

let _libp2p;
libp2p.subscribe((val) => {
    _libp2p = val
});

let _helia;
helia.subscribe((val) => {
    _helia = val
});

let _orbitdb;
orbitdb.subscribe((val) => {
    _orbitdb = val
});

let _dbMessages;
dbMessages.subscribe((val) => {
    _dbMessages = val
});

let _dbMyAddressBook;
dbMyAddressBook.subscribe((val) => {
    _dbMyAddressBook = val
});

let _masterSeed;
masterSeed.subscribe((val) => {
    _masterSeed = val
});

let _seedPhrase;
seedPhrase.subscribe((val) => {
    _seedPhrase = val
});

let _ourIdentity;
ourIdentity.subscribe((val) => {
    _ourIdentity = val
});

let _identities;
identities.subscribe((val) => {
    _identities = val
});

let _subscription
subscription.subscribe((val) => {
    _subscription = val
});

let _handle
handle.subscribe((val) => {
    _handle = val
});
let _connectedPeers
connectedPeers.subscribe((val) => {
    _connectedPeers = val
});
let _myAddressBook
myAddressBook.subscribe((val) => {
    _myAddressBook = val
});

let _subscriberList
subscriberList.subscribe((val) => {
    _subscriberList = val
});

let _selectedTab
selectedTab.subscribe((val) => {
    _selectedTab = val
});