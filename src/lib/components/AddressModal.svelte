<script>
    import { ExpandableTile,
        ComposedModal,
        ModalHeader,
        ModalBody,
        ModalFooter, Column, Grid, Row } from "carbon-components-svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let heading = 'deContact Protocol Action';
    export let ExchangeContactDataButtonText = 'Exchange Contact Data';
    export let OnlyHandoutMyDataButtonText = 'Only hand out my contact data';
    export let CancelOperationButtonText = 'Cancel this operation';
    export let data;
    export let db;
    export let sender;

    let businessCard

    const getBusinessCard = async () => {
        const businessCardElements = await db.all();
        const filteredElements = businessCardElements.filter(element => {
            return element.value.owner === sender
        });
        return filteredElements[0].value
    }
    $:{
        getBusinessCard(db).then(bc => businessCard=bc)
    }
</script>
<ComposedModal open on:close={() => dispatch('result', false)} on:submit={() => dispatch('result', true)}>
    <ModalHeader label="deContact Protocoll Action" title={heading} />
    <ModalBody hasForm>
<!--        <Checkbox labelText="I have reviewed the changes" bind:checked />-->
        <ExpandableTile>
            <div slot="above">
                <div>{businessCard?.firstName} {businessCard?.lastName} {businessCard?.city} <br/> sent a contact data request</div>
                you can: <br/>
                <li>Exchange your contact data with {businessCard?.firstName}'s data</li>
                <li>ONLY write your contact data into {businessCard?.firstName}'s address book</li>
                <li>Don't do anything of this and cancel this request</li>
                <br />
                <br />
                <div>View Transaction Details</div>
            </div>
            <div slot="below">
                <Grid>
                    {#if data.command}<Row><Column>Command: {data.command}</Column></Row> {/if}
                    {#if data.text} <Row><Column>{data.text}</Column></Row> {/if}
                    {#if data.recipient} <Row><Column>Recipient: {data.recipient}</Column></Row> {/if}
                    {#if data.sender} <Row><Column>Sender: {data.sender}</Column></Row> {/if}
                    {#if data.timestamp} <Row><Column>TimeStamp: {data.timestamp}</Column></Row> {/if}
                </Grid>
            </div>
        </ExpandableTile>
    </ModalBody>
    <ModalFooter
            primaryButtonText={ ExchangeContactDataButtonText }
            on:click:button--pimary={() => dispatch('result', true)}
            selectorPrimaryFocus=".bx--btn--primary"
            secondaryButtons={[{ text: CancelOperationButtonText }, { text: OnlyHandoutMyDataButtonText }]}
            on:click:button--secondary={({ detail }) => {
                if (detail.text === CancelOperationButtonText) dispatch('result', false);
                if (detail.text === OnlyHandoutMyDataButtonText) dispatch('result', "ONLY_HANDOUT");
            }}
    />
</ComposedModal>