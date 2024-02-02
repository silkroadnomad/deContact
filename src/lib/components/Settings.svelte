<script>
    import { TextInput, Column, Grid, Row,PasswordInput } from "carbon-components-svelte";
    import {
        libp2p,
        connectedPeers,
        masterSeed,
        handle,
        orbitdb, seedPhrase,
    } from "../../stores.js"

    $:window.localStorage.setItem('handle', $handle);
    $:window.localStorage.setItem('seed', $masterSeed);
    $:window.localStorage.setItem('seedPhrase', $seedPhrase);

    $:console.log("orbitdb",$orbitdb?.identity?.id)

</script>

<!--
 @component Settings component displays current address of db and my handle
 The handle is used in order to set write permissions for the databases
*/
-->
<Grid>
    <Row>
<!--        <Column sm={3}><TextInput labelText="My Handle"  size="sm" bind:value={$handle} /></Column>-->
        <Column sm={3}><TextInput labelText="DID"  size="sm" value={$orbitdb?.identity?.id} /></Column>
        <Column sm={3}><TextInput labelText="PeerId (LibP2P)"  size="sm" value={$libp2p?.peerId?.string} /></Column>

    </Row>
    <Row>
        <Column sm={3}><TextInput labelText="Connected Peers" readonly size="sm" bind:value={$connectedPeers} /></Column>
<!--        <Column sm={3}><TextInput labelText="Connected Peers" readonly size="sm" bind:value={$connectedPeers} /></Column>-->
    </Row>
    <Row>
        <Column sm={3}><TextInput labelText="Seed" size="sm" bind:value={$masterSeed} /></Column>
        <!--        <Column sm={3}><TextInput labelText="Connected Peers" readonly size="sm" bind:value={$connectedPeers} /></Column>-->
    </Row>
    <Row>
        <Column sm={3}><PasswordInput labelText="Seed" size="sm" bind:value={$seedPhrase} /></Column>
        <!--        <Column sm={3}><TextInput labelText="Connected Peers" readonly size="sm" bind:value={$connectedPeers} /></Column>-->
    </Row>
</Grid>