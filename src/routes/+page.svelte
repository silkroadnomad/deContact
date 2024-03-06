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
    import Statistics from "$lib/components/Statistics.svelte";

    import {
        orbitdb,
        qrCodeOpen,
        qrCodeData,
        progressState,
        progressText,
        showNotification,
        notificationMessage,
        selectedTab,
        selectedRowIds
    } from "../stores.js";
    import { loadContact } from "../operations.js";
    import { requestAddress } from "../lib/network/p2p-operations.js"

    $: $selectedRowIds.length>0?loadContact($selectedRowIds[0]):null; //as the datatable gets clicked we load the contact into the contact form
    let scannedAddress;
</script>

<div class="content">
    {#if $progressState!==6}
    <ProgressBar helperText={"("+$progressState+"/6) "+$progressText} status={$progressState===6?"finished":"active"} />
    {/if}
    <Tabs class="tabs" bind:selected={$selectedTab}>
        <Tab label="Contacts" data-cy="contacts"/>
        <Tab label="My Address" data-cy="address"/>
        <Tab label="Statistics"  data-cy="statistics"/>
        <Tab label="Settings"  data-cy="settings"/>
        <svelte:fragment slot="content">
            <TabContent>
                <Grid fullWidth>
                    <Row>
                        <Column>
                            <TextInput role="scanContact" size="sm" bind:value={scannedAddress} on:keydown={(e) => e.code==='Enter'?requestAddress(scannedAddress):null} />
                        </Column>
                            <Column>
<!--                                <Scan on:click={()=>requestAddress(scannedAddress)}/>-->
                            <Button size="sm" on:click={async () => await requestAddress(scannedAddress)}>Scan Contact</Button>
                        </Column>
                        <Column><Button size="sm" on:click={
                        () => {
                            $qrCodeData = $orbitdb?.identity?.id
                            $qrCodeOpen = !$qrCodeOpen; }
                            }>Show QR-Code</Button></Column>
                    </Row>
                </Grid>
                <ContactList/>
            </TabContent>
            <TabContent><ContactForm/></TabContent>
            <TabContent><Statistics/></TabContent>
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
