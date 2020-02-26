var gdprAutoDelete = {
    showModalCronInfo : function(){
        $("#id_meliscoregdpr_auto_delete_content_accordion_list_config_modal_modal").modal({
            show:true,
            keyboard:false,
            backdrop:true
        });
    },
    hideListConfig : function() {
        $("#list-config-content").collapse('hide')
    },
    showListConfig : function() {
        $("#list-config-content").collapse('show')
    },
    reloadListAutoDeleteConfigTable : function(){
        $("#tableGdprAutoDeleteConfig").DataTable().ajax.reload();
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
window.initGdprAutoDeleteConfigFilters = function( data ) {
    var gdprSiteFilter   = $('#gdpr_site_filter'),
        gdprModuleFilter = $('#gdpr_module_filter');

    if( gdprSiteFilter.length ) {
        data.gpdr_auto_delete_site_id = gdprSiteFilter.val();
    }

    if( gdprModuleFilter.length ) {
        data.gdpr_auto_delete_module = gdprModuleFilter.val();
    }
};
$(function(){
    $body.on('click', "#add-auto-delete-config", function(){
        gdprAutoDelete.showAddEditConfig();
    });
    $body.on('click', ".cron-info-toggle", function(){
        gdprAutoDelete.showModalCronInfo();
    });
    /*
     * site filter
     */
    $body.on('change', "#gdpr_site_filter", function(){
        gdprAutoDelete.reloadListAutoDeleteConfigTable();
    });
    /*
     * module filter
     */
    $body.on('change', "#gdpr_module_filter", function(){
        gdprAutoDelete.reloadListAutoDeleteConfigTable();
    });
});