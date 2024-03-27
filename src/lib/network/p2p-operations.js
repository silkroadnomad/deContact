import { createLibp2p } from 'libp2p'
import { createHelia } from "helia";
import { IPFSAccessController, useAccessController} from '@orbitdb/core';
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers'
import { config } from "../../config.js";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webTransport } from "@libp2p/webtransport";
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
    followList, dbMessages, selectedTab, syncedDevices,useWebRTC, useWebSocket
} from "../../stores.js";

import { get } from 'svelte/store';
import { confirm } from "../components/addressModal.js"
import {notify, sha256} from "../../utils/utils.js";
import { getIdentityAndCreateOrbitDB } from "$lib/network/getIdendityAndCreateOrbitDB.js";

let blockstore = new LevelBlockstore("./helia-blocks")
let datastore = new LevelDatastore("./helia-data")

let messageQueue = {};
let activeConfirmations = {};

let _libp2p; /** @type {import('libp2p').Libp2p} Value of to the libp2p store variable containing the libp2p instance*/
libp2p.subscribe((val) => {
    _libp2p = val
});

/**
 * The PubSub topic where deContact is publishing and subscribing
 * REQUEST_ADDRESS requests
 * @type {string}
 */
export const CONTENT_TOPIC = "/dContact/3/message/proto";

const REQUEST_ADDRESS = 'REQUEST_ADDRESS';
const CANCEL_REQUEST = 'CANCEL_REQUEST';

/**
 * Starting libp2p, Helia, OrbitDB with an Identity (e.g. DID generated by the seed phrase)
 * Starting replication of myAddressbook with my other devices and launching storage protocol to receive message requests from others.
 * @returns {Promise<void>}
 */
export async function startNetwork() {

    _libp2p =  await createLibp2p(config)
    libp2p.set(_libp2p)

    _helia = await createHelia({
        libp2p: _libp2p,
        blockstore,
        datastore,
        blockBrokers: [bitswap()] //TODO what is this bockBrokers (bitswap) good for?
    });
    helia.set(_helia)
    window.helia = _helia

    _libp2p.addEventListener('connection:open',  async (c) => {
        console.log("connection:open",c.detail.remoteAddr.toString())
        connectedPeers.update(n => n + 1);

        if(_connectedPeers>1)
            await getAddressRecords();
    });

    _libp2p.addEventListener('connection:close', (c) => {
        console.log("connection:close",c);
        connectedPeers.update(n => n - 1);
    });

    _orbitdb = await getIdentityAndCreateOrbitDB('ed25519',_masterSeed,_helia)
    orbitdb.set(_orbitdb)

    await _libp2p.services.pubsub.subscribe(CONTENT_TOPIC+"/"+_orbitdb.identity.id)

    _libp2p.services.pubsub.addEventListener('message', event => {
        const topic = event.detail.topic
        const message = new TextDecoder().decode(event.detail.data)
        if(!topic.startsWith(CONTENT_TOPIC)) return
        console.log(`Message received on topic '${topic}': ${message}`)
        handleMessage(message)
    })

    _orbitdb = await getIdentityAndCreateOrbitDB('ed25519',_masterSeed,_helia)
    orbitdb.set(_orbitdb)

    /**
     * My Address Book (with own contact data and contact data of others
     */
    useAccessController(IPFSAccessController)
    const myDBName = await sha256(_orbitdb.identity.id)
    _dbMyAddressBook = await _orbitdb.open("/myAddressBook/"+myDBName, {
        type: 'documents',
        sync: true,
        AccessController: IPFSAccessController({ write: ['*'] })
        // AccessController: OrbitDBAccessController({ write: [_orbitdb.identity.id]})
    })

    dbMyAddressBook.set(_dbMyAddressBook)
    window.mydb = _dbMyAddressBook
    await getAddressRecords()

    initReplicationBackup(_orbitdb.identity.id)

    startInvitationCheckWorker()
    _dbMyAddressBook.events.on('join', async (peerId, heads) => {
        console.log("db replicated (join event received)",peerId)
        syncedDevices.set(true)
        getAddressRecords()
    })

    _dbMyAddressBook.events.on('update', async (entry) => {
        console.log("someone updated my address book",entry) //TODO
        getAddressRecords()
    })
}

export async function close() {
    await _orbitdb?.stop()
    await _helia?.stop();
}

async function handleMessage(dContactMessage) {
    console.log("dContactMessage", dContactMessage);
    if (!dContactMessage) return;
    const messageObj = JSON.parse(dContactMessage);

    // Queue the message, keeping only the last message from each sender
    messageQueue[messageObj.sender] = messageObj;

    // Process the queued messages
    await processMessageQueue();
}


