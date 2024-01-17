var loader = (function(window) {
    // overlay loader .svg icon with spinning effect
    var $body               = $("body"),
        // overlay-loader for common loading
        overlayLoader       =   '<div id="loader" class="overlay-loader">' +
                                    '<img class="loader-icon spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12">' +
                                '</div>',
        // page-overlay-loader for melis cms page edition loading
        pageOverlayLoader   =   '<div id="loader" class="overlay-loader">' +
                                    '<div class="page-overlay-loader">' +
                                        '<img class="page-loader-icon img-fluid" src="/MelisCore/assets/images/page-loader.gif" data-page-loader="page-loader">' +
                                        '<div class="page-overlay-loader-text">' +
                                            '<img class="loader-icon-cog spinning-cog" src="/MelisCore/assets/images/cog12.svg" data-cog="cog12">' +
                                            '<p>' + translations.tr_meliscore_page_edition_loader_text +'</p>' + 
                                        '</div>' + 
                                    '</div>' +
                                '</div>',
        // window selector
        $window             = $(window);
        // matches             = activeTabId.match(/\d+/g);

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
                        $melisIframe        = $melisTabEdition.find(".melis-iframe"),
                        $loader             = $melisTabEdition.find("#loader");

                        $melisIframe.each(function() {
                            var $this           = $(this),
                                $iframeChildren = $this.contents().find("body").children();

                                if ( $iframeChildren.length === 0 && $loader.length === 0 ) {
                                    $melisTabEdition.prepend( pageOverlayLoader );
                                    melisCoreTool.addOverflowHidden();
                                }
                        });
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
                              
                                if ( $iframeChildren.length > 0 ) {
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

        // function addActivePageEditionLoading
        function addActivePageEditionLoading(zoneId) {
            var $melisCms           = $body.find("#"+zoneId+"[data-meliskey='meliscms_page'].tab-pane.container-level-a"),
                $iframeContainer    = $melisCms.find(".iframe-container"),
                $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                $melisIframe        = $melisTabEdition.find(".melis-iframe"),
                melisIframeHeight   = $melisIframe.contents().find("body").height(),
                $loader             = $melisTabEdition.find("#loader");

                // check if loader is already present
                if ( $loader.length === 0 ) {
                    // loader
                    $melisTabEdition.prepend( pageOverlayLoader );
                    melisCoreTool.addOverflowHidden();
                }
                else {
                    melisCoreTool.removeOverflowHidden();
                }

                // set .melis-iframe css height
                $melisIframe.css("height", melisIframeHeight);
        }

        // function removeActivePageEditionLoading
        function removeActivePageEditionLoading(zoneId) {
            var $melisCms           = $body.find("#"+zoneId+"[data-meliskey='meliscms_page'].tab-pane.container-level-a"),
                $iframeContainer    = $melisCms.find(".iframe-container"),
                $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                $melisIframe        = $melisTabEdition.find(".melis-iframe"),
                melisIframeHeight   = $melisIframe.contents().find("body").height(),
                $iframeElements     = $melisIframe.contents().find("body").children(),
                $loader             = $melisTabEdition.find("#loader");

                // checks for the inside iframes elements
                // if ( $iframeElements.length > 0 ) {
                    // remove loader
                    $loader.remove();

                    // remove overflow hidden
                    melisCoreTool.removeOverflowHidden();
                // }

                // set .melis-iframe css height
                $melisIframe.css("height", melisIframeHeight);
        }

        // function checkInPageLoading
        function checkPageLoading(zoneId) {
            // setTimeout 3000 for melis-user-tabs
            setTimeout(function() {              
                var setCmsBtnDisabledInterval = setInterval(function() {
                    var $activeTabId        = $("#"+zoneId),
                        $menuBarOptions     = $activeTabId.find(".menu-bar-options"),
                        $cmsBtnDisabled     = $menuBarOptions.find(".btn-disabled"),
                        $iframeContainer    = $activeTabId.find(".iframe-container"),
                        $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                        $melisIframe        = $melisTabEdition.find(".melis-iframe");

                        // check for .btn-disabled and iframe is found
                        if ( $cmsBtnDisabled.length > 0 ) {
                            if ( $melisIframe.length > 0 ) {
                                addPageEditionLoading();
                            }
                        }
                        else {
                            if ( $melisIframe.length > 0 ) {
                                removePageEditionLoading();
                                clearInterval( setCmsBtnDisabledInterval );
                            }
                        }
                }, 500);
            }, 3000);
        }

        // function checkClickEventPageLoading
        function checkClickEventPageLoading(zoneId) {
            setTimeout(function() {                     
                var setCmsBtnDisabledInterval = setInterval(function() {
                    var $activeTabId        = $("#"+zoneId),
                        $menuBarOptions     = $activeTabId.find(".menu-bar-options"),
                        $cmsBtnDisabled     = $menuBarOptions.find(".btn-disabled"),
                        $iframeContainer    = $activeTabId.find(".iframe-container"),
                        $melisTabEdition    = $iframeContainer.find(".meliscms-page-tab-edition"),
                        $melisIframe        = $melisTabEdition.find(".melis-iframe");

                        // check for .btn-disabled and iframe is found
                        if ( $cmsBtnDisabled.length > 0 && $melisIframe.length > 0 ) {
                            addActivePageEditionLoading(zoneId);
                        }
                        else {
                            removeActivePageEditionLoading(zoneId);

                            clearInterval( setCmsBtnDisabledInterval );
                        }
                }, 500);
            }, 3000);
        }

        init();

        return {
            init                                : init,

            // #1
            addPageEditionLoading               : addPageEditionLoading,
            removePageEditionLoading            : removePageEditionLoading,

            // removing of loading overlay on left sidebar menu
            removeLoadingLeftMenuOnWindowLoad   : removeLoadingLeftMenuOnWindowLoad,

            // #2
            addActivePageEditionLoading         : addActivePageEditionLoading,
            removeActivePageEditionLoading      : removeActivePageEditionLoading,

            // for opening tab contents melisHelper.tabOpen, calls #1 functions
            checkPageLoading                    : checkPageLoading,

            // for click events melisCms publishPage, calls #2 functions
            checkClickEventPageLoading          : checkClickEventPageLoading
        };
})(window);