<script>
    import {Modal, Column, Grid, Row, } from "carbon-components-svelte";
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    import Time from "svelte-time";

    /* the header of the modal @type {string} [heading='Confirmation'] */
    export let heading = 'Confirmation';
    /* the message to be displayed @type {string}  [message=''Do you want to proceed?']*/
    // export let message = 'Do you want to proceed?';
    /* ok button (true) @type {string}  [TrueButtonText='Continue']*/
    export let TrueButtonText = 'Continue';
    /* the cancel button (false) @type {string}  [FalseButtonText='Cancel']*/
    export let FalseButtonText = 'Cancel';
    export let data
    // export let modalHeading = "Decentralized Address Book"
    let text = '';

    function copySuccess(){
        text = "Copied!"
    }

    function copyError(event){
        text = `Error! ${event.detail}`
    }
</script>
<svelte:window on:copysuccess={copySuccess} on:copyerror={copyError}/>

<Modal open
       shouldSubmitOnEnter={false}
       primaryButtonText={TrueButtonText}
       secondaryButtonText={FalseButtonText}
       selectorPrimaryFocus=".bx--btn--primary"
       modalHeading={heading}
on:close={() => dispatch('result', false)}
on:click:button--secondary={() => {
    /** when a button is clicked 'result' event with a result object is dispatched @return {boolean} true or false according to the clicked button */
    dispatch('result', false);
}}
on:submit={() => dispatch('result', true)}
>
<Grid>
    <Row><Column>Command: {data.command}</Column></Row>
    <Row><Column>Recipient: {data.recipient}</Column></Row>
    <Row><Column>Sender: {data.sender}</Column></Row>
    <Row><Column>TimeStamp: <Time timestamp={data.timestamp} /> </Column></Row>
</Grid>
</Modal>