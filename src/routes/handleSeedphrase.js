import {ENTER_EXISTING, GENERATE_NEW, generateSeed} from "$lib/components/seedModal.js";
import {generateMasterSeed, notify} from "../utils/utils.js";
import {masterSeed, seedPhrase, selectedTab} from "../stores.js";
import {generateMnemonic} from "bip39";

let _masterSeed;
masterSeed.subscribe((val) => {
    _masterSeed = val
});

let _seedPhrase;
seedPhrase.subscribe((val) => {
    _seedPhrase = val
});

/**
 * If there's no seed inside the browser storage, we ask the generate a new seed or to enter an existing
 * //TODO 1) encrypt the seed 2) keep seed only on mobile device and sign transactions there or 3) have a hardware wallet
 * //TODO 4) if browser ask for Metamask connect (EthereumIdentityProvider)
 *
 * @returns {Promise<void>}
 */
export const handleSeedphrase = async () => {

    if(!localStorage.getItem("seedPhrase")) {

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
                selectedTab.set(3)
                notify(`generated a new seed phrase ${_seedPhrase}`)
                break;
        }
    }
    _masterSeed = generateMasterSeed(_seedPhrase,"password")
    console.log("generated masterseed",_masterSeed)
    masterSeed.set(_masterSeed)
}
