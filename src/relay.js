/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { createLibp2p } from 'libp2p'
import {circuitRelayTransport, circuitRelayServer} from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { autoNAT } from '@libp2p/autonat'
import {dcutr} from "@libp2p/dcutr";
import {gossipsub} from "@chainsafe/libp2p-gossipsub";
// import {ReservationStore} from "@libp2p/circuit-relay-v2/src/server/reservation-store.js";

const topics = [
    `dcontact._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
    // '_peer-discovery._p2p._pubsub' // Include if you want to participate in the global space
]

// const reservationStore = new ReservationStore({ maxReservations: 100 })

const server = await createLibp2p({
    addresses: {
        listen: ['/ip4/127.0.0.1/tcp/12313/ws']
    },
    transports: [
        circuitRelayTransport(),
        webSockets({
            filter: filters.all
        })
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
        // bootstrap(bootstrapConfig),
        pubsubPeerDiscovery({
            interval: 10000,
            topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
            listenOnly: false
        })
    ],
    services: {
        identify: identify(),
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        pubsub: gossipsub({ allowPublishToZeroPeers: true, canRelayMessage: true}),
        circuitRelay: circuitRelayServer({ reservations: { applyDefaultLimit:false, maxReservations:Infinity }})
    }
})

console.log('Relay listening on multiaddr(s): ', server.getMultiaddrs().map((ma) => ma.toString()))
