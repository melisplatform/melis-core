$(function() {
	
	// LOGIN 
    // $('form#idformmeliscorelogin').on("submit", function(event) {
    //     var datastring = $("form#idformmeliscorelogin").serialize();
    //     $(this).find("input").attr("disabled", "disabled");
    //     $.ajax({
    //         type        : 'POST', 
    //         url         : '/melis/authenticate',
    //         data        : datastring,
    //         dataType    : 'json',
    //         encode      : true
    //     }).done(function(data) {
    //         if (data.success)   {
    //             window.location.replace("/melis");
    //         }
    //         else{
    //             var errorTxt = "";
    //             $.each(data.errors, function(i,v) {
    //                 errorTxt = v;
    //             });

    //             if(data.require_reset_password) {
    //                 melisCoreTool.alertWarning('#loginprompt', '<i class="fa fa-exclamation-triangle"></i> ' + translations.tr_meliscore_common_warning+"!", errorTxt);
    //             }
    //             else if(data.password_expired){
    //                 window.location.replace(data.renew_pass_url);
    //             }
    //             else {
    //                 melisCoreTool.alertDanger('#loginprompt', translations.tr_meliscore_common_error+"!", errorTxt);
    //             }

    //             if (data.accountLocked) {
    //                 let icon = "<div style='text-align: center;'><a href='#' class='glyphicons lock'><i></i></a></div>";
    //                 let message = '';
    //                 let adminEmail = data.accountLockAdminEmail;
    //                 let firstSentence = '<h4 style="margin-top: 10px; margin-bottom: 15px; text-align: center;">' + translations.tr_meliscore_login_maximum_amount_of_failed_login_attempts_message + '</h4>';
    //                 let thirdSentence = '<p style="text-align: center;"><i>' + translations.tr_meliscore_login_contact_an_administrator_for_assistance_message.replace('%s', '<strong>' + adminEmail + '</strong>') + '</i></p>';

    //                 if (data.accountLockType == 'admin') {
    //                     let secondSentence = '<p style="text-align: center; font-size: 1rem;">' + translations.tr_meliscore_login_account_is_now_locked_message + '</p>';
    //                     message = firstSentence + secondSentence + thirdSentence;
    //                     melisHelper.melisKoNotification(icon, message, []);
    //                     $("form#idformmeliscorelogin").find("input").prop("disabled", false);
    //                 } else if (data.accountLockType == 'timer') {
    //                     let days = data.accountLockDurationInDays;
    //                     let hours = data.accountLockDurationInHours;
    //                     let minutes = data.accountLockDurationInMinutes;
    //                     let daysString = translations.tr_meliscore_login_locked_in_days_message;
    //                     let hoursString = translations.tr_meliscore_login_locked_in_hours_message;
    //                     let minutesString = translations.tr_meliscore_login_locked_in_minutes_message;
    //                     let durationString = '<strong>';
    //                     let components = [];

    //                     if (days > 0) {
    //                         components.push(daysString.replace('%d', days));
    //                     }
                        
    //                     if (hours > 0) {
    //                         components.push(hoursString.replace('%d', hours));
    //                     }

    //                     if (minutes > 0) {
    //                         components.push(minutesString.replace('%d', minutes));
    //                     }

    //                     if (components.length === 1) {
    //                         durationString += components[0] + "</strong>.";
    //                     } else {
    //                         durationString += components.join(', ') + "</strong>.";
    //                     }

    //                     let secondSentence = '<p style="text-align: center; font-size: 1rem;">' + translations.tr_meliscore_login_account_is_now_locked_for_duration_message + durationString + '</p>';
    //                     message = firstSentence + secondSentence + thirdSentence;
    //                     melisHelper.melisKoNotification(icon, message, []);
    //                     $("form#idformmeliscorelogin").find("input").prop("disabled", false);
    //                 }
    //             }
    //             $("form#idformmeliscorelogin").find("input").prop("disabled", false);
    //         }
    //     }).fail(function() {
    //         $("form#idformmeliscorelogin").find("input").prop("disabled", false);
            
    //         alert( translations.tr_meliscore_error_message );
    //     });
    //     event.preventDefault();
    // });

    // LOGIN
    $('form#idformmeliscorelogin').on("submit", function(event) {
        var datastring = $("form#idformmeliscorelogin").serialize();
        $(this).find("input").attr("disabled", "disabled");
        
        $.ajax({
            type: 'POST', 
            url: '/melis/authenticate',
            data: datastring,
            dataType: 'json',
            encode: true
        }).done(function(data) {
            // Re-enable inputs regardless of success/failure
            $("form#idformmeliscorelogin").find("input").prop("disabled", false);
            
            // The core logic is simple: if success, run the command (which is redirect), 
            // otherwise, run the command (which is alert/redirect/notification).
            if (data.command) {
                console.log(data);
                try {
                    eval(data.command);
                } catch (e) {
                    console.error('Failed to execute server command:', e, data.command);
                    // Fallback in case of JS command failure
                    var errorTxt = "";
                    if (data.errors && typeof data.errors === 'object') {
                        for (var key in data.errors) {
                            if (data.errors.hasOwnProperty(key)) {
                                errorTxt = Array.isArray(data.errors[key]) ? data.errors[key].join(' ') : data.errors[key];
                                break;
                            }
                        }
                    }

                    melisCoreTool.alertDanger('#loginprompt', translations.tr_meliscore_common_error + "!", errorTxt || "A critical server-driven UI error occurred.");
                }
            }            
        }).fail(function() {
            // This is the error handler for AJAX connection/server-side PHP fatal errors
            $("form#idformmeliscorelogin").find("input").prop("disabled", false);
            
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