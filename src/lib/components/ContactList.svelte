<script>
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch, Pagination } from "carbon-components-svelte";
    import { myAddressBook, selectedRowIds } from "../../stores.js";
    import { generateQRForAddress } from "../../operations.js"
    let pageSize = 5;
    let page = 1;
    let filteredRowIds = [];
</script>

<DataTable
        expandable
        rows={$myAddressBook}
        {pageSize}
        {page}
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
                    { key: "city", value: "City" },
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