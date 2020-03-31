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
                melisHelper.melisOkNotification('GDPR auto delete SMTP', 'Unable to save');
                // flash messenger
                melisCore.flashMessenger();
            } else {
                melisHelper.melisKoNotification('GDPR auto delete SMTP', 'Unable to save', data.errors);
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
});