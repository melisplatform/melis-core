/**
 * Created by conta on 11/8/2017.
 */

$(function() {
    $(".osta_color_code").colorpicker({color : "", format: "hex"});
});

function getColors(primary, secondary) {

    $.ajax({
        type: 'POST',
        url: "/melis/MelisCore/PlatformColor/saveColor",
        data: datastring,
        dataType: 'json',
        success: function(data) {
            if(data.success) {
                // generate css
                // refresh page
            }
        },
        error: function() {
            console.log("Something went wrong");
        }
    });
}
getColors("#000", "#bbb");