async function restartLibp2p() {
    const webRTCEnabled = get(useWebRTC);
    const webSocketEnabled = get(useWebSocket);

    if (_libp2p) {
        await _libp2p.stop();
    }

    config.transports = [];

    if (webRTCEnabled) {
        const webRTCConfig = webRTC({
            rtcConfiguration: {
                iceServers: [{
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                }]
            }
        });
        config.transports.push(webRTCConfig, webRTCDirect());
    }

    if (webSocketEnabled) {
        const webSocketConfig = webSockets({filter: filters.all});
        config.transports.push(webSocketConfig);
    }
    console.log("restarting libp2p with config",config)
    _libp2p =  await createLibp2p(config)
  
}

let isInitialCall = true;

useWebRTC.subscribe(() => {
    if (!isInitialCall) {
        restartLibp2p();
    }
});

useWebSocket.subscribe(() => {
    if (!isInitialCall) {
        restartLibp2p();
    }
});

isInitialCall = false;
/**
 * We want to open a confirmation dialog for each sender sending a pub sub message. (in case it's coming in same time)
 * @returns {Promise<void>}
 */
async function processMessageQueue() {
    for (const sender in messageQueue) {
        const messageObj = messageQueue[sender];

        // Check if a confirmation dialog is already active for this sender
        if (activeConfirmations[sender]) {
            continue;
        }

        let result, data, requesterDB;
        if (messageObj.recipient === _orbitdb.identity.id) {
            switch (messageObj.command) {
                case CANCEL_REQUEST:
                    data = JSON.parse(messageObj.data);
                break;

                case REQUEST_ADDRESS:
                    data = JSON.parse(messageObj.data);
                    requesterDB = await _orbitdb.open(data.sharedAddress, { type: 'documents', sync: true });
                    // Mark this sender as having an active confirmation
                    activeConfirmations[sender] = true;

                    if(messageObj.onBoardingToken!==undefined){
                        //TODO "mytoken" should be a unique sessionId
                        //TODO "onBoardingToken
                        const onBoardingSignatureValid = await _orbitdb.identity.verify(messageObj.onBoardingToken,_orbitdb.identity.publicKey,"mytoken")
                        console.log("onBoardingToken signature valid",onBoardingSignatureValid)
                        if(onBoardingSignatureValid)
                            result = 'ONLY_HANDOUT'
                        else {
                            notify(`onboarding signature was not valid - somebody wanted to steal your contact data`);
                            return //don't do anything
                        }
                    }
                    else
                        result = await confirm({ data: messageObj, db: requesterDB });
                    if(result){
                        if(result==='ONLY_HANDOUT'){
                            //As Bob updates his contact data (without requesting contact data of Alice), Bob needs to remember Alice db address so he can
                            //1) update his contact data in her address book
                            //2) keep a backup of her data
                            const subscriber  = {sharedAddress: data.sharedAddress, subscriber:true}
                            subscriber._id = await sha256(JSON.stringify(subscriber));
                            await _dbMyAddressBook.put(subscriber)
                            await writeMyAddressIntoRequesterDB(requesterDB); //Bob writes his address into Alice address book
                        }
                        else {
                            await writeMyAddressIntoRequesterDB(requesterDB);
                            await requestAddress(messageObj.sender,true)
                        }
                        initReplicationBackup(_orbitdb.identity.id) //init replication of all subscriber ids

                    } else{
                        try {
                            const all = await requesterDB.all()
                            const foundDummy = all.filter((it) => {
                                return it.value.owner === _orbitdb?.identity?.id
                            })
                            const cancelDummy = foundDummy[0].value;
                            for (const foundDummyKey in foundDummy) {
                            //    await requesterDB.del(foundDummy[foundDummyKey].key)
                                cancelDummy.value._id = foundDummy[foundDummyKey].value._id
                                cancelDummy.value.firstName="request canceled";
                            }

                            const hash = await requesterDB.put(cancelDummy);
                            notify(`wrote canceled request with hash ${hash}`);

                        } catch (error) {
                            console.error('Error in writeMyAddressIntoRequesterDB:', error);
                        }
                        // const msg = await createMessage(CANCEL_REQUEST, messageObj.sender);
                        // await _libp2p.services.pubsub.publish(CONTENT_TOPIC+"/"+messageObj.sender,fromString(JSON.stringify(msg)))
                    }
                    // Confirmation is complete; allow future confirmations for this sender
                    delete activeConfirmations[sender];
                    // Remove the message from the queue after processing
                    delete messageQueue[sender];
                    break;
                default:
                    console.error(`Unknown command: ${messageObj.command}`);
                    // Remove unprocessable messages from the queue
                    delete messageQueue[sender];
            }
        }
    }
}

