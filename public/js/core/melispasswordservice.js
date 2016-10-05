$(document).ready(function() {
	// forget password form submit
    $('#idformmeliscoreforgot').submit(function(event) {
        var datastring = $("#idformmeliscoreforgot").serialize();

        $.ajax({
            type        : 'POST', 
            url         : '/melis/lost-password-request',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).success(function(data){
            if (data.success) {
            	melisCoreTool.alertSuccess('#lostpassprompt', "", data.message);
               $('#idformmeliscoreforgot')[0].reset();
            }
            else{
            	melisCoreTool.alertDanger('#lostpassprompt', translations.tr_meliscore_common_error+"!", data.message);
            }
        }).error(function(){
        	alert( translations.tr_meliscore_error_message );
        });
        event.preventDefault();
    });
});