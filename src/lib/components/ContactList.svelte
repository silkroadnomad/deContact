<script>
    import {DataTable} from "carbon-components-svelte";
    import {selectedRowIds, dbMyAddressBook, myAddressBook, qrCodeData, qrCodeOpen} from "../../stores/stores.js";
    import { getAddressRecords } from "decontact";
    $: $dbMyAddressBook && getAddressRecords($dbMyAddressBook).then(result => $myAddressBook = result);
</script>

<DataTable
            radio
            sortable
            on:click={event => {
                    if (event?.detail?.cell?.key === 'qr') {
                            qrCodeData.set(event.detail.row);
                            qrCodeOpen.set(true);
                    }
            }}
            bind:selectedRowIds={$selectedRowIds}
            headers={[
                        { key: "lastName", value: "Name" },
                        { key: "firstName", value: "Firstname" },
                        { key: "street", value: "Street" },
                        { key: "postalCode", value: "ZipCode" },
                        { key: "city", value: "City" },
                        { key: "countryRegion", value: "Country" },
                        { key: "owner", value: "Owner" }
                ]}
            rows={$myAddressBook}
    />