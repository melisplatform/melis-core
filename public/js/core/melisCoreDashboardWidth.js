var melisCoreDashboardWidth = (function(window) {
	// variable declaration
    var $body           = $("body"),
        $activeTab      = $("#"+activeTabId),
        // menus
        $leftMenu       = $("#id_meliscore_leftmenu"),
        $leftMenuBtn    = $("#sidebar-menu"),
        $pluginMenu     = $("#id_meliscore_center_dashboard_menu"),
        $pluginMenuBtn  = $("#melisDashBoardPluginBtn"),
        // dashboard elements
        $bubblePlugin   = $activeTab.find("#bubble-plugin"),
        $gridStack      = $activeTab.find(".grid-stack"),
        $dbMsg          = $activeTab.find(".melis-core-dashboard-msg"),
        // dashboard elements grid-stack widths
        gridStackWidth  = $gridStack.outerWidth(),
        pluginMenuWidth = $pluginMenu.outerWidth(),
        leftMenuWidth   = $leftMenu.outerWidth(),
        gsItemCount     = ( typeof melisDashBoardDragnDrop !== "undefined" ) ? melisDashBoardDragnDrop.countGsItems() : 0;

        // methods / functions
        /**
         * Set value for min and max width data
         * Since .grid-stack, #bubble-plugin and .melis-core-dashboard-msg, will use gridStackWidth for its width for uniformity
         */
        function setGridStackWidths() {
            // #bubble-plugin
            $bubblePlugin.attr("data-min-width", gridStackWidth - pluginMenuWidth);
            $bubblePlugin.attr("data-max-width", gridStackWidth);
            $bubblePlugin.css("width", gridStackWidth);

            // .grid-stack
            $gridStack.attr("data-min-width", gridStackWidth - pluginMenuWidth);
            $gridStack.attr("data-max-width", gridStackWidth);
            $gridStack.css("width", gridStackWidth);

            // .melis-core-dashboard-msg
            $dbMsg.attr("data-min-width", gridStackWidth - pluginMenuWidth);
            $dbMsg.attr("data-max-width", gridStackWidth);
            $dbMsg.css("width", gridStackWidth);
        }

        /**
         * Add or remove .pt-0 class
         */
        function addOrRemoveClassPt() {
            var $melisDashboardPlugins  = $dbMsg.closest(".melis-dashboard-plugins"),
                ptClass                 = "pt-0",
                $pt                     = $melisDashboardPlugins.find("."+ptClass);

                if ( $pt.length ) {
                    $melisDashboardPlugins.removeClass(ptClass);
                }
                else {
                    $melisDashboardPlugins.addClass(ptClass);
                }
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
            ( gsItemCount > 0 ) ? $dbMsg.hide() : $dbMsg.show();
        }
        
        /**
         * Checks on dashboard elements widths
         */
        function checkDashboard() {
            showOrHideDbMsg();
            setGridStackWidths();
            setBubblePluginElementSpacing();
        }

        // inits and events
        checkDashboard();

})(window);