import { writable } from 'svelte/store'
export const handle = writable(window.localStorage.getItem('handle') || 'unknown')
export const libp2p = writable()
export const orbitdb = writable()
export const helia = writable()
export const dbMessages = writable()
export const subscription = writable()
export const connectedPeers = writable(0)
export const progressText = writable("initializing...")
export const progressState = writable(0)

//0d3c4655d0fa1f9bcaa6c824eaae27fbb494e3a763d1bdd8b764d66e73ce8c4a
export const hdkey = writable()
export const seedPhrase = writable(window.localStorage.getItem('seedPhrase') || undefined)
export const identities = writable()
export const ourIdentity = writable()

export const myAddressBook = writable(JSON.parse(window.localStorage.getItem('myAddressBook') || "[]"))
export const myDal = writable()

export const showNotification =  writable()
export const notificationMessage = writable()

export const subscriberList = writable(JSON.parse(window.localStorage.getItem('subscriberList')) || [] )
export const qrCodeOpen = writable(false)
export const qrCodeData = writable()

export const selectedRowIds = writable([])
export const selectedTab = writable(0)
const contact = {
    id:"",
    firstName: "",
    lastName: "",
    street: "",
    postalCode: "",
    city: "",
    stateProvince: "",
    countryRegion:"",
    own: false,
    ipns: ""
}
export const selectedAddr = writable( contact)
// export const selectedAddress = writable( )