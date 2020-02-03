$(function() {
	
	// LOGIN 
    $('form#idformmeliscorelogin').submit(function(event) {
        var datastring = $("form#idformmeliscorelogin").serialize();
        $(this).find("input").attr("disabled", "disabled");
        $.ajax({
            type        : 'POST', 
            url         : '/melis/authenticate',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success)   {
                window.location.replace("/melis");
            }
            else{

                var errorTxt = "";
                $.each(data.errors, function(i,v) {
                    errorTxt = v;
                });

                if(data.require_reset_password) {
                    melisCoreTool.alertWarning('#loginprompt', '<i class="fa fa-exclamation-triangle"></i> ' + translations.tr_meliscore_common_warning+"!", errorTxt);
                }
                else {
                    melisCoreTool.alertDanger('#loginprompt', translations.tr_meliscore_common_error+"!", errorTxt);
                }
                $("form#idformmeliscorelogin").find("input").removeAttr("disabled", "disabled");

            }
        }).fail(function() {
            $("form#idformmeliscorelogin").find("input").removeAttr("disabled", "disabled");
            
            alert( translations.tr_meliscore_error_message );
        });
        event.preventDefault();
    });
    
    // CHANGE LANGUAGE
    window.melisChangeLanguage = function(langId){
        var datastring = { langId: langId };
        $.ajax({
            type        : 'GET', 
            url         : '/melis/change-language',
            data        : datastring,
            dataType    : 'json',
            encode      : true
        }).done(function(data) {
            if (data.success){
                location.reload();
            }
            else{
                alert( translations.tr_meliscore_error_language );
            }
        }).fail(function() {
            alert( translations.tr_meliscore_error_message );
        });
    }
    
    // login checkbox (remember me) mask
    $('body').on("click", ".cb-cont input[type=checkbox]", function(){
    	$(".cbmask-inner").toggleClass("cb-active");
    });
    
    // enable/disable remember me checkbox
    var rememberME = $(".remember-me-cont input[type='checkbox']").attr("checked");
    if(rememberME){
    	$(".remember-me-cont .cbmask-inner").addClass("cb-active");
    }
});