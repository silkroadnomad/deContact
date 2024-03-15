<script>
    import {
        ComposedModal,
        ModalHeader,
        ModalBody,
        ModalFooter,
        ExpandableTile,
        Column,
        Grid,
        Row, Checkbox
    } from "carbon-components-svelte";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    export let heading = 'deContact Protocol Action';
    export let ExchangeContactDataButtonText = 'Exchange Contact Data';
    export let SendMyContactData = 'Send My Contact Data';
    export let CancelOperationButtonText = 'Cancel';
    export let data;
    export let db;
    export let sender;

    let businessCard;
    let exchangeData = true

    async function fetchBusinessCard() {
        const businessCardElements = await db.all();
        const filteredElements = businessCardElements.filter(element => element.value.owner === sender);
        businessCard = filteredElements.length > 0 ? filteredElements[0].value : null;
    }

    onMount(() => {
        fetchBusinessCard();
        dispatch("addressExchange");
    });
</script>

<ComposedModal open on:close={() => dispatch('result', false)} on:submit={() => dispatch('result', true)}>
    <ModalHeader label="deContact Protocol Action" title={heading} />
    <ModalBody hasForm>
        <ExpandableTile>
            <div slot="above">
                <div>From:
                    {#if businessCard}
                        {businessCard.firstName} {businessCard.lastName} {businessCard.city} <br/>
                        owner: {businessCard.owner}<br/>
                    {/if}
                </div>
                <p>&nbsp;</p>
                <Checkbox labelText="Request contact data from requester in exchange"  bind:checked={exchangeData} />
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
        primaryButtonText={ SendMyContactData }
        on:click:button--primary={() => exchangeData?dispatch('result', true):dispatch('result', "ONLY_HANDOUT")}
        selectorPrimaryFocus=".bx--btn--primary"
        secondaryButtons={[
            { text: CancelOperationButtonText }
        ]}
        on:click:button--secondary={({ detail }) => {
            if (detail.text === CancelOperationButtonText) dispatch('result', false);

        }}
    />
</ComposedModal>
