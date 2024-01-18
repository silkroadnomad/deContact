<script>
    import { onDestroy, onMount } from "svelte";
    import "carbon-components-svelte/css/all.css";
    import {
        Header,
        HeaderGlobalAction,
        HeaderNav,
        HeaderUtilities,
        Theme,
        ToastNotification
    } from "carbon-components-svelte";
    import Modals from "$lib/components/QRCodeModal.svelte";
    import {
        showNotification,
        notificationMessage,
        myDal,
        qrCodeOpen,
        qrCodeData,
        subscription,
        myAddressBook,
        subscriberList, identity
    } from "../stores.js";
    import { startNetwork, CONTENT_TOPIC } from "../network/net-operations.js"
    import { connectedPeers } from "../stores.js";

    const urlParams = new URLSearchParams(window.location.search);

    let theme = "g90";

    async function handleDestroy() {
        if($subscription) await $subscription.unsubscribe([CONTENT_TOPIC]);
    }

    $: window.localStorage.setItem('myAddressBook', JSON.stringify($myAddressBook));
    $: window.localStorage.setItem('subscriberList', JSON.stringify($subscriberList));

    onMount(startNetwork);
    onDestroy(handleDestroy);

    let isSideNavOpen
    let title = "   - the cloud we are!"
</script>

<svelte:window on:beforeinstallprompt={()=>{console.log("beforeinstallprompt")}} />
<Header
        class="header-title"
        persistentHamburgerMenu={true}
        bind:isSideNavOpen
        company="deContact.xyz"
        platformName={title}
        href="./#/">
    <HeaderNav>
        <div class="flags">Identity: {$identity}</div>
        <div class="flags">
        Peers: {$connectedPeers}</div>
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
                            themes: ["g10", "g80"],
                            labelA: "",
                            labelB: "",
                            hideLabel: true,
                            size: "sm",
              }}/>
        </HeaderGlobalAction>
    </HeaderUtilities>
</Header>
<Modals on:close={() => $qrCodeOpen = false} bind:qrCodeOpen={$qrCodeOpen} qrCodeData={$qrCodeData} dbMyDal={$myDal} />
{#if $showNotification}
    <ToastNotification class="toast" kind="success" title="Success" subtitle={$notificationMessage} />
{/if}
<slot></slot>
<style>
    .toast {
        margin: 3rem;
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