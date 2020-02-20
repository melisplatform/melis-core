var gdprAutoDelete = {
    hideListConfig : function() {
        $("#list-config-content").collapse('hide')
    },
    showListConfig : function() {
        $("#list-config-content").collapse('show')
    },
    showAddEditConfig : function () {
        // hide list config
        gdprAutoDelete.hideListConfig();
        // remove class d-none to show the add/edit config area
        $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
        // zone reload to get forms
        melisHelper.zoneReload('id_meliscoregdpr_auto_delete_content_accordion_add_edit_config','meliscoregdpr_auto_delete_content_accordion_add_edit_config', [] , function(){
            $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
        });
    },
    hideAddEditConfig : function () {
        $("#add-edit-config-content").collapse('hide')
    }
};

$(function(){
    $body.on('click', "#add-auto-delete-config", function(){
        gdprAutoDelete.showAddEditConfig();
    });
});