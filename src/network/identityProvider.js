import { Ed25519Provider } from 'key-did-provider-ed25519';
import EthereumIdentityProvider from '@orbitdb/identity-provider-ethereum';
import * as KeyDIDResolver from "key-did-resolver";
import OrbitDBIdentityProviderDID from "@orbitdb/identity-provider-did";
import {Identities, useIdentityProvider} from "@orbitdb/core";
import {notify} from "../utils/utils.js";

export async function createIdentityProvider(type, seedArray, ipfs) {
    let identity
    let identityProvider;
    const identities = await Identities({ ipfs })
    switch (type) {
        case 'ed25519':
            const keyDidResolver = KeyDIDResolver.getResolver()
            OrbitDBIdentityProviderDID.setDIDResolver(keyDidResolver)
            useIdentityProvider(OrbitDBIdentityProviderDID)

            try { //TODO if masterSeed array is encrypted open decryption dialog
             //   const seedArray = new Uint8Array(seed.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                identityProvider = new Ed25519Provider(seedArray)
            } catch(e){
                console.log(e)
                notify(`DID error ${e}`)
                return
            }
            identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderDID({ didProvider:identityProvider }) })
            break;
        case 'ethereum':
            //TODO Assuming you have an Ethereum wallet instance
            const wallet = undefined
            identityProvider = new EthereumIdentityProvider({ wallet });
            break;
        default:
            throw new Error(`Unsupported identity provider type: ${type}`);
    }
    return {identities,identity,identityProvider}
}
export default createIdentityProvider