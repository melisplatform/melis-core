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

    $("body").on("keyup", "input#sidebar_header_text", function() {
        var text = escapeHtml($(this).val());

        if(!text) {
            text = translations['tr_meliscore_header Title'];
        }

        $("span#platform-scheme-sidebar-header-title").html(text);
    })
});


