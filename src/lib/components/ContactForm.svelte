<script>
    import { Button, Checkbox, Column, Dropdown, Grid, Row, TextInput } from "carbon-components-svelte";
    import { getAddressRecords } from "decontact";
    import { orbitdb, deContact, myAddresses, selectedTab, selectedAddr } from "../../stores/stores.js";
    import { notify } from "../../utils/utils.js";

    /**
     * Synchronizes the address book in store with the addressbook in orbitdb
     */
     async function updateAddressBook() {
         const myDBAddressBook = await $deContact.getMyAddressBook();
         const result = await getAddressRecords(myDBAddressBook);
         $myAddresses = result;
     }

     /**
      * Adds a new contact into orbitdb dbMyAddressBook and switches back to ContactList Tab
      */
     async function addContact() {
         const hash = await $deContact.addContact($selectedAddr);
         notify(`Contact added successfully to ipfs/orbitdb! ${hash}`);
         $selectedAddr = {};
         $selectedTab = 0
         updateAddressBook();
     }

     /**
      * Saves the current edited address into the Svelte storage and informs the subscribers about the address update
      */
     export async function updateContact() {
         await $deContact.updateContact($selectedAddr);
         notify(`Contact updated successfully - informing our subscribers!`);
         $selectedAddr = {};
         $selectedTab = 0
         updateAddressBook();

     }

     /**
      * Deletes a contact from our db
      */
     export async function deleteContact() {
         const deleteHash = await $deContact.deleteContact($selectedAddr._id);
         notify(`Contact deleted successfully! ${deleteHash}`);
         $selectedAddr = {};
         $selectedTab = 0
         updateAddressBook();
     }

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
            <Column><Dropdown
                    titleText="Category"
                    bind:selectedId={$selectedAddr.category}
                    items={[
                            { id: "private", text: "Private" },
                            { id: "business", text: "Business" },
                            { id: "other", text: "Other" },
                    ]}
            /></Column>
            <Column><Checkbox labelText="our own address" name="own" bind:checked={$selectedAddr.own}/></Column>
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
                    <Button data-cy="addContact" size="sm" on:click={() => addContact($selectedAddr)}>Add</Button>
                {/if}
            </Column>
        </Row>
    </Grid>
</section>