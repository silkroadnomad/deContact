// import { createDecoder, createEncoder, createLightNode, Protocols, waitForRemotePeer} from "@waku/sdk";
import {
    libp2p,
    myAddressBook,
    subscription,
    connectedPeers,
    identity,
    progressText,
    progressState,
    subscriberList
} from "../stores.js";
import { fromString, toString } from 'uint8arrays';
import { AddressCardMessage} from "../schemas/protobufSchemas.js";
import { confirm } from "../lib/components/modal.js"
import { createLibp2p } from 'libp2p'
import { config } from "../config.js";

export const CONTENT_TOPIC = "/dContact/1/message/proto"; //TODO each user should have its own TOPIC
const SEND_ADDRESS_REQUEST = 'SEND_ADDRESS_REQUEST';
const RECEIVE_NEW_ADDRESS = 'RECEIVE_ADDRESS';

// const decoder = createDecoder(CONTENT_TOPIC);
// const encoder = createEncoder({ contentTopic: CONTENT_TOPIC, ephemeral: true });

export async function startNetwork() {

    progressText.set("creating libp2p node in browser")
    progressState.set(1)
    _libp2p =  await createLibp2p(config)
    libp2p.set(_libp2p)
    console.log("_libp2p",_libp2p)
    console.log("_libp2p",_libp2p.peerId.string)
    //_wakuNode = await createLightNode({ defaultBootstrap: true })

    // wakuNode.set(_wakuNode)
    progressText.set("starting libp2p node ...")
    progressState.set(2)
  //  await _wakuNode.start();

    progressText.set("started - waiting for remote peers")
    progressState.set(3)
    // await waitForRemotePeer(_wakuNode, [Protocols.LightPush]);
   // await waitForRemotePeer(_wakuNode, [Protocols.Store]);

    progressText.set("libp2p peers connected - subscribing to pubsub channel ")
    progressState.set(4)
    // outputLogComp.appendOutput(`Subscribing to '${clean(subscribeTopic)}'`)
    _libp2p.services.pubsub.subscribe(CONTENT_TOPIC)
    // subscription.set(await _wakuNode.filter.createSubscription());
    // await _subscription.subscribe([decoder], handleMessage);

    // progressText.set(`subscribed to ${CONTENT_TOPIC} `)
    progressState.set(5)

    _libp2p.addEventListener('connection:open',  (c) => {
        console.log("connection:open",c.detail.id)
        connectedPeers.update(n => n + 1);
        // _libp2p.services.pubsub.publish("test publish open")
        if(_connectedPeers>=1) progressState.set(6)
    });
    _libp2p.addEventListener('connection:close', (c) => {
        console.log("connection:close",c.detail.id)
        connectedPeers.update(n => n - 1);
        // _libp2p.services.pubsub.publish("test publish close")
    });

    _libp2p.services.pubsub.addEventListener('message', event => {
        const topic = event.detail.topic
        const message = toString(event.detail.data)
        if(topic === 'dcontact._peer-discovery._p2p._pubsub') return //we don't do anything with other topics
        console.log(`Message received on topic '${topic}': ${message}`)
        handleMessage(message)
    })
}

async function handleMessage (dContactMessage) {
    console.log("message",dContactMessage   )
    if (!dContactMessage) return;
    const messageObj = JSON.parse(dContactMessage)
    let result
    if (messageObj.recipient === _identity){
        switch (messageObj.command) {
            case SEND_ADDRESS_REQUEST: //we received a SEND_ADDRESS_REQUEST and sending our address //TODO verify signature with public key
                result = await confirm({data:messageObj})
                if(result){
                    const contact =  _myAddressBook.find((entry) => entry.owner === _identity) //TODO check if requester (Alice) was sending her own data
                    sendMyAddress(messageObj.sender,contact);
                    if(_subscriberList.indexOf(messageObj.sender)===-1)
                        _subscriberList.push(messageObj.sender)
                    console.log("_subscriberList",_subscriberList)
                    subscriberList.update(_subscriberList) //keep subscribers
                }else{
                    //TODO send "rejected sending address"
                }
            break;
            case RECEIVE_NEW_ADDRESS || RECEIVE_NEW_ADDRESS: //we received an address and add it to our address book //TODO show address sender in modal & verify signature with his pubic key
                result = await confirm({data:messageObj})
                if(result) {
                    updateAddressBook(messageObj);
                }
                else {  //TODO respond with something?
                     }
            break;
            default:
                console.error(`Unknown command: ${messageObj.command}`);
        }
    }
}

/**
 * In case somebody requests my contact data or I update my address I'll send it to requester / subscriber
 * @param recipient
 * @param data
 * @returns {Promise<void>}
 */
export async function sendMyAddress(recipient, data) {

    const myAddress = {
        timestamp: Date.now(),
        command: RECEIVE_NEW_ADDRESS,
        sender: _identity,
        recipient: recipient,
        data: JSON.stringify(data)
    }

    _libp2p.services.pubsub.publish(CONTENT_TOPIC,fromString(JSON.stringify(myAddress))) //TODO when publishing a message sign content and enrypt content
    console.log("RECEIVE_NEW_ADDRESS", myAddress)
}

export const sendAddress = async (identity,scannedAddress) => {
    console.log("request sendAddress", identity)

    const addr = {
        timestamp: Date.now(),
        command: SEND_ADDRESS_REQUEST,
        sender: identity,
        recipient: scannedAddress,
    }

    _libp2p.services.pubsub.publish(CONTENT_TOPIC,fromString(JSON.stringify(addr))) //TODO when publishing a message sign content and enrypt content
    console.log("SEND_ADDRESS_REQUEST",addr)
}

function updateAddressBook(messageObj) {
    const msg = messageObj
    const contactData = JSON.parse(messageObj.data);
    console.log("updating myAddressBook ",_myAddressBook)
    const newAddrBook = _myAddressBook.filter( el => el.id !== contactData.id )
    newAddrBook.push({
        id: contactData.id, //TODO
        firstName: contactData.firstName,
        middleName: contactData.middleName,
        lastName: contactData.lastName,
        organization: contactData.organization,
        workPhone: contactData.workPhone,
        birthday: contactData.birthday,
        title: contactData.title,
        url: contactData.url,
        note: contactData.note,
        street: contactData.street,
        city: contactData.city,
        stateProvince: contactData.stateProvince,
        postalCode: contactData.postalCode,
        countryRegion: contactData.countryRegion,
        timestamp: msg.timestamp,
        owner: msg.sender,
        ownerPubKey: 'somepubkey' //TODO store pubkey of owner with contact
    });
    myAddressBook.set(newAddrBook);
}

let _libp2p;
libp2p.subscribe((val) => {
    _libp2p = val
});

let _subscription
subscription.subscribe((val) => {
    _subscription = val
});

let _identity
identity.subscribe((val) => {
    _identity = val
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