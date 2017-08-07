$(function() {
    setTimeout(function() {
        $("div.view-controller > button[data-value='0']").trigger("click");
    }, 1000);

    $("body a[data-function='apply_img']").click(function() {
        //var mediaUrl = window.location.origin + "/media/";
        var dom      = $(this).parents("figure").find("figcaption form.download-form");
        var path     = "/media/" + dom.find("input[name='path']").val();
        var file     = dom.find("input[name='name']").val();
        var link     = path + file;


        // tinymce.activeEditor.te
        window.parent.$("div.mce-open").prevAll("input.mce-textbox").val(link);

        // console.log(window.parent.$("div.mce-open").prevAll("input.mce-textbox"));

        window.parent.tinyMCE.activeEditor.windowManager.close();
    });

});