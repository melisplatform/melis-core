$(document).ready(function () {
    var $body = $("body"),
        zoneId 		= "id_melis_core_announcement_tool_content_modal_container_form",
        melisKey 	= 'melis_core_announcement_tool_content_modal_container_form',
        modalUrl 	= '/melis/MelisCore/Announcement/renderToolContentModalContainer';

    $body.on("click", ".btnAnnouncementEdit", function(){
        var id 	= $(this).closest("tr").attr("id");
        melisHelper.createModal(zoneId, melisKey, false, {'mca_id':id}, modalUrl);
    });

    $body.on("click", "#btnAnnouncementAdd", function(){
        melisHelper.createModal(zoneId, melisKey, false, {}, modalUrl);
    });

    $body.on("click", ".btnAnnouncementDelete", function(){
        var id 	= $(this).closest("tr").attr("id");
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_core_announcement_tool_delete_title,
            translations.tr_melis_core_announcement_tool_delete_message,
            function() {
                $.ajax({
                    type        : 'POST',
                    url         : '/melis/MelisCore/Announcement/deleteAnnouncement',
                    data		: {mca_id : id},
                    dataType    : 'json',
                    encode		: true
                }).done(function(data){
                    if(data.success){
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                        //reload table
                        $("#tableAnnouncement").DataTable().ajax.reload();
                    }else{
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    }

                }).fail(function(){
                    alert( translations.tr_meliscore_error_message );
                });
            });
    });

    $body.on("click", "#btnComSaveAnnouncement", function(e){
        var data = $("#id_announcement_tool_form").serializeArray();

        $.ajax({
            type 		: 'POST',
            url  		: '/melis/MelisCore/Announcement/saveAnnouncement',
            data 		: data,
            dataType    : 'json'
        }).done(function(data) {
            if ( data.success ) {
                $("#id_melis_core_announcement_tool_content_modal_container_form_container").modal("hide");
                melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                //reload table
                $("#tableAnnouncement").DataTable().ajax.reload();
            }
            else {
                melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                melisCoreTool.highlightErrors(data.success, data.errors, "id_melis_core_announcement_tool_content_modal_container_form_container form#id_announcement_tool_form");
            }
            melisCore.flashMessenger();
        }).fail(function(xhr) {
            alert( translations.tr_meliscore_error_message );
        });

        e.preventDefault();
    });
});