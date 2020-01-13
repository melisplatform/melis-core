$(function() {
    var $body = $('body'),
        gdprFormData = [];

        $body.on('input', '#melis_core_gdpr_search_form_name input', function(){
            $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#686868");
            $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#686868");
        });

        $body.on('input', '#melis_core_gdpr_search_form_email input', function(){
            $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#686868");
            $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#686868");
        });

        // Toggle single checkbox
        $body.on("click", ".cb-cont input[type=checkbox]", function () {
            var $this = $(this);
            if ( $this.is(':checked') ) {
                $this.prop("checked", true);
                $this.prev("span").find(".cbmask-inner").addClass('cb-active');
            } else {
                $this.not(".requried-module").prop("checked", false);
                $this.not(".requried-module").prev("span").find(".cbmask-inner").removeClass('cb-active');
            }
        });

        /**
         * Submiting search form
         */
        $body.on('submit', '#id_melis_core_gdpr_search_form', function(e) {
            var formInputs  = $(this).serializeArray(),
                hasSite     = false,
                hasName     = false,
                hasEmail    = false;

                $.each (formInputs, function(i, field) {
                    if (field.value != '') {
                        if (field.name == 'user_name') {
                            hasName = true;
                        } else if (field.name == 'user_email') {
                            hasEmail = true
                        } else if (field.name == 'site_id') {
                            hasSite = true;
                        }
                    }
                });

                //only send request if there are any inputs
                if (hasName == true || hasEmail == true) {
                    if (hasName == true) {
                        if (formInputs[0].value.length <= 2 && formInputs[0].name === 'user_name') {
                            $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#e61c23");

                            melisHelper.melisKoNotification(
                                translations.tr_melis_core_gdpr_notif_gdpr_search,
                                translations.tr_melis_core_gdpr_notif_error_3ormore_inputs
                            );
                        } else {
                            melisCoreTool.pending("#melis-core-gdpr-search-form-submit");
                            GdprTool.getUserInfo(formInputs);
                            melisCoreTool.done("#melis-core-gdpr-search-form-submit");
                        }
                    } else {
                        melisCoreTool.pending("#melis-core-gdpr-search-form-submit");
                        GdprTool.getUserInfo(formInputs);
                        melisCoreTool.done("#melis-core-gdpr-search-form-submit");
                    }
                } else {
                    if (hasName == false && hasEmail == false && hasSite == true) {
                        $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#e61c23");
                        $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#e61c23");

                        melisHelper.melisKoNotification(
                            translations.tr_melis_core_gdpr_notif_gdpr_search,
                            translations.tr_melis_core_gdpr_notif_name_or_email_required
                        );
                    } else {
                        $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#e61c23");
                        $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#e61c23");
                        
                        melisHelper.melisKoNotification(
                            translations.tr_melis_core_gdpr_notif_gdpr_search,
                            translations.tr_melis_core_gdpr_tool_form_no_inputs
                        );
                    }
                }

                e.preventDefault();
        });

        /**
         * On checking all checkbox
         */
        $body.on('click', '#id_melis_core_gdpr_content_tabs .check-all', function() {
            var $this               = $(this),
                status              = this.checked,
                $iconPlaceholder    = $this.siblings('i');

                $iconPlaceholder.toggleClass("checked");
                $iconPlaceholder.closest('.dataTables_scrollHead').siblings('.dataTables_scrollBody').find('.checkRow').each(function() {
                    var $this   = $(this),
                        $i      = $this.siblings('i'),
                        $row    = $this.parents('tr');

                        this.checked = status;

                        if (status) {
                            if (!$i.hasClass('checked')) {
                                $i.addClass('checked');
                                $row.addClass('checked');
                            }
                        } else {
                            if ($i.hasClass('checked')) {
                                $i.removeClass('checked');
                                $row.removeClass('checked');
                            }
                        }
                });

            var moduleName = $this.closest('.dataTables_scroll').find('.dataTables_scrollBody table').attr('id');

                $body.find('#id_melis_core_gdpr_content_tabs .tab-content .tab-pane').each(function() {
                    var $this = $(this);

                        countOfRows = $this.find('table tbody tr').length;
                        moduleName = $this.find('table').attr('id');

                    var p               = $this.closest('.widget-body').siblings('.widget-head').find('ul #' + moduleName + '-left-tab p'),
                        charIndex       = p.text().indexOf(" ("),
                        lengthToDelete  = charIndex - p.text().length;

                        p.text().slice(charIndex, lengthToDelete);
                        p.append( "texting");
                });

            var moduleName          = $this.closest('.dataTables_scroll').find('.dataTables_scrollBody table').attr('id'),
                countOfRows         = $this.closest('.dataTables_scroll').find('.dataTables_scrollBody table tbody tr').length,
                pTag                = $body.find('.widget-head ul #' + moduleName + '-left-tab p'),
                charIndex           = pTag.html().indexOf(" ("),
                lengthToDelete      = charIndex - pTag.html().length,
                countOfCheckedRows  = $this.closest('.dataTables_scroll').find('.dataTables_scrollBody table tr .checkRow:checked').length;

                pTag.html(pTag.html().slice(0, lengthToDelete)).append(" (" + countOfCheckedRows + "/" + countOfRows + ")");
        });

        /**
         * On checking a single checkbox
         */
        $body.on('click', '#id_melis_core_gdpr_content_tabs .checkRow', function() {
            var $this = $(this);

                if ( this.checked ) {
                    if ( !$this.siblings('i').hasClass('checked') ) {
                        $this.siblings('i').addClass('checked');
                        $this.parents('tr').addClass('checked');
                    }
                } else {
                    if ( $this.siblings('i').hasClass('checked') ) {
                        $this.siblings('i').removeClass('checked');
                        $this.parents('tr').removeClass('checked');
                    }
                }

            var numberOfCheckedCheckBoxes   = $this.closest('table').find('.checkRow:checked').length,
                numberOfCheckboxes          = $this.closest('table').find('.checkRow').length;

                if (numberOfCheckedCheckBoxes < numberOfCheckboxes) {
                    var checkAll = $this.closest('.dataTables_scrollBody').siblings('.dataTables_scrollHead').find('.table thead .check-all');

                        if (checkAll.prop('checked')) {
                            checkAll.prop('checked', false);
                            $(checkAll).siblings('i').removeClass("checked");
                        }
                } else if (numberOfCheckedCheckBoxes == numberOfCheckboxes && numberOfCheckboxes != 0) {
                    var checkAll = $this.closest('.dataTables_scrollBody').siblings('.dataTables_scrollHead').find('.table thead .check-all');

                        if (checkAll.prop('checked') == false) {
                            checkAll.prop('checked', true);
                            $(checkAll).siblings('i').addClass("checked");
                        }
                }

            var moduleName      = $this.closest('table').attr('id'),
                pTag            = $body.find('.widget-head ul #' + moduleName + '-left-tab p'),
                charIndex       = pTag.html().indexOf(" ("),
                lengthToDelete  = charIndex - pTag.html().length;

                pTag.html().slice(0, lengthToDelete);
                pTag.html(pTag.html().slice(0, lengthToDelete)).append(" (" + numberOfCheckedCheckBoxes + "/" + numberOfCheckboxes + ")");
        });

        /**
         * On clicking extract selected button
         */
        $body.on('click', '#id_melis_core_gdpr_content_tabs .extract-selected', function() {
            var modules = {},
                tableId,
                ids,
                hasData = false;

            $('#id_melis_core_gdpr_content_tabs').find('.dataTables_scroll').each(function() {
                var $this = $(this);

                    tableId = $this.find('.dataTables_scrollBody .table').attr('id');
                    ids     = [];

                    $this.find('.dataTables_scrollBody #' + tableId + ' .checkRow:checkbox:checked').each(function() {
                        var $this = $(this);

                            ids.push( $this.val() );
                            hasData = true;
                    });
                    modules[tableId] = ids;
            });

            //only send request if there are any ids
            if (hasData) {
                GdprTool.extractSelected(modules);
            } else {
                melisHelper.melisKoNotification(
                    translations.tr_melis_core_gdpr_notif_extract_user,
                    translations.tr_melis_core_gdpr_notif_no_selected_extract_user
                );
            }
        });

        /**
         * On clicking delete selected button
         */
        $body.on('click', '#id_melis_core_gdpr_content_tabs .delete-selected', function() {
            var modules = {},
                tableId,
                ids,
                hasData = false;

            $('#id_melis_core_gdpr_content_tabs').find('.dataTables_scroll').each(function() {
                var $this = $(this);

                tableId = $this.find('.dataTables_scrollBody .table').attr('id');
                ids = [];

                //push all selected ids to array
                $this.find('.dataTables_scrollBody #' + tableId + ' .checkRow:checkbox:checked').each(function() {
                    var $this = $(this);
                        
                        ids.push( $this.val() );
                        hasData = true;
                });
                modules[tableId] = ids;
            });

            if (hasData) {
                GdprTool.deleteSelected(modules);
            } else {
                melisHelper.melisKoNotification(
                    translations.tr_melis_core_gdpr_notif_delete_user,
                    translations.tr_melis_core_gdpr_notif_no_selected_delete_user
                );
            }
        });

        /**
         * Clicking on tabs
         * .gdpr-tab-table-container
         * table results
         */
        $body.on("click", ".gdpr-tab-table-container .widget-head ul li a", function(e) {
            var $this   = $(this),
                href    = $this.attr("href");

                $this.toggleClass("active").siblings().removeClass("active");
                $this.closest("li").toggleClass("active").siblings().removeClass("active");

                $(href).toggleClass("active").siblings().removeClass("active");
                $(href).tab("show");

                

                $('html body').animate({
                    scrollTop: $(href).offset().top
                }, 2000);

                e.preventDefault();
        });

        var GdprTool = {
            getUserInfo: function(formData) {
                $.ajax({
                    type     : 'POST',
                    url      : '/melis/MelisCore/MelisCoreGdpr/checkForm',
                    data     : $.param(formData)
                }).done(function(data) {
                    if (data.success) {
                        //this will be used on deleting a row
                        gdprFormData = formData;
                        //show the tabs so that the loading view will be shown to the user
                        $('#id_melis_core_gdpr_content_tabs').show();
                        melisHelper.zoneReload('id_melis_core_gdpr_content_tabs', 'melis_core_gdpr_content_tabs', {
                            show: true,
                            formData: formData,
                        });
                    } else {
                        melisHelper.melisKoNotification(
                            translations.tr_melis_core_gdpr_search_user_title,
                            translations.tr_melis_core_gdpr_search_user_error_message,
                            data.errors
                        );
                    }
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
                melisCoreTool.done("#melis-core-gdpr-search-form-submit");
            },
            deleteSelected: function(modules) {
                melisCoreTool.confirm (
                    translations.tr_meliscore_common_yes,
                    translations.tr_meliscore_common_no,
                    translations.tr_melis_core_gdpr_notif_delete_selected_confirm,
                    translations.tr_melis_core_gdpr_notif_delete_selected_confirm_message,
                    function() {
                        $.ajax({
                            type: 'POST',
                            url: '/melis/MelisCore/MelisCoreGdpr/melisCoreGdprDeleteSelected',
                            data: $.param(modules),
                            dataType: 'json',
                            encode: true
                        }).done(function(data) {
                            if (data.success) {
                                //Reload the zone after deleting a row.
                                melisHelper.zoneReload('id_melis_core_gdpr_content_tabs', 'melis_core_gdpr_content_tabs', {
                                    show: true,
                                    formData: gdprFormData,
                                });

                                melisHelper.melisOkNotification(
                                    translations.tr_melis_core_gdpr,
                                    translations.tr_melis_core_gdpr_tool_notif_delete_selection_success
                                );
                                melisCore.flashMessenger();
                            } else {
                                melisHelper.melisKoNotification(
                                    translations.tr_melis_core_gdpr_notif_delete_user,
                                    translations.tr_melis_core_gdpr_notif_error_on_deleting_data
                                );
                            }
                        }).fail(function() {
                            alert(translations.tr_meliscore_error_message);
                        });
                    }
                );
            },
            extractSelected: function(modules) {
                $.ajax({
                    type: 'POST',
                    url:'/melis/MelisCore/MelisCoreGdpr/melisCoreGdprExtractSelected',
                    data: {'id' : modules}
                }).done(function(data, textStatus, request) {
                    if (data) {
                        var fileName = request.getResponseHeader("fileName");
                        var mime = request.getResponseHeader("Content-Type");
                        var blob = new Blob([request.responseText], {type: mime});
                        saveAs(blob, fileName);
                    }
                }).fail(function() {
                    alert(translations.tr_meliscore_error_message);
                });
            }
        };
});