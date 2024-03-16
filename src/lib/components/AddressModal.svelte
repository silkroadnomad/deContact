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
    export let SendMyContactData = 'Send My Contact Data';
    export let CancelOperationButtonText = 'Cancel';
    export let data;
    export let db;

    let businessCard;
    let checkboxLabel;
    let exchangeData = data.nopingpong?true:false
    let dontRequestData = data.nopingpong

    async function fetchBusinessCard(){
        const businessCardElements = await db.all();
        const filteredElements = businessCardElements.filter(element => element.value.owner === data.sender);
        businessCard = filteredElements.length > 0 ? filteredElements[0].value : null;
        checkboxLabel =  `Request contact data from ${businessCard?.firstName} ${businessCard?.lastName} ${businessCard?.city} in exchange`
    }

    onMount(() => {
        fetchBusinessCard();
        dispatch("addressExchange");
    });
console.log("dontRequestData",dontRequestData)
</script>

<ComposedModal open on:close={() => dispatch('result', false)} on:submit={() => dispatch('result', true)}>
    <ModalHeader label="deContact Protocol Action" title={heading} />
    <ModalBody hasForm>
        <ExpandableTile>
            <div slot="above">
                <div>From:
                    {#if businessCard}
                        {businessCard?.firstName} {businessCard?.lastName} {businessCard?.city} <br/>
                        owner: {businessCard?.owner}<br/>
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
