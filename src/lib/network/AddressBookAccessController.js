const type = 'custom'

const AddressBookAccessController = ({identity} = {}) => async ({ orbitdb, identities, address }) => {
    address = '/custom/address-book-access-controller'//+identity.id //TODO create address from something else ?!?
    const ourAC = this
    const canAppend = async (entry) => {
        if(!identity) return true //if we are another identity this is undefined (everybody should write what ever, question is if it will be accepted.<
        if(entry.identity === orbitdb.identity.hash) return true
        const aliceDB = await orbitdb.open(entry.id, { type: 'documents', sync: true, AccessController: ourAC})
        const aliceRecords = await aliceDB.all()
        const writtenDummies = aliceRecords.filter((it) => {
            return it.value.owner===entry.payload.value.owner
        })

        if(writtenDummies.length===1) return true

        return false
    }

    return {
        type,
        address,
        canAppend
    }
}

AddressBookAccessController.type = type

export default AddressBookAccessController