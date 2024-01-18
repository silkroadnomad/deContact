import { createLibp2p } from 'libp2p'
import { createHelia } from "helia";
import {createOrbitDB, Identities, KeyStore, useAccessController} from '@orbitdb/core';
import { fromString, toString } from 'uint8arrays';
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers'
import { config } from "../config.js";
import {
    libp2p,
    helia,
    orbitdb,
    identities,
    ourIdentity,
    myAddressBook,
    subscription,
    connectedPeers,
    identity,
    progressText,
    progressState,
    subscriberList, dbMessages,
} from "../stores.js";
import AddressBookAccessController from "./AddressBookAccessController.js"
import { confirm } from "../lib/components/modal.js"
import {notify, sha256} from "../utils/utils.js";

let blockstore = new LevelBlockstore("./helia-blocks")
let datastore = new LevelDatastore("./helia-data")

export const CONTENT_TOPIC = "/dContact/1/message/proto";
const SEND_ADDRESS_REQUEST = 'SEND_ADDRESS_REQUEST';
const RECEIVE_ADDRESS = 'RECEIVE_ADDRESS';

export async function startNetwork() {

    progressText.set("starting libp2p node")
    progressState.set(1)
    _libp2p =  await createLibp2p(config)
    libp2p.set(_libp2p)
    console.log("_libp2p",_libp2p)
    console.log("_libp2p",_libp2p.peerId.string)

    progressText.set("starting Helia (IPFS) node")
    _helia = await createHelia({
        libp2p: _libp2p,
        blockstore,
        datastore,
        blockBrokers: [bitswap()]
    });
    helia.set(_helia)
    progressState.set(2)
    window.helia = _helia

    progressText.set("creating OrbitDB")
    _orbitdb = await createOrbitDB({ ipfs: _helia, directory: './deContact' })
    orbitdb.set(_orbitdb)
    window.orbitdb = _orbitdb
    progressState.set(3)

    progressText.set("subscribing to pub sub topic")
    _libp2p.services.pubsub.subscribe(CONTENT_TOPIC)
    progressState.set(4)
    _libp2p.addEventListener('connection:open',  async (c) => {
        console.log("connection:open",c.detail.remoteAddr.toString())
        connectedPeers.update(n => n + 1);
        if(_connectedPeers>1) {
            console.log(await _dbMessages.all())
            progressState.set(6)
        }
    });
    _libp2p.addEventListener('connection:close', (c) => {
        console.log("connection:close",c.detail.id)
        connectedPeers.update(n => n - 1);
    });

    progressText.set(`opening peer-to-peer storage protocol`)
    const keysPath = './dContactKeys'
    const keystore = await KeyStore({ path: keysPath })
    _identities = await Identities({ keystore })
    identities.set(_identities)
    _ourIdentity = await _identities.createIdentity({ id: _handle })
    ourIdentity.set(_ourIdentity)
    useAccessController(AddressBookAccessController)
    _dbMessages = await _orbitdb.open("dbMessages",
        //"/orbitdb/zdpuAzWfv59XPddgxdmGxznmL24oiZ78RpJfAuA1fqFqodGLP",{//"dbMessages", {
        {
            type: 'documents',
        sync: true,
        identities: identities,
        identity: ourIdentity,
        AccessController: AddressBookAccessController( )
    }) //'dbMessages'
    console.log("_dbMessages",_dbMessages)
    dbMessages.set(_dbMessages)
    window.dbMessages = _dbMessages

    _dbMessages.events.on('join', async (peerId, heads) => {
        console.log("join",peerId)
        console.log(await _dbMessages.all())
    })

    _dbMessages.events.on('update', async (entry) => {
        console.log("update",entry)
        const OP = entry.payload.op
        if(OP==="PUT"){
            const message = entry.payload.value
            console.log("processing message of storage protocol via orbitdb",message)
            handleMessage(message)
        }
        // Full replication is achieved by explicitly retrieving all records from db1.
        console.log(await _dbMessages.all())
    })
    progressState.set(5)

    _libp2p.services.pubsub.addEventListener('message', event => {
        const topic = event.detail.topic
        const message = toString(event.detail.data)
        if(topic === 'dcontact._peer-discovery._p2p._pubsub') return //we don't do anything with other topics
        console.log(`Message received on topic '${topic}': ${message}`)
        handleMessage(message)
    })
}

