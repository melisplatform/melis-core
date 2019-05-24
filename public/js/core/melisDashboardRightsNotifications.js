var melisDashboardRightsNotifications = (function() {

	// cache DOM
	var $body 			= $("body"),
		$pluginBtn 		= $body.find("#melisDashBoardPluginBtn"),
		$pluginBtnBox	= $body.find("#melisDashBoardPluginBtn").closest(".melis-core-dashboard-dnd-box"),
		$dboard 		= $body.find("#"+activeTabId+" [data-tool-meliskey='meliscore_dashboard']"),
		$dbPlugins 		= $body.find("#"+activeTabId+" .melis-dashboard-plugins"),
		//$pluginMenu 	= $body.find(".melis-core-dashboard-dnd-box"),
		$availPlugins 	= $pluginBtnBox.find(".melis-core-dashboard-dnd-fix-menu .melis-core-dashboard-plugin-filter-box"),
		$arrow 			= $dbPlugins.find(".location-arrow");

		renderArrow();
		showDBPluginMenu();

		function renderArrow() {
			$arrow.css("display", "none");

			setTimeout(function() {
				if ( $pluginBtnBox.length && $arrow.length ) {
					//console.log("both are found");

					var styleProps = $pluginBtnBox.css([
							'position',
							'top',
							'right',
							'z-index'
						]);

						$.each(styleProps, function(prop, value) {				
							if ( prop === 'top' ) {
								value = parseInt(value) + 98 + 'px';
							}
							else if ( prop === 'right' ) {
								value = parseInt(value) + 64 + 'px';
							}

							$arrow.css(prop, value);
						});
				}
				$arrow.css("display", "block");
			}, 500);
		}

		function showDBPluginMenu() {
			//console.log("2 showDBPluginMenu");

			if ( typeof ( melisDashBoardDragnDrop ) !== "undefined" ) {
				//console.log("melisDashBoardDragnDrop");

				if ( $pluginBtnBox.length && $availPlugins.length ) {
					$pluginBtnBox.addClass("shown");

					//console.log("$pluginMenu: shown");
				}
			}

			/*console.log("$pluginBtnBox length: ", $pluginBtnBox.length);
			console.log("$availPlugins length: ", $availPlugins.length);
			console.log("$pluginBtnBox: ", $pluginBtnBox);*/
		}

		// bind events .melis-dashboard-plugins-menu
		$body.on("click", '.melis-opendashboard', function() {
			renderArrow();
		});

		$body.on("click", $pluginBtn, function() {
			$arrow.fadeOut("slow");
		});

		return {
			renderArrow : renderArrow
		};
		
})();