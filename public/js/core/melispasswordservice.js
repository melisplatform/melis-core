$(function() {
	// forget password form submit
    $('#idformmeliscoreforgot').submit(function(event) {
        var datastring = $("#idformmeliscoreforgot").serialize();

        $.ajax({
            type        : 'POST', 
            url         : '/melis/lost-password-request',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success) {
                melisCoreTool.alertSuccess('#lostpassprompt', "", data.message);
               $('#idformmeliscoreforgot')[0].reset();
            }
            else{
                melisCoreTool.alertDanger('#lostpassprompt', translations.tr_meliscore_common_error+"!", data.message);
            }
        }).fail(function() {
            alert( translations.tr_meliscore_error_message );
        });
        event.preventDefault();
    });

    $("#idformmeliscoreresetpass").submit(function(event) {
        //window.location.href = window.location.href;
        var $this = $(this),
            rhash = $(this).serialize();

        $.ajax({
            type        : 'POST',
            url         : '/melis/reset-old-password',
            data        : rhash,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success) {
                melisCoreTool.alertSuccess('#resetpassprompt', "", data.message);
                $this[0].reset();
                window.location.replace("/melis/login/");
            }
            else{
                melisCoreTool.alertDanger('#resetpassprompt', translations.tr_meliscore_common_error+"!", data.message);
            }
        }).fail(function() {
            alert( translations.tr_meliscore_error_message );
        });

        event.preventDefault();
    });
});