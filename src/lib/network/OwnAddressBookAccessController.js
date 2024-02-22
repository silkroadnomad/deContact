import {ourIdentity} from "../../stores/stores.js";

const type = 'custom'

const OwnAddressBookAccessController = ({  } = {}) => async ({ orbitdb, identities, address, name }) => {

    address = '/custom/address-book-access-controller'
    // if (governorAddress && proposalId) {
    //     address = pathJoin('/', type, governorAddress, proposalId)
    // } else {
    //     const parts = address.split('/')
    //     proposalId = parts.pop()
    //     governorAddress = parts.pop()
    // }
    //
    // if (!governorAddress) {
    //     throw new Exception('No governor contract specified')
    // }
    //
    // if (!proposalId) {
    //     throw new Exception("no proposalId specified")
    // }

    const canAppend = async (entry) => {
        const writerIdentity = await identities(entry.handle)
        if (!writerIdentity || writerIdentity!==orbitdb.identity) {
            return false
        }
        return true
    }

    return {
        type,
        address,
        canAppend
    }
}

OwnAddressBookAccessController.type = type

export default OwnAddressBookAccessController