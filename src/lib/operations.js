import { getAddressRecords } from "decontact";
import {
    myAddressBook,
    selectedAddr,
    selectedTab,
    qrCodeData,
    qrCodeOpen,
    orbitdb,
    myDal,
    subscriberList,
    deContact, libp2p, helia, dbMyAddressBook, masterSeed, seedPhrase, subscription, handle, connectedPeers,
} from "../stores/stores.js";
import { notify } from "../utils/utils.js";

// Subscriptions setup
let _libp2p, _helia, _orbitdb, _deContact, _selectedAddr, _dbMyAddressBook, _masterSeed, _seedPhrase, _subscription, _handle, _connectedPeers, _myAddressBook, _subscriberList, _selectedTab;

// Utility function to update address book
async function updateAddressBook() {
    const myDBAddressBook = await _deContact.getMyAddressBook();
    const result = await getAddressRecords(myDBAddressBook);
    _myAddressBook = result;
    myAddressBook.set(_myAddressBook);
}

/**
 * Loading a contact from memory into the contactForm
 */
export async function loadContact(id) {
    console.log("loading");
    if (!_myAddressBook) return;
    const address = _myAddressBook.find(obj => obj.id === id);
    if (!address) return; // Do not set undefined here
    _selectedAddr = address;
    selectedAddr.set(_selectedAddr);
    selectedTab.set(1);
    console.log("loading contact", id);
}

/**
 * Adds a new contact into orbitdb dbMyAddressBook and switches back to ContactList Tab
 */
export async function addContact() {
    const hash = await _deContact.addContact(_selectedAddr);
    await updateAddressBook();
    selectedAddr.set({});
    selectedTab.set(0);
    notify(`Contact added successfully to ipfs/orbitdb! ${hash}`);
}

/**
 * Saves the current edited address into the Svelte storage and informs the subscribers about the address update
 */
export async function updateContact() {
    await _deContact.updateContact(_selectedAddr);
    await updateAddressBook();
    selectedAddr.set({});
    selectedTab.set(0);
    notify(`Contact updated successfully - informing our subscribers!`);
}

/**
 * Deletes a contact
 */
export async function deleteContact() {
    const deleteHash = await _deContact.deleteContact(_selectedAddr._id);
    await updateAddressBook();
    selectedAddr.set({});
    selectedTab.set(0);
    notify(`Contact deleted successfully! ${deleteHash}`);
}

export async function generateQRForAddress(contact) {
    qrCodeData.set(contact);
    qrCodeOpen.set(true);
}
function setupSubscriptions() {
    const subscriptions = [
        { store: libp2p, setter: val => _libp2p = val },
        { store: helia, setter: val => _helia = val },
        { store: orbitdb, setter: val => _orbitdb = val },
        { store: deContact, setter: val => _deContact = val },
        { store: dbMyAddressBook, setter: val => _dbMyAddressBook = val },
        { store: masterSeed, setter: val => _masterSeed = val },
        { store: seedPhrase, setter: val => _seedPhrase = val },
        { store: subscription, setter: val => _subscription = val },
        { store: handle, setter: val => _handle = val },
        { store: connectedPeers, setter: val => _connectedPeers = val },
        { store: myAddressBook, setter: val => _myAddressBook = val },
        { store: subscriberList, setter: val => _subscriberList = val },
        { store: selectedTab, setter: val => _selectedTab = val },
    ];

    subscriptions.forEach(({ store, setter }) => {
        store.subscribe(setter);
    });
}

setupSubscriptions();

