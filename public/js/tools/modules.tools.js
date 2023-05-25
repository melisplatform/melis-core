$(function() {
    var $body = $("body");

        $body.on("switch-change", "#select-deselect-all-module", function(e, data){
            var val = "";
            if ( data.value === false ) {
                val = "off";
            } else {
                val = "on";
            }

            $('.module-switch').find("div.switch-animate").removeClass("switch-on switch-off").addClass("switch-"+val);
        });

        $body.on('switch-change', 'div[data-module-name]', function (e, data) {

            var moduleName = $(this).data("module-name"),
                value 	   = data.value,
                isInactive = false,
                isActive   = true;

            if ( value === isInactive ) {
                    $("h4#meliscore-tool-module-content-title").html(translations.tr_meliscore_module_management_checking_dependencies);
                    $('div[data-module-name]').bootstrapSwitch('setActive', false);
                    $.ajax({
                        type        : 'POST',
                        url         : '/melis/MelisCore/Modules/getDependents',
                        data		: {module : moduleName},
                        dataType    : 'json',
                        encode		: true
                    }).done(function(data) {
                        var modules    = "<br/><br/><div class='container'><div class='row'><div class='col-lg-12'><ul>%s</ul></div></div></div>",
                            moduleList = '';

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
                    }).fail(function() {
                        alert(translations.tr_meliscore_error_message);
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
                    encode		: true
                }).done(function(data) {
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
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
            }
        });

        $body.on("click", "#btnModulesSave", function() {
            var modules         = [],
                moduleSwitches  = $(".module-switch"),
                on              = "switch-on",
                off             = "switch-off",
                moduleStatus    = "";

                $.each(moduleSwitches , function(idx, val) {
                    var moduleName  = $(val).data("module-name"),
                        status      = $(".module-switch[data-module-name='"+ moduleName +"']").find("div").attr("class");

                        if ( status !== undefined ) {
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
                            encode		: true
                        }).done(function(data) {
                            if (data.success == 1) {
                                melisCoreTool.processing();
                                setTimeout(function() {window.location.reload(true) }, 3000);
                            } else {
                                melisHelper.melisKoNotification(data.textTitle, data.textMessage);
                            }
                        }).fail(function() {
                            alert(translations.tr_meliscore_error_message);
                        });
                    }
                );
        });

        $body.on("click", ".password-complexity[type='checkbox']", function() {
            if ($(this).is(':checked')) {
                $(this).val(1);
            } else {
                $(this).val(0);
            }
        });
          
        $("body").on("click", "#saveOtherConfig", function(){
            // merge data from all forms
            let mergedData = $('.other-config-tool').map(function() {
                return $(this).serializeArray();
            }).get().flat();
            
            var btn = $(this);

            $("body").find('form .make-switch div').each(function () {
                var $this       = $(this),
                    field       = $this.find('input').attr('name'),
                    status      = $this.hasClass('switch-on'),
                    saveStatus  = (status) ? 1 : 0;

                if (! saveStatus) {
                    mergedData.push({name: field, value: saveStatus});
                }
            });

            var form = $('form#password-validity-form');

            form.unbind("submit");
    
            form.on("submit", function(e) {
                e.preventDefault();

                btn.attr('disabled', true);
                
                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/MelisCoreOtherConfig/saveOtherConfig',
                    data: mergedData,
                    dataType: 'json',
                }).done(function (data) {
                    if (data.success){
                        // Notifications
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
    
                        // // Reload List
                        // melisHelper.zoneReload("id_meliscore_tool_other_config", "meliscore_tool_other_config");    
                        melisHelper.tabClose("id_meliscore_tool_other_config");

                        melisHelper.tabOpen(
                            translations.tr_meliscore_tool_other_config, 
                            'fa fa-cube fa-2x', 
                            'id_meliscore_tool_other_config', 
                            'meliscore_tool_other_config'
                        );
                    } else{
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                        // melisHelper.highlightMultiErrors(data.success, data.errors, "#"+id+"_id_song_properties_content");
                    }
    
                    btn.attr('disabled', false);
    
                }).fail(function () {
                    alert(translations.tr_meliscore_error_message);
                });
            });
    
            form.submit();
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