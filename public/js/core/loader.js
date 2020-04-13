var loader = (function($, window) {
    // overlay loader .svg icon with spinning effect
    var $body           = $("body"),
        overlayLoader   = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>',
        // window selector
        $window         = $(window),
        init = function() {
            // check left menu selector is found
            addLoadingLeftMenu();

            // if window is loaded remove the #loader element
            removeLoadingLeftMenu();
        },
        addLoadingLeftMenu = function() {
            // the left menu id selector
            var $leftMenu = $("#id_meliscore_leftmenu");

                if ( $leftMenu.length > 0 ) {
                    $leftMenu.prepend(overlayLoader);
                }
        },
        removeLoadingLeftMenu = function() {
            $window.on("load", function() {
                // #loader element
                var $loader = $("#loader");

                var loaderInterval = setInterval(function() {
                    if ( $loader.length > 0 ) {
                        $loader.remove();

                        clearInterval(loaderInterval);
                    }
                }, 1000);
            });
        },
        pageEditionLoading = function() {
            var $melisCmsPage       = $("[data-meliskey='meliscms_page']").find(".active"),
                $iframeContainer    = $melisCmsPage.find(".iframe-container"),
                $iframeTab          = $iframeContainer.find(".widget-body.tab-content .meliscms-page-tab-edition.active"),
                $iframe             = $iframeTab.find(".melis-iframe");

                if ( $melisCmsPage.length > 0 ) {
                    $melisCmsPage.prepend(overlayLoader);
                }
        };

        return {
            init : init
        };

})(jQuery, window);

/* $(function() {
    loader.init();
}); */