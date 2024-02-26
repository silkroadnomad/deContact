<script>
    import {Modal, Toggle} from "carbon-components-svelte";
    import QRCode from "qrcode-generator";
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    import { clickToCopy } from "../../utils/utils.js"


    export let qrCodeOpen = false
    export let qrCodeData

    let myContactData = []
    const page_url = process.env.PAGE_URL?process.env.PAGE_URL:'https://deContact.xyz';

    /**
     * Generates a QR-Code with the given data
     * @param {string}data
     * @return {string} the
     */
    function generateQRCode(data) {
        const qr = QRCode(4, 'L');
        qr.addData(data);
        qr.make();
        return qr.createImgTag(6);
    }

    let text = ''; //TODO when clicking use timeout to reset text to '' (maybe an anymation)
    let linkUrl = ''
    let qrCode = '';
    let fullDeContactUrl = true

    $:linkUrl = fullDeContactUrl?page_url+'/onboarding/'+qrCodeData:qrCodeData
    $:qrCode = generateQRCode(linkUrl)

</script>
<svelte:window on:copysuccess={ () => text = "Copied!"} on:copyerror={ (e) => text = `Error! ${e.detail}`}/>
<Modal bind:open={ qrCodeOpen }
       modalHeading="Scan (DID) - Decentralized Identity"
       primaryButtonText="OK"
       secondaryButtonText=""
       on:click:button--primary={ () => dispatch('close') }
       on:click:button--secondary={ () => dispatch('close') }
       on:close={()=>dispatch('close')} >

    <Toggle labelText="Scan from deContact?" labelA="No" labelB="Yes" bind:toggled={fullDeContactUrl}/>

    <p>&nbsp;</p>
    <label for="qrCodeModal"
        use:clickToCopy>{linkUrl}</label>
        <span id="qrCodeModal">{text}</span>
    <p></p>
    <p>&nbsp;</p>
    {#each myContactData as contact, index}
        <li>{contact.value.firstname} {contact.value.lastname}</li>
    {/each}

    {#if qrCodeData && qrCodeOpen}{@html qrCode}{/if}
</Modal>