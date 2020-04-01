var gdprAutoDelete = {
    dataTosave: [],
    /**
     * reload auto delete config list datatable
     */
    reloadAutoDeleteConfigList : function () {
        melisHelper.zoneReload('id_meliscoregdpr_auto_delete_content_accordion_list_config_content','meliscoregdpr_auto_delete_content_accordion_list_config_content');
    },
    /**
     * show modal cron info
     */
    showModalCronInfo: function () {
        $("#id_meliscoregdpr_auto_delete_content_accordion_list_config_modal_modal").modal({
            show: true,
            keyboard: false,
            backdrop: true
        });
    },
    /**
     * hide list config datatable
     */
    hideListConfig: function () {
        $("#list-config-content").collapse('hide');
    },
    /**
     * show list config datatable
     */
    showListConfig: function () {
        $("#list-config-content").collapse('show');
    },
    /**
     * toggle arrow on accordion
     * @param element
     */
    toggleArrowIndicator: function (element) {
        var el = $(element);
        if (el.hasClass('arrow-indication-down')) {
            el.removeClass('arrow-indication-down');
            el.addClass('arrow-indication-right')
        } else {
            el.removeClass('arrow-indication-right');
            el.addClass('arrow-indication-down')
        }
    },
    /**
     * reload data table
     */
    reloadListAutoDeleteConfigTable: function () {
        $("#tableGdprAutoDeleteConfig").DataTable().ajax.reload();
    },
    /**
     * show add/edit config zone
     * @param element
     */
    showAddEditConfig: function (element) {
        // hide list config
        gdprAutoDelete.hideListConfig();
        // remove class d-none to show the add/edit config area
        $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
        // zone reload to get forms
        melisCoreTool.pending(element);
        melisHelper.zoneReload('id_meliscoregdpr_auto_delete_content_accordion_add_edit_config', 'meliscoregdpr_auto_delete_content_accordion_add_edit_config', [], function () {
            $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
            melisCoreTool.done(element);
        });
    },
    scrollAnimationToElment : function (element) {
        $([document.documentElement, document.body]).animate({
            scrollTop: $("#" + element ).offset().top - 55
        }, 500)
    },
    /**
     * open a gdpr auto delete config
     * @param configId
     */
    openGdprAutoDeleteConfig : function (configId, siteId, module) {
        // remove class d-none to show the add/edit config area
        $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
        melisHelper.zoneReload('id_meliscoregdpr_auto_delete_content_accordion_add_edit_config', 'meliscoregdpr_auto_delete_content_accordion_add_edit_config', { configId : configId , siteId : siteId, moduleName : module}, function () {
            $("#id_meliscoregdpr_auto_delete_content_accordion_add_edit_config").removeClass('d-none');
        });
    },
    /**
     * hide add/edit config
     */
    hideAddEditConfig: function () {
        $("#add-edit-config-content").collapse('hide')
    },
    customHighlightLabelError : function(label){
        $(label).css("color", "rgb(255, 0, 0);")
    },
    removecustomHighlightLabelError : function(label) {

    },
    /**
     * save all forms data
     * @param callbackSuccess
     * @param callbackFail
     * @param element
     */
    saveGdprAutoDeleteConfig: function (callbackSuccess, callbackFail, element) {
        /**
         *  set data to save
         *   - other modules have an option to add data of the request
         */
        // set first email setup form in order to get the file upload
        var dataString = gdprAutoDelete.getEmailSetupData();
        // set data for gdpr auto delete filters
        dataString.append('auto_delete_filters', gdprAutoDelete.getAddEditFilters());
        // set data for gdpr auto delete config
        dataString.append('auto_delete_config', gdprAutoDelete.getConfigInputs());
        // set data for gdpr alert emails warning translations
        dataString.append('alert_emails_warning_trans', gdprAutoDelete.getAlertEmailsTransData());
        // set data for gdpr alert emails delete translations
        dataString.append('alert_emails_delete_trans', gdprAutoDelete.getAlertEmailsDeleteTransData());
        // set element pending
        melisCoreTool.pending(element);
        // set element pending to avoid spamming of opening add/edit config zone
        melisCoreTool.pending("#add-auto-delete-config");
        // ajax
        $.ajax({
            type: "POST",
            url: "/melis/MelisCore/MelisCoreGdprAutoDelete/saveAutoDeleteConfiguration",
            data: dataString,
            contentType: false,
            processData: false,
            cache: false,
            dataType: 'json'
        }).done(function (data) {
            if (data.success) {
                // call back success
                if (typeof callback !== "undefined" && typeof callback === "function") {
                    callbackSuccess(data);
                }
                // show ok notification
                melisHelper.melisOkNotification('GDPR Auto Delete', 'Unable to save');
                // show gdpr list of auto delete configuration
                gdprAutoDelete.showListConfig();
                // reload the table
                gdprAutoDelete.reloadAutoDeleteConfigList();
                // open gdpr config
                gdprAutoDelete.openGdprAutoDeleteConfig(data.id);
                // flash messenger
                melisCore.flashMessenger();
            } else {
                melisHelper.melisKoNotification('GDPR Auto Delete', 'Unable to save', data.errors);
                // highlight form errors
                gdprAutoDelete.highlightGdprFormErrors(data);
                if (typeof callbackFail !== "undefined" && typeof callbackFail === "function") {
                    callbackFail(data);
                }
            }
            // set element dont
            melisCoreTool.done(element);
            // set element dont
            melisCoreTool.done("#add-auto-delete-config");
        }).fail(function () {

        });
    },
    /**
     * highllgh forms error label
     * @param data
     */
    highlightGdprFormErrors: function (data) {
        // hight light errors for form filters
        melisCoreTool.highlightErrors(data.success, data.errors, "id_melisgdprautodelete_add_edit_config_filters");
        // hight light errors for cron config form
        melisCoreTool.highlightErrors(data.success, data.errors, "id_melisgdprautodelete_add_edit_cron_config_form");
        // high light errors for email setup form
        melisCoreTool.highlightErrors(data.success, data.errors, "id_melisgdprautodelete_add_edit_email_setup");

        $($("#available-lang").val().split(',')).each(function (i, value) {
            if (value !== "") {
                // account alert email form
                melisCoreTool.highlightErrors(data.success, data.errors, "melisgdprautodelete_add_edit_alert_email_" + value);
                // account delete email form
                melisCoreTool.highlightErrors(data.success, data.errors, "melisgdprautodelete_add_edit_alert_email_delete_" + value);
            }
        });

        melisCoreTool.highlightErrors(data.success, data.errors, "melisgdprautodelete_add_edit_alert_email");
    },
    /**
     * get inputs of cron config form
     * @returns {jQuery}
     */
    getConfigInputs: function () {
        return $("#id_melisgdprautodelete_add_edit_cron_config_form").serialize();
    },
    /**
     * get email setup form data
     * @returns {*}
     */
    getEmailSetupData: function () {
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
    /**
     * get alert email translation data
     */
    getAlertEmailsTransData: function () {
        var alertEmailTransData = [];
        $(".melisgdprautodelete_add_edit_email_setup_form").each(function (i, form) {
            // tmp form
            var form2 = $(form);
            // serialize array
            var dataString = form2.serialize();
            if (typeof (form2.find('input[name="mgdpre_email_tags"]').data('tags')) !== 'undefined') {
                // get tags
                dataString += "&mgdpre_email_tags=" + form2.find('input[name="mgdpre_email_tags"]').data('tags').toString();
            }
            dataString += "&mgdpre_lang_id=" + form2.data('langId') + "&mgdpre_type=1";
            // data lang locale
            alertEmailTransData.push({
                locale: form2.data('langLocale'),
                data: dataString
            });
        });

        return JSON.stringify(alertEmailTransData);
    },
    /**
     * get alert emails deleted email translations data
     */
    getAlertEmailsDeleteTransData: function () {
        var alertEmailTransData = [];
        $(".melisgdprautodelete_add_edit_alert_email_delete").each(function (i, form) {
            // tmp form
            var form2 = $(form);
            // serialize array
            var dataString = form2.serialize();
            if (typeof (form2.find('input[name="mgdpre_email_tags"]').data('tags')) !== 'undefined') {
                // get tags
                dataString += "&mgdpre_email_tags=" + form2.find('input[name="mgdpre_email_tags"]').data('tags').toString();
            }
            dataString += "&mgdpre_lang_id=" + form2.data('langId') + "&mgdpre_type=2";
            // data lang locale
            alertEmailTransData.push({
                locale: form2.data('langLocale'),
                data: dataString
            });
        });

        return JSON.stringify(alertEmailTransData);
    },

    /**
     * get add / edit filters
     *  - site
     *  - module
     */
    getAddEditFilters : function () {
        return $("#id_melisgdprautodelete_add_edit_config_filters").serialize();
    },
    getAutoDeleteConfigDataBySiteIdModuleName : function (siteId, modulename) {
        $.ajax({
            type: "POST",
            url: "/melis/MelisCore/MelisCoreGdprAutoDelete/getAutoDeleteConfigBySiteModule",
            data: {
                siteId : siteId,
                moduleName : modulename
            },
            contentType: false,
            processData: false,
            cache: false,
            dataType: 'json'
        })
    },
    reloadData : function () {

    }

};
/**
 * event bindings
 */
$(function () {

    /*
     * add auto delet econfig
     */
    $body.on('click', "#add-auto-delete-config", function () {
        // show add / edit configration zone
        gdprAutoDelete.showAddEditConfig(this);
        // trigger accordtion toggle list to hide the accordion
        gdprAutoDelete.hideListConfig();
        // animation scroll
        gdprAutoDelete.scrollAnimationToElment('id_meliscoregdpr_auto_delete_content_accordion_add_edit_config')
    });

    /*
     * modal cron ifo
     */
    $body.on('click', ".cron-info-toggle", function () {
        // show modal which have CRON Info
        gdprAutoDelete.showModalCronInfo();
    });

    /*
     * site filter
     */
    $body.on('change', "#gdpr_site_filter", function () {
        gdprAutoDelete.reloadListAutoDeleteConfigTable();
    });

    /*
     * module filter
     */
    $body.on('change', "#gdpr_module_filter", function () {
        gdprAutoDelete.reloadListAutoDeleteConfigTable();
    });

    /*
     * save auto delete configurations
     */
    $body.on('click', "#saveAutoDeleteConfigurations", function () {
        gdprAutoDelete.saveGdprAutoDeleteConfig(null, null, this);
    });

    /*
     * accordion hide list config
     */
    $body.on('hide.bs.collapse', '#list-config-content', function () {
        gdprAutoDelete.toggleArrowIndicator("#gdpr-accordion-toggle-list");
    });

    /*
     * accordion show list config
     */
    $body.on('show.bs.collapse', '#list-config-content', function () {
        gdprAutoDelete.toggleArrowIndicator("#gdpr-accordion-toggle-list");
    });
    $body.on('click', '.gdpr-edit-delete-confg', function () {
        gdprAutoDelete.hideListConfig();
        gdprAutoDelete.openGdprAutoDeleteConfig($(this).parent().parent().parent().attr('id'));
    });

    $body.on('click', '#refresh-logs-table', function(){
        var parent = $('#id_meliscoregdpr_auto_delete_add_edit_config_tab_logs');
        // apply loading html
        melisHelper.loadingZone(parent);
        // refresh log table
        $("#tableGdprAutoDeleteLogs").DataTable().ajax.reload(function(){
            // remove loading zone
            melisHelper.removeLoadingZone(parent);
        });
    });

    $body.on('click', ".gdpr-email-logs-show-details", function() {
        $("#id_meliscoregdpr_auto_delete_add_edit_config_tab_logs_details").removeClass('hidden');
        melisHelper.zoneReload(
            'id_meliscoregdpr_auto_delete_add_edit_config_tab_logs_details',
            'meliscoregdpr_auto_delete_add_edit_config_tab_logs_details',
            {
                logId : $(this).parent().parent().parent().attr('id')
            }
        );
    });

    $body.on('change', "#mgdprc_site_id", function(){
        gdprAutoDelete.openGdprAutoDeleteConfig(null, this.value, $("#mgdprc_module_name").val());
    });

    $body.on('change', "#mgdprc_module_name", function(){
        gdprAutoDelete.openGdprAutoDeleteConfig(null, $("#mgdprc_site_id").val(), this.value );
    });
});
/**
 * gdpr list config filters initializtions
 */
window.initGdprAutoDeleteConfigFilters = function (data) {
    var gdprSiteFilter = $('#gdpr_site_filter'),
        gdprModuleFilter = $('#gdpr_module_filter');

    if (gdprSiteFilter.length) {
        data.gpdr_auto_delete_site_id = gdprSiteFilter.val();
    }

    if (gdprModuleFilter.length) {
        data.gdpr_auto_delete_module = gdprModuleFilter.val();
    }
};
/**
 * gdpr email logs filters
 */
window.initGdprDeleteEmailsLogsFilters = function (data) {
   data.site_id = $("#mgdprc_site_id").val();
   data.module_name = $("#mgdprc_module_name").val();
};
