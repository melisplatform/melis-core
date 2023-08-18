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
                else if(data.password_expired){
                    window.location.replace(data.renew_pass_url);
                }
                else {
                    melisCoreTool.alertDanger('#loginprompt', translations.tr_meliscore_common_error+"!", errorTxt);
                }

                if (data.accountLocked) {
                    let icon = "<div style='text-align: center;'><a href='#' class='glyphicons lock'><i></i></a></div>";

                    if (data.accountLockType == 'admin') {
                        let translation = translations.tr_meliscore_login_auth_account_is_locked_using_admin_option;

                        if (data.accountLockAdminEmail) {
                            melisHelper.melisKoNotification(icon, translation.replace('%s', data.accountLockAdminEmail), []);
                        }
                    } else if (data.accountLockType == 'timer') {
                        let message = '';
                        let days = data.accountLockDurationInDays;
                        let hours = data.accountLockDurationInHours;
                        let minutes = data.accountLockDurationInMinutes;
                        let daysString = translations.tr_meliscore_login_locked_in_days_message;
                        let hoursString = translations.tr_meliscore_login_locked_in_hours_message;
                        let minutesString = translations.tr_meliscore_login_locked_in_minutes_message;
                        let durationString = '<b>';
                        let components = [];

                        if (days > 0) {
                            components.push(daysString.replace('%d', days));
                        }
                        
                        if (hours > 0) {
                            components.push(hoursString.replace('%d', hours));
                        }

                        if (minutes > 0) {
                            components.push(minutesString.replace('%d', minutes));
                        }

                        if (components.length === 1) {
                            durationString += components[0] + "</b>.";
                        } else {
                            durationString += components.join(', ') + "</b>.";
                        }

                        let firstSentence = '<h4 style="text-align: center;">' + translations.tr_meliscore_login_maximum_amount_of_failed_login_attempts_message + '</h4>';
                        let secondSentence = '<p style="text-align: center; font-size: 1rem;">' + translations.tr_meliscore_login_account_is_now_locked_message + durationString + '</p>';
                        let thirdSentence = '<p style="text-align: center;"><i>' + translations.tr_meliscore_login_contact_an_administrator_for_assistance_message + '</i></p>';
                        message = firstSentence + secondSentence + thirdSentence;
                        melisHelper.melisKoNotification(icon, message, []);

                        $("form#idformmeliscorelogin").find("input").removeAttr("disabled", "disabled");
                        melisHelper.melisKoNotification(icon, message, []);
                    }
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