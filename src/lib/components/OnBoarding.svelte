<script>
    import { multiaddr } from '@multiformats/multiaddr'
    import { did, query } from "../../routes/router.js";
    import {
        selectedAddr,
        orbitdb,
        libp2p,
        dbMyAddressBook,
        myAddressBook,
        connectedPeers
    } from "../../stores.js";
    import { requestAddress } from "../../lib/network/p2p-operations.js"
    import ContactForm from "./ContactForm.svelte"
    import { sha256 } from '../../utils/utils.js';

    // import { page } from '$app/stores'


   const onBoardingToken = decodeURI($query.split("&")[0]).split("=")[1]
    // const onBoardingToken = $page.url.searchParams.get('onBoardingToken')
   // const aliceMultiAddress = $page.url.searchParams.get('onBoardingToken') ((JSON.parse(decodeURI($query.split("&")[1]).split("=")[1])
    // const aliceMultiAddress = JSON.parse(decodeURI($query.split("&")[1]).split("=")[1])
    const aliceMultiAddress = undefined

    let scannedContact //the contact which was scanned
    let ourContact  //if we have an address book available
    let requested
    let dummyWritten
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

    // $:{
    //         if(!requested &&
    //             $connectedPeers >1 && //if connected
    //             $did !== undefined &&
    //             $orbitdb !== undefined ){
    //             requestAddress($did,false,onBoardingToken)
    //             requested = true
    //         }
    // }

    $:scannedContact = $myAddressBook?.filter((it) => { return it.owner === $did })
    $:{ //we need a dummy - if we have already real data don't ask them from the invited person!
       if(!dummyWritten &&
            $libp2p &&
            $connectedPeers>0 &&
            $dbMyAddressBook !==undefined && // !Array.isArray($dbMyAddressBook) && //TODO why is this an array at some point?
           $orbitdb !== undefined ){
           ourContact = $myAddressBook?.filter((it) => { return it.owner === $orbitdb?.identity?.id })
           if(ourContact.length>0){
               requestAddress($did,false,onBoardingToken).then(()=>{
                   window.location.hash="/" //no need to ask for email, firstname anyore - go straight to contact list
               })

           }
           else {
               //create a dummy contact for us so we can write it into the requesters db as long the user didn't write the contact data
               $selectedAddr.owner = $orbitdb?.identity?.id
               $selectedAddr.lastName = $orbitdb?.identity?.id
               $selectedAddr.own = true
               $selectedAddr.sharedAddress = $dbMyAddressBook?.address
               sha256(JSON.stringify($selectedAddr)).then((sha256Hash)=>{
                   $selectedAddr._id = sha256Hash
                   $selectedAddr.id = sha256Hash
                   $dbMyAddressBook.put($selectedAddr).then((orbitHash)=>console.log("dummy written with orbitHash",orbitHash))

                   requestAddress($did,false,onBoardingToken)
               }) //hash is staying until end of life - we have only one address
           }
           dummyWritten=true
       }
    }

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