<script>
    import { did, query } from "../../routes/router.js";
    import { multiaddr } from '@multiformats/multiaddr'
    import {
        orbitdb,
        libp2p,
        dbMyAddressBook,
        myAddressBook,
        // progressText,
        connectedPeers
    } from "../../stores.js";
    import { requestAddress } from "../../lib/network/p2p-operations.js"
    import ContactForm from "$lib/components/ContactForm.svelte";

    const aliceMultiAddress = JSON.parse(decodeURI($query).split("=")[1])
    console.log("aliceMultiAddress",aliceMultiAddress[0])
    let scannedContact
    let requested
    let aliceConnected
    $:{
        if(!aliceConnected && $libp2p && $connectedPeers>0){
            $libp2p.dial(multiaddr(aliceMultiAddress[0])).then((info) => {
                aliceConnected=true
                console.log("connected peer",info)}).catch( (e) => {
                console.log("e",e)
            })
        }
    }

    $:{
            if(!requested &&
                $connectedPeers>1 && //if connected
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
    {#if !scannedContact}
        <li>loading did: {$did} </li>
    {:else}
        <li>
            {scannedContact && scannedContact.length>0?scannedContact[0].firstName:''}
            {scannedContact && scannedContact.length>0?scannedContact[0].lastName:''} added to our address book please
            add your name and email
        </li>
    {/if}

    <ContactForm isOnBoarding={true}/>
</div>

<style>
    :global(.content) {
        margin: 3rem;
    }
</style>