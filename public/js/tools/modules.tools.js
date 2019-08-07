$(document).ready(function() {
    var $body = $("body");

    $body.on("switch-change", "#select-deselect-all-module", function(e, data){
        var val = "";
        if(data.value === false){
            val = "off";
        }else{
            val = "on";
        }
        $('.module-switch').find("div.switch-animate").removeClass("switch-on switch-off").addClass("switch-"+val);
    });

    $body.on('switch-change', 'div[data-module-name]', function (e, data) {

		var moduleName = $(this).data("module-name");
		var value 	   = data.value;
		var isInactive = false;
		var isActive   = true;

		if(value === isInactive) {


                $("h4#meliscore-tool-module-content-title").html(translations.tr_meliscore_module_management_checking_dependencies);
                $('div[data-module-name]').bootstrapSwitch('setActive', false);


                $.ajax({
                    type        : 'POST',
                    url         : '/melis/MelisCore/Modules/getDependents',
                    data		: {module : moduleName},
                    dataType    : 'json',
                    encode		: true,
                    success: function(data) {
                        var modules    = "<br/><br/><div class='container'><div class='row'><div class='col-lg-12'><ul>%s</ul></div></div></div>";
                        var moduleList = '';

                        $.each(data.modules, function(i, v) {
                            moduleList += "<li>"+v+"</li>";

                        });

                        modules = modules.replace("%s", moduleList);

                        if(data.success) {
                            melisCoreTool.confirm(
                                translations.tr_meliscore_common_yes,
                                translations.tr_meliscore_tool_emails_mngt_generic_from_header_cancel,
                                translations.tr_meliscore_general_proceed,
                                data.message+modules,
                                function() {
                                    $.each(data.modules, function(i, v) {
                                        // this will trigger a switch-change event
                                        // $('div[data-module-name="'+v+'"]').bootstrapSwitch('setState', false, false);
                                        // this will just trigger an animate switch
                                        switchButtonWithoutEvent(v, "off");
                                    });
                                },
                                /**
                                 * User selects cancel: Revert the switch to its saved state, in this case "ON",
                                 * to prevent user from saving the cancelled switch change
                                 */
                                function () {
                                    switchButtonWithoutEvent(moduleName, 'on');
                                }
                            );
                        }
                        $('div[data-module-name]').bootstrapSwitch('setActive', true);
                        $("h4#meliscore-tool-module-content-title").html(translations.tr_meliscore_module_management_modules);
                    },
                    error: function() {
                        alert(translations.tr_meliscore_error_message);
                    }
                });

		}


		if(value === isActive) {
            $("h4#meliscore-tool-module-content-title").html(translations.tr_meliscore_module_management_checking_dependencies);
            $('div[data-module-name]').bootstrapSwitch('setActive', false);

            $.ajax({
                type        : 'POST',
                url         : '/melis/MelisCore/Modules/getRequiredDependencies',
                data		: {module : moduleName},
                dataType    : 'json',
                encode		: true,
                success: function(data) {
                    if(data.success) {
                        $.each(data.modules, function(i, v) {
                            // this will trigger a switch-change event
                            // $('div[data-module-name="'+v+'"]').bootstrapSwitch('setState', false, false);
                            // this will just trigger an animate switch
                            switchButtonWithoutEvent(v, "on");
                        });
    
                    }
                    $('div[data-module-name]').bootstrapSwitch('setActive', true);
                    $("h4#meliscore-tool-module-content-title").html(translations.tr_meliscore_module_management_modules);
                },
                error: function() {
                    alert(translations.tr_meliscore_error_message);
                }
            });
		}
    });

	$body.on("click", "#btnModulesSave", function() {
		var modules = [];
		var moduleSwitches = $(".module-switch");
		var on = "switch-on";
		var off= "switch-off";
		var moduleStatus = "";
		$.each(moduleSwitches , function(idx, val) {
			var moduleName = $(val).data("module-name");
			var status = $(".module-switch[data-module-name='"+ moduleName +"']").find("div").attr("class");
			if(status !== undefined){
                status = status.split(" ");
                $.each(status, function(i, v) {
                    if(v == on) {
                        moduleStatus = 1;
                    }
                    else if(v == off) {
                        moduleStatus = 0;
                    }
                });
                modules.push({
                    name: moduleName,
                    value: moduleStatus
                });
			}
		});
		
		modules = $.param(modules);
		melisCoreTool.confirm(
			translations.tr_meliscore_common_yes, 
			translations.tr_meliscore_common_no, 
			translations.tr_meliscore_module_management_modules, 
			translations.tr_meliscore_module_management_prompt_confirm, 
			function() {
				$.ajax({
			        type        : 'POST', 
			        url         : '/melis/MelisCore/Modules/saveModuleChanges',
			        data		: modules,
			        dataType    : 'json',
                    encode		: true,
                    success: function(data) {
                        if (data.success == 1) {
                            melisCoreTool.processing();
                            setTimeout(function() {window.location.reload(true) }, 3000);
                        } else {
                            melisHelper.melisKoNotification(data.textTitle, data.textMessage);
                        }
                    },
                    error: function() {
                        alert(translations.tr_meliscore_error_message);
                    }
			     });
			}
		);

		
	});

	function setModuleSwitchState(state)
	{
        $('div[data-module-name]').bootstrapSwitch('setState', state);
	}

	function getModuleState(moduleName)
	{
        var value = $('div[data-module-name="'+moduleName+'"]').bootstrapSwitch('isActive');

        return value;
	}

	function switchButtonWithoutEvent(moduleName, status)
	{
        $('div[data-module-name="'+moduleName+'"]').find("div.switch-animate").removeClass("switch-on switch-off").addClass("switch-"+status);
	}
});