<script>
    import { ComposedModal, ModalHeader, ModalBody, ModalFooter, ExpandableTile, Column, Grid, Row, Checkbox } from "carbon-components-svelte";
    import { onMount, createEventDispatcher } from "svelte";

    /** dispatches the events when a button was clicked*/
    const dispatch = createEventDispatcher();

    /** the header of the modal @type {string} [heading='deContact Protocol Action'] */
    export let heading = 'deContact Protocol Action';
    /** the button label when sending the contact data  @type {string} [heading='Send My Contact Data'] */
    export let SendMyContactData = 'Send My Contact Data';
    /** the button label when canceling the operation  @type {string} [heading='Send My Contact Data']*/
    export let CancelOperationButtonText = 'Cancel';

    /** the pub-sub message from Alice */
    export let data;

    /** the orbitdb of Alice (which requests contact data from Bob */
    export let db;

    /** contains the contact data of Alice (the requester) @type {Array<object>} */
    let aliceOwnContactData

    /** label for the checkbox which requests the contact data from Alice after Bob received her data @type {string} */
    let checkboxLabel;

    /** if Alice receives a REQUEST_ADDRESS from Bob, he marks the pubsub message with nopingpong=true so Alice isn't requesting Bobs contact data again*/
    let exchangeData = data.nopingpong?true:false
    let dontRequestData = data.nopingpong

    /**
     * @function
     * Opens the address book of the requester (Alice) and iterates over all contacts.
     * Find Alice own contact data.
     *
     * //TODO since Alice db is encrypted by her publicKey, those data can't be read in practice from the db.
     * //TODO 1. the db must be still opened so we replicate (and backup her db)
     * //TODO 2. Alice contact data (her business card should be sent in the pubsub message encrypted by Bob's public key.
     *
     * @returns {Promise<void>}
     */
    async function readRequestersContactData(){
        const businessCardElements = await db.all();
        aliceOwnContactData = businessCardElements.filter(element => element.value.owner === data.sender);

        if(aliceOwnContactData.length>0)
            checkboxLabel =  `Contact data request from ${aliceOwnContactData[0].value.firstName} ${aliceOwnContactData[0].value?.lastName} ${aliceOwnContactData[0].value.city}`
    }

    onMount(() => {
        readRequestersContactData();
    });

</script>

<!--
@component
Opens a confirmation modal on Bob's device when Alice is requesting his contact data.

-->
<ComposedModal open on:close={() => dispatch('result', false)} on:submit={() => dispatch('result', true)}>
    <ModalHeader label="deContact Protocol Action" title={heading} />
    <ModalBody hasForm>
        <ExpandableTile>
            <div slot="above">
                <div>From:
                    {#if filteredElements.length>0}
                        {contactData?.firstName} {contactData?.lastName} {contactData?.city} <br/>
                        owner: {contactData?.owner}<br/>
                    {/if}
                </div>
                <p>&nbsp;</p>
                {#if !dontRequestData}<Checkbox labelText={checkboxLabel}  bind:checked={exchangeData} />{/if}
                <p>&nbsp;</p>
                <div>View Transaction Details</div>
            </div>
            <div slot="below">
                <Grid>
                    {#if data.command}<Row><Column>Command: {data.command}</Column></Row>{/if}
                    {#if data.text}<Row><Column>{data.text}</Column></Row>{/if}
                    {#if data.recipient}<Row><Column>Recipient: {data.recipient}</Column></Row>{/if}
                    {#if data.sender}<Row><Column>Sender: {data.sender}</Column></Row>{/if}
                    {#if data.timestamp}<Row><Column>TimeStamp: {data.timestamp}</Column></Row>{/if}
                </Grid>
            </div>
        </ExpandableTile>
    </ModalBody>

    <ModalFooter
            primaryButtonDisabled
            selectorPrimaryFocus=".bx--btn--primary"
            secondaryButtons={[
                { text: CancelOperationButtonText },{ text: SendMyContactData }
            ]}
            on:click:button--secondary={({ detail }) => {
                if (detail.text === CancelOperationButtonText) dispatch('result', false);
                if (detail.text === SendMyContactData) dispatch('result', (dontRequestData || !exchangeData)?"ONLY_HANDOUT":true)
            }}
    />
</ComposedModal>
