<script>
    import { onDestroy, onMount } from "svelte";
    import "carbon-components-svelte/css/all.css";
    import ConnectionSignalOff from "carbon-icons-svelte/lib/ConnectionSignalOff.svelte";
    import ConnectionSignal from "carbon-icons-svelte/lib/ConnectionSignal.svelte";
    import WatsonHealthAiStatus from "carbon-icons-svelte/lib/WatsonHealthAiStatus.svelte";
    import WatsonHealthAiStatusComplete from "carbon-icons-svelte/lib/WatsonHealthAiStatusComplete.svelte";
    import { Header, HeaderGlobalAction, HeaderNav, HeaderUtilities, Theme } from "carbon-components-svelte";
    import Modals from "$lib/components/QRCodeModal.svelte";
    import { myDal, qrCodeOpen, qrCodeData, subscriberList, seedPhrase, helia, orbitdb, masterSeed } from "../stores/stores.js";
    import { startNetwork } from "../lib/network/p2p-operations.js"
    import { getIdentityAndCreateOrbitDB} from "$lib/network/getIdendityAndCreateOrbitDB.js"

    import { connectedPeers } from "../stores/stores.js";
    import { confirmExperimentalUse } from "./confirmExperimentalUse.js";
    import { handleSeedphrase } from "./handleSeedphrase.js";

    const urlParams = new URLSearchParams(window.location.search); //TODO url params we need when we "onboard" a new user via scanning a URL

    let theme = "g90";

    async function handleDestroy() {
        // if($subscription) await $subscription.unsubscribe([CONTENT_TOPIC]);
    }
    $: window.localStorage.setItem('subscriberList', JSON.stringify($subscriberList));

    $: if ($helia!==undefined && $masterSeed!==undefined && $seedPhrase!==undefined) {
        handleSeedphrase().then(() => {
            getIdentityAndCreateOrbitDB('ed25519', $masterSeed, $helia)
                .then(dbInstance => {
                    orbitdb.set(dbInstance);
                })
                .catch(error => {
                    console.error('Failed to create OrbitDB instance:', error);
                });
        })
    }

    onMount(async ()=>{
        await confirmExperimentalUse();
        await handleSeedphrase();
        await startNetwork();
    })

    onDestroy(handleDestroy);

    let isSideNavOpen
    let title = "   - the cloud we are!"
</script>

<svelte:window on:beforeinstallprompt={()=>{ console.log("beforeinstallprompt") }} />

    <Header
        class="header-title"
        persistentHamburgerMenu={true}
        bind:isSideNavOpen
        company="deContact.xyz"
        platformName={title}
        href="./#/">

        <HeaderNav>
            <div class="flags">
                 {#if ($connectedPeers===0) }
                     <ConnectionSignalOff title="No network or connecting..." class="statusRed" />&nbsp;{$connectedPeers}
                 {:else if $connectedPeers===1}
                     <ConnectionSignal title="Seed Node connected" class="statusYellow" />&nbsp;{$connectedPeers}
                 {:else}
                     <ConnectionSignal title="Swarm connected" class="statusGreen" />&nbsp;{$connectedPeers}
                 {/if}
            </div>
<!--            <div class="flags">
                {#if $synced===true}
                    <WatsonHealthAiStatusComplete  title="Storage Protocol synced messages" class="statusGreen"/>&nbsp;{$recordsSynced.length | 0}
                {:else}
                    <WatsonHealthAiStatus title="Storage Protocol syncing..." class="statusYellow" />&nbsp;{$recordsSynced.length | 0}
                {/if}
            </div>-->
        </HeaderNav>

        <HeaderUtilities>
            <HeaderGlobalAction aria-label="dark-mode">
                <Theme
                        bind:theme
                        render="toggle"
                        toggle={{
                                themes: ["g90", "g80"],
                                labelA: "",
                                labelB: "",
                                hideLabel: true,
                                size: "sm",
                  }}/>
            </HeaderGlobalAction>
    </HeaderUtilities>
</Header>
<Modals on:close={() => $qrCodeOpen = false}
        bind:qrCodeOpen={$qrCodeOpen}
        qrCodeData={$qrCodeData}
        dbMyDal={$myDal} />
<slot></slot>
<style>
    :global(.bx--toast-notification) {
        z-index: 1;
        margin: 5rem;
    }
    :global(.statusRed) {
        color: red;
        width: 16px;
        height: 16px;
    }
    :global(.statusYellow) {
        color: yellow;
        width: 16px;
        height: 16px;
    }
    :global(.statusGreen) {
        color: green;
        width: 16px;
        height: 16px;
    }
    .flags {
        margin: 10px;
        display: flex;
        justify-content: space-between;
    }
</style>