import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webTransport } from "@libp2p/webtransport";
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from "@chainsafe/libp2p-yamux";
import { pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import { identify, identifyPush } from '@libp2p/identify';
import { autoNAT } from '@libp2p/autonat'
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { ping } from '@libp2p/ping'
import { dcutr } from '@libp2p/dcutr'
import { FaultTolerance } from '@libp2p/interface-transport'

const multiaddrs =
    import.meta.env.MODE === 'development'
        ? import.meta.env.VITE_SEED_NODES_DEV?.replace('\n','').split(',')
        : import.meta.env.VITE_SEED_NODES?.replace('\n','').split(',')


const pubSubPeerDiscoveryTopics =
	import.meta.env.MODE === 'development'
		? import.meta.env.VITE_P2P_PUPSUB_DEV?.replace('\n','').split(',')
        : import.meta.env.VITE_P2P_PUPSUB?.replace('\n','').split(',')
console.log("multiaddrs",multiaddrs)
export const bootstrapConfig = {list: multiaddrs};

export const config = {
    addresses: {
        // swarm: [address],
        listen: [
            "/p2p-circuit",
            "/p2p-circuit",
            '/webrtc'
        ]
    },
    transports: [
        webSockets({filter: filters.all}),
        webRTC({
            rtcConfiguration: {
                iceServers:[{
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478'
                    ]
                }]
            }
        }),
        webRTCDirect(),
        webTransport(),
        circuitRelayTransport({ discoverRelays: 1}),
        // kadDHT({}),
    ],
    connectionEncrypters: [noise()],
    connectionManager: {
        maxConnections: 100,
        maxIncomingPendingConnections: 100,
    },
    transportManager: {
        faultTolerance: FaultTolerance.NO_FATAL
    },
    streamMuxers: [
        yamux(),
    ],
    connectionGater: {
        denyDialMultiaddr: () => {
            return false
        }
    },
    peerDiscovery: [
        bootstrap(bootstrapConfig),
        pubsubPeerDiscovery({
            interval: 8000,
            topics: pubSubPeerDiscoveryTopics, // defaults to ['_peer-discovery._p2p._pubsub']
            listenOnly: false
        })
    ],
    services: {
        ping: ping(),
        identify: identify(),
        identifyPush: identifyPush(),
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, canRelayMessage: true }),
/*        aminoDHT: kadDHT({
            protocol: '/ipfs/kad/1.0.0',
            peerInfoMapper: removePrivateAddressesMapper
        })*/
        // dht: kadDHT({
        //     protocolPrefix: "/svelte-pubsub",
        //     maxInboundStreams: 5000,
        //     maxOutboundStreams: 5000,
        //     clientMode: true,
        // })
    }
}