var gdprautodeletesmtp = {
    saveSmtpConfig: function(toSaveData, successCallback, failCallback) {
        // ajax
        $.ajax({
            type: "POST",
            url: "/melis/MelisCore/MelisCoreGdprAutoDeleteSmtp/saveSmtpConfig",
            data: toSaveData,
            dataType: 'json'
        }).done(function (data) {
            if (data.success) {
                // call back success
                if (typeof callback !== "undefined" && typeof callback === "function") {
                    successCallback(data);
                }
                // show ok notification
                melisHelper.melisOkNotification('GDPR auto delete SMTP', 'Successfully saved');
                melisHelper.zoneReload('id_meliscoregdpr_auto_delete_smtp_content',"meliscoregdpr_auto_delete_smtp_content");
                // flash messenger
                melisCore.flashMessenger();
            } else {
                melisHelper.melisKoNotification('GDPR auto delete SMTP', 'Unable to save', data.errors);
            }
        }).fail(function () {

        });
    },
    deleteStmpConfig : function (id) {
        $.ajax({
            type: "POST",
            url: "/melis/MelisCore/MelisCoreGdprAutoDeleteSmtp/deleteSmtp",
            data: { id : id},
            dataType: 'json'
        }).done(function (data) {
            if (data.success) {
                // show ok notification
                melisHelper.melisOkNotification('GDPR auto delete SMTP', 'Successfully deleted');
                melisHelper.zoneReload('id_meliscoregdpr_auto_delete_smtp_content',"meliscoregdpr_auto_delete_smtp_content");
                // flash messenger
                melisCore.flashMessenger();
            } else {
                melisHelper.melisKoNotification('GDPR auto delete SMTP', 'Unable to delete config', data.errors);
            }
        }).fail(function () {

        });
    }
};

$(function(){
    // save gdpr auto delete smtp
    $("body").on('click', "#save-smtp" , function(){
        gdprautodeletesmtp.saveSmtpConfig($("#melisgdprautodelete_smtp_form").serialize());
    });
    $("body").on('click', "#delete-smtp" , function(){
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_core_gdpr_autodelete_config_delete_title,
            translations.tr_melis_core_gdpr_autodelete_config_delete_message,
            function(){
                gdprautodeletesmtp.deleteStmpConfig($("#mgdpr_smtp_id").val());
            }
        );

    });
});
