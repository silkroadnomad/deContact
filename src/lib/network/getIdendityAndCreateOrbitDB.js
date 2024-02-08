import { convertTo32BitSeed } from "../../utils/utils.js";
import createIdentityProvider from "$lib/network/identityProvider.js";
import { createOrbitDB } from "@orbitdb/core";

/**
 * From a seed generate an Identity
 *
 * @param _type
 * @param _seed
 * @param _helia
 * @returns {Promise<void>}
 */
export const getIdentityAndCreateOrbitDB = async (_type, _seed, _helia) => {
    const identitySeed = convertTo32BitSeed(_seed)
    const idProvider = await createIdentityProvider(_type, identitySeed, _helia)
    const _ourIdentity = idProvider.identity
    const _identities = idProvider.identities
    // ourIdentity.set(_ourIdentity)

    const orbitdb = await createOrbitDB({
        ipfs: _helia,
        identity: _ourIdentity,
        identities: _identities,
        directory: './deContact' })
    // orbitdb.set(_orbitdb)
    return orbitdb
}
