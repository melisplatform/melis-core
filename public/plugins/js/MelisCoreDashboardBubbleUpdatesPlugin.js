var MelisCoreDashboardBubbleUpdatesPlugin = {
    init: function() {
        this.getUpdates();
    },
    getUpdates: function() {
        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleUpdatesPlugin/getUpdates',
        }).done(function (response) {
            if (response.count > 0) {
                var button = '<button id="dashboard-bubble-updates-back-btn" class="btn btn-default">' + translations.tr_meliscore_dashboard_bubble_plugins_view_updates + '</button>';
                $('.dashboard-bubble-updates-back-btn-container').each(function(){
                    $(this).empty();
                    $(this).append(button);
                });
            } else {
                $('.dashboard-bubble-updates-back-btn-container').each(function(){
                    $(this).empty();
                });
            }

            $('.dashboard-bubble-updates-counter').each(function(){
                $(this).text(response.count);
            });

            $.each(response.data, function (key, value) {
                if (value.status === -1) {
                    var update = '<tr class="dashboard-bubble-update-details" data-packageid="' + value.packageId + '" data-packagename="' + value.module_name +'">\n' +
                        '<td class="center">' + value.module_name + '</td>\n' +
                        '<td class="center">' + value.currentVersion + '</td>\n' +
                        '<td class="center">' + value.latestVersion + '</td>\n' +
                        '</tr>';

                    $('.dashboard-bubble-updates-list').each(function(){
                        $(this).append(update);
                    });
                }
            })
        });
    },
};

$(document).ready(function() {
    var $body = $('body');
    var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();

    if (showBubblePlugins) {
        MelisCoreDashboardBubbleUpdatesPlugin.init();
    }

    $body.on('click', '.dashboard-bubble-update-details', function () {
        var packageId = $(this).data('packageid');
        var packageTitle = $(this).data('packagename');

        melisHelper.tabOpen(
            translations.tr_market_place,
            "fa-shopping-cart",
            "id_melis_market_place_tool_display",
            "melis_market_place_tool_display"
        );

        var alreadyOpen = $("body #melis-id-nav-bar-tabs li a.tab-element[data-id='id_melis_market_place_tool_display']");
        var checkTab = setInterval(function() {
            if (alreadyOpen.length) {
                melisHelper.tabOpen(
                    packageTitle,
                    'fa-shopping-cart',
                    packageId + '_id_melis_market_place_tool_package_display',
                    'melis_market_place_tool_package_display',
                    {
                        packageId: packageId
                    },
                    'id_melis_market_place_tool_display'
                );

                clearInterval(checkTab);
            }
        }, 500);
    });
});