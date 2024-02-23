import { convertTo32BitSeed } from "../../utils/utils.js";
import { createOrbitDB } from "@orbitdb/core";
import {CONTENT_TOPIC} from "$lib/network/p2p-operations.js";
import createIdentityProvider from "$lib/network/identityProvider.js";

/**
 * From a seed generate an Identity and start an orbitdb instance
 *
 * @param _type
 * @param _seed
 * @param _helia
 * @returns {Promise<OrbitDB>}
 */
export const getIdentityAndCreateOrbitDB = async (_type, _masterseed, _helia) => {
    const identitySeed = convertTo32BitSeed(_masterseed)
    const idProvider = await createIdentityProvider(_type, identitySeed, _helia)
    const _ourIdentity = idProvider.identity
    const _identities = idProvider.identities
    const orbitdb = await createOrbitDB({
        ipfs: _helia,
        identity: _ourIdentity,
        identities: _identities,
        directory: './deContact' })
    const ourContentTopic = CONTENT_TOPIC+"/"+orbitdb.identity.id
    _helia.libp2p.services.pubsub.subscribe(ourContentTopic)
    return orbitdb
}
