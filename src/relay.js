import { yamux } from '@chainsafe/libp2p-yamux'
import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { identify, identifyPush } from '@libp2p/identify';


import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { ping } from "@libp2p/ping";
import { autoNAT } from "@libp2p/autonat";
import { dcutr } from "@libp2p/dcutr";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { generateKeyPair, privateKeyToProtobuf, privateKeyFromProtobuf } from '@libp2p/crypto/keys';
import { fromString as uint8ArrayFromString, toString as uint8ArrayToString } from 'uint8arrays';
const topics = ['dcontact._peer-discovery._p2p._pubsub']
// const newKeyPair = await generateKeyPair('Ed25519');
// const protobufKey = privateKeyToProtobuf(newKeyPair);
// const privateKeyHex = uint8ArrayToString(protobufKey, 'hex');
// import {bootstrapConfig} from "./config.js";

// output of: console.log(server.peerId.privateKey.toString('hex'))
const relayPrivKey = '08011240821cb6bc3d4547fcccb513e82e4d718089f8a166b23ffcd4a436754b6b0774cf07447d1693cd10ce11ef950d7517bad6e9472b41a927cd17fc3fb23f8c70cd99'
// the peer id of the above key
// const relayId = '12D3KooWAJjbRkp8FPF5MKgMU53aUTxWkqvDrs4zc1VMbwRwfsbE'

// const encoded = uint8ArrayFromString(relayPrivKey, 'hex')
// const privateKey = await keys.unmarshalPrivateKey(encoded)
// const peerId = await createFromPrivKey(privateKey)

const privKeyBuffer = uint8ArrayFromString(relayPrivKey, 'hex');
const keyPair = await privateKeyFromProtobuf(privKeyBuffer);


const server = await createLibp2p({
	privateKey: keyPair,
	addresses: {
		listen: ['/ip4/0.0.0.0/tcp/54657/ws']
		// TODO check "What is next?" section
		// announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
	},
	transports: [
		circuitRelayTransport(),
		tcp(),
		webSockets({
			filter: filters.all
		}),
	],
	connectionManager: {
		maxConnections: 100,
		maxIncomingPendingConnections: 100,
	},
	connectionEncrypters: [
		noise()
	],
	streamMuxers: [
		yamux()
	],
	peerDiscovery: [
		pubsubPeerDiscovery({
			interval: 8000,
			topics: topics, // defaults to ['_peer-discovery._p2p._pubsub']
			listenOnly: false
		})
	],
	services: {
		ping: ping({ protocolPrefix: 'dContact'}),
		identify: identify(),
		identifyPush: identifyPush(),
		autoNAT: autoNAT(),
		dcutr: dcutr(),
		pubsub: gossipsub({ allowPublishToZeroPeers: true, canRelayMessage: true }),
		relay: circuitRelayServer({
			hopTimeout: 600 * 1000,
			advertise: {
				bootDelay: 15 * 60 * 1000
			},
			reservations: {
				maxReservations: 100,
				reservationClearInterval: 300 * 1000,
				applyDefaultLimit: true,
				defaultDurationLimit: 60*60 * 1000,
				defaultDataLimit: BigInt(2 << 20),
				maxInboundHopStreams: 32,
				maxOutboundHopStreams: 64,
			}
		}),
	}
})
/*
const server =
	await createLibp2p({
		peerId,
		addresses: {
			listen: ['/ip4/0.0.0.0/tcp/12345/ws']
		},
		transports: [
			circuitRelayTransport(),
			tcp(),
			webSockets({
				filter: filters.all
			})
		],
		connectionManager: {
					maxConnections: 100,
					maxIncomingPendingConnections: 100,
		},
		connectionEncrypters: [
			noise()
		],
		streamMuxers: [yamux()],
		peerDiscovery: [
			// bootstrap({
			// 	list: ['/ip4/159.69.119.82/udp/9090/webrtc-direct/certhash/uEiAIh0DoA5Qk2xTpc_j58KZMvww9CQzN6UNgsJ-DTuM6XQ/p2p/12D3KooWF5fGyE4VeXMhSGd9rCwckyxCVkA6xfoyFJG9DWJis62v']}),
			pubsubPeerDiscovery({
				interval: 1000,
				topics: ['dev-dcontact._peer-discovery._p2p._pubsub','dcontact._peer-discovery._p2p._pubsub'], // defaults to ['_peer-discovery._p2p._pubsub']
				listenOnly: false
			})
		],
		services: {
			ping: ping(),
			identify: identify(),
			autoNAT: autoNAT(),
			dcutr: dcutr(),
			pubsub: gossipsub({ allowPublishToZeroPeers: true, canRelayMessage: true }),
			relay: circuitRelayServer({
				reservations: {
					maxReservations: 5000,
					reservationTtl: 1000,
					defaultDataLimit: BigInt(1024 * 1024 * 1024)
				}
			})
		}
}) */
server.addEventListener('peer:discovery', (evt) => {
	console.log('found peer: ', evt.detail)
})
server.addEventListener('peer:connect', async event => {
	console.log('peer:connect dialing', event.detail)
})

server.addEventListener('peer:disconnect', async event => {
	console.log('peer:disconnect', event.detail)
	server.peerStore.delete(event.detail)
})

console.log(server.peerId.toString())
console.log('p2p addr: ', server.getMultiaddrs().map((ma) => ma.toString()))
// generates a deterministic address: /ip4/127.0.0.1/tcp/33519/ws/p2p/12D3KooWAJjbRkp8FPF5MKgMU53aUTxWkqvDrs4zc1VMbwRwfsbE
