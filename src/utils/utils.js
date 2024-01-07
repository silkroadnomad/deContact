import { notificationMessage, showNotification } from "../stores.js";
/**
 * {string} _notificationMessage
 */
let _notificationMessage
/**
 * {string} _showNotification
 */
let _showNotification

notificationMessage.subscribe((value) => {
    _notificationMessage = value
});
showNotification.subscribe((value) => {
    _showNotification = value
})

/**
 * Make an sha256 hash
 * @param (string) input
 * @returns {Promise<string>}
 */
export async function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function notify(message) {
    notificationMessage.set(message);
    showNotification.set(true)

    setTimeout(() => {
        showNotification.set(false)
        notificationMessage.set(undefined);
    }, 2000);
}

export function clickToCopy(node, target) {
    async function copyText() {
        let text = target
            ? document.querySelector(target).innerText
            : node.innerText;

        try {
            await navigator.clipboard.writeText(text);

            node.dispatchEvent(
                new CustomEvent('copysuccess', {
                    bubbles: true
                })
            );
        } catch(error) {
            node.dispatchEvent(
                new CustomEvent('copyerror', {
                    bubbles: true,
                    detail: error
                })
            );
        }
    }

    node.addEventListener('click', copyText);

    return {
        destroy() {
            node.removeEventListener('click', copyText);
        }
    }
}