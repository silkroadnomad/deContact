import { writable } from 'svelte/store'

export const identity = writable(window.localStorage.getItem('identity') || 'unknown')
export const wakuNode = writable()
export const subscription = writable()
export const connectedPeers = writable(0)
export const progressText = writable("initializing...")
export const progressState = writable(0)

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