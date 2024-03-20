import { createLibp2p } from 'libp2p';
// import { createHelia } from "helia";
// import { createDeContact } from "decontact";

// import { LevelBlockstore } from "blockstore-level";
// import { LevelDatastore } from "datastore-level";
// import { bitswap } from '@helia/block-brokers';
// import { getIdentityAndCreateOrbitDB } from "$lib/network/getIdendityAndCreateOrbitDB.js"
import { config } from "./config.js";
// import debug from "debug";
//
// let blockstore = new LevelBlockstore("./helia-blocks")
// let datastore = new LevelDatastore("./helia-data")

// let messageQueue = {};
// let activeConfirmations = {};
//
// export const CONTENT_TOPIC = "/dContact/3/message/proto";
//
// const REQUEST_ADDRESS = 'REQUEST_ADDRESS';
// Post data back to the main thread

postMessage(JSON.stringify({ worker:{ status:'started'}}));

onmessage = function(e) {
    console.log('Message received from main script');

    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    console.log('Posting message back to main script');
    postMessage(workerResult);
};

startNetwork()
let connectedPeers = 0
let libp2p, helia, orbitdb,myAddresses;
/**
 * Starting libp2p, Helia, OrbitDB with an Identity (e.g. DID generated by the seed phrase)
 * Starting replication of myAddressbook with my other devices and launching storage protocol to receive message requests from others.
 * @returns {Promise<void>}
 */
export async function startNetwork() {
    // debug.enable('libp2p:*')
    libp2p =  await createLibp2p(config)
    // console.log("libp2p:status",libp2p.status)
    postMessage(JSON.stringify({ libp2p:{ status:libp2p.status }}));
    // postMessage("libp2p:status:"+libp2p.status);
    // helia = await createHelia({
    //     libp2p,
    //     blockstore,
    //     datastore,
    //     blockBrokers: [bitswap()]
    // });

    libp2p.addEventListener('connection:open',  async (c) => {
        // console.log("connection:open",c.detail.remoteAddr.toString())
        connectedPeers+=1;
        postMessage(JSON.stringify({connectedPeers:connectedPeers}));
    });

    libp2p.addEventListener('connection:close', (c) => {
        // console.log("connection:close",c.detail.id)
        connectedPeers-=1;
        postMessage(JSON.stringify({connectedPeers:connectedPeers}));
    });

    libp2p.services.pubsub.addEventListener('message', event => {
        const topic = event.detail.topic
        const message = toString(event.detail.data)
        // if(!topic.startsWith(CONTENT_TOPIC)) return
        // console.log(`Message received on topic '${topic}'`,event.detail)
       // handleMessage(message)
    })

    // orbitdb = await getIdentityAndCreateOrbitDB('ed25519',masterSeed,helia)
    //
    // const deContact = await createDeContact({ orbitdb: orbitdb });
    //
    // const dbMyAddressBook = await deContact.open();
    // dbMyAddressBook.events.on('join', async (peerId, heads) => {
    //     console.log("join",peerId)
    //     myAddresses = deContact.getMyAddressBook()
    //     // myAddresses.set(_myAddresses)
    //     // connectedPeers.set(_deContact.getConnectedPeers())
    //     // synchedFollowerDBs.set(_deContact.getSyncedFollowerDBs())
    // })
    // dbMyAddressBook.events.on('update', async (entry) => {
    //     console.log("update",entry)
    //     myAddresses = deContact.getMyAddresses()
    //     // myAddresses.set(_myAddresses)
    //     // connectedPeers.set(_deContact.getConnectedPeers())
    //     // synchedFollowerDBs.set(_deContact.getSyncedFollowerDBs())
    // })
    // libp2p.addEventListener('connection:open',  async (c) => {
    //     console.log("_deContact.getSyncedDevices()",deContact.getConnectedPeers())
    //     // connectedPeers.set(_deContact.getConnectedPeers())
    // });
    //
    // libp2p.addEventListener('connection:close', (c) => {
    //     // connectedPeers.set(_deContact.getConnectedPeers())
    // });
}