import {confirm} from "$lib/components/experimentalUseModal.js";

/**
 * When opening the app first time, let the people know this is experimental.
 * @returns {Promise<void>}
 */
export const confirmExperimentalUse = async () => {
    if(!localStorage.getItem("testConfirmation")) {
        const result = await confirm({ data: {
                text: "Note: This is still experimental software. " +
                    "This peer-to-peer only progressive web app (PWA) is not (yet) intended for use in production environments " +
                    "or for use where real money or real contact data are at stake! \n" +
                    "Please contact developers for questions. " } })
        if(result===true) localStorage.setItem("testConfirmation",result)
    }
}
