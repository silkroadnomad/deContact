<script>
    import {
        Tabs,
        Tab,
        TabContent,
        Button,
        TextInput,
        Column,
        Grid,
        Row,
        ProgressBar,
        ToastNotification
    } from "carbon-components-svelte";
    import ContactForm from "$lib/components/ContactForm.svelte";
    import ContactList from "$lib/components/ContactList.svelte";
    import Settings from "$lib/components/Settings.svelte";

    import {
        qrCodeOpen,
        qrCodeData,
        handle,
        progressState,
        progressText,
        showNotification,
        libp2p,
        notificationMessage,
        selectedTab,
        selectedRowIds
    } from "../stores.js";
    import { loadContact } from "../operations.js";
    import { sendAddress } from "../network/net-operations.js"

    $: loadContact($selectedRowIds[0]);
    let scannedAddress;
    const toggleQrCode = () => {
        $qrCodeData = `ipfs://${$handle}`
        $qrCodeOpen = !$qrCodeOpen;
    };

    $: {
        const decoder = new TextDecoder("utf-8");
        const values = Array.from($libp2p?.peerRouting?.peerStore?.store.datastore.data.values() || []);
        const stringValues = values.map(value => decoder.decode(value));
        console.log(stringValues);
    }
</script>

<div class="content">
    {#if $progressState!==6}
    <ProgressBar helperText={"("+$progressState+"/6) "+$progressText} status={$progressState===6?"finished":"active"} />
    {/if}
    <Tabs class="tabs" bind:selected={$selectedTab}>
        <Tab label="Contacts" data-cy="contacts"/>
        <Tab label="My Address" data-cy="address"/>
        <Tab label="Settings"  data-cy="settings"/>
        <svelte:fragment slot="content">
            <TabContent>
                <Grid fullWidth>
                    <Row>
                        <Column><TextInput size="sm" bind:value={scannedAddress}/></Column>
                        <Column><Button size="sm" on:click={() => sendAddress($handle,scannedAddress)}>Scan Contact</Button></Column>
                        <Column><Button size="sm" on:click={toggleQrCode}>My QR-Code</Button></Column>
                    </Row>
                </Grid>
                <ContactList/>
            </TabContent>
            <TabContent><ContactForm/></TabContent>
            <TabContent><Settings/></TabContent>
        </svelte:fragment>
    </Tabs>
</div>
{#if $showNotification}
    <ToastNotification class="toast"
                       kind={$notificationMessage?.indexOf("error")!==-1?'error':'success'}
                       title={$notificationMessage?.indexOf("Error")!==-1?'error':'success'}
                       subtitle={$notificationMessage} />
{/if}
<style>
    :global(.content) {
        margin: 3rem;
    }
    :global(.bx--btn, input) {
        margin-bottom: 1rem;
    }
    :global(.tabs) {
        margin: 1rem;
    }
</style>
