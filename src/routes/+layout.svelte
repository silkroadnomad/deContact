<script>
    import { onDestroy, onMount } from "svelte";
    import "carbon-components-svelte/css/all.css";
    import { Theme, ToastNotification } from "carbon-components-svelte";
    import Modals from "$lib/components/QRCodeModal.svelte";
    import { showNotification, notificationMessage, qrCodeOpen, qrCodeData, myDal, subscription, myAddressBook,subscriberList } from "../stores.js";
    import { startNetwork, CONTENT_TOPIC } from "../network/net-operations.js"
    const urlParams = new URLSearchParams(window.location.search);

    let theme = "g90";

    async function handleDestroy() {
        await $subscription.unsubscribe([CONTENT_TOPIC]);
    }

    $: window.localStorage.setItem('myAddressBook', JSON.stringify($myAddressBook));
    $: window.localStorage.setItem('subscriberList', JSON.stringify($subscriberList));

    onMount(startNetwork);
    onDestroy(handleDestroy);
</script>

<Theme bind:theme />
    <Modals on:close={() => $qrCodeOpen = false} bind:qrCodeOpen={$qrCodeOpen} qrCodeData={$qrCodeData} dbMyDal={$myDal} />

    {#if $showNotification}
        <ToastNotification kind="success" title="Success" subtitle={$notificationMessage} />
    {/if}
<slot></slot>