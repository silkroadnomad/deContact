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
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { FaultTolerance } from '@libp2p/interface-transport'

export const dialMultiaddrItems =  [
    // { id:"/ip4/159.69.119.82/udp/4004/quic-v1/webtransport/certhash/uEiAP75UYHU9lxxeQ43_u3U7PrL3eeb0aOBfw2ty7CjuSUA/certhash/uEiBhciKTRyUiuDHnFkpOD_i3bMRCuGT8olXrdFvteNV-uA/p2p/12D3KooWAu6KS53pN69d6WG7QWttL14LnodUkBjZ1LG7F73k58LM", text: "webtransport istanbul"},
    { id:"/ip4/159.69.119.82/udp/4005/webrtc-direct/certhash/uEiD3LuzNOsNyskWmWI_wPr8-FlWBhbsEKsH9x6fcEGwT7w/p2p/12D3KooWAu6KS53pN69d6WG7QWttL14LnodUkBjZ1LG7F73k58LM", text: "webrtc-direct istanbul"},
    // { id:"/ip4/78.46.210.80/udp/4005/quic-v1/webtransport/certhash/uEiAbaFR9QTo2Y6xu3VEK_r3mciXziAFA0jBWvKSBb4QaMA/certhash/uEiAk1c3NNp0-aAlwktq7FdzQDcTAqcHjjWiR99MqCkrgTw/p2p/12D3KooWA6NB8Vz5ro22X3ws3DQWndQKbdNgt6UNzgUSGjS4e96Z", text: "webtransport tiflis"},
    { id:"/ip4/78.46.210.80/udp/4004/webrtc-direct/certhash/uEiA1KCyqxF7qbtyJpumrlZEB2BmvvLddpAoowlmltQogug/p2p/12D3KooWA6NB8Vz5ro22X3ws3DQWndQKbdNgt6UNzgUSGjS4e96Z", text: "webrtc-direct tiflis"}
]

const multiaddrs = [ '/ip4/127.0.0.1/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKABDpSmjtXQRm1FmkwbRDMzLHYi83btQnxHMAYRpYH8k']
const multiaddrs2 = [
  //  '/ip4/192.168.0.103/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKABDpSmjtXQRm1FmkwbRDMzLHYi83btQnxHMAYRpYH8k', //Schewtschenko
    //'/ip4/10.41.92.3/udp/9090/webrtc-direct/certhash/uEiAIbksoQ56yn3UPDn0k_abCkGBHCf79iUemkVXRn_Vy2g/p2p/12D3KooWKABDpSmjtXQRm1FmkwbRDMzLHYi83btQnxHMAYRpYH8k' //SOK
     '/ip4/159.69.119.82/udp/9090/webrtc-direct/certhash/uEiAIh0DoA5Qk2xTpc_j58KZMvww9CQzN6UNgsJ-DTuM6XQ/p2p/12D3KooWF5fGyE4VeXMhSGd9rCwckyxCVkA6xfoyFJG9DWJis62v' //istanbul
    // '/ip4/127.0.0.1/udp/9095/quic-v1/p2p/12D3KooWPuveUzbMedUNP9C43LpNqpsrcHfTwAVrw8ghyksxW8xF' //go universal connectivity
  //  '/ip4/164.92.229.178/udp/9090/webrtc-direct/certhash/uEiCyG5zCRpky38iwqX6RCuNvaAumkTM0dexnyVXjMf6QLA/p2p/12D3KooWDsKuyhLWZwXXwFph1Tgd2CWs4RJFktsVKdQL94uHLsZv'
     // "/ip4/159.69.119.82/udp/4004/quic-v1/webtransport/certhash/uEiAP75UYHU9lxxeQ43_u3U7PrL3eeb0aOBfw2ty7CjuSUA/certhash/uEiBhciKTRyUiuDHnFkpOD_i3bMRCuGT8olXrdFvteNV-uA/p2p/12D3KooWAu6KS53pN69d6WG7QWttL14LnodUkBjZ1LG7F73k58LM",
     // "/ip4/159.69.119.82/udp/4005/webrtc-direct/certhash/uEiD3LuzNOsNyskWmWI_wPr8-FlWBhbsEKsH9x6fcEGwT7w/p2p/12D3KooWAu6KS53pN69d6WG7QWttL14LnodUkBjZ1LG7F73k58LM",
     // "/ip4/78.46.210.80/udp/4005/quic-v1/webtransport/certhash/uEiAbaFR9QTo2Y6xu3VEK_r3mciXziAFA0jBWvKSBb4QaMA/certhash/uEiAk1c3NNp0-aAlwktq7FdzQDcTAqcHjjWiR99MqCkrgTw/p2p/12D3KooWA6NB8Vz5ro22X3ws3DQWndQKbdNgt6UNzgUSGjS4e96Z",
     // "/ip4/78.46.210.80/udp/4004/webrtc-direct/certhash/uEiA1KCyqxF7qbtyJpumrlZEB2BmvvLddpAoowlmltQogug/p2p/12D3KooWA6NB8Vz5ro22X3ws3DQWndQKbdNgt6UNzgUSGjS4e96Z"
     //    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
     //    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
     //    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
     //    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
];
const pubSubPeerDiscoveryTopics = [
    `dcontact._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
    // '_peer-discovery._p2p._pubsub' // Include if you want to participate in the global space
]

const bootstrapConfig = {list: multiaddrs2};
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