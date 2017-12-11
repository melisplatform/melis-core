$(function() {

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escapeHtml (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }
    $("body").on("click", "#savePlatformScheme", function() {
        $("form#melis_core_platform_scheme_images").submit();
    });

    $("body").on("click", "#resetPlatformScheme", function() {
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_tool_emails_mngt_generic_from_header_cancel,
            translations.tr_meliscore_general_proceed,
            translations.tr_meliscore_platform_scheme_reset_confirm,
            function() {
                melisCoreTool.pending(".button");
                $.ajax({
                    type    : 'GET',
                    url     : 'melis/MelisCore/PlatformScheme/resetToDefault',
                    processData : false,
                    cache       : false,
                    contentType : false,
                    dataType    : 'json',
                }).success(function(data){
                    if(data.success) {
                        melisCoreTool.processing();
                        location.reload(true);
                    }
                    else {
                        melisHelper.melisKoNotification(data.title, data.message, data.errors);
                    }
                    melisCoreTool.done(".button");
                }).error(function(){
                    melisCoreTool.done(".button");
                });
            }
        );


    });

    $("body").on("submit", "form#melis_core_platform_scheme_images", function(e) {
        var formData = new FormData(this);

        var colorFormData = $("form#melis_core_platform_scheme_form").serializeArray();
        var colors        = new Object();

        $.each(colorFormData, function(i, v) {
            colors[v['name']] = v['value'];
        });

       formData.append('colors', JSON.stringify(colors));


        melisCoreTool.pending(".button");
        $.ajax({
            type    : 'POST',
            url     : 'melis/MelisCore/PlatformScheme/save',
            data    : formData,
            processData : false,
            cache       : false,
            contentType : false,
            dataType    : 'json',
        }).success(function(data){
            if(data.success) {
                melisCoreTool.processing();
                location.reload(true);
            }
            else {
                melisHelper.melisKoNotification(data.title, data.message, data.errors);
            }
            melisCoreTool.done(".button");
        }).error(function(){
            melisCoreTool.done(".button");
        });

        e.preventDefault();
    });

    $("body").on("keyup", "input#sidebar_header_text", function() {
        var text = escapeHtml($(this).val());

        if(!text) {
            text = translations['tr_meliscore_header Title'];
        }

        $("span#platform-scheme-sidebar-header-title").html(text);
    })
});


