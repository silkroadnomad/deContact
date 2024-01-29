<script>
    import { Modal, Column, Grid, Row } from "carbon-components-svelte";
    import { createEventDispatcher } from "svelte";
    import { ENTER_EXISTING, GENERATE_NEW } from "./seedModal.js"
    const dispatch = createEventDispatcher();

    /* the header of the modal @type {string} [heading='Seed phrase Generation'] */
    export let heading = 'Seed phrase generation';

    /* the confirm button @type {string}  [GenerateNewButtonText='Generate New']*/
    export let GenerateNewButtonText = 'Generate New';
    /* the cancel button @type {string}  [EnterExistingSeedButtonText='Enter Existing Seed Phrase']*/
    export let EnterExistingSeedButtonText = 'Enter Existing Seed Phrase';
    export let data

</script>

<Modal open
       shouldSubmitOnEnter={false}
       primaryButtonText={GenerateNewButtonText}
       secondaryButtonText={EnterExistingSeedButtonText}
       selectorPrimaryFocus=".bx--btn--primary"
       modalHeading={heading}

       on:close={() => dispatch('result', ENTER_EXISTING)}
       on:click:button--secondary={() => {
            /** when a button is clicked 'result' event with a result object is dispatched @return {boolean} true or false according to the clicked button */
            dispatch('result', ENTER_EXISTING);
        }}
        on:submit={() => dispatch('result', GENERATE_NEW)}
        >
        <Grid>
            {#if data.text} <Row><Column>{data.text}</Column></Row> {/if}
        </Grid>
</Modal>