import { createDecoder, createEncoder, createLightNode, Protocols, waitForRemotePeer} from "@waku/sdk";
import {
    myAddressBook,
    wakuNode,
    subscription,
    connectedPeers,
    identity,
    progressText,
    progressState,
    subscriberList
} from "../stores.js";

import { AddressCardMessage} from "../schemas/protobufSchemas.js";
import {confirm} from "../lib/components/modal.js"

export const CONTENT_TOPIC = "/dContact/1/message/proto"; //TODO each user should have its own TOPIC
const SEND_ADDRESS_REQUEST = 'SEND_ADDRESS_REQUEST';
const RECEIVE_NEW_ADDRESS = 'RECEIVE_ADDRESS';

const decoder = createDecoder(CONTENT_TOPIC);
const encoder = createEncoder({ contentTopic: CONTENT_TOPIC, ephemeral: true });

export async function startNetwork() {

    progressText.set("creating light waku node")
    progressState.set(1)
    _wakuNode = await createLightNode({ defaultBootstrap: true })

    wakuNode.set(_wakuNode)
    progressText.set("starting waku node ...")
    progressState.set(2)
    await _wakuNode.start();

    progressText.set("waku started - waiting for remote peers")
    progressState.set(3)
    await waitForRemotePeer(_wakuNode, [Protocols.LightPush]);
    // await waitForRemotePeer(_wakuNode, [Protocols.Store]);

    // Create the callback function
//     const callback = (wakuMessage) => {
//         // Render the message/payload in your application
//         console.log(wakuMessage);
//     };
//
// // Query the Store peer
//     await node.store.queryWithOrderedCallback(
//         [decoder],
//         callback,
//     );

    progressText.set("waku peers connected - opening connections ...")
    progressState.set(4)
    subscription.set(await _wakuNode.filter.createSubscription());
    await _subscription.subscribe([decoder], handleMessage);

    progressText.set(`subscribed to ${CONTENT_TOPIC} `)
    progressState.set(5)

    _wakuNode.libp2p.addEventListener('connection:open',  () => {
        connectedPeers.update(n => n + 1);
        if(_connectedPeers>1) progressState.set(6)
    });
    _wakuNode.libp2p.addEventListener('connection:close', () => {
        connectedPeers.update(n => n - 1);
    });
}

async function handleMessage (wakuMessage) {

    if (!wakuMessage.proto.payload) return;
    const messageObj = AddressCardMessage.decode(wakuMessage.payload);
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

    const protoMessage = AddressCardMessage.create({
        timestamp: Date.now(),
        command: RECEIVE_NEW_ADDRESS,
        sender: _identity,
        recipient: recipient,
        data: JSON.stringify(data)
    });

    const serialisedMessage = AddressCardMessage.encode(protoMessage).finish();
    await _wakuNode.lightPush.send(encoder, { payload: serialisedMessage });
    console.log("sent my address to",protoMessage)
}

export const sendAddress = async (identity,scannedAddress) => {
    console.log("request sendAddress",identity)
    const protoMessage = AddressCardMessage.create({
        timestamp: Date.now(),
        command: SEND_ADDRESS_REQUEST,
        sender: identity,
        recipient: scannedAddress,
    });
    const serialisedMessage = AddressCardMessage.encode(protoMessage).finish();
    await _wakuNode.lightPush.send(encoder, { payload: serialisedMessage });
    console.log("message sent")
}

function updateAddressBook(messageObj) {
    const msg = messageObj.toJSON()
    const contactData = JSON.parse(messageObj.toJSON().data);
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

let _wakuNode;
wakuNode.subscribe((val) => {
    _wakuNode = val
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