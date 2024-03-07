<script>
    import { did } from "../../routes/router.js";
    import {
        orbitdb,
        dbMyAddressBook,
        myAddressBook,
        progressText,
        progressState,
        connectedPeers
    } from "../../stores.js";
    import { requestAddress } from "../../lib/network/p2p-operations.js"

    $:{
        if($progressState>3 && //if connected
            $did!==undefined && $orbitdb!==undefined && $dbMyAddressBook.access!==undefined)
            requestAddress($did)
    }
    let scannedContact
    $:{
        if($myAddressBook.length>0){
            scannedContact = $myAddressBook?.filter((it) => {
                console.log("it.value?.owner", it.owner)
                return it.owner === $did
            })
            console.log("scannedContact",scannedContact[0])
        }
    }
</script>
<div class="content">
    <h1>Thank you for scanning my address {$did}</h1>
    <li>Peers connected: {$connectedPeers}</li>
    <li>State: {$progressText}</li>
    <li>
        {scannedContact && scannedContact.length>0?scannedContact[0].firstName:''}
        {scannedContact && scannedContact.length>0?scannedContact[0].lastName:''} added to addressbook
    </li>
</div>

<style>
    :global(.content) {
        margin: 3rem;
    }

</style>