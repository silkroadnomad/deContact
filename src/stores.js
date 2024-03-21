import { writable } from 'svelte/store'

/**
 * The libp2p node instance
 * @type {Writable<import('libp2p').Libp2p>}
 */
export const libp2p = writable()

/**
 * The OrbitDB instance
 * @type {Writable<import('@orbitdb/core').OrbitDB>}
 */
export const orbitdb = writable()

/**
 * The Helia instance
 * @type {Writable<import('helia').Helia>}
 */
export const helia = writable()

/**
 * The masterSeed based on the seedPhrase. Can be used to create HDKeys for crypto wallets
 * @type {Writable<string>}
 */
export const masterSeed = writable()

/**
 * Seed phrase
 * @type {Writable<string|undefined>}
 */
export const seedPhrase = writable(window.localStorage.getItem('seedPhrase') || undefined)


export const dbMessages = writable()
export const subscription = writable()
export const connectedPeers = writable(0)




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

export const followList = writable([] )
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
    email:"",
    ipns: "",
    owner:"",
    own:true,
    category: 'business',
    sharedAddress:""
}
export const selectedAddr = writable( contact)
// export const selectedAddress = writable( )