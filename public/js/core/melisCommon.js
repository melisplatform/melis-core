/**
 * Common js codes that applies on almost all modules
 * Bootstrap issue on dataTables under tabs
 * .responsive.recalc().columns.adjust()
 */
$(document).ready(function() {
    console.log("document ready melisCommon.js");

    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        $($.fn.dataTable.tables(true)).DataTable().responsive.recalc().columns.adjust();

        console.log( 'show tab' );
    });
});