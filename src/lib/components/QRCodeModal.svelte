<script>
    import {Modal} from "carbon-components-svelte";
    import QRCode from "qrcode-generator";
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    import { clickToCopy } from "../../utils/utils.js"
    import { myDal } from "../../stores.js"

    /**
     * @type {boolean}
     * when true qr-code modal is open
     */
    export let qrCodeOpen = false

    /**
     * the data to be transformed into an qr-code
     * @type {string}
     */
    export let qrCodeData

    /**
     * myDal
     */
    // export let myDal;

    let myContactData = []
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

    /**
     *
     */
    async function getMyData(db) {
        if(!db) return
        myContactData = await db.all()
    }
    $: getMyData($myDal)


    let text = '';

    function copySuccess(){
        text = "Copied!"
    }

    function copyError(event){
        text = `Error! ${event.detail}`
    }
</script>
<svelte:window on:copysuccess={copySuccess} on:copyerror={copyError}/>
<Modal bind:open={qrCodeOpen}
       modalHeading="Scan (DAL) - Decentralized Address Link"
       primaryButtonText="OK"
       secondaryButtonText=""
       on:click:button--primary={ () => dispatch('close') }
       on:click:button--secondary={ () => dispatch('close') }
       on:close={()=>dispatch('close')}>

    <label for="qrCodeModal"
            use:clickToCopy>{qrCodeData}</label>&nbsp;<span id="qrCodeModal">{text}</span>
    <p></p>
    {#each myContactData as contact, index}
        <li>{contact.value.firstname} {contact.value.lastname}</li>
    {/each}

    {#if qrCodeData && qrCodeOpen}{@html generateQRCode(qrCodeData)}{/if}

</Modal>