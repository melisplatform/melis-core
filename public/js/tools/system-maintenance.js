$(function(){
    $("body").on("click", ".btnAddSystemmaintenance", function(){
        modalUrl = '/melis/MelisCore/MelisGenericModal/emptyGenericModal';
        melisHelper.createModal("id_systemmaintenance_modal", "systemmaintenance_modal", false, {}, modalUrl);
    });

    $("body").on("click", ".btnSaveSystemmaintenance", function(){
        var btn = $(this);
        var id = $(this).data("id");
        submitForm($("form#systemmaintenanceForm"), id, btn);
    });

    var submitForm  = function(form, id, btn){

        form.unbind("submit");

        form.on("submit", function(e) {

            e.preventDefault();
            btn.attr('disabled', true);
            var formData = new FormData(this);
            formData.append('site_id', id);



            $.ajax({
                type: 'POST',
                url: '/melis/MelisCore/SystemMaintenanceProperties/save',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
            }).done(function (data) {
                if(data.success){
                    // Notifications
                    melisHelper.melisOkNotification(data.textTitle, data.textMessage);

                    $("#id_systemmaintenance_modal_container").modal("hide");
                    melisHelper.zoneReload("id_systemmaintenance_content", "systemmaintenance_content");
                }else{
                    melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors);
                    melisHelper.highlightMultiErrors(data.success, data.errors, "#id_systemmaintenance_modal");
                }

                btn.attr('disabled', false);
            }).fail(function () {
                alert(translations.tr_meliscore_error_message);
            });
        });

        form.submit();
    };

    $("body").on("click", ".btnEditSystemmaintenance", function(){
        // var id = $(this).parents('tr').find('td').first().text();
        var id = $(this).parents("tr").attr("id");
        var modalUrl = '/melis/MelisCore/MelisGenericModal/emptyGenericModal';
        melisHelper.createModal("id_systemmaintenance_modal", "systemmaintenance_modal", false, {id : id}, modalUrl);
    });

    $("body").on("click", ".btnDeleteSystemmaintenance", function(){
        var id = $(this).parents("tr").attr("id");

        melisCoreTool.confirm(
            translations.tr_systemmaintenance_common_button_yes,
            translations.tr_systemmaintenance_common_button_no,
            translations.tr_systemmaintenance_delete_title,
            translations.tr_systemmaintenance_delete_confirm_msg,
            function(data) {
                $.ajax({
                    type        : 'GET',
                    url         : '/melis/MelisCore/SystemMaintenance/deleteItem?id='+id,
                    dataType    : 'json',
                    encode		: true,
                    success		: function(data){
                        // refresh the table after deleting an item
                        melisHelper.zoneReload("id_systemmaintenance_content", "systemmaintenance_content");

                        // Notifications
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);

                        
                    }
                });
            });
    });

    $("body").on("switch-change",".systemmaintenance-action-switch",function(e,data) {

        let siteId = $(this).parents('tr').find('td').first().text();
        var modalUrl = '/melis/MelisCore/MelisGenericModal/emptyGenericModal';

        let val = "";
        if(data.value === false) {
            val = 0;
        } else {
            val = 1;
        }

        melisHelper.createModal("id_systemmaintenance_modal_confirmation", "systemmaintenance_modal_confirmation", false, {id : siteId,status:val}, modalUrl);

       
        $("body").one("click", ".btnSaveSystemmaintenanceConfirm", function(event){
            event.stopImmediatePropagation();
            $("#id_systemmaintenance_modal_confirmation_container").modal("hide");
            $.ajax({
                url:'/melis/MelisCore/SystemMaintenanceProperties/saveStatus',
                method: 'POST', 
                data:{
                    switchStatus:val,
                    siteId:siteId
                },
                dataType: 'json',
                success: function(response) {
                    if(response.data == null || response.data == '[]' || response.json_exists === false) {
                        melisHelper.createModal("id_systemmaintenance_modal", "systemmaintenance_modal", false, {id : siteId}, modalUrl);
                    }
                    melisHelper.melisOkNotification(response.textTitle, response.textMessage);
                },
                error: function(error) {
                    console.error('Error reading JSON file:', error);
                }
            });
            // console.log("haha");

        });
        
        /*  When this element is clicked, it will execute the
        function that reloads the content of the "id_systemmaintenance_content" zone with the
        "systemmaintenance_content" template. */
        $("body").one("click",".close-btnSaveSystemmaintenanceConfirm",() => {
            melisHelper.zoneReload("id_systemmaintenance_content", "systemmaintenance_content");
        });
    });


    $body.on("click", "#generateTreePageId ", function(event) { 
    /* This code is retrieving the selected page from a tree structure and extracting the page ID from
    its title. It then sets the value of the `maintenance_url` input field to the extracted page ID.
    This code is typically used to populate a form field with the selected page ID for further
    processing. */
        var selected = $("#find-page-dynatree ul li .fancytree-active .fancytree-title").text();
        var pageId = selected.match(/\d+/g);
        if(pageId != null || pageId != undefined || pageId.length >= 1) {

            $("#maintenance_url").val(pageId[0]);


        }
        return false;
    });


});



/**
 * The `initSwitch` function retrieves site data from an API, updates the status of switches and table
 * elements based on the data, and initializes the Bootstrap Switch plugin.
 */
const initSwitch = () => {
    let siteData = [];
    $.ajax({
        url:'/melis/MelisCore/SystemMaintenance/getSiteStatus',
        method:'GET',
        dataType:'json',
        async:false,
        success:function(res) {
            if(res.length > 0) {
                siteData = res;
            }

        },
        error: function(error) {
            console.log(error);
        }
    });
    siteData.forEach((site,i) => {


        $("body #systemmaintenanceTableContent tbody tr").each((index,element) => {
            if((index+1) == site['site_id']) {
                $(element).find("td:eq(2)").text(site['maintenance_url']);
                $(element).find("td:eq(4) div .testLink").attr('href',site['maintenance_url']);
                $(element).find("td:eq(3)").html(`
                    
                    <div id="" class="ml-2 mt-1 make-switch has-witch systemmaintenance-action-switch"
                    data-on-label="` + translations.tr_systemmaintenance_common_activate + `"
                    data-off-label="`+ translations.tr_systemmaintenance_common_deactivate + `"
                    data-text-label="`+ translations.tr_meliscore_tool_user_col_status +`">
                    <input type="checkbox" class="system_maintenance_site_status"  />
                    </div>
    
                `);
            }
        });

        let status = site['is_maintenance_mode'] == 1 ? true : false;
        $("body .systemmaintenance-action-switch .system_maintenance_site_status").each((index,element) => {
            if((index+1) == site['site_id']) {

                $(element).prop('checked',status);
                $(element).text(status);   
            }
        });
        
    });

    $(".systemmaintenance-action-switch").bootstrapSwitch();

}
