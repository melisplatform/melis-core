/**
 * Common js codes that applies on almost all modules
 * Bootstrap issue on dataTables under tabs
 * .responsive.recalc().columns.adjust()
 */
$(function() {
    $(document).on('shown.bs.tab', 'a[data-bs-toggle="tab"]', function (e) {
        $($.fn.dataTable.tables(true)).DataTable().responsive.recalc().columns.adjust();
    });
});