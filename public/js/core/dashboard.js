/** 
 * Dashboard functionalities manipulation 
 * on .gridstack, #bubble-plugin, #side-menu and #id_meliscore_center_dashboard_menu widths
 * Works in connection with gridstack.init.js
 * 
 * Setting the value for .gridstack data-min-width and data-max-width is in gristack.init.js
 * checkDashboardElemWidths()
 * 
 * Left menu is opened by default while dashboard plugin menu is closed
 * Issue:
 *  - When drag and dropping dashboard plugins into the .gridstack/dashboard
 *  - When scale recommended, 150% on 1920 x 1080 laptop/desktop
 */
var dashboard = (function() {
	// CACHE SELECTORS ==================================================================================
	var $body 				= $("body"),
		$activeTabId 		= $("#"+activeTabId),
		$gs 				= $activeTabId.find(".grid-stack"),
		$bp 				= $activeTabId.find(".bubble-plugin"), //$("#"+activeTabId + " .bubble-plugin"),
		//$bp					= $("#bubble-plugin"),
		$lm 				= $("#id_meliscore_leftmenu"),
		$lmBtn 				= $("#side-menu"),
		$tabArrowTop    	= $("#tab-arrow-top"), // show main tabs on small screen devices
		$dbPluginMenu 		= $("#id_meliscore_center_dashboard_menu"),
		$dbPluginMenuBtn 	= $("#melisDashBoardPluginBtn");

	// dashboard specific selectors and data values
	var $dbMsg 				= $activeTabId.find(".melis-core-dashboard-msg"),
		lmWidth 			= $lm.outerWidth(),
		dbpmWidth 			= $dbPluginMenu.outerWidth(),
		//gsWidth 			= $gs.outerWidth(),
		bpWidth 			= $bp.outerWidth(),
		dbMsgWidth 			= $dbMsg.outerWidth(),
		animationDuration   = 50,
		minWidth 			= parseInt( $gs.attr("data-min-width") ),
		maxWidth 			= parseInt( $gs.attr("data-max-width") );


		// FUNCTION DEFINITIONS =============================================================================

		// subtrace .gridstack and other elements from menus .outerWidth()
		function toggleDashboardElements($el) {
			var currentGsWidth = $gs.outerWidth();
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
								////console.log(`768 dbPluginMenu not shown, lm shown`);

								$gs.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								
								$dbMsg.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								
								if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
								}
							}
							else {
								////console.log(`768 dbPluginMenu not shown, lm not shown`);
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
								//console.log(`currentGsWidth != bpWidth: `, currentGsWidth != bpWidth);
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
								//console.log(`bpWidth == currentGsWidth: `, bpWidth == currentGsWidth);
								//console.log("bpWidth: " + bpWidth + " currentDsWidth: " + currentGsWidth);
								// if .grid-stack width is below .bubble-plugin width
								if ( bpWidth == currentGsWidth ) {
									//console.log(`=======INSIDE=======`);
									//console.log(`bpWidth + lmWidth: `, bpWidth + lmWidth );
									//console.log(`bpWidth: `, bpWidth);
									//console.log(`lmWidth: `, lmWidth);
									//console.log(`currentGsWidth: `, currentGsWidth);
									//console.log(`$bp.outerWidth(): `, $bp.outerWidth());
									$gs.animate({ width: bpWidth + lmWidth }, animationDuration);

									$dbMsg.animate({ width: bpWidth + lmWidth }, animationDuration);
									
									if ( $bp.length ) {
										$bp.animate({ width: $bp.outerWidth() + lmWidth }, animationDuration);
										
										//console.log(`$bp.outerWidth() + lmWidth: `, $bp.outerWidth() + lmWidth );
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
					//console.log(`767 $el[0].id: `, $el[0].id);
					// dashboard menu button clicked
					if ( $el[0].id === "melisDashBoardPluginBtn" ) {
						//console.log({$bp});
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
								
								//if ( $bp.length ) {
									$bp.animate({ width: currentGsWidth - dbpmWidth }, animationDuration);
								//}

								//$bp.css("width", bpWidth - dbpmWidth);

								/* console.log({currentGsWidth});
								console.log({bpWidth});
								console.log({dbpmWidth});
								console.log(`$bp.outerWidth(): `, $bp.outerWidth() );

								if ( currentGsWidth == bpWidth ) {
									$bp.animate({ width: bpWidth - dbpmWidth }, animationDuration);

									console.log(`currentGsWidth == bpWidth: `, currentGsWidth == bpWidth );
									console.log({currentGsWidth});
									console.log({bpWidth});
									console.log({dbpmWidth});
									console.log(`$bp.outerWidth(): `, $bp.outerWidth() );
								} */
							}
						}
						// db menu not clicked, off
						else {
							//console.log(`767 dbPluginMenu not shown, lm not shown`);
							$gs.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);

							$dbMsg.animate({ width: currentGsWidth + dbpmWidth }, animationDuration);
							
							if ( $bp.length ) {
								$bp.animate({ width: bpWidth - dbpmWidth }, animationDuration);
							}

							$bp.css("width", bpWidth - dbpmWidth);

							/* console.log({currentGsWidth});
							console.log({bpWidth});
							console.log({dbpmWidth});
							console.log(`$bp.outerWidth(): `, $bp.outerWidth() ); */
						}
					}
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