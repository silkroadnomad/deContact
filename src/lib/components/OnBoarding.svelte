<script>
    import { multiaddr } from '@multiformats/multiaddr'
    import { did, query } from "../../routes/router.js";
    import {
        selectedAddr,
        orbitdb,
        libp2p,
        // dbMyAddressBook,
        myAddressBook,
        connectedPeers
    } from "../../stores.js";
    import { requestAddress } from "../../lib/network/p2p-operations.js"
    import ContactForm from "./ContactForm.svelte"
    // import { page } from '$app/stores'


   const onBoardingToken = decodeURI($query.split("&")[0]).split("=")[1]
    // const onBoardingToken = $page.url.searchParams.get('onBoardingToken')
   // const aliceMultiAddress = $page.url.searchParams.get('onBoardingToken') ((JSON.parse(decodeURI($query.split("&")[1]).split("=")[1])
    // const aliceMultiAddress = JSON.parse(decodeURI($query.split("&")[1]).split("=")[1])
    const aliceMultiAddress = undefined
    let scannedContact
    let requested
    let aliceConnected

    $:{ //connect to a multiAddress if one was given!
        if(aliceMultiAddress && !aliceConnected && $libp2p && $connectedPeers>0){
            $libp2p.dial(multiaddr(aliceMultiAddress[0])).then((info) => {
                aliceConnected=true
                console.log("connected peer",info)}).catch(
                    (e) => {
                            console.log("e",e)
                    })
        }
    }

    $:{
            if(!requested &&
                $connectedPeers>1 && //if connected
                $did!==undefined &&
                $orbitdb!==undefined ){
                requestAddress($did,false,onBoardingToken)
                requested = true
            }
    }

    $:scannedContact = $myAddressBook?.filter((it) => { return it.owner === $did })

    $:{
        if($selectedAddr.email && ! $selectedAddr.firstName && ! $selectedAddr.lastName){
            $selectedAddr.firstName=$selectedAddr.email
            $selectedAddr.lastName=$orbitdb.identity.id
        }
    }
</script>
<div class="content">
    <p>
    {#if !scannedContact}
        <h3>Contact Data have been shared with you </h3>
        <p>&nbsp;</p>
        <h9>loading did from peer: {$did} </h9>
    {:else}
        <h3>Contact Data have been shared with you </h3>
        <p>&nbsp;</p>
        <h9>
            {scannedContact && scannedContact.length>0?scannedContact[0].firstName:''}
            {scannedContact && scannedContact.length>0?scannedContact[0].lastName:''} added to your address book
        </h9>
        <p>&nbsp;</p>
        <h8>please add your email to view your contacts</h8>
    {/if}
    </p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p><ContactForm isOnBoarding={true}/></p>

</div>

<style>
    :global(.content) {
        margin: 3rem;
    }
</style>