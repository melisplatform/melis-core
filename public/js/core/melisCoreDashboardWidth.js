var melisCoreDashboardWidth = (function(window) {
	// Variable Declaration
    var $body           = $("body"),
        $activeTab      = $("#"+activeTabId),
        // menus
        leftMenuId      = "#id_meliscore_leftmenu",
        leftMenuBtnId   = "#sidebar-menu",
        pluginMenuId    = "#id_meliscore_center_dashboard_menu", // .melis-core-dashboard-dnd-box
        pluginMenuBtnId = "#melisDashBoardPluginBtn",
        $leftMenu       = $(leftMenuId),
        $leftMenuBtn    = $(leftMenuBtnId),        
        $pluginMenu     = $(pluginMenuId),
        $pluginMenuBtn  = $(pluginMenuId),
        // dashboard elements
        $bubblePlugin   = $activeTab.find("#bubble-plugin"),
        $gridStack      = $activeTab.find(".grid-stack"),
        $dbMsg          = $activeTab.find(".melis-core-dashboard-msg"),
        $tabArrowTop    = $("#tab-arrow-top"),
        elementArray    = [$gridStack, $dbMsg, $bubblePlugin],
        // dashboard elements grid-stack widths
        gridStackWidth  = $gridStack.outerWidth(),
        pluginMenuWidth = $pluginMenu.outerWidth(),
        leftMenuWidth   = $leftMenu.outerWidth(),
        gsItemCount     = ( typeof melisDashBoardDragnDrop !== "undefined" ) ? melisDashBoardDragnDrop.countGsItems() : 0;

        // Methods / Functions
        /**
         * Set value for min and max width data
         * Since .grid-stack, #bubble-plugin and .melis-core-dashboard-msg, will use gridStackWidth for its width for uniformity
         */
        function setGridStackWidths() {
            var _activeTab       = $("#"+activeTabId),
                _bubblePlugin    = _activeTab.find("#bubble-plugin"),
                _gridStack       = _activeTab.find(".grid-stack"),
                _dbMsg           = _activeTab.find(".melis-core-dashboard-msg"),
                _elementArray    = [_gridStack, _dbMsg, _bubblePlugin];

                // #bubble-plugin
                /* $bubblePlugin.attr("data-min-width", gridStackWidth - pluginMenuWidth);
                $bubblePlugin.attr("data-max-width", gridStackWidth);
                $bubblePlugin.css("width", gridStackWidth);

                // .grid-stack
                $gridStack.attr("data-min-width", gridStackWidth - pluginMenuWidth);
                $gridStack.attr("data-max-width", gridStackWidth);
                $gridStack.css("width", gridStackWidth);

                // .melis-core-dashboard-msg
                $dbMsg.attr("data-min-width", gridStackWidth - pluginMenuWidth);
                $dbMsg.attr("data-max-width", gridStackWidth);
                $dbMsg.css("width", gridStackWidth); */

                $.each( _elementArray, function(key, value) {
                    var $element = $(value);
                        // check if element is present
                        if ( $element.length ) {
                            $element.attr("data-min-width", gridStackWidth - pluginMenuWidth );
                            $element.attr("data-max-width", gridStackWidth );
                        }
                });
                
                animateDbElementWidth( _elementArray, gridStackWidth - pluginMenuWidth );
        }

        /**
         * Get minimum width value on .grid-stack's data-min-width attribute
         * @return {number}
         */
        function getMinWidth() {
            return $gridStack.data("min-width");
        }

        /**
         * Get maximum width value on .grid-stack's data-max-width attribute
         * @return {number}
         */
         function getMaxWidth() {
            return $gridStack.data("max-width");
        }

        /**
         * Add or remove .pt-0 class
         */
        function addOrRemoveClassPt() {
            var $melisDashboardPlugins  = $dbMsg.closest(".melis-dashboard-plugins"),
                ptClass                 = "pt-0",
                $pt                     = $melisDashboardPlugins.find("."+ptClass);

                ( $pt.length ) ? $melisDashboardPlugins.removeClass( ptClass ) : $melisDashboardPlugins.addClass( ptClass );
        }

        /**
         * Set spacing for #bubble-plugin and .grid-stack div elements
         */
        function setBubblePluginElementSpacing() {
            if ( $bubblePlugin.length ) {
                if ( $dbMsg.length && $dbMsg.is(":visible") ) {
                    addOrRemoveClassPt();
                }

                if ( gsItemCount > 0 ) {
                    addOrRemoveClassPt();
                }
            }
        }

        /**
         * Show or hide .melis-core-dashboard-msg
         */
        function showOrHideDbMsg() {
            // count .grid-stack-item
            if ( gsItemCount > 0 ) {
                $dbMsg.hide();
            } 
            else {
                $dbMsg.show();
            }
        }

        /**
         * Add or remove shown class on plugin menu
         */
        function addOrRemoveShownClassPluginMenu() {
            ( gsItemCount > 0 ) ? $pluginMenu.removeClass("shown") : $pluginMenu.addClass("shown");
        }

        /**
         * Add or remove .hide-arrow class on #tab-arrow-top on mobile view 767px and below
         */
        function addOrRemoveHideArrowClassTabArrowTop() {
            if ( $tabArrowTop.length && melisCore.screenSize <= 767 ) {
                ( isPluginMenuShown() ) ? $tabArrowTop.addClass("hide-arrow") : $tabArrowTop.removeClass("hide-arrow");
            }
        }

        /**
         * Animate dashboard elements width with animate() function.
         * Dashboard elements: $gridStack, $dbMsg and $bubblePlugin
         * @param {number} widthValue
         * @param {array} elemArray
         */
        function animateDbElementWidth( elemArray, widthValue ) {
            console.log("check! animateDbElementWidth widthValue: ", widthValue);
            $.each( elemArray, function(key, value) {
                var $element = $(value);
                    // check if element is present
                    if ( $element.length ) {
                        $element.animate({
                            width: widthValue
                        }, 3);
                    }
            });
        }

        /**
         * Check on plugin menu class .shown
         * if dashboard plugin is opened.
         * Adjust dashboard elements accordingly.
         */
        function checkPluginMenu() {
            var _minWidth = getMinWidth(),
                _maxWidth = getMaxWidth();

                if ( $pluginMenu.hasClass("shown") ) {
                    animateDbElementWidth( elementArray, _minWidth );
                }
                else {
                    animateDbElementWidth( elementArray, _maxWidth );
                }
        }

        /**
         * Toggle dashboard plugin menu
         * and adjust dashboard elements width.
         * $gridStack, $dbMsg and $bubblePlugin
         */
        function toggleDbPluginMenu() {
            var _minWidth = getMinWidth(),
                _maxWidth = getMaxWidth();
                
                // toggle class .shown
                $pluginMenu.toggleClass("shown");
            
                // #tab-arrow-top, show tab menu on mobile view 767px and below 
                addOrRemoveHideArrowClassTabArrowTop();

                // check for screenSize
                if ( melisCore.screenSize >= 768 ) {
                    if ( $pluginMenu.hasClass('shown') ) {
                        if ( $leftMenu.hasClass('shown') ) {
                            animateDbElementWidth( elementArray, _minWidth );
                        }
                        else {
                            if ( melisCore.screenSize == 768 ) {
                                animateDbElementWidth( elementArray, _maxWidth - pluginMenuWidth );
                            }
                            else {
                                animateDbElementWidth( elementArray, _maxWidth + 50 );
                            }
                        }
                    }
                    else {
                        if ( $leftMenu.hasClass('shown') ) {
                            console.log("check! _minWidth + pluginMenuWidth: ", _minWidth + pluginMenuWidth );
                            console.log("check! elementArray: ", elementArray );
                            animateDbElementWidth( elementArray, _minWidth + pluginMenuWidth );
                        }
                        else {
                            if ( melisCore.screenSize == 768 ) {
                                animateDbElementWidth( elementArray, _maxWidth );
                            }
                            else {
                                animateDbElementWidth( elementArray, _maxWidth + leftMenuWidth );
                            }
                        }
                    }
                }
                else {
                    // check for dashboard plugin menu is shown
                    checkPluginMenu();
                }
        }

        /**
         * Toggle left menu or sidebar menu
         * and adjust dashboard elements width.
         * $gridStack, $dbMsg and $bubblePlugin
         */
        function toggleLeftMenu() {
            var _minWidth = getMinWidth(),
                _maxWidth = getMaxWidth();

                // prevent from having a scrollbar at the bottom
                $body.toggleClass("overflowHidden");

                $leftMenu.toggleClass("shown");

                if ( melisCore.screenSize >= 768 ) {
                    if ( $leftMenu.hasClass("shown") ) {
                        if ( $pluginMenu.hasClass("shown") ) {
                            animateDbElementWidth( elementArray, _minWidth );
                        }
                        else {
                            animateDbElementWidth( elementArray, _maxWidth );
                        }
                    }
                    else {
                        if ( $pluginMenu.hasClass("shown") ) {
                            if ( melisCore.screenSize == 768 ) {
                                animateDbElementWidth( elmentArray, _minWidth );
                            }
                            else {
                                animateDbElementWidth( elementArray, _maxWidth + 50 );
                            }
                        }
                        else {
                            if ( melisCore.screenSize == 768 ) {
                                animateDbElementWidth( elementArray, _maxWidth );
                            }
                            else {
                                animateDbElementWidth( elementArray, _maxWidth + pluginMenuWidth + 50 );
                            }
                        }
                    }
                }
        }
        
        /**
         * Checks on dashboard elements widths
         */
        function checkDashboard() {
            var _minWidth       = getMinWidth(),
                elementArray    = [$gridStack];

                setGridStackWidths();
                setBubblePluginElementSpacing();
                showOrHideDbMsg();
                addOrRemoveShownClassPluginMenu();
                addOrRemoveHideArrowClassTabArrowTop();

                checkPluginMenu();

                if ( $pluginMenu.hasClass("shown") && gsItemCount === 0 ) {
                    animateDbElementWidth( elementArray, _minWidth );
                }
        }

        // Inits, Events and Function calls
        checkDashboard();

        // toggle plugin menu
        $body.on("click", pluginMenuBtnId, toggleDbPluginMenu);

        // toggle sidebar menu
        $body.on("click", leftMenuBtnId, toggleLeftMenu);

        $body.on("click", "#dashboard-plugin-delete-all", function() {
            var _maxWidth   = getMaxWidth(),
                element     = [$gridStack];

                animateDbElementWidth( element, _maxWidth );
        });

        return {
            checkDashboard : checkDashboard
        };

})(window);