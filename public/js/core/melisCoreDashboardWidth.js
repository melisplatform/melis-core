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
        // gridstak.init.js functions
        gsItemCount     = ( typeof melisDashBoardDragnDrop !== 'undefined' ) ? melisDashBoardDragnDrop.countGsItems() : 0;

        // methods
        
        /**
         * Checks on dashboard elements widths
         */
        function checkDashboard() {
            if ( typeof melisDashBoardDragnDrop !== 'undefined' ) {
                var gsItems = melisDashBoardDragnDrop.countGsItems();

                    console.log('melisCoreDashboardWidth checkDashboard gsItems: ', gsItems);
                    ( gsItems > 0 ) ? $dbMsg.hide() : $dbMsg.show();
            }
        }

        // inits and events
        checkDashboard();

})(window);