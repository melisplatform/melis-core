var gdprAutoDelete = {
    dataTosave : [],
    showModalCronInfo : function(){
        $("#id_meliscoregdpr_auto_delete_content_accordion_list_config_modal_modal").modal({
            show:true,
            keyboard:false,
            backdrop:true
        });
    },
    hideListConfig : function() {
        $("#list-config-content").collapse('hide');
    },
    toggleArrowIndicator : function (element) {
        var el = $(element);
        if (el.hasClass('arrow-indication-down')) {
            el.removeClass('arrow-indication-down')
            el.addClass('arrow-indication-right')
        } else {
            el.removeClass('arrow-indication-right')
            el.addClass('arrow-indication-down')
        }
    },
    showListConfig : function() {
        $("#list-config-content").collapse('show')
    },
    reloadListAutoDeleteConfigTable : function(){
        $("#tableGdprAutoDeleteConfig").DataTable().ajax.reload();
    },
    showAddEditConfig : function (data, callback, callbackFail) {
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
    },
    saveGdprAutoDeleteConfig : function(callbackSuccess , callbackFail) {
        /**
         *  set data to save
         *   - other modules have an option to add data of the request
         */
            // set first email setup form in order to get the file upload
        var dataString = gdprAutoDelete.getEmailSetupData();
        // set data for gdpr auto delete config
        dataString.append('auto_delete_config',gdprAutoDelete.getConfigInputs());
        // set data for gdpr alert emails translations
        dataString.append('alert_emails_trans',gdprAutoDelete.getAlertEmailsTransData());
        dataString.append('alert_delete_conf',$("#id_melisgdprautodelete_add_edit_config_filters").serialize());
        // ajax
        $.ajax({
            type        : "POST",
            url         : "/melis/MelisCore/MelisCoreGdprAutoDelete/saveAutoDeleteConfiguration",
            data        : dataString,
            contentType : false,
            processData : false,
            cache       : false,
            dataType: 'json',
        }).done(function(data) {
            if (data.success) {
                if(typeof callback !== "undefined" && typeof callback === "function") {
                    callbackSuccess(data);
                }
                melisCore.flashMessenger();
                // clear data to save
                gdprAutoDelete.dataTosave = [];
            } else {
                if(typeof callbackFail !== "undefined" && typeof callbackFail === "function") {
                    callbackFail(data);
                }
            }
        }).fail(function(){

        });
    },
    getConfigInputs : function(){
        return  $("#id_melisgdprautodelete_add_edit_cron_config_form").serialize();
    },
    getEmailSetupData : function () {
        var form = $("#id_melisgdprautodelete_add_edit_email_setup");
        var dataString = new FormData(form[0]);
        if (typeof (form.find('input[name="mgdprc_email_conf_tags"]').data('tags')) !== 'undefined') {
            // get tags
            dataString.append(
                "mgdprc_email_conf_tags",
                form.find('input[name="mgdprc_email_conf_tags"]').data('tags').toString()
            );
        }

        return dataString;
    },
    getAlertEmailsTransData : function () {
        var alertEmailTransData = [];
        $(".melisgdprautodelete_add_edit_email_setup_form").each(function(i , form){
            // tmp form
            var form2 = $(form);
            // serialize array
            var dataString  = form2.serialize();
            if (typeof (form2.find('input[name="mgdprc_alert_email_tags"]').data('tags')) !== 'undefined') {
                // get tags
                dataString += "&mgdpre_email_tags=" + form2.find('input[name="mgdprc_alert_email_tags"]').data('tags').toString();
            }
            dataString += "&mgdpre_lang_id=" + form2.data('langId') + "&mgdpre_type=1";
            // data lang locale
            alertEmailTransData.push({
                locale : form2.data('langLocale'),
                data : dataString
            });
        });

        return JSON.stringify(alertEmailTransData);
    },
    setDataToSave : function (name,data) {
        gdprAutoDelete.dataTosave.push(data);
    },
    getDataTosave : function () {
        return this.dataTosave;
    }

};
/**
 * gdpr list config filters initializtions
 */
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
/**
 * event bindings
 */
$(function(){
    $body.on('click', "#add-auto-delete-config", function(){
        // show add / edit configration zone
        gdprAutoDelete.showAddEditConfig();
        // trigger accordtion toggle list to hide the accordion
        $("#gdpr-accordion-toggle-list").trigger('click');
    });
    $body.on('click', ".cron-info-toggle", function(){
        // show modal which have CRON Info
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
    /*
     * toggle accordion list of configs
     */
    $body.on('click', "#gdpr-accordion-toggle-list" , function() {
        gdprAutoDelete.toggleArrowIndicator(this);
    });
    /*
     * save auto delete configurations
     */
    $body.on('click', "#saveAutoDeleteConfigurations", function() {
        gdprAutoDelete.saveGdprAutoDeleteConfig();
    });
});