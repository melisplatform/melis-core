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
        
        $body.on(
            "click",
            "#id_meliscore_tool_other_config input[type=checkbox]",
            function() {
                $(this)
                    .parent()
                    .find(".cbmask-inner")
                    .toggleClass("cb-active");
            }
        );

        $body.on("click", "#saveOtherConfig", function(){
            let configFormsData = [];
            let forms = $('#id_meliscore_tool_other_config form');

            forms.each(function() {
                let $form = $(this);
                let formConfig = {};
                let formId = $form.attr('id');
                let formName = $form.attr('name');

                if (!formId) {
                    console.error("Configuration form is missing an ID, skipping serialization.", $form);
                    return;
                }

                $.each($form.serializeArray(), function(i, field){
                    formConfig[field.name] = field.value;
                });

                $form.find('.make-switch div').each(function () {
                    let fieldName = $(this).find('input').attr('name');
                    let status = $(this).hasClass('switch-on');
                    let saveStatus = (status) ? 1 : 0;
                       
                    formConfig[fieldName] = saveStatus;
                });
               
                configFormsData.push({
                    form_id: formId,
                    form_name: formName,
                    data: formConfig
                });
            });

            let finalPayload = {
                all_config_forms_data: configFormsData
            };
           
            let btn = $(this);
            let form = $('form#password-validity-form');

            form.off("submit");
           
            form.on("submit", function(e) {
                e.preventDefault();

                btn.attr('disabled', true);
               
                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/MelisCoreOtherConfig/saveOtherConfig',
                    data: finalPayload,
                    dataType: 'json',
                }).done(function (data) {
                    if (data.success){
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                        melisHelper.tabClose("id_meliscore_tool_other_config");
                        melisHelper.tabOpen(
                            translations.tr_meliscore_tool_other_config,
                            'fa fa-cube fa-2x',
                            'id_meliscore_tool_other_config',
                            'meliscore_tool_other_config'
                        );
                    } else{
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    }

                    btn.attr('disabled', false);

                }).fail(function () {
                    alert(translations.tr_meliscore_error_message);
                });
            });

            form.trigger("submit");
        });

        /**
         * Bundle all assets
         */
        $body.on("click", "#btnModulesBundle", function(){
            var _this = $(this);
            $.ajax({
                type: 'POST',
                url: '/melis/MelisCore/Modules/bundle',
                data: {},
                dataType: 'json',
                beforeSend: function(){
                    _this.attr('disabled', true);
                }
            }).done(function (data) {
                if (data.success){
                    // Notifications
                    melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                    //reload platform
                    setTimeout(function() {window.location.reload(true); }, 1000);
                } else{
                    melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                }

                _this.attr('disabled', false);

            }).fail(function () {
                alert(translations.tr_meliscore_error_message);
            });
        });

        function setModuleSwitchState(state) {
            $('div[data-module-name]').bootstrapSwitch('setState', state);
        }

        function getModuleState(moduleName) {
            var value = $('div[data-module-name="'+moduleName+'"]').bootstrapSwitch('isActive');

            return value;
        }

        function switchButtonWithoutEvent(moduleName, status) {
            $('div[data-module-name="'+moduleName+'"]').find("div.switch-animate").removeClass("switch-on switch-off").addClass("switch-"+status);
        }
});