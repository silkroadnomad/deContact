/**
 * performs confirmation dialogs
 * @module lib/components/common/confirmationModal/modal
 */
import Modal from './SeedPhraseModal.svelte';
export const ENTER_EXISTING = "EnterSeedPhrase"
export const GENERATE_NEW = "GenerateNew"

/**
 * Show a modal which asks the user to either generate or enter a seedphrase
 *
 * @param options
 * @returns {Promise<boolean>}
 */
export async function generateSeed(options) {
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
