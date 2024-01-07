<script>
    import {DataTable} from "carbon-components-svelte";
    import { myAddressBook, selectedRowIds } from "../../stores.js";
    import { generateQRForAddress } from "../../operations.js"



</script>

<DataTable
            radio
            sortable
            on:click={event => {
                    if (event?.detail?.cell?.key === 'qr') {
                         generateQRForAddress(event.detail.row);
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
