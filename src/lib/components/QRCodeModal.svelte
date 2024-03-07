<script>
    import {Column, Modal, Toggle, Grid, Row} from "carbon-components-svelte";
    import Information from "carbon-icons-svelte/lib/Information.svelte";
    import QrCode from "svelte-qrcode"
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import { clickToCopy } from "../../utils/utils.js"
    const page_url = process.env.PAGE_URL?process.env.PAGE_URL:'https://deContact.xyz';
    export let qrCodeData
    export let qrCodeOpen

    let text = ''; //TODO when clicking use timeout to reset text to '' (maybe an animation)
    let linkUrl = `${page_url}/onboarding/${qrCodeData || '' }`
    let fullDeContactUrl
    $: linkUrl = !fullDeContactUrl?`${page_url}/onboarding/${qrCodeData || '' }`:qrCodeData
</script>
<svelte:window on:copysuccess={ () => text = "Copied!"} on:copyerror={ (e) => text = `Error! ${e.detail}`}/>
<Modal bind:open={ qrCodeOpen }
       modalHeading="Scan (DID) - Decentralized Identity"
       primaryButtonText="OK"
       secondaryButtonText=""
       on:click:button--primary={ () => dispatch('close') }
       on:click:button--secondary={ () => dispatch('close') }
       on:close={()=>dispatch('close')} >
    <Grid>
        <Row>
            <Column>
                <Information />
                <Toggle
                    labelText="Scan from deContact?"
                    labelA="No"
                    labelB="Yes"
                    bind:toggled={fullDeContactUrl}/></Column>
        </Row>
    </Grid>

    <label for="qrCodeModal" use:clickToCopy>{linkUrl}</label>
    <span id="qrCodeModal">{text}</span>
    <!--{#each myContactData as contact, index}-->
    <!--    <li>{contact.value.firstname} {contact.value.lastname}</li>-->
    <!--{/each}-->
    {#if qrCodeData && qrCodeOpen}
        <div class="container">
            <QrCode value={linkUrl} />
        </div>
    {/if}
</Modal>