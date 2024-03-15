import { createLibp2p } from 'libp2p'
import { createHelia } from "helia";
import { OrbitDBAccessController, useAccessController} from '@orbitdb/core';
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers'
import { fromString, toString } from 'uint8arrays';
import {
    libp2p,
    helia,
    orbitdb,
    masterSeed,
    seedPhrase,
    myAddressBook,
    dbMyAddressBook,
    subscription,
    connectedPeers,
    handle,
    progressText,
    progressState,
    subscriberList, dbMessages, selectedTab, syncedDevices,
} from "../../stores.js";
import {config} from "../../config.js";
import { confirm } from "../components/addressModal.js"
import { notify, sha256 } from "../../utils/utils.js";
import { getIdentityAndCreateOrbitDB } from "$lib/network/getIdendityAndCreateOrbitDB.js";


let blockstore = new LevelBlockstore("./helia-blocks")
let datastore = new LevelDatastore("./helia-data")

export const CONTENT_TOPIC = "/dContact/3/message/proto";

const REQUEST_ADDRESS = 'REQUEST_ADDRESS';

/**
 * Starting libp2p, Helia, OrbitDB with an Identity (e.g. DID generated by the seed phrase)
 * Starting replication of myAddressbook with my other devices and launching storage protocol to receive message requests from others.
 * @returns {Promise<void>}
 */
export async function startNetwork() {

    progressText.set("Starting libp2p node")
    progressState.set(1)
    _libp2p =  await createLibp2p(config)
    libp2p.set(_libp2p)

    progressText.set("Starting Helia (IPFS) node")
    progressState.set(2)
    _helia = await createHelia({
        libp2p: _libp2p,
        blockstore,
        datastore,
        blockBrokers: [bitswap()]
    });
    helia.set(_helia)
    window.helia = _helia

    progressText.set(`Starting deContact pub sub protocol`)
    progressState.set(3)
    _libp2p.addEventListener('connection:open',  async (c) => {
        console.log("connection:open",c.detail.remoteAddr.toString())
        connectedPeers.update(n => n + 1);

        if(_connectedPeers>1) {
            await getAddressRecords();
            progressState.set(6)
        }
    });

    _libp2p.addEventListener('connection:close', (c) => {
        console.log("connection:close",c.detail.id)
        connectedPeers.update(n => n - 1);
    });

    _libp2p.services.pubsub.addEventListener('message', event => {
        const topic = event.detail.topic
        const message = toString(event.detail.data)
        if(!topic.startsWith(CONTENT_TOPIC)) return
        console.log(`Message received on topic '${topic}': ${message}`)
        handleMessage(message)
    })

    progressText.set(`Opening our address book from OrbitDB... `)
    _orbitdb = await getIdentityAndCreateOrbitDB('ed25519',_masterSeed,_helia)
    orbitdb.set(_orbitdb)
    progressState.set(3)

    /**
     * My Address Book (with own contact data and contact data of others
     */
    useAccessController(OrbitDBAccessController)
    const myDBName = await sha256(_orbitdb.identity.id)
    _dbMyAddressBook = await _orbitdb.open("/myAddressBook/"+myDBName, {
        type: 'documents',
        sync: true,
        AccessController: OrbitDBAccessController({ write: [_orbitdb.identity.id]})
    })
    // console.log("dbMyAddressBook",_dbMyAddressBook)
    dbMyAddressBook.set(_dbMyAddressBook)
    window.dbMyAddressBook = _dbMyAddressBook
    await getAddressRecords()
    initReplicationOfSubscriberDBs(_orbitdb.identity.id)
    _dbMyAddressBook.events.on('join', async (peerId, heads) => {
        console.log("one of my devices joined and synced myaddressbook",peerId)
        syncedDevices.set(true)
        getAddressRecords()
    })

    _dbMyAddressBook.events.on('update', async (entry) => {
        console.log("someone updated my addressbook with data",entry)
        getAddressRecords()
    })
}

async function getAddressRecords() {
    try {
        const addressRecords = await _dbMyAddressBook.all();
        let transformedRecords = addressRecords.map(record => ({
            ...record.value,
            id: record.value._id
        }));
        transformedRecords = transformedRecords.filter((addr)=> {
            return addr.id !==undefined
        })
        myAddressBook.set(transformedRecords);
        console.log("records in dbMyAddressBook ",addressRecords)
    } catch (e) {
        console.log("something isn't yet correctly setup inside dbMyAddressBook")
    }
}

/**
 * Loop through our address book and filter all other's addresses
 * @param ourDID our DID
 * @returns {Promise<void>}
 */