/**
 * Transforms entries in the dbMyAddressBook orbitdb into an arraylist consumable e.g. by a datatable component
 * @returns {Promise<void>}
 */
async function getAddressRecords() {
    try {
        const addressRecords = await _dbMyAddressBook.all();
        let transformedRecords = addressRecords.map(record => ({
            ...record.value,
            id: record.value._id
        }));
        transformedRecords = transformedRecords.filter((addr)=> {
            return addr.id !==undefined && addr.subscriber===undefined
        })
        myAddressBook.set(transformedRecords);
        console.log("records in dbMyAddressBook ",addressRecords)
    } catch (e) {
        console.log("exception while opening (reading) dbMyAddressBook",e)
        //await close()
    }
}

/**
 * Loop through our address book and open all other address books of the people we follow (and replicate them in order to keep a backup)
 * We back up the dbs of the people (the addresses) we follow.
 *
 * In case Bob doesn't follow Alice he keeps an invisible dummy in his address book (which he can decide if he wants to back it up or not)
 *
 * TODO: If a contact db gets too large we still need a solution for that! e.g. all other follower (like us) could agree on only backing up
 * a certain part of the data. E.g. Bob has 100 MB data, Alice wants to backup only 10MB, she could create her own version of Bobs data w ith only slice of his data.
 * Alice could let others know about her slice, so those who want to backup Bobs data can take the next slice.
 * If Bob looses his data, he could open his db address with a slice index as an extension e.g. /orbitdb/address/01 /orbitdb/address/02 etc
 * He could do so right in the moment when his data gets over 10MB and create a new db for new contacts. The new contacts would then automatically backup the correct slice
 * (something like that)
 *
 * @param ourDID our DID
 * @returns {Promise<void>}
 */
async function initReplicationBackup(ourDID) {

    const addressRecords = await _dbMyAddressBook.all();
    _followList = addressRecords.filter((addr)=> {
        return addr.value.owner !== ourDID && addr.value.sharedAddress!==undefined //sharedAddress undefined for all not decentralized addresses
    })

    followList.set(_followList)
    for (const s in _followList) {
        const dbAddress = _followList[s].value.sharedAddress
        try {
            _followList[s].db = await _orbitdb.open(dbAddress, {type: 'documents',sync: true})
            _followList[s].db.all().then((records)=> { //replicate the addresses of Bob, Peter etc.
                console.log(`we follow and backup dbAddress: ${dbAddress} records`,records)
            })
        } catch(e){
            await close()
            console.log(`error while loading ${dbAddress} `)}
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
 * 1. Alice requests an address from Bob via pub sub
 * 2. Alice adds write permission to Bobs identity //TODO please make sure Alice can only write one address into Bobs db and can only update and delete his own.
 * 3. Bob keeps a backup of Alice (encrypted)
 * 4. If Bob changes his address he is iterating through all of his subscribers, opens their address book and updates writes his data in.
 *
 * @param scannedAddress a DID or any other handle supported by the system (e.g. ethereum addresses=
 * @param nopingpong set to true if Bob should not ask again to exchange the contacts if just happened (prevent the ping pong)
 * @param onBoardingToken if set we send an onBoardingToken back to Alice so she doesn't need a confirmation
 * @returns {Promise<void>}
 */
export const requestAddress = async (_scannedAddress,nopingpong, onBoardingToken) => {
    const scannedAddress = _scannedAddress.trim()

    try {
        console.log("request requestAddress from", _scannedAddress);
        const data = { sharedAddress:_dbMyAddressBook.address }
        const msg = await createMessage(REQUEST_ADDRESS, scannedAddress,data);
        if(onBoardingToken!==undefined) msg.onBoardingToken = onBoardingToken
        if(nopingpong===true) msg.nopingpong = true
        // await _dbMyAddressBook.access.grant("write",scannedAddress) //the requested did (to write into my address book)

        //look if a dummy is inside
        const all = await _dbMyAddressBook.all()
        const foundDummy = all.filter((it) => { return it.value.owner === scannedAddress})

        if(foundDummy.length===0){
            const dummyContact  = {
                owner: scannedAddress,
                firstName: 'invited',
                lastName: scannedAddress
            }
            if(onBoardingToken!==undefined) dummyContact.onBoardingToken = onBoardingToken

            dummyContact._id = await sha256(JSON.stringify(dummyContact));
            await _dbMyAddressBook.put(dummyContact)
        }

        //TODO when publishing, sign and encrypt message
        await _libp2p.services.pubsub.publish(CONTENT_TOPIC+"/"+scannedAddress, new TextEncoder().encode(JSON.stringify(msg)))

        startInvitationCheckWorker()
        notify(`sent SEND_ADDRESS_REQUEST to ${scannedAddress}`);
    } catch (error) {
        console.error('Error in requestAddress:', error);
    }
}

/**
 * Periodically checks for 'invited' contacts and attempts to resend the address request.
 * The interval increases exponentially: first 10 seconds, then 100 seconds, then 10000 seconds, and so on.
 */
function startInvitationCheckWorker() {

    let iteration = 0; // Track the current iteration
    const executeWorker = async () => {
        console.log("Checking for 'invited' contacts to resend requests...");

        const allContacts = await _dbMyAddressBook.all();
        const invitedContacts = allContacts.filter(contact => contact.value.firstName === 'invited');

        if (invitedContacts.length === 0) {
            console.log("No 'invited' contacts found. Worker will not schedule further checks.");
            return; // Stop scheduling further executions
        }

        for (const contact of invitedContacts) {
            const data = { sharedAddress: _dbMyAddressBook.address };
            const msg = await createMessage(REQUEST_ADDRESS, contact.value.owner, data);

            if(contact?.value?.onBoardingToken) msg.onBoardingToken = contact.value.onBoardingToken;
            
            // Use TextEncoder to encode the message
            await _libp2p.services.pubsub.publish(CONTENT_TOPIC + "/" + contact.value.owner, new TextEncoder().encode(JSON.stringify(msg)));
            console.log(`Resent address request to ${contact.value.owner}`);
        }

        // Schedule the next execution
        iteration++;
        const nextInterval = 10 * iteration * 1000; // Calculate the next interval
        console.log(`Scheduling next check in ${nextInterval / 1000} seconds.`);
        setTimeout(executeWorker, nextInterval);
    }

    // Start the first execution
    executeWorker();
}

/**
 * Now we are writing our address directly into Alice address book (we got write permission)
 *
 * @param recipient
 * @param data
 * @returns {Promise<void>}
 */
export async function writeMyAddressIntoRequesterDB(requesterDB) {
    try {
        const writeFirstOfOurAddresses = _myAddressBook.filter((it) => {
            return it.owner === _orbitdb?.identity?.id
        })[0]
        delete writeFirstOfOurAddresses.own;

        //delete the dummy which alice added for us!
        const all = await requesterDB.all()
        const foundDummy = all.filter((it) => {
            return it.value.owner === _orbitdb?.identity?.id
        })

        for (const foundDummyKey in foundDummy) {
             // await requesterDB.del(foundDummy[foundDummyKey].key)|
            writeFirstOfOurAddresses._id = foundDummy[foundDummyKey].value._id
            const hash = await requesterDB.put(writeFirstOfOurAddresses);
            notify(`wrote my address into requesters db with hash ${hash}`);
        }

    } catch (error) {
        console.error('Error in writeMyAddressIntoRequesterDB:', error);
    }
}


/**
 * Subscription to the helia store variable containing the Helia instance
 */
let _helia;
helia.subscribe((val) => {
    _helia = val
});

/**
 * Subscription to the orbitdb store variable containing the OrbitDB instance
 */
let _orbitdb;
orbitdb.subscribe((val) => {
    _orbitdb = val
});

/**
 *
 */
let _masterSeed;
masterSeed.subscribe((val) => {
    _masterSeed = val
});

let _dbMessages;
dbMessages.subscribe((val) => {
    _dbMessages = val
});

let _dbMyAddressBook;
dbMyAddressBook.subscribe((val) => {
    _dbMyAddressBook = val
});

let _seedPhrase;
seedPhrase.subscribe((val) => {
    _seedPhrase = val
});

let _subscription
subscription.subscribe((val) => {
    _subscription = val
});

let _connectedPeers
connectedPeers.subscribe((val) => {
    _connectedPeers = val
});
let _myAddressBook
myAddressBook.subscribe((val) => {
    _myAddressBook = val
});

let _followList
followList.subscribe((val) => {
    _followList = val
});

let _selectedTab
selectedTab.subscribe((val) => {
    _selectedTab = val
});