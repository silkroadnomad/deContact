<script>
    import {
        ComposedModal,
        ModalHeader,
        ModalBody,
        ModalFooter,
        ExpandableTile,
        Column,
        Grid,
        Row
    } from "carbon-components-svelte";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    export let heading = 'deContact Protocol Action';
    export let ExchangeContactDataButtonText = 'Exchange Contact Data';
    export let OnlyHandoutMyDataButtonText = 'Only hand out my contact data';
    export let CancelOperationButtonText = 'Cancel this operation';
    export let data;
    export let db;
    export let sender;

    let businessCard;

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
                <div>
                    {#if businessCard}
                        {businessCard.firstName} {businessCard.lastName} {businessCard.city} <br/> sent a contact data request
                    {/if}
                </div>
                <p>You can:</p>
                <ul>
                    <li>Exchange your contact data with {businessCard?.firstName}'s data</li>
                    <li>ONLY write your contact data into {businessCard?.firstName}'s address book</li>
                    <li>Don't do anything of this and cancel this request</li>
                </ul>
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
        primaryButtonText={ExchangeContactDataButtonText}
        on:click:button--primary={() => dispatch('result', true)}
        selectorPrimaryFocus=".bx--btn--primary"
        secondaryButtons={[
            { text: CancelOperationButtonText },
            { text: OnlyHandoutMyDataButtonText }
        ]}
        on:click:button--secondary={({ detail }) => {
            if (detail.text === CancelOperationButtonText) dispatch('result', false);
            if (detail.text === OnlyHandoutMyDataButtonText) dispatch('result', "ONLY_HANDOUT");
        }}
    />
</ComposedModal>
