<script>
    import { TextInput, Button, Column, Grid, Row, PasswordInput } from "carbon-components-svelte";
    import ConnectionSignalOff from "carbon-icons-svelte/lib/ConnectionSignalOff.svelte";
    import ConnectionSignal from "carbon-icons-svelte/lib/ConnectionSignal.svelte";


    import WatsonHealthAiStatus from "carbon-icons-svelte/lib/WatsonHealthAiStatus.svelte";
    import WatsonHealthAiStatusComplete from "carbon-icons-svelte/lib/WatsonHealthAiStatusComplete.svelte";
    import {connectedPeers, recordsSynced, synced} from "../../stores.js";
</script>

<!--
 @component Statistics component
*/
-->
<Grid>
    <Row>
        <Column sm={2}>Seed Node connected / Swarm connected  </Column>
        <Column sm={1}>
            {#if ($connectedPeers===0) }
                <ConnectionSignalOff title="No network or connecting..." class="statusRed" />&nbsp;{$connectedPeers}
            {:else if $connectedPeers===1}
                <ConnectionSignal title="Seed Nodes connected" class="statusYellow" />&nbsp;{$connectedPeers}
            {:else}
                <ConnectionSignal title="Swarm connected" class="statusGreen" />&nbsp;{$connectedPeers}
            {/if}
        </Column>
    </Row>

<!--    <Row>-->
<!--        <Column sm={2}>Global Storage Protocol Synced Messages: </Column>-->
<!--        <Column sm={1}>-->
<!--            {#if $synced===true}-->
<!--            <WatsonHealthAiStatusComplete  title="Storage Protocol synced messages" class="statusGreen"/>&nbsp;{$recordsSynced.length | 0}-->
<!--        {:else}-->
<!--            <WatsonHealthAiStatus title="Storage Protocol syncing..." class="statusYellow" />&nbsp;{$recordsSynced.length | 0}-->
<!--        {/if}</Column>-->
<!--    </Row>-->

</Grid>
<style>
    :global(.bx--label) {
        color: white;
    }

    :global(.bx--row) {
        margin-bottom: 40px; /* Adjust the bottom margin to increase space between rows */
    }
</style>