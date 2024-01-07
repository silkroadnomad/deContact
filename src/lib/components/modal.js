/**
 * performs confirmation dialogs
 * @module lib/components/common/confirmationModal/modal
 */
import Modal from './AddressModal.svelte';

/**
 * Creates a modal Confirmation Dialog and waits for the answer
 * @param {import('$lib/interfaces.js').ConfirmDialogOptions? } options
 * @returns {Promise<boolean>}
 */
export async function confirm(options) {
  return new Promise((resolve) => {
    const modal = new Modal({
      target: document.body,
      props: options
    });
    modal.$on('result', (e) => {
      resolve(e.detail);
      modal.$destroy();
    });
  });
}
