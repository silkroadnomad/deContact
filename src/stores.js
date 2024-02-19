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
export const masterSeed = writable()
export const seedPhrase = writable(window.localStorage.getItem('seedPhrase') || undefined)

export const myAddressBook = writable([])
/** an orbitdb which will replace the myAddressBook store based on localstorage //TODO */
export const dbMyAddressBook = writable([])

export const myDal = writable()

/** storage protocol in synced with another device TODO count the sync events instead of showing just true/false) */
export const synced = writable(false)

/**
 * if contacts of the devices got synced with another devices
 * @type {Writable<boolean>}
 */
export const syncedDevices = writable(false)

/**
 * how many records (messages) got syned via the storage protocol.
 * @type {Writable<number>}
 */
export const recordsSynced = writable(0)

/**
 * Holds the amount of address records, synced from another of my devices (devices with same seed)
 * @type {Writable<number>}
 */
// export const addressRecordsSynced = writable(0)

export const showNotification =  writable()
export const notificationMessage = writable()

export const subscriberList = writable(JSON.parse(window.localStorage.getItem('subscriberList')) || [] )
export const qrCodeOpen = writable(false)
export const qrCodeData = writable()

export const selectedRowIds = writable([])
export const selectedTab = writable(0)
const contact = {
    _id:"",
    firstName: "",
    lastName: "",
    street: "",
    postalCode: "",
    city: "",
    stateProvince: "",
    countryRegion:"",
    ipns: "",
    owner:"",
    own:false,
    category: 'business',
    sharedAddress:""
}
export const selectedAddr = writable( contact)
// export const selectedAddress = writable( )