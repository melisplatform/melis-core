var melisDashboardRightsNotifications = (function(window) {

	// cache DOM
	var $body 			= $("body"),
		$pluginBtn 		= $body.find("#melisDashBoardPluginBtn"),
		$pluginBtnBox	= $body.find("#melisDashBoardPluginBtn").closest(".melis-core-dashboard-dnd-box"),
		$dboard 		= $body.find("#"+activeTabId+" [data-tool-meliskey='meliscore_dashboard']"),
		$gsItem 		= $dboard.find(".grid-stack .grid-stack-item"),
		$dbPlugins 		= $body.find("#"+activeTabId+" .melis-dashboard-plugins"),
		$availPlugins 	= $pluginBtnBox.find(".melis-core-dashboard-dnd-fix-menu .melis-core-dashboard-plugin-filter-box"),
		$arrow 			= "<div id='plugin-menu-arrow-wrapper'><i class='fa fa-location-arrow plugin-menu-arrow' aria-hidden='true'></i><div class='plugin-menu-btn animated hinge infinite zoomIn'></div><div class='plugin-menu-arrow-overlay'></div></div>";

		function renderArrow() {
			if ( $gsItem.length === 0 ) {
				if ( $pluginBtnBox.length && !$pluginBtnBox.hasClass("shown") ) {
						$body.append( $arrow );

						var $pluginMenuWrapper = $body.find("#plugin-menu-arrow-wrapper");
							$pluginMenuWrapper.fadeIn("slow");
				}
			}
		}

		// bind events .melis-dashboard-plugins-menu
		$body.on("click", '.melis-opendashboard', function() {
			renderArrow();
		});

		/* $body.on("click", $pluginBtn, function() {
			$arrow.fadeOut("slow");
		}); */

		renderArrow();

		return {
			renderArrow : renderArrow
		};
		
})(window);