async function handleMessage (dContactMessage) {
    console.log("message",dContactMessage   )
    if (!dContactMessage) return;
    let messageObj

    try { //pubsub receives a string
        messageObj = JSON.parse(dContactMessage)
    } catch (e) { //orbitdb has already a valid object
        messageObj = dContactMessage
    }

    let result
    if (messageObj.recipient === _handle){
        switch (messageObj.command) {
            case SEND_ADDRESS_REQUEST: //we received a SEND_ADDRESS_REQUEST and sending our address //TODO verify signature with public key
                result = await confirm({data:messageObj})
                if(result){
                    const contact =  _myAddressBook.find((entry) => entry.owner === _handle) //TODO check if requester (Alice) was sending her own data
                    sendMyAddress(messageObj.sender,contact);
                    if(_subscriberList.indexOf(messageObj.sender)===-1)
                        _subscriberList.push(messageObj.sender)
                    console.log("_subscriberList",_subscriberList)
                    subscriberList.set(_subscriberList) //keep subscribers
                }else{
                    //TODO send "rejected sending address"
                }
            break;
            case RECEIVE_ADDRESS: //we received an address and add it to our address book //TODO show address sender in modal & verify signature with his pubic key
                result = await confirm({data:messageObj})
                if(result) {
                    updateAddressBook(messageObj);
                }
                else {  //TODO respond with something?
                     }
            break;
            default:
                console.error(`Unknown command: ${messageObj.command}`);
        }
    }
}

/**
 * In case somebody requests my contact data or I update my address I'll send it to requester / subscriber
 * @param recipient
 * @param data
 * @returns {Promise<void>}
 */
export async function sendMyAddress(recipient, data) {

    const myAddress = {
        timestamp: Date.now(),
        command: RECEIVE_ADDRESS,
        sender: _handle,
        recipient: recipient,
        data: JSON.stringify(data)
    }
    myAddress._id =  await sha256(JSON.stringify(myAddress));

    //_libp2p.services.pubsub.publish(CONTENT_TOPIC,fromString(JSON.stringify(myAddress))) //TODO when publishing a message sign content and enrypt content
    const hash = await _dbMessages.put(myAddress) //TODO put this in a broadcast function
    console.log("hash in dbMessages", hash)
    console.log("RECEIVE_NEW_ADDRESS", myAddress)
    notify(`sent RECEIVE_NEW_ADDRESS`)
}

export const sendAddress = async (identity,scannedAddress) => {
    console.log("request sendAddress", identity)

    const addr = {
        timestamp: Date.now(),
        command: SEND_ADDRESS_REQUEST,
        sender: identity,
        recipient: scannedAddress,
    }
    addr._id =  await sha256(JSON.stringify(addr));

    //_libp2p.services.pubsub.publish(CONTENT_TOPIC,fromString(JSON.stringify(addr))) //TODO when publishing a message sign content and enrypt content
    const hash = await _dbMessages.put(addr) //TODO put this in a broadcast functin
    console.log("hash in dbMessages", hash)
    console.log("SEND_ADDRESS_REQUEST",addr)
    notify(`sent SEND_ADDRESS_REQUEST`)
}

function updateAddressBook(messageObj) {
    const msg = messageObj
    const contactData = JSON.parse(messageObj.data);
    console.log("updating myAddressBook ",_myAddressBook)
    const newAddrBook = _myAddressBook.filter( el => el.id !== contactData.id )
    newAddrBook.push({
        _id: contactData._id, //TODO
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
        owner: msg.sender,
        ownerPubKey: 'somepubkey' //TODO store pubkey of owner with contact
    });
    myAddressBook.set(newAddrBook);
    notify(`address updated`)
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
identity.subscribe((val) => {
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