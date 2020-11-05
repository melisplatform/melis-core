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

            $('body .melis-dashboard-bubble-news-melis-plugin .back .widget-scroll').find('.widget-body > div').show();
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
                var description = value.cnews_paragraph1.replace(/<([^ >]+)[^>]*>.*?<\/\1>|<[^\/]+\/>/ig, ""),
                    newsPageId  = '91',
                    domain      = 'https://www.melistechnology.com',
                    link        = domain + '/news/id/' + newsPageId + '?newsId=' + value.cnews_id,
                    img         = domain + value.cnews_image1,
                    title       = value.cnews_title,
                    $newsLists  = $('#melis-news-bubble-plugin-news-list');

                var newsWithImage = '<div class="media innerAll">' +
                                        '<div class="media-body" data-link="' + link + '">' +
                                            '<div class="row">' +
                                                '<div class="col-md-6">' +
                                                    '<img class="img-fluid dashboard-bubble-news-img" src="' + img + '" class="dashboard-bubble-news-plugin-show-news" alt="Placeholder image" />' +
                                                '</div>' +
                                                '<div class="col-md-6">' +
                                                    '<div class="label label-default">' + value.newsDateFormated + '</div>' +
                                                    '<a href="#" class="text-info heading-title dashboard-bubble-news-plugin-show-news" title="' + value.cnews_title + '">' + ( ( title.length > 18 ) ? title.substring(0, 18) + '...' : title ) + '</a>' +
                                                    '<p>' + description.substring(0, 40) + '...</p>' +
                                                    '<a href="#" class="btn btn-info btn-bubble-read-more btn-xs float-right dashboard-bubble-news-plugin-show-news">' + translations.tr_meliscore_dashboard_bubble_plugins_read + '</a>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                var newsNoImage =  '<div class="media innerAll newsNoImage">' +
                                        '<div class="media-body" data-link="' + link + '">' +
                                            '<div class="float-right label label-default">' + value.newsDateFormated + '</div>' +
                                            '<a href="#" class="text-info heading-title dashboard-bubble-news-plugin-show-news">' + ( ( title.length > 18 ) ? title.substring(0, 18) + '...' : title ) + '</a>' +
                                            '<p>' + description.substring(0, 152) + '...</p>' +
                                            '<a href="#" class="btn btn-info btn-bubble-read-more btn-xs float-right dashboard-bubble-news-plugin-show-news">' + translations.tr_meliscore_dashboard_bubble_plugins_read + '</a>' +
                                        '</div>' +
                                    '</div>';
                if ( value.cnews_image1 !== '' ) {
                    $newsLists.append( newsWithImage );
                }
                else {
                    $newsLists.append( newsNoImage );
                }
            });
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
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