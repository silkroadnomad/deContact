/* eslint-disable no-console */

import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { createLibp2p } from 'libp2p'
import {circuitRelayTransport, circuitRelayServer} from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { autoNAT } from '@libp2p/autonat'
import {dcutr} from "@libp2p/dcutr";
import {gossipsub} from "@chainsafe/libp2p-gossipsub";
import {FaultTolerance} from "@libp2p/interface-transport";
import {kadDHT} from "@libp2p/kad-dht";

const topics = [
    `dcontact._peer-discovery._p2p._pubsub`
]

const server = await createLibp2p({
    addresses: {
        listen: ['/ip4/127.0.0.1/tcp/12313/ws']
    },
    transports: [
        circuitRelayTransport(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    transportManager: {
        faultTolerance: FaultTolerance.NO_FATAL
    },
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
        dht: kadDHT({
            kBucketSize: 20,
            clientMode: false           // Whether to run the WAN DHT in client or server mode (default: client mode)
        }),
        circuitRelay: circuitRelayServer({ reservations: { applyDefaultLimit:false, maxReservations:Infinity }})
    }
})

console.log('Relay listening on multiaddr(s): ', server.getMultiaddrs().map((ma) => ma.toString()))
