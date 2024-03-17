<script>
     import { selectedAddr, orbitdb } from "../../stores.js";
     import { addContact, deleteContact, updateContact } from "../../operations.js";
     import { Button, Checkbox, Column, Dropdown, Grid, Row, TextInput } from "carbon-components-svelte";
     import {goto} from "$app/navigation";
     export let isOnBoarding = false
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
                <TextInput data-cy="txtEmail" size="sm" labelText="Email" placeholder="Email" bind:value={$selectedAddr.email}  />
            </Column>
            <Column></Column>
        </Row>
        <Row>
            <Column><Dropdown
                    titleText="Category"
                    bind:selectedId={$selectedAddr.category}
                    items={[
                            { id: "private", text: "Private" },
                            { id: "business", text: "Business" },
                            { id: "other", text: "Other" },
                    ]}
            /></Column>
            <Column>
                {#if $selectedAddr.owner === $orbitdb?.identity?.id || !$selectedAddr._id}
                    <Checkbox labelText="our own address" name="own" bind:checked={$selectedAddr.own}/>
                {/if}
            </Column>
        </Row>
        <Row>
            <Column>
                {#if $selectedAddr._id}
                    {#if $selectedAddr.owner === $orbitdb.identity.id}
                        <Button data-cy="updateContact" size="sm" on:click={() => updateContact()}>Update</Button>
                        <Button data-cy="newContact" size="sm" on:click={() => $selectedAddr = {}}>New</Button>
                    {/if}
                    <Button data-cy="deleteContact" size="sm" on:click={() => deleteContact()}>Delete</Button>

                {:else}
                    <Button data-cy="addContact" size="sm" on:click={async () => {
                        await addContact(isOnBoarding)
                        if(isOnBoarding) await goto("/")
                    }}>Add</Button>
                {/if}
            </Column>
        </Row>
    </Grid>

</section>