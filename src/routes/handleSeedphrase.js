import {ENTER_EXISTING, GENERATE_NEW, generateSeed} from "$lib/components/seedModal.js";
import {generateMasterSeed, notify} from "../utils/utils.js";
import {masterSeed, seedPhrase, selectedTab} from "../stores.js";
import {generateMnemonic} from "bip39";

let _masterSeed; /** @type {string} the masterSeed based on the seedPhrase */
masterSeed.subscribe((val) => {
    _masterSeed = val
});

let _seedPhrase; /** @type {string} the seed phrase */
seedPhrase.subscribe((val) => {
    _seedPhrase = val
});

/**
 * If there's no seed inside the browser storage, we ask the generate a new seed or to enter an existing
 * - stores the generated seedPhrase inside the browser storage and holds it inside Svelte store
 * - creates a masterSeed from seedPhrase. Can be used to create hd-keys for crypto wallets.
 *
 * //TODO 1) encrypt the seed
 * //TODO 2) keep seed only on mobile device and sign transactions there or
 * //TODO 3) have a hardware wallet
 * //TODO 4) if browser ask for Metamask connect (EthereumIdentityProvider)
 *
 * @param {boolean?} skip if true, we just create a new seed and don't ask the user, e.g. during onboarding procedure
 * @returns {Promise<void>}
 */
export const handleSeedphrase = async (skip=false) => {

    if(!localStorage.getItem("seedPhrase") && !skip) {

        const result = await generateSeed({ data: {
                text: "We couldn't find a master seed phrase inside your browser storage. " +
                    "Do you want to generate a new master seed phrase? Or maybe you have an existing one?"} })

        switch (result) {
            case ENTER_EXISTING:
                notify("enter existing masterSeed phrase in settings please!")
                selectedTab.set(3)
                break;
            case GENERATE_NEW:
                _seedPhrase = generateMnemonic();
                seedPhrase.set(_seedPhrase)
                localStorage.setItem("seedPhrase",_seedPhrase)
                selectedTab.set(3)
                notify(`generated a new seed phrase ${_seedPhrase}`)
                break;
        }
    }

    if(skip){ //we are in onboarding mode
        _seedPhrase = generateMnemonic();
        seedPhrase.set(_seedPhrase)
        localStorage.setItem("seedPhrase",_seedPhrase)
    }
    _masterSeed = generateMasterSeed(_seedPhrase,"password")
    masterSeed.set(_masterSeed)
}
