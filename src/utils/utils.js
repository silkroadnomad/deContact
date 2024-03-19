import { notificationMessage, showNotification, libp2p } from "../stores.js";
import { mnemonicToSeedSync } from "bip39";
import HDKey from "hdkey";
import { createHash } from 'crypto';

/**
 * Make an sha256 hash
 * @param (string) input
 * @returns {Promise<string>}
 */
export async function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * ConvertTo32BitSeed: Takes our masterSeed with 64 bit and converts it deterministically to 32 bit seed
 * @param origSeed
 * @returns {Buffer}
 */
export function convertTo32BitSeed (origSeed) {
    const hash = createHash('sha256');
    hash.update(origSeed);
    return hash.digest();
}
/**
 * Generates a master seed from a mnemonic and a password
 * @type {{return: string}}
 */
export const generateMasterSeed = (mnemonicSeedphrase, password) => {
    return mnemonicToSeedSync(mnemonicSeedphrase, password ? password : "mnemonic").toString("hex")
}
export const createHdKeyFromMasterKey = (masterseed,network) => {
    return HDKey.fromMasterSeed(Buffer.from(masterseed, "hex"), network)
}

export function notify(message) {
    notificationMessage.set(message);
    showNotification.set(true)

    setTimeout(() => {
        showNotification.set(false)
        notificationMessage.set(undefined);
    }, 2000);
}

let _libp2p

/**
 * {string} _notificationMessage
 */
let _notificationMessage
/**
 * {string} _showNotification
 */
let _showNotification

libp2p.subscribe((value) => {
    _libp2p = value
});

notificationMessage.subscribe((value) => {
    _notificationMessage = value
});
showNotification.subscribe((value) => {
    _showNotification = value
})