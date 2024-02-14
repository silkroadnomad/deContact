const type = 'custom'
let address = '/custom/address-book-access-controller'
const AddressBookAccessController = ({  } = {}) => async ({ orbitdb, identities, subscriberList}) => {
    address = '/custom/address-book-access-controller'//+identity.id //TODO create address from something else ?!?

    const canAppend = async (entry) => {
        return true
        console.log("orbitdb",orbitdb)
        console.log("orbitdb.identity.hash",orbitdb.identity.hash)
        console.log("entry.identity",entry.identity)
        console.log("identities",identities)
        console.log("subscriberList",subscriberList)
        console.log("entry.identity === orbitdb.identity.hash",entry.identity === orbitdb.identity.hash)
        const OP = entry.payload.op
        if(entry.payload.op!=="PUT")return false

        if(entry.identity === orbitdb.identity.hash) return true; //always allow our own records
        //1. can the entry be decoded by our privkey
        console.log(entry)

        const RECIPIENT = entry.payload?.value?.recipient
        if(!RECIPIENT) return
        if(RECIPIENT === identity.id) {
            console.log("recipient is allowed to write",RECIPIENT)
            return true;
        }
        const SENDER = entry.payload?.value?.sender
        if(!SENDER) return
        if(SENDER === identity.id) return true; //this isn't necessary anymore imho since "entry.identity === orbitdb.identity.hash" already knows everything


        //TODO if the identity of the entry is one of the people we follow also allow
        //TODO test with 4 browsers if we can have Alice1 and Bob1 and Alic2 and Bob2 have to separate dbMessages dbs
        //TODO info: sender and recipient aren't encrypted
        //TODO info: only data attribute will encrypted
        //TODO info: if recipient and sender and timestamp is encrypted too, it must be encrypted with the recipients publickey -> in such case followers of RECIPIENT will not be able to see their responsibility to backup the response
        //TODO solution: maybe hash sender and recipient so followers can see their responsibility to backup?


        return false //we do not support DEL events (or others)
    }

    return {
        type,
        address,
        canAppend
    }
}

AddressBookAccessController.type = type

export default AddressBookAccessController