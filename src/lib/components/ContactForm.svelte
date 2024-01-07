<script>
     import { selectedTab, selectedAddr} from "../../stores.js";
     import {addContact, deleteContact, updateContact} from "../../operations.js";
     import {Button, Checkbox, Column, Grid, Row, TextInput} from "carbon-components-svelte";
</script>

<section>
    <Grid>
        <Row>
            <Column><TextInput data-cy="txtFirstname" size="sm" labelText="firstname" placeholder="Enter firstname..."
                               bind:value={$selectedAddr.firstName} /></Column>
            <Column><TextInput data-cy="txtLastname" size="sm" labelText="lastname" placeholder="Enter lastname..."
                               bind:value={$selectedAddr.lastName} /></Column>
        </Row>
        <Row>
            <Column><TextInput  data-cy="txtStreet" size="sm" labelText="street" placeholder="Enter street..."
                                bind:value={$selectedAddr.street}  /></Column>
            <Column><TextInput  data-cy="txtZipCode" size="sm" labelText="zipcode" placeholder="Enter zipcode..."
                                bind:value={$selectedAddr.postalCode}  /></Column>
        </Row>
        <Row>
            <Column><TextInput  data-cy="txtCity" size="sm" labelText="city" placeholder="Enter city..."
                                bind:value={$selectedAddr.city}  /></Column>
            <Column><TextInput  data-cy="txtCountry" size="sm" labelText="country" placeholder="Enter country..."
                                bind:value={$selectedAddr.countryRegion}  /></Column>
        </Row>
        <Row>
            <Column>
                {#if $selectedAddr.id}
                    <Button data-cy="updateContact" size="sm" on:click={() => updateContact()}>Update</Button>
                    <Button data-cy="deleteContact" size="sm" on:click={() => deleteContact()}>Delete</Button>
                    <Button data-cy="newContact" size="sm" on:click={() => $selectedAddr = {}}>New</Button>
                {:else}
                    <Button data-cy="addContact" size="sm" on:click={() => addContact()}>Add</Button>
                {/if}
            </Column>
        </Row>
    </Grid>

</section>