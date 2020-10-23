var MelisCoreDashboardBubbleNewsMelisPlugin = {
    init: function() {
        this.getNews();
        this.waitForEl('#melis-news-bubble-plugin-news-list div.media.innerAll', function () {
            $('body .melis-dashboard-bubble-news-melis-plugin .back .widget-scroll').find('.widget-body > div').height($(this).attr('data-scroll-height')).niceScroll({
                cursorwidth: 3,
                zindex: 2,
                cursorborder: "none",
                cursorborderradius: "0",
                cursorcolor: primaryColor
            });
        });
    },
    getNews: function() {
        $.ajax({
            type: 'POST',
            url: 'melis/dashboard-plugin/MelisCoreDashboardBubbleNewsMelisPlugin/getNews',
        }).done(function (response) {
            if (response.count > 0) {
                var button = '<button id="dashboard-bubble-news-back-btn" class="btn btn-inverse">' + translations.tr_meliscore_dashboard_bubble_plugins_view_melis_news + '</button>';
                $('#dashboard-bubble-news-back-btn-container').append(button);
            }

            $('#melis-news-bubble-plugin-counter').text(response.count);

            $.each(response.data, function (key, value) {
                var description = value.cnews_paragraph1.replace(/<([^ >]+)[^>]*>.*?<\/\1>|<[^\/]+\/>/ig, "");
                var newsPageId = '91';
                var domain = 'https://www.melistechnology.com';
                var link = domain + '/news/id/' + newsPageId + '?newsId=' + value.cnews_id;
                var img = domain + value.cnews_image1;
                var news = '<div class="media innerAll">\n' +
                    '<i class="fa fa-chat fa-2x float-left disabled"></i>\n' +
                    '<div class="media-body" data-link="' + link + '" style="margin: 0px;">\n' +
                    '<img src="' + img + '" class="dashboard-bubble-news-plugin-show-news" alt="" width="50" height="115" style="float: left;width: 25%;cursor: pointer;">\n' +
                    '<div style="float: right;">\n' +
                    '<div class="float-right label label-default">' + value.newsDateFormated + '</div><br>\n' +
                    '<button class="btn btn-info btn-xs dashboard-bubble-news-plugin-show-news" style="margin-top: 60px;margin-left: 8px">' + translations.tr_meliscore_dashboard_bubble_plugins_read + '</button>\n' +
                    '</div>\n' +
                    '<div style="float: left;width: 50%;padding-left: 10px;">\n' +
                    '<a href="#" class="text-info dashboard-bubble-news-plugin-show-news" style="word-break: break-all;">' + value.cnews_title + '</a>\n' +
                    '<p style="word-break: break-all;font-size: 13px;margin-top: 10px;">' + description.substring(0, 40) + '...</p>\n' +
                    '</div>\n' +
                    '</div>\n' +
                    '</div>';

                $('#melis-news-bubble-plugin-news-list').append(news);
            });
        });
    },
    showBackButton: function () {
        var button = '<button id="dashboard-bubble-news-back-btn" class="btn btn-inverse">View Melis News</button>';
        $('#dashboard-bubble-news-back-btn-container').append(button);
    },
    waitForEl: function (selector, callback) {
        var poller1 = setInterval(function(){
            $jObject = $(selector);
            if($jObject.length < 1){
                return;
            }
            clearInterval(poller1);
            callback($jObject)
        },100);
    }
};

$(document).ready(function() {
    var $body = $('body');
    var showBubblePlugins = MelisCoreDashboardBubblePlugin.showBubblePlugins();

    if (showBubblePlugins) {
        MelisCoreDashboardBubbleNewsMelisPlugin.init();
    }

    $body.on('click', '.dashboard-bubble-news-plugin-show-news', function () {
        window.open($(this).closest('div.media-body').data('link'), '_blank');
    });
});