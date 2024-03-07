<script>
    import { onMount } from "svelte";

    onMount(() => {
        console.log("mounting onboarding")
    })
</script>
<div class="content">
    <h1>Thank you for scanning my address</h1>
    <li>starting address book</li>
    <li>generating my random seed</li>
    <li>requesting address</li>
</div>

<style>
    :global(.content) {
        margin: 3rem;
    }

</style>