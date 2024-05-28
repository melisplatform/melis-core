/** 
 * Dashboard functionalities manipulation 
 * on .gridstack, #bubble-plugin, #side-menu and #id_meliscore_center_dashboard_menu widths
 * Works in connection with gridstack.init.js
 * 
 * Setting the value for .gridstack data-min-width and data-max-width is in gristack.init.js
 * checkDashboardElemWidths()
 * console.log() is for tracing where the action falls
 * 
 * Left menu is opened by default while dashboard plugin menu is closed
 * Issue:
 *  - When drag and dropping dashboard plugins into the .gridstack/dashboard
 *  - When scale recommended, 150% on 1920 x 1080 laptop/desktop
 */
var dashboard = (function() {
	// CACHE SELECTORS ==================================================================================
	var $body 				= $("body"),
		$activeTabId		= $("#"+activeTabId),
		$gs 				= $activeTabId.find(".grid-stack"),
		$lm 				= $("#id_meliscore_leftmenu"),
		$lmBtn 				= $("#side-menu"),
		$tabArrowTop    	= $("#tab-arrow-top"), // show main tabs on small screen devices
		$dbPluginMenu 		= $("#id_meliscore_center_dashboard_menu"),
		$dbPluginMenuBtn 	= $("#melisDashBoardPluginBtn");

	// dashboard specific selectors and data values
	var $dbMsg 				= $activeTabId.find(".melis-core-dashboard-msg"),
		lmWidth 			= $lm.outerWidth(),
		dbpmWidth 			= $dbPluginMenu.outerWidth(),
		dbMsgWidth 			= $dbMsg.outerWidth(),
		animationDuration   = 50,
		minWidth 			= parseInt( $gs.attr("data-min-width") ),
		maxWidth 			= parseInt( $gs.attr("data-max-width") );


		// FUNCTION DEFINITIONS =============================================================================

		// subtrace .gridstack and other elements from menus .outerWidth()
		function toggleDashboardElements($el) {
			var currentGsWidth 	= $gs.outerWidth(),
				$bpWrapper 		= $("#id_meliscore_dashboard_bubble_plugins"),
				$bp 			= $bpWrapper.find(".tab-pane .bubble-plugin"),
				bpWidth 		= $bp.outerWidth();

				// check screenSize for responsive, desktop
				if ( melisCore.screenSize >= 768 ) {
					//console.log(`768 $el[0].id: `, $el[0].id);
					// dashboard menu button clicked
					if ( $el[0].id === "melisDashBoardPluginBtn" ) {
						// toggle class .shown
						$dbPluginMenu.toggleClass("shown");

						// dashboard plugin menu button clicked, on
						if ( $dbPluginMenu.hasClass("shown") )	{
							if ( $lm.hasClass("shown") ) {
								//console.log(`768 dbPluginMenu shown, lm shown`);
								$gs.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth - dbpmWidth}, animationDuration);
								}
							}
							else {
								//console.log(`768 dbPluginMenu shown, lm not shown`);
								$gs.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								}
							}
						}
						// db menu not shown, off
						else {
							if ( $lm.hasClass("shown") ) {
								//console.log(`768 dbPluginMenu not shown, lm shown`);

								$gs.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								
								$dbMsg.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								}
							}
							else {
								//console.log(`768 dbPluginMenu not shown, lm not shown`);
								$gs.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								}
							}
						}
					}
					// left menu button is clicked, sidebarMenuClicked
					else if ( $el[0].id === "sidebar-menu" ) {
						$lm.toggleClass("shown");
						//console.log(`768 $lm.hasClass("shown"): `, $lm.hasClass("shown") );
						if ( $lm.hasClass("shown") ) {
							if ( $dbPluginMenu.hasClass("shown") ) {
								//console.log(`768 lm shown, dbPluginMenu shown`);
								// if .grid-stack width is below .bubble-plugin width
								if ( currentGsWidth != bpWidth ) {
									$gs.animate({ width: bpWidth - dbpmWidth }, animationDuration);

									$dbMsg.animate({ width: bpWidth - dbpmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: bpWidth - dbpmWidth }, animationDuration);
									}
								}
								else {
									$gs.animate({ width: currentGsWidth - lmWidth }, animationDuration);

									$dbMsg.animate({ width: currentGsWidth - lmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: currentGsWidth - lmWidth }, animationDuration);
									}
								}
							}
							else {
								//console.log(`768 lm shown, dbPluginMenu not shown`);
								// if .grid-stack width is below .bubble-plugin width
								if ( currentGsWidth != bpWidth ) {
									$gs.animate({ width: bpWidth - lmWidth }, animationDuration);

									$dbMsg.animate({ width: bpWidth - lmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: bpWidth - lmWidth }, animationDuration);
									}
								}
								$gs.animate({ width: currentGsWidth - lmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth - lmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth - lmWidth }, animationDuration);
								}
							}
						}
						// false
						else {
							if ( $dbPluginMenu.hasClass("shown") ) {
								//console.log(`768 lm not shown, dbPluginMenu shown`);
								$gs.animate({ width: currentGsWidth + lmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth + lmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth + lmWidth }, animationDuration);
								}
							}
							else {
								//console.log(`768 lm not shown, dbPluginMenu not shown`);
								// if .grid-stack width is below .bubble-plugin width
								if ( bpWidth == currentGsWidth ) {
									$gs.animate({ width: bpWidth + lmWidth }, animationDuration);

									$dbMsg.animate({ width: bpWidth + lmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: $bp.outerWidth() + lmWidth }, animationDuration);
									}
								}
								else {
									$gs.animate({ width: currentGsWidth + lmWidth }, animationDuration);

									$dbMsg.animate({ width: currentGsWidth + lmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: currentGsWidth + lmWidth }, animationDuration);
									}
								}
							}
						}
					}
				}
				// considered mobile width
				else {
					// dashboard menu button clicked
					if ( $el[0].id === "melisDashBoardPluginBtn" ) {
						// toggle class .shown
						$dbPluginMenu.toggleClass("shown");

						// dashboard plugin menu button clicked, on
						if ( $dbPluginMenu.hasClass("shown") )	{
							if ( $lm.hasClass("shown") ) {
								//console.log(`767 dbPluginMenu shown, lm shown`);
								$gs.animate({ width: minWidth }, animationDuration);

								$dbMsg.animate({ width: minWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: minWidth }, animationDuration);
								}
							}
							else {
								//console.log(`767 dbPluginMenu shown, lm not shown`);
								$gs.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);

								$dbMsg.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								}
							}
						}
						// db menu not clicked, off
						else {
							//console.log(`767 dbPluginMenu not shown, lm not shown`);
							$gs.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);

							$dbMsg.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
							
							if ( $bp.length ) {
								$bp.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
							}
						}
					}
				}

            if($($el).closest(".melis-core-dashboard-dnd-box").hasClass("shown")){
                $.ajax({
                    type: 'GET',
                    url: '/melis/MelisCore/DashboardPlugins/dashboardMenuContent',
                    beforeSend: function(){
                        loader.addLoadingDashboardPluginMenu();
                    }
                }).done(function(data){
                    $("#dashboardMenuContent").html(data.view);
                    setTimeout(function(){
                        melisDashBoardDragnDrop.init(false);
                    }, 100);
                    loader.removeLoadingDashboardPluginMenu();
                });
            }
		}

		// BIND & DELEGATE EVENTS ===========================================================================
		/* 
		 * Subtracts the .grid-stack width with the plugins sidebar's width so that it would not overlap
		 * workaround solution for the issue: http://mantis.melistechnology.fr/view.php?id=2418
		 * this is also applied on mobile responsive as it would not allow to drop plugins if sidebar is position fixed
		 * in melisCore.js @ 494 #melisDashBoardPluginBtn click event
		 */
		$body.on("click", "#melisDashBoardPluginBtn, #sidebar-menu", function(e) {
			e.preventDefault();

			toggleDashboardElements( $(this) );
		});

		// FUNCTION CALLS ===================================================================================

		// RETURN ===========================================================================================
		/*
		 * Include your newly created functions inside the object so it will be accessible outside
    	 * sample syntax in calling it outside - dashboard.functionName()
		 */
		return {
			toggleDashboardElements : toggleDashboardElements
		}
})();