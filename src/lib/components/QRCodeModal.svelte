<script>
    import {Column, Modal, Toggle, Grid, Row} from "carbon-components-svelte";
    import QrCode from "svelte-qrcode"
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import {connectedPeers, libp2p} from "../../stores.js";
    import {notify} from "../../utils/utils.js";

    const page_url = import.meta.env.VITE_PAGE_URL?import.meta.env.VITE_PAGE_URL+'/#':'https://deContact.xyz/#';
    export let qrCodeData
    export let qrCodeOpen

    let multiaddrs
    $:($connectedPeers>1)?multiaddrs = $libp2p.getMultiaddrs().map((ma) => ma.toString()):''

    let text = ''; //TODO when clicking use timeout to reset text to '' (maybe an animation)
    let linkUrl = qrCodeData //`${page_url}/onboarding/${qrCodeData || '' }`
    let fullDeContactUrl = true
    $: linkUrl = (fullDeContactUrl && $connectedPeers>1)?`${page_url}/onboarding/${qrCodeData+'?multiaddr='+encodeURI(JSON.stringify(multiaddrs)) || '' }`:qrCodeData
</script>

    <Modal bind:open={ qrCodeOpen }
       modalHeading="Scan (DID) - Decentralized Identity"
       primaryButtonText="OK"
       secondaryButtonText=""
       on:click:button--primary={ () => dispatch('close') }
       on:click:button--secondary={ () => dispatch('close') }
       on:close={()=>dispatch('close')}>
    <Grid>
        <Row>
            <Column>
                {#if multiaddrs && multiaddrs.length>0}
                    <Toggle
                        labelText="Generate invitation?"
                        labelA="No"
                        labelB="Yes"
                        bind:toggled={fullDeContactUrl}/>
                {/if}
            </Column>
        </Row>
        <Row>
            <Column>
                {#if qrCodeData && qrCodeOpen}
                    <div class="container" on:click={async () => {
                            console.log("linkurl",linkUrl)
                            await navigator.clipboard.writeText(linkUrl);
                            dispatch('close')
                            notify(`copied invitation`);
                        }}>
                        <QrCode  value={linkUrl} />
                    </div>
                {/if}
            </Column>
        </Row>
    </Grid>
</Modal>