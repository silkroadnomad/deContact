import { createLibp2p } from 'libp2p';
import { createHelia } from "helia";
import { LevelBlockstore } from "blockstore-level";
import { LevelDatastore } from "datastore-level";
import { bitswap } from '@helia/block-brokers';
import { config } from "../config.js";
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
    subscriberList,
    selectedTab, synchedFollowerDBs,
} from "../../stores/stores.js";
import { getIdentityAndCreateOrbitDB } from "$lib/network/getIdendityAndCreateOrbitDB.js";
import { createDeContact } from "decontact";

let blockstore = new LevelBlockstore("./helia-blocks");
let datastore = new LevelDatastore("./helia-data");

export const CONTENT_TOPIC = "/dContact/3/message/proto";

export async function startNetwork() {
    progressText.set("Starting libp2p node");
    progressState.set(1);
    const _libp2p = await createLibp2p(config);
    libp2p.set(_libp2p);

    progressText.set("Starting Helia (IPFS) node");
    progressState.set(2);
    const _helia = await createHelia({
        libp2p: _libp2p,
        blockstore,
        datastore,
        blockBrokers: [bitswap()]
    });
    helia.set(_helia);
    window.helia = _helia;

    progressText.set("Starting deContact protocol");
    progressState.set(3);

    progressText.set("Creating identity and OrbitDB instance...");
    const _orbitdb = await getIdentityAndCreateOrbitDB('ed25519', _masterSeed, _helia);
    orbitdb.set(_orbitdb);
    progressState.set(4);

    const _deContact = await createDeContact({ orbitdb: _orbitdb });
    window.deContact = _deContact;
    deContact.set(_deContact);

    const _dbMyAddressBook = await _deContact.open();
    _dbMyAddressBook.events.on('join', async (peerId, heads) => {
        console.log("join",peerId)
        _myAddressBook = _deContact.getMyAddressBook()
        myAddressBook.set(_myAddressBook)
        connectedPeers.set(_deContact.getConnectedPeers())
        synchedFollowerDBs.set(_deContact.getSyncedFollowerDBs())
    })
    _dbMyAddressBook.events.on('update', async (entry) => {
        console.log("update",entry)
        _myAddressBook = _deContact.getMyAddressBook()
        myAddressBook.set(_myAddressBook)
        connectedPeers.set(_deContact.getConnectedPeers())
        synchedFollowerDBs.set(_deContact.getSyncedFollowerDBs())
    })
    _libp2p.addEventListener('connection:open',  async (c) => {
        console.log("_deContact.getSyncedDevices()",_deContact.getConnectedPeers())
        connectedPeers.set(_deContact.getConnectedPeers())
    });

    _libp2p.addEventListener('connection:close', (c) => {
        connectedPeers.set(_deContact.getConnectedPeers())
    });

    window.dbMyAddressBook = _dbMyAddressBook;
    console.log("dbMyAddressBook", _dbMyAddressBook);
    dbMyAddressBook.set(_dbMyAddressBook);
    progressState.set(6);
}

// Subscription setup
let _libp2p, _helia, _orbitdb, _deContact, _dbMyAddressBook, _masterSeed, _seedPhrase, _subscription, _handle, _connectedPeers, _myAddressBook, _subscriberList, _selectedTab;

function setupSubscriptions() {
    const subscriptions = [
        { store: libp2p, setter: val => _libp2p = val },
        { store: helia, setter: val => _helia = val },
        { store: orbitdb, setter: val => _orbitdb = val },
        { store: deContact, setter: val => _deContact = val },
        { store: dbMyAddressBook, setter: val => _dbMyAddressBook = val },
        { store: masterSeed, setter: val => _masterSeed = val },
        { store: seedPhrase, setter: val => _seedPhrase = val },
        { store: subscription, setter: val => _subscription = val },
        { store: handle, setter: val => _handle = val },
        { store: connectedPeers, setter: val => _connectedPeers = val },
        { store: myAddressBook, setter: val => _myAddressBook = val },
        { store: subscriberList, setter: val => _subscriberList = val },
        { store: selectedTab, setter: val => _selectedTab = val },
    ];

    subscriptions.forEach(({ store, setter }) => {
        store.subscribe(setter);
    });
}
setupSubscriptions();

