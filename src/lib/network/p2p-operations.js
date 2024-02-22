import { createLibp2p } from 'libp2p'
import { createHelia } from "helia";
import { LevelBlockstore } from "blockstore-level"
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers'
import { config } from "../../config.js";
import {
    libp2p,
    helia,
    orbitdb,
    deContact,
    masterSeed,
    seedPhrase,
    myAddressBook,
    dbMyAddressBook,
    subscription,
    connectedPeers,
    handle,
    progressText,
    progressState,
    subscriberList, dbMessages, selectedTab,
} from "../../stores.js";

import { getIdentityAndCreateOrbitDB } from "$lib/network/getIdendityAndCreateOrbitDB.js";
import { createDeContact } from "decontact";

let blockstore = new LevelBlockstore("./helia-blocks")
let datastore = new LevelDatastore("./helia-data")

export const CONTENT_TOPIC = "/dContact/3/message/proto";

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

    progressText.set(`Starting deContact protocol`)
    progressState.set(3)

    progressText.set(`Creating identity and OrbitDB instance... `)
    _orbitdb = await getIdentityAndCreateOrbitDB('ed25519',_masterSeed,_helia)
    orbitdb.set(_orbitdb)
    progressState.set(4)

    _deContact = await createDeContact({ orbitdb: _orbitdb })
    window.deContact = _deContact
    deContact.set(_deContact)

    _dbMessages = await _deContact.open()
    window.dbMessages = _dbMessages
    console.log("_dbMessages",_dbMessages)
    dbMessages.set(_dbMessages)
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

let _deContact;
deContact.subscribe((val) => {
    _deContact = val
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