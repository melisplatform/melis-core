$(document).ready(function() {
    var $body = $('body');

    /**
     * Submiting search form
     */
    $body.on('submit', '#id_melis_core_gdpr_search_form', function(e) {
        var formInputs = $(this).serializeArray();
        var hasData = false;

        $.each (formInputs, function(i, field) {
            if (field.value != '') {
                hasData = true;
            }
        });

        //only send request if there are any inputs
        if (hasData) {
            melisCoreTool.pending("#melis-core-gdpr-search-form-submit");
            GdprTool.getUserInfo(formInputs);
            melisCoreTool.done("#melis-core-gdpr-search-form-submit");
        } else {
            melisHelper.melisKoNotification(
                translations.tr_melis_core_gdpr_notif_gdpr_search,
                translations.tr_melis_core_gdpr_tool_form_no_inputs
            );
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
    });

    /**
     * On checking a single checkbox
     */
    $body.on('click', '#id_melis_core_gdpr_content_tabs .checkRow', function() {
        if (this.checked) {
            if (!$(this).siblings('i').hasClass('checked')) {
                $(this).siblings('i').addClass('checked');
            }
        } else {
            if ($(this).siblings('i').hasClass('checked')) {
                $(this).siblings('i').removeClass('checked');
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
            melisCoreTool.exportData('/melis/MelisCore/MelisCoreGdpr/melisCoreGdprExtractSelected?'+$.param(modules));
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
                    //reset form
                    $('#id_melis_core_gdpr_search_form').trigger('reset');
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
                        $.each(modules, function (key, value) {
                            var moduleName = key

                            //remove selected rows in data table
                            $('#' + moduleName).DataTable().rows('.checked').remove().draw();
                        });
                    }).error(function () {

                    });
                }
            );
        },
    };
});
