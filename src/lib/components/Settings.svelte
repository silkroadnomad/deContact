<script>
    import { Button, TextInput, Dropdown, Column, Grid, Row } from "carbon-components-svelte";
    import {connectedPeers,identity} from "../../stores.js"

    $:window.localStorage.setItem('identity', $identity);
</script>
<!--
 @component Settings component displays current address of db and my identity
 The identity is used in order to set write permissions for the databases
*/
-->
<Grid>
    <Row>
        <Column sm={3}><TextInput labelText="My Identity"  size="sm" bind:value={$identity} /></Column>
        <Column sm={3}><TextInput labelText="Connected Peers" readonly size="sm" bind:value={$connectedPeers} /></Column>
    </Row>
</Grid>