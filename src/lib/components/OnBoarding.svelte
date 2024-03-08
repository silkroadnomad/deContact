<script>
    import { did, query } from "../../routes/router.js";
    import { multiaddr } from '@multiformats/multiaddr'
    import {
        orbitdb,
        libp2p,
        dbMyAddressBook,
        myAddressBook,
        progressText,
        connectedPeers
    } from "../../stores.js";
    import { requestAddress } from "../../lib/network/p2p-operations.js"

    const aliceMultiAddress = JSON.parse(decodeURI($query).split("=")[1])
    console.log("aliceMultiAddress",aliceMultiAddress[0])
    $:{
        if($libp2p && $connectedPeers>0){
            $libp2p.dial(multiaddr(aliceMultiAddress[0])).then((info) => {
                console.log("connected peer",info)}).catch( (e) => {
                console.log("e",e)
            })
        }
    }
    let scannedContact
    let requested
    $:{
            if($connectedPeers>1 && //if connected
                $did!==undefined &&
                $orbitdb!==undefined &&
                $dbMyAddressBook.access!==undefined){
                requestAddress($did)
                requested = true
            }

    }


    $:{
        if($myAddressBook.length>0){ //if a record arrives in my address book show it on the page //TODO go to ContactList (would be better)
            scannedContact = $myAddressBook?.filter((it) => { return it.owner === $did })
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