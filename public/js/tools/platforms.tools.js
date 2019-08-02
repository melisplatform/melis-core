$(document).ready(function () {
    var formAdd = "#formplatformadd form#idformsite";
    var formEdit = "#formplatformedit form#idformsite";

    addEvent(".addCorePlatform", function () {
        platformFormModal();
    });

    addEvent(".btnPlatformEdit", function () {
        var platformId = $(this).parents("tr").attr("id");
        platformFormModal(platformId);
    });

    function platformFormModal(platformId) {
        var platformId = (typeof platformId !== "undefined") ? platformId : null;
        // initialation of local variable
        zoneId = 'id_meliscore_tool_platform_generic_form';
        melisKey = 'meliscore_tool_platform_generic_form';
        modalUrl = '/melis/MelisCore/MelisGenericModal/emptyGenericModal';
        window.parent.melisHelper.createModal(zoneId, melisKey, false, {plf_id: platformId}, modalUrl);
    }

    addEvent("#btnPlatformSave", function () {
        var dataString = $("#corePlatform").serializeArray();

        platformId = $("#corePlatform").find("#plf_id").val();

        if (platformId) {
            dataString.push({
                name: "plf_id",
                value: platformId
            });
        }

        $.ajax({
            type: 'POST',
            url: '/melis/MelisCore/Platforms/savePlatform',
            data: dataString,
            dataType: 'json',
            encode: true,
            done: function(data) {
                if (data.success) {
                    $("#id_meliscore_tool_platform_generic_form_container").modal("hide");
                    melisHelper.zoneReload("id_meliscore_tool_platform_content", "meliscore_tool_platform_content");
                    // Show Pop-up Notification
                    melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                } else {
                    melisCoreTool.alertDanger("#platformalert", '', data.textMessage);
                    melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    melisCoreTool.highlightErrors(data.success, data.errors, "corePlatform");
                }
    
                melisCoreTool.processDone();
            },
            fail: function() {
                alert(translations.tr_meliscore_error_message);
            }
        });
    });

    addEvent(".btnPlatformDelete", function () {
        var getId = $(this).parents("tr").attr("id");

        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_meliscore_tool_platform_modal_del,
            translations.tr_meliscore_tool_platform_prompts_confirm,
            function () {
                $.ajax({
                    type: 'POST',
                    url: '/melis/MelisCore/Platforms/deletePlatform',
                    data: {id: getId},
                    dataType: 'json',
                    encode: true,
                    success: function(data) {
                        melisCoreTool.pending(".btn-danger");
                        if (data.success) {
                            melisHelper.zoneReload("id_meliscore_tool_platform_content", "meliscore_tool_platform_content");
                            melisCore.flashMessenger();

                            // Show Pop-up Notification
                            melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                        }
                        melisCoreTool.done(".btn-danger");
                    },
                    error: function() {
                        alert(translations.tr_meliscore_error_message);    
                    }
                });
            });
    });

    function addEvent(target, fn) {
        $("body").on("click", target, fn);
    }
});

window.initCorePlatformListTable = function () {
    var parent      = "#tablePlatforms",
        $paginate   = $(".dataTables_paginate"),
        $page_item  = $paginate.find(".pagination li"),
        $page_link  = $page_item.find("a");

    // Core platform list init to remove delete buttons
    $(parent).find('.noPlatformDeleteBtn').each(function () {
        var rowId = '#' + $(this).attr('id');
        $(parent).find(rowId).find('.btnPlatformDelete').remove();
    });

    // additional class on pagination for bootstrap 4.3.1
    $page_item.addClass("page-item");
    $page_link.addClass("page-link");
};