async function initReplicationOfSubscriberDBs(ourDID) {
    // console.log("replicateSubsriberDBs")
    const addressRecords = await _dbMyAddressBook.all();
    _subscriberList = addressRecords.filter((addr)=> {
        return addr.value.owner !== ourDID && addr.value.sharedAddress!==undefined //sharedAddress undefined for all not decentralized addresses
    })
    // console.log("_subscriberList",_subscriberList)
    subscriberList.set(_subscriberList)
    for (const s in _subscriberList) {
        const dbAddress = _subscriberList[s].value.sharedAddress
        // console.log("loading subscribers db s",dbAddress)
        try{
            _subscriberList[s].db = await _orbitdb.open(dbAddress, {type: 'documents',sync: true})
            _subscriberList[s].db.all().then((records)=> { //replicate the addresses of Bob, Peter etc.
                console.log(`dbAddress: ${dbAddress} records`,records)
            })
        }catch(e){console.log(`error while loading ${dbAddress} `)}

    }
}
async function handleMessage (dContactMessage) {
    console.log("dContactMessage",dContactMessage   )
    if (!dContactMessage) return;
    const messageObj = JSON.parse(dContactMessage)
    let result, data, requesterDB
    if (messageObj.recipient === _orbitdb.identity.id){
        switch (messageObj.command) {
            case REQUEST_ADDRESS:
                data = JSON.parse(messageObj.data)

                requesterDB = await _orbitdb.open(data.sharedAddress, {
                    type: 'documents',sync: true})

                // const isRes = await isRequesterInSenderDB(requesterDB, messageObj) //TODO this seems contradicting we need to think twice again
                // if (isRes === true)
                // break;

                result = await confirm({
                    data:messageObj,
                    db:requesterDB,
                    sender: messageObj.sender })

                if(result){
                    if(result==='ONLY_HANDOUT'){
                        await writeMyAddressIntoRequesterDB(requesterDB); //Bob writes his address into Alice address book
                        //add a subscriber to our address book (should not be displayed in datatable
                        const subscriber  = {sharedAddress: data.sharedAddress, subscriber:true}
                        subscriber._id = await sha256(JSON.stringify(subscriber));
                        await _dbMyAddressBook.put(subscriber)
                    }
                    else {
                        await writeMyAddressIntoRequesterDB(requesterDB);
                        await requestAddress(messageObj.sender)
                        //await addRequestersContactDataToMyDB(requesterDB,messageObj.sender) //we want to write Alice contact data into our address book same time
                        //TODO in case Bob want's to exchange the data he should just send another request to Alice (just as Alice did)
                    }
                    initReplicationOfSubscriberDBs(_orbitdb.identity.id) //init replication of all subscriber ids

                }else{
                    //TODO send "rejected sending address"
                }
                break;
            default:
                console.error(`Unknown command: ${messageObj.command}`);
        }
    }
}


/**
 * When ever we want to send something out to a pear we create a message here
 * //TODO add encryption
 * @param command
 * @param recipient
 * @param data
 * @returns {Promise<{data: (string|null), sender: *, recipient, command, timestamp: number}>}
 */
async function createMessage(command, recipient, data = null) {
    const message = {
        timestamp: Date.now(),
        command,
        sender: _orbitdb?.identity?.id,
        recipient,
        data: data ? JSON.stringify(data) : null,
    };
    message._id = await sha256(JSON.stringify(message));
    return message;
}

/**
 * 1. Bob requests an address from Alice via Pub Sub
 * 2. Bob adds write permission to Alice identity to his own address book //TODO please make sure Alice can only write up to 3 addresses into Bobs db and can only update and delte her own.
 * 3. Bob is so kind and backups Alice (encrypted) address db on his device by opening it.
 * @param scannedAddress
 * @returns {Promise<void>}
 */
export const requestAddress = async (_scannedAddress) => {
    const scannedAddress = _scannedAddress.trim()
    try {
        console.log("request requestAddress from", _orbitdb?.identity?.id); //TODO remove white spaces from scannedAddress string
        const data = { sharedAddress:_dbMyAddressBook.address }
        const msg = await createMessage(REQUEST_ADDRESS, scannedAddress,data);
        await _dbMyAddressBook.access.grant("write",scannedAddress) //the requested did (to write into my address book)

        const dummyContact  = {owner:scannedAddress, firstName:'requested', lastName:scannedAddress}
        dummyContact._id = await sha256(JSON.stringify(dummyContact));
        await _dbMyAddressBook.put(dummyContact)

        const capabilities = await _dbMyAddressBook.access.capabilities()
        console.log(`granted write permission to ${scannedAddress}`,capabilities)
        await _libp2p.services.pubsub.publish(CONTENT_TOPIC+"/"+scannedAddress,fromString(JSON.stringify(msg))) //TODO when publishing a message sign content and enrypt content

        notify(`sent SEND_ADDRESS_REQUEST to ${scannedAddress}`);
    } catch (error) {
        console.error('Error in requestAddress:', error);
    }
}

/**
 * Now we are writing our address directly into Alice address book (we got write permission)
 * @param recipient
 * @param data
 * @returns {Promise<void>}
 */
export async function writeMyAddressIntoRequesterDB(requesterDB) {
    try {
        const writeFirstOfOurAddresses = _myAddressBook[0] //TODO use boolean flag "own" and a "tag" e.g. business or private to indicate which address should be written
        delete writeFirstOfOurAddresses.own;
        const all = await requesterDB.all()
        console.log("all before deleting",all)

        //find id of dummy record and delte
        const foundDummy = all.filter((it) => {
            console.log("it.value.owner",it.value.owner)
            console.log("_orbitdb?.identity?.id",_orbitdb?.identity?.id)
            return it.value.owner === _orbitdb?.identity?.id
        })
        console.log("foundDummy and deleting it",foundDummy)
        await requesterDB.del(foundDummy[0].value._id)
        const hash = await requesterDB.put(writeFirstOfOurAddresses);
        notify(`wrote my address into requesters db with hash ${hash}`);
    } catch (error) {
        console.error('Error in writeMyAddressIntoRequesterDB:', error);
    }
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