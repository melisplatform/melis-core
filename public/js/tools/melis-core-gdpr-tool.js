$(document).ready(function() {
    var $body = $('body');

    $body.on('input', '#melis_core_gdpr_search_form_name input', function(){
        $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#686868");
        $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#686868");
    });

    $body.on('input', '#melis_core_gdpr_search_form_email input', function(){
        $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#686868");
        $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#686868");
    });


    /**
     * Submiting search form
     */
    $body.on('submit', '#id_melis_core_gdpr_search_form', function(e) {
        var formInputs = $(this).serializeArray();
        var hasSite = false;
        var hasName = false;
        var hasEmail = false;

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
            melisCoreTool.pending("#melis-core-gdpr-search-form-submit");
            GdprTool.getUserInfo(formInputs);
            melisCoreTool.done("#melis-core-gdpr-search-form-submit");
        } else {
            if (hasName == false && hasEmail == false && hasSite == true) {
                $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#981a1f");
                $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#981a1f");

                melisHelper.melisKoNotification(
                    translations.tr_melis_core_gdpr_notif_gdpr_search,
                    translations.tr_melis_core_gdpr_notif_name_or_email_required
                );
            } else {
                $body.find("#melis_core_gdpr_search_form_name").find('label').css("color", "#981a1f");
                $body.find("#melis_core_gdpr_search_form_email").find('label').css("color", "#981a1f");
                
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
        var status = this.checked;
        var $iconPlaceholder = $(this).siblings('i');

        $iconPlaceholder.toggleClass("checked");
        $iconPlaceholder.closest('.dataTables_scrollHead').siblings('.dataTables_scrollBody').find('.checkRow').each(function() {
            $i = $(this).siblings('i');
            $row = $(this).parents('tr');
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

        var moduleName = $(this).closest('.dataTables_scroll').find('.dataTables_scrollBody table').attr('id');

        $body.find('#id_melis_core_gdpr_content_tabs .tab-content .tab-pane').each(function() {
            countOfRows = $(this).find('table tbody tr').length;
            moduleName = $(this).find('table').attr('id');
            var p = $(this).closest('.widget-body').siblings('.widget-head').find('ul #' + moduleName + '-left-tab p');

            var charIndex = p.text().indexOf(" (");
            var lengthToDelete = charIndex - p.text().length;

            p.text().slice(charIndex, lengthToDelete);
            p.append( "texting");
        });

        var moduleName = $(this).closest('.dataTables_scroll').find('.dataTables_scrollBody table').attr('id');
        var countOfRows = $(this).closest('.dataTables_scroll').find('.dataTables_scrollBody table tbody tr').length;
        var pTag = $body.find('.widget-head ul #' + moduleName + '-left-tab p');
        var charIndex = pTag.html().indexOf(" (");
        var lengthToDelete = charIndex - pTag.html().length;
        var countOfCheckedRows = $(this).closest('.dataTables_scroll').find('.dataTables_scrollBody table tr .checkRow:checked').length;

        pTag.html(pTag.html().slice(0, lengthToDelete)).append(" (" + countOfCheckedRows + "/" + countOfRows + ")");
    });

    /**
     * On checking a single checkbox
     */
    $body.on('click', '#id_melis_core_gdpr_content_tabs .checkRow', function() {
        if (this.checked) {
            if (!$(this).siblings('i').hasClass('checked')) {
                $(this).siblings('i').addClass('checked');
                $(this).parents('tr').addClass('checked');
            }
        } else {
            if ($(this).siblings('i').hasClass('checked')) {
                $(this).siblings('i').removeClass('checked');
                $(this).parents('tr').removeClass('checked');
            }
        }

        var numberOfCheckedCheckBoxes = $(this).closest('table').find('.checkRow:checked').length;
        var numberOfCheckboxes = $(this).closest('table').find('.checkRow').length;

        if (numberOfCheckedCheckBoxes < numberOfCheckboxes) {
            var checkAll = $(this).closest('.dataTables_scrollBody').siblings('.dataTables_scrollHead').find('.table thead .check-all');
            if (checkAll.prop('checked')) {
                checkAll.prop('checked', false);
                $(checkAll).siblings('i').removeClass("checked");
            }
        } else if (numberOfCheckedCheckBoxes == numberOfCheckboxes && numberOfCheckboxes != 0) {
            var checkAll = $(this).closest('.dataTables_scrollBody').siblings('.dataTables_scrollHead').find('.table thead .check-all');
            if (checkAll.prop('checked') == false) {
                checkAll.prop('checked', true);
                $(checkAll).siblings('i').addClass("checked");
            }
        }

        var moduleName = $(this).closest('table').attr('id');
        var pTag = $body.find('.widget-head ul #' + moduleName + '-left-tab p');
        var charIndex = pTag.html().indexOf(" (");
        var lengthToDelete = charIndex - pTag.html().length;

        pTag.html().slice(0, lengthToDelete);
        pTag.html(pTag.html().slice(0, lengthToDelete)).append(" (" + numberOfCheckedCheckBoxes + "/" + numberOfCheckboxes + ")");
    });

    /**
     * On clicking extract selected button
     */
    $body.on('click', '#id_melis_core_gdpr_content_tabs .extract-selected', function() {
        var modules = {};
        var tableId;
        var ids;
        var hasData = false;

        $('#id_melis_core_gdpr_content_tabs').find('.dataTables_scroll').each(function() {
            tableId = $(this).find('.dataTables_scrollBody .table').attr('id');
            ids = [];

            $(this).find('.dataTables_scrollBody #' + tableId + ' .checkRow:checkbox:checked').each(function() {
                ids.push($(this).val());
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
        var modules = {};
        var tableId;
        var ids;
        var hasData = false;

        $('#id_melis_core_gdpr_content_tabs').find('.dataTables_scroll').each(function() {
            tableId = $(this).find('.dataTables_scrollBody .table').attr('id');
            ids = [];

            //push all selected ids to array
            $(this).find('.dataTables_scrollBody #' + tableId + ' .checkRow:checkbox:checked').each(function() {
                ids.push($(this).val());
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


    var GdprTool = {
        getUserInfo: function(formData) {
            $.ajax({
                type     : 'POST',
                url      : '/melis/MelisCore/MelisCoreGdpr/checkForm',
                data     : $.param(formData)
            }).success(function (data) {
                if (data.success) {
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
            }).error(function () {

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
                        encode: true,
                    }).success(function (data) {
                        if (data.success) {
                            $.each(modules, function (key, value) {
                                var moduleName = key;

                                //remove selected rows in data table
                                $('#' + moduleName).DataTable().rows('.checked').remove().draw();
                            });

                            var countOfRows = 0;
                            var moduleName;

                            $body.find('#id_melis_core_gdpr_content_tabs .tab-content .tab-pane').each(function () {
                                countOfRows = $(this).find('tbody tr').length;
                                moduleName = $(this).find('tbody').closest('table').attr('id');

                                var pTag = $(this).closest('.widget-body').siblings('.widget-head').find('ul #' + moduleName + '-left-tab p');
                                var charIndex = pTag.html().indexOf(" (");
                                var lengthToDelete = charIndex - pTag.html().length;

                                pTag.html(pTag.html().slice(0, lengthToDelete)).append(" (0/" + countOfRows + ")");
                            });
                        } else {
                            melisHelper.melisKoNotification(
                                translations.tr_melis_core_gdpr_notif_delete_user,
                                translations.tr_melis_core_gdpr_notif_error_on_deleting_data
                            );
                        }
                    }).error(function () {

                    });
                }
            );
        },
        extractSelected: function(modules) {
            $.ajax({
                type: 'POST',
                url:'/melis/MelisCore/MelisCoreGdpr/melisCoreGdprExtractSelected',
                data: {'id' : modules},
                success: function (data, textStatus, request) {
                    // if data is not empty
                    if (data) {
                        var fileName = request.getResponseHeader("fileName");
                        var mime = request.getResponseHeader("Content-Type");
                        var blob = new Blob([request.responseText], {type: mime});
                        saveAs(blob, fileName);
                    }
                }
            });
        }
    };
});
