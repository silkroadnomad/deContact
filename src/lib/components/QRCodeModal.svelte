<script>
    import {createEventDispatcher, onMount} from "svelte";
    import { Column, Modal, Toggle, Grid, Row } from "carbon-components-svelte";
    import QrCode from "svelte-qrcode"
    const dispatch = createEventDispatcher();
    import { connectedPeers, libp2p, orbitdb } from "../../stores.js";
    import { notify } from "../../utils/utils.js";

    const page_url = import.meta.env.VITE_PAGE_URL?import.meta.env.VITE_PAGE_URL+'/#':'https://deContact.xyz/#';

    export let qrCodeData
    export let qrCodeOpen

    let multiaddrs
    $:($connectedPeers>1)?multiaddrs = $libp2p.getMultiaddrs().map((ma) => ma.toString()):''

    let onBoardingToken
    let linkUrl = qrCodeData //`${page_url}/onboarding/${qrCodeData || '' }`
    let fullDeContactUrl = true
    $: $orbitdb!==undefined?$orbitdb.identity.sign($orbitdb.identity,"mytoken").then( (sig) => {
        onBoardingToken = sig
        console.log("signature created on onboardingToken",onBoardingToken)
    }):null;
    $: linkUrl = (fullDeContactUrl && $connectedPeers>1)?`${page_url}/onboarding/${qrCodeData}?onBoardingToken=${onBoardingToken}&multiaddr=${encodeURI(JSON.stringify(multiaddrs)) || '' }`:qrCodeData

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
                        labelText="Scan DID or URL?"
                        labelA="DID only"
                        labelB="URL"
                        bind:toggled={fullDeContactUrl}/>
                {/if}
            </Column>
        </Row>
        <Row>
            <Column>
                {#if qrCodeData && qrCodeOpen}
                    <div class="container" on:click={async () => {
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