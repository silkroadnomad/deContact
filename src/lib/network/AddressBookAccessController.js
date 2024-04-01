const type = 'custom'

const AddressBookAccessController = ({identity,myDBName} = {}) => async ({ orbitdb, identities, address }) => {
    address = "/custom/"+myDBName
    const ourAC = this
    console.log("test")
    const canAppend = async (entry) => {
        // if(!identity) return true //if we are another identity this is undefined (everybody should write what ever, question is if it will be accepted.<

        console.log("entry",entry)
        console.log("identity",identity)
          return true
        //1. if this entries identiy is the identity of the creator of the database (Alice) identity?


        //if(entry.identity === orbitdb.identity.hash) return true
       //{
         // return identities.verifyIdentity(entry.identity)
       // }

        // const aliceDB = await orbitdb.open(entry.id, { type: 'documents', sync: true, accessController: ourAC})
        // const aliceRecords = await aliceDB.all()
        // const writtenDummies = aliceRecords.filter((it) => {
        //     return it.value.owner===entry.payload.value.owner
        // })
        //
        // if(writtenDummies.length===1) return true

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