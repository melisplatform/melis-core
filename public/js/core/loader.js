var loader = (function(window) {
    // overlay loader .svg icon with spinning effect
    var $body           = $("body"),
        overlayLoader   = '<div id="loader" class="overlay-loader"><img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12"></div>',
        // window selector
        $window         = $(window);

        // initial function
        function init() {
            // check left menu selector is found
            addLoadingLeftMenu();

            // if window is loaded remove the #loader element
            removeLoadingLeftMenuOnWindowLoad();
        }

        // adding of loader overlay on left menu
        function addLoadingLeftMenu() {
            // the left menu id selector
            var $leftMenu = $("#id_meliscore_leftmenu");

                if ( $leftMenu.length > 0 ) {
                    $leftMenu.prepend(overlayLoader);
                }
        }

        // remove loader overlay on left menu on window load
        function removeLoadingLeftMenuOnWindowLoad() {
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
        }

        // added loader overlay on the page edition iframe container
        function addPageEditionLoading() {
            var $melisCms = $body.find("[data-meliskey='meliscms_page'].tab-pane.container-level-a");

                $melisCms.each(function(i, v) {
                    var $this               = $(v),
                        $melisCmsID         = $("#"+$this.attr("id") ),
                        $iframeContainer    = $melisCmsID.find(".iframe-container"),
                        $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                        $loader             = $melisTabEdition.find("#loader");
                        
                        // check if loader overlay is already present
                        if ( $loader.length === 0 ) {
                            $melisTabEdition.prepend(overlayLoader);
                            melisCoreTool.addOverflowHidden();
                        }
                });
        }

        // remove loader overlay on the page edition iframe container
        function removePageEditionLoading() {
            var $melisCms = $body.find("[data-meliskey='meliscms_page'].tab-pane.container-level-a");
                
                $melisCms.each(function(i, v) {
                    var $this               = $(v),
                        $melisCmsID         = $("#"+$this.attr("id") ),
                        $iframeContainer    = $melisCmsID.find(".iframe-container"),
                        $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                        $melisIframe        = $melisTabEdition.find(".melis-iframe"),
                        melisIframeHeight   = $melisIframe.contents().find("body").height(),
                        $loader             = $melisTabEdition.find("#loader");

                        // check if iframe is loaded
                        $melisIframe.each(function() {
                            var $this           = $(this),
                                $iframeChildren = $this.contents().find("body").children();
                              
                                if ( $iframeChildren.length ) {
                                    // remove loader
                                    $loader.remove();

                                    // remove overflow hidden
                                    melisCoreTool.removeOverflowHidden();
                                }

                                // set .melis-iframe css height
                                $melisIframe.css("height", melisIframeHeight);
                        });
                });
        }

        init();

        return {
            init                                : init,
            addPageEditionLoading               : addPageEditionLoading,
            removePageEditionLoading            : removePageEditionLoading,
            removeLoadingLeftMenuOnWindowLoad   : removeLoadingLeftMenuOnWindowLoad
        };
})(window);