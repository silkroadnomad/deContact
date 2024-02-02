<script>
    import { onDestroy, onMount } from "svelte";
    import "carbon-components-svelte/css/all.css";
    import { bootstrapConfig } from "../config.js";
    import {
        Header,
        HeaderGlobalAction,
        HeaderNav,
        HeaderUtilities,
        Theme,
    } from "carbon-components-svelte";

    import Modals from "$lib/components/QRCodeModal.svelte";

    import {
        myDal,
        qrCodeOpen,
        qrCodeData,
        myAddressBook,
        subscriberList, masterSeed, helia, synced, recordSynced
    } from "../stores.js";

    import { startNetwork, getIdentity } from "../network/net-operations.js"
    import { connectedPeers } from "../stores.js";

    const urlParams = new URLSearchParams(window.location.search);

    let theme = "g90";

    async function handleDestroy() {
        // if($subscription) await $subscription.unsubscribe([CONTENT_TOPIC]);
    }

    console.log("bootstrapConfig",bootstrapConfig)
    $: window.localStorage.setItem('myAddressBook', JSON.stringify($myAddressBook));
    $: window.localStorage.setItem('subscriberList', JSON.stringify($subscriberList));

    $: {
        if($helia && $masterSeed)
            getIdentity('ed25519',$masterSeed,$helia)
    }

    onMount(startNetwork);
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
<!--            <div class="flags">Identity: {$handle}</div>-->
            <div class="flags">Peers: {$connectedPeers}</div>
            <div class="flags">In Sync: {$synced}</div>
            <div class="flags">Synced: {$recordSynced.length | 0}</div>
        </HeaderNav>

        <HeaderUtilities>

<!--        <div class="flags">-->
<!--            <De style="margin-right: 10px" on:click={()=>$locale="de"}/>-->
<!--            <Gb style="margin-right: 10px"  on:click={()=>$locale="en"}/>-->
<!--        </div>-->
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
<Modals on:close={() => $qrCodeOpen = false} bind:qrCodeOpen={$qrCodeOpen} qrCodeData={$qrCodeData} dbMyDal={$myDal} />

<slot></slot>
<style>
    :global(.bx--toast-notification) {
        z-index: 1;
        margin: 5rem;
    }
    .peers {
        margin: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .flags {
        margin: 10px;
        display: flex;
        justify-content: space-between;
    }
</style>