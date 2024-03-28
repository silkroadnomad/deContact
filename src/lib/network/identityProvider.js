import { Ed25519Provider } from 'key-did-provider-ed25519';
import EthereumIdentityProvider from '@orbitdb/identity-provider-ethereum';
import * as KeyDIDResolver from "key-did-resolver";
import OrbitDBIdentityProviderDID from "@orbitdb/identity-provider-did";
import {Identities, useIdentityProvider} from "@orbitdb/core";
import {notify} from "../../utils/utils.js";

/**
 *
 * Create an IdentityProvider either an
 * - OrbitDBIdentityProviderDID or
 * - EthereumIdentityProvider
 *
 * //TODO open the seed decryption dialog if seed is encrypted
 *
 * @param type {string} 'ed25519' (for DID) or 'ethereum' (for Web3 or Metamask-wallet) support
 * @param seed a 32bit seed
 * @param ipfs the Helia instance
 * @returns {Promise<{identities: module:Identities~Identities, identity: {id: string, publicKey: Object, signatures: Object, type: string, sign: Function, verify: Function}, identityProvider}>}
 */
export async function createIdentityProvider(type='ed25519', seed, ipfs) {
    let identity
    let identityProvider;
    const identities = await Identities({ ipfs })
    switch (type) {
        case 'ed25519':
            const keyDidResolver = KeyDIDResolver.getResolver()
            OrbitDBIdentityProviderDID.setDIDResolver(keyDidResolver)
            useIdentityProvider(OrbitDBIdentityProviderDID)

            try { //TODO if masterSeed array is encrypted open decryption dialog
                identityProvider = new Ed25519Provider(seed)
            } catch(e){
                console.log(e)
                notify(`DID error ${e}`)
                return
            }
            identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider: identityProvider }) })
            break;
        case 'ethereum':
            //TODO Implementing an Ethereum Provider
            const wallet = undefined
            identityProvider = new EthereumIdentityProvider({ wallet });
            break;
        default:
            throw new Error(`Unsupported identity provider type: ${type}`);
    }
    return {identities,identity,identityProvider}
}
export default createIdentityProvider