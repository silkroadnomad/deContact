<script>
    import { TextInput, Button, Column, Grid, Row, PasswordInput } from "carbon-components-svelte";
    import {
        libp2p,
        connectedPeers,
        masterSeed,
        handle,
        orbitdb, seedPhrase,
        dbMyAddressBook, selectedAddr, selectedTab
    } from "../../stores.js"
    $:window.localStorage.setItem('handle', $handle);
    $:window.localStorage.setItem('seed', $masterSeed);
    $:window.localStorage.setItem('seedPhrase', $seedPhrase);
</script>

<!--
 @component Settings component displays current address of db and my handle
 The handle is used in order to set write permissions for the databases
*/
-->
<Grid>
    <Row>
        <Column sm={3}><TextInput labelText="DID"
                                  helperText="Generated from your seed phrase"
                                  size="sm"
                                  readonly
                                  value={$orbitdb?.identity?.id} /></Column>
    </Row>

    <Row class="custom-row">
        <Column sm={3}><PasswordInput labelText="Seed Phrase" helperText="If you change the seed phrase a new DID is generated" size="sm" bind:value={$seedPhrase} /></Column>
<!--        <Column size="small"><Button kind="tertiary" on:click={ async () => {-->
<!--            const result = await confirm({ data: {-->
<!--                text:   "the contact data of this user are (will be) stored in an own orbit-db document table, " +-->
<!--                        "all data inside are encrypted so from outside nobody could ever decrypt it even when connecting to our peer this database." +-->
<!--                        "when this button is clicked the OrbitDBs will be re-connected according to our new seed." } })-->
<!--        }}>Sync My Devices</Button></Column>-->
    </Row>

    <Row>
        <Column sm={3}><TextInput labelText="PeerId (LibP2P)"
                                  helperText="Every device has a unique peer id independent from your seed phrase"
                                  readonly size="sm"
                                  value={$libp2p?.peerId?.string} /></Column>
    </Row>

    <Row class="custom-row">
        <Column sm={3}><TextInput labelText="Connected Peers"
                                  helperText="This is the amount of peers which are connected in our peer-to-peer network"
                                  readonly
                                  size="sm"
                                  value={$connectedPeers} /></Column>
    </Row>
    <Row class="custom-row">
        <Column sm={3}><Button data-cy="DropAddressDB" size="sm" on:click={async () => {
            console.log("dropping address db!")

            await $dbMyAddressBook.drop()
            const addressRecords = await $dbMyAddressBook.all();
            console.log("addressRecords",addressRecords)
            selectedAddr.set({})
            selectedTab.set(0)
        }}>Drop AddressDB</Button></Column>
    </Row>

</Grid>
<style>
    :global(.bx--label) {
        color: white;
    }

    :global(.bx--row) {
        margin-bottom: 40px; /* Adjust the bottom margin to increase space between rows */
    }
</style>