$(function() {


    $("body").on("submit", "form#melis_core_platform_color_form", function(e) {
        var formData = new FormData(this);

        melisCoreTool.pending(".button");
        $.ajax({
            type    : 'POST',
            url     : 'melis/MelisCore/PlatformColor/saveColors',
            data    : formData,
            processData : false,
            cache       : false,
            contentType : false,
            dataType    : 'json',
        }).success(function(data){
            if(data.success) {
                location.reload(true);
            }
            else {
                melisHelper.melisKoNotification(data.title, data.message, data.errors);
            }
            melisCore.flashMessenger();
            melisCoreTool.done(".button");
        }).error(function(){
            melisCoreTool.done(".button");
        });

        e.preventDefault();
    });

    $(".osta_color_code").colorpicker({color : "", format: "hex"});


});


