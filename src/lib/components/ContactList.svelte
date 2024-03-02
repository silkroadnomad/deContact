<script>
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch, Pagination } from "carbon-components-svelte";
    import { selectedRowIds, dbMyAddressBook, myAddresses, qrCodeData, qrCodeOpen } from "../../stores/stores.js";
    import { getAddressRecords } from "decontact";
    $: $dbMyAddressBook && getAddressRecords($dbMyAddressBook).then(result => $myAddresses = result);

    let pageSize = 5;
    let page = 1;
    let filteredRowIds = [];
    $:console.log("$myAddresses:",$myAddresses)
</script>

<DataTable
        expandable
        rows={$myAddresses}
        {pageSize}
        {page}
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
                    { key: "firstName", value: "Firstname" }
        ]}
>
        <Toolbar>
            <ToolbarContent>
            <ToolbarSearch
                    persistent
                    value=""
                    shouldFilterRows
                    bind:filteredRowIds
            />
            </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="expanded-row" let:row>
        <pre>{JSON.stringify(row, null, 2)}</pre>
    </svelte:fragment>
</DataTable>
<Pagination
        bind:pageSize
        bind:page
        totalItems={filteredRowIds.length}
        pageSizeInputDisabled
/>