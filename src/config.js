import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { webTransport } from "@libp2p/webtransport";
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { pubsubPeerDiscovery} from "@libp2p/pubsub-peer-discovery";
import { identify } from '@libp2p/identify'
import { autoNAT } from '@libp2p/autonat'
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { ping } from '@libp2p/ping'
import { dcutr } from '@libp2p/dcutr'
import { kadDHT } from '@libp2p/kad-dht'
import { FaultTolerance } from '@libp2p/interface-transport'

const multiaddrs = [
    '/ip4/192.168.0.103/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKABDpSmjtXQRm1FmkwbRDMzLHYi83btQnxHMAYRpYH8k'
    // '/ip4/10.41.92.3/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKABDpSmjtXQRm1FmkwbRDMzLHYi83btQnxHMAYRpYH8k'
//     '/ip4/159.69.119.82/udp/9090/webrtc-direct/certhash/uEiAIh0DoA5Qk2xTpc_j58KZMvww9CQzN6UNgsJ-DTuM6XQ/p2p/12D3KooWF5fGyE4VeXMhSGd9rCwckyxCVkA6xfoyFJG9DWJis62v'
] //istanbul
const pubSubPeerDiscoveryTopics = [`dcontact._peer-discovery._p2p._pubsub`]

const bootstrapConfig = {list: multiaddrs};
export const config = {
    addresses: {
        // swarm: [address],
        listen: [
            "/webrtc",
            "/webtransport"
            // "/wss", "/ws",
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
        circuitRelayTransport({discoverRelays: 2}),
        // kadDHT({}),
    ],
    connectionEncryption: [noise()],
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
            interval: 10000,
            topics: pubSubPeerDiscoveryTopics, // defaults to ['_peer-discovery._p2p._pubsub']
            listenOnly: false
        })
    ],
    services: {
        ping: ping({
            protocolPrefix: 'dContact', // default
        }),
        identify: identify(),
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        pubsub: gossipsub({allowPublishToZeroPeers: true, canRelayMessage: true}),
/*        aminoDHT: kadDHT({
            protocol: '/ipfs/kad/1.0.0',
            peerInfoMapper: removePrivateAddressesMapper
        })*/
        dht: kadDHT({
            protocolPrefix: "/svelte-pubsub",
            maxInboundStreams: 5000,
            maxOutboundStreams: 5000,
            clientMode: true,
        })
    }
}