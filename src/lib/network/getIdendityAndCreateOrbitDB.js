import { convertTo32BitSeed } from "../../utils/utils.js";
import createIdentityProvider from "$lib/network/identityProvider.js";
import { createOrbitDB } from "@orbitdb/core";
import {CONTENT_TOPIC} from "$lib/network/p2p-operations.js";

/**
 * From a seed generate an identity and start an OrbitDB instance
 *
 * @param type {string} [type='ed25519'] default or 'ethereum' for web3/Metamask support
 * @param masterseed {string} our 64bit masterseed generated from the seedPhrase
 * @param helia the ipfs (Helia) instance to create an OrbitDB instance.
 *
 * @returns {Promise<{import('@orbitdb/core').OrbitDB}>}
 */
export const getIdentityAndCreateOrbitDB = async (type='ed25519', masterseed, helia) => {
    const identitySeed = convertTo32BitSeed(masterseed)
    const idProvider = await createIdentityProvider(type, identitySeed, helia)
    const _ourIdentity = idProvider.identity
    const _identities = idProvider.identities
    const orbitdb = await createOrbitDB({
        ipfs: helia,
        identity: _ourIdentity,
        identities: _identities,
        directory: './deContact' })
    const ourContentTopic = CONTENT_TOPIC+"/"+orbitdb.identity.id
    helia.libp2p.services.pubsub.subscribe(ourContentTopic)
    return orbitdb
}
