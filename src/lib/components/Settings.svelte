<script>
    import { TextInput, PasswordInput, Button, Column, Grid, Row, Toggle } from "carbon-components-svelte";
    import {
        libp2p,
        connectedPeers,
        masterSeed,
        orbitdb, seedPhrase,
        dbMyAddressBook, selectedAddr, selectedTab,
        useWebRTC,
        useWebSocket 
    } from "../../stores.js"

    $:window.localStorage.setItem('seed', $masterSeed);
    $:window.localStorage.setItem('seedPhrase', $seedPhrase);
    $:window.localStorage.setItem('useWebRTC', $useWebRTC.toString());
    $:window.localStorage.setItem('useWebSocket', $useWebSocket.toString());

  console.log("useWebRTC",$useWebRTC)
  </script>

<!--
 @component Settings component displays current address of db and my handle
 The handle is used in order to set write permissions for the databases
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
    <Row>
        <Column sm={3}>
            <Toggle id="webrtc-toggle" labelText="WebRTC" bind:toggled={$useWebRTC} /></Column>
    </Row>
    <Row>
        <Column sm={3}>
            <Toggle id="websocket-toggle" labelText="WebSocket" bind:toggled={$useWebSocket} /></Column>
    </Row>
    <Row class="custom-row">
        <Column sm={1}><Button data-cy="DropFollowerDBs" size="sm" on:click={async () => {
            const addressRecords = await $dbMyAddressBook.all();
            console.log("dropping DropFollowerDBs db!",addressRecords)
            for (const addressRecord of addressRecords) {
                if(addressRecord.value.own) continue
                console.log("dropping follower db",addressRecord.value.sharedAddress)
                 const followerDB2DDrop = await $orbitdb.open(addressRecord.value.sharedAddress)
                 await followerDB2DDrop.drop()
                 if(addressRecord.value.subscriber){
                    const deleteHash = await $dbMyAddressBook.del(addressRecord.key)
                    console.log("deleteHash",deleteHash)
                 }
            }
            console.log("addressRecords",addressRecords)
            selectedAddr.set({})
            selectedTab.set(0)
        }}>Drop Followed & Follower DBs</Button></Column>
        <Column>&nbsp;</Column>
        <Column sm={1}><Button data-cy="DropAddressDB" size="sm" on:click={async () => {
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