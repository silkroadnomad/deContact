import { convertTo32BitSeed } from "../../utils/utils.js";
import createIdentityProvider from "$lib/network/identityProvider.js";
import { createOrbitDB } from "@orbitdb/core";

/**
 * From a seed generate an Identity and start an orbitdb instance
 *
 * @param _type
 * @param _seed
 * @param _helia
 * @returns {Promise<OrbitDB>}
 */
export const getIdentityAndCreateOrbitDB = async (_type, _seed, _helia) => {
    const identitySeed = convertTo32BitSeed(_seed)
    const idProvider = await createIdentityProvider(_type, identitySeed, _helia)
    const _ourIdentity = idProvider.identity
    const _identities = idProvider.identities

    const orbitdb = await createOrbitDB({
        ipfs: _helia,
        identity: _ourIdentity,
        identities: _identities,
        directory: './deContact' })
    return orbitdb
}
