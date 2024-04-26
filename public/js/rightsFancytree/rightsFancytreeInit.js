(function($){
	initRightsTree = function(trees, url) {
		$(trees).fancytree({
			checkbox: true,
			selectMode: 2,
			debugLevel: 0,
			toggleEffect: {
			effect: "slideToggle",
			duration: 500,
			},
			source: {
				url: url,
			},
			//load
			lazyLoad: function(event, data) {
				var lazyURL = data.node.data.melisData.lazyURL;
					data.result = { 
						url: lazyURL,
					}
			},
			// clicking of the nodes callback function
			renderNode: function (event, data) {
				// removed .fancytree-icon class and replace it with font-awesome icons
				$(data.node.span).find('.fancytree-icon').addClass("page-icons "+data.node.data.iconTab).removeClass('fancytree-icon'); 
				$(data.node.span).find('.fancytree-checkbox').addClass("rights-custom-checkbox fa fa-square-o");
				
				if(data.node.isSelected() === true){
					//console.log(`$(data.node.span).find('.fancytree-title').text(): `, $(data.node.span).find('.fancytree-title').text());
					$(data.node.span).find('.fancytree-title').css("color",data.node.data.melisData.colorSelected );
					$(data.node.span).find('.fancytree-checkbox').removeClass("fa-square-o").addClass("fa-check-square-o").css("color",data.node.data.melisData.colorSelected );
					//$(data.node.span).closest("li").addClass("fancytree-animating");
				}
				else{
					$(data.node.span).find('.fancytree-title').css("color","#686868" );
				}
			},
			loadChildren: function(event, data) {
				userRightsData = [ { "treeStatus" : [] }];
				
				var tree = $(trees).fancytree('getTree');
				
					tree.findAll(function(node){
						userRightsData[0]['treeStatus'].push(node.key);
						
						// on first render of the tree get all the toplevel parent node and add them to the array
						if( ( node.isTopLevel() ) && (node.isStatusNode() === false) ){
							var parentObj = {};
							parentObj[node.key] = [];
							userRightsData.push(parentObj);  
						}  
						
						if(node.isSelected() === true){
							// get the parent list of each node 
							var parents = $.map( node.getParentList(false, true), function(node){
								return node.key;
							});
							
							// get the topmost parent (top level parent)
							var getToplvlParent = parents.shift();
							
							// loop the userRightsData array object and if the toplvl parent node inside userRightsData[] matches the current node parent. 
							// add them to the array of xNodex[]
							for (var i = 0; i < userRightsData.length; i++) {
								if (userRightsData[i][getToplvlParent]) {
									userRightsData[i][getToplvlParent].push(node.key);
								} 
							}
						}
					});
			},
			select: function(event, data) {
				if ( data.node.isSelected() === true ) {
					$(data.node.span).find('.fancytree-title').css("color",data.node.data.melisData.colorSelected );
					$(data.node.span).find('.fancytree-checkbox').removeClass("fa-square-o").addClass("fa-check-square-o").css("color",data.node.data.melisData.colorSelected );
				}
				else {
					$(data.node.span).find('.fancytree-title').css("color","#686868" );
					$(data.node.span).find('.fancytree-checkbox').removeClass("fa-check-square-o").addClass("fa-square-o").css("color","#686868" );
				}
				
				// reset the values of the array everytime a node is checked or unchecked to update values
				for (var i = 0; i < userRightsData.length; i++) {
					$.each( userRightsData[i], function( key, value ) {
						// dont empty the treeStatus array
						if( key !== 'treeStatus'){
							userRightsData[i][key] = [];
						}
					});
				}

				// Get a list of all selected nodes, and convert to a key array:
				var selKeys = $.map(data.tree.getSelectedNodes(), function(node){
					
					// get the parent list of each node 
					var parents = $.map( node.getParentList(false, true), function(node){
						return node.key;
					});
			
					// get the topmost parent (top level parent)
					var getToplvlParent = parents.shift();
					
					// loop the userRightsData array object and if the toplvl parent node inside userRightsData[] matches the current node parent. 
					// add them to the array of xNodex[]
					for (var i = 0; i < userRightsData.length; i++) {
						if (userRightsData[i][getToplvlParent]) {
							userRightsData[i][getToplvlParent].push(node.key);
						}
					}
				});

				// highlight parents node selected
				highlightParents( data );
			}
		});
		
		// add class exclusion to differ the color hightlight to red
		var $body = $("body");

			$body.on("click", 
			".btnUserEdit," +
			"#id_meliscore_tool_user_action_new_user," +
			".btnUserEditRole," +
			"#id_melissb_tool_userrole_header_buttons_add_role",
			function(e) {
				e.preventDefault();

				setTimeout(function() {
					if ( $(trees).length ) {
						$(trees).find(".ui-fancytree").each(function(i, v) {
							var $this = $(v);
								$this.find("li:first-child").addClass("exclusion");
						});
					}
				}, 3000);
			});

			// highlight parents from selected
			// red: #cb4040
			// green: #99c975
			// gray: #686868
			function highlightParents( data ) {
				var $clickedNodeSpan = $(data.node.span);
					// select on nodes
					//console.log(`$clickedNodeSpan.hasClass("fancytree-selected"): `, $clickedNodeSpan.hasClass("fancytree-selected"));
					if ( $clickedNodeSpan.hasClass("fancytree-selected") ) {
						var $parentSelected 	= $clickedNodeSpan.parents("ul").prev(".fancytree-has-children.fancytree-selected"),
							$parentNotSelected 	= $clickedNodeSpan.parents("ul").prev(".fancytree-has-children").not(".fancytree-selected");

							// parent nodes that are not pre selected
							if ( $parentNotSelected.length ) {
								$parentNotSelected.find(".fancytree-title").css({
									"color": "#cb4040",
									"opacity": 0.7
								});
							}
							else {
								$parentSelected.find(".fancytree-title").css({
									"color": "#cb4040",
									"opacity": 1
								});
							}
					}
					// deselect a node
					else {
						// node deselected is a parent node
						// console.log(`$clickedNodeSpan.hasClass("fancytree-has-children"): `, $clickedNodeSpan.hasClass("fancytree-has-children"));
						if ( $clickedNodeSpan.hasClass("fancytree-has-children") ) {
							// current deselected has an active child or grandchild node
							console.log(`parent node deselected, $clickedNodeSpan.next("ul").find(".fancytree-selected").length: `, $clickedNodeSpan.next("ul").find(".fancytree-selected").length );
							console.log(`parent node deselected, $clickedNodeSpan.closest("li").siblings().find(".fancytree-selected").length: `, $clickedNodeSpan.closest("li").siblings().find(".fancytree-selected").length );
							if ( $clickedNodeSpan.next("ul").find(".fancytree-selected").length || $clickedNodeSpan.closest("li").siblings().find(".fancytree-selected").length ) {
								$clickedNodeSpan.closest("li").find(".fancytree-has-children .fancytree-title").css({
									"color": "#cb4040",
									"opacity": 0.7
								});
								
								// parent not previously selected
								console.log(`parent node deselected not prevously selected, $clickedNodeSpan.parents("ul").prev(".fancytree-has-children").hasClass("fancytree-selected"): `, $clickedNodeSpan.parents("ul").prev(".fancytree-has-children").hasClass("fancytree-selected") );
								if ( $clickedNodeSpan.parents("ul").prev(".fancytree-has-children").hasClass("fancytree-selected") ) {
									$clickedNodeSpan.parents("ul").prev(".fancytree-has-children.fancytree-selected").find(".fancytree-title").css({
										"color": "#cb4040",
										"opacity": 1
									});
								}
								else {
									//console.log(`$clickedNodeSpan.closest("li").find(".fancytree-has-children .fancytree-selected").length: `, $clickedNodeSpan.closest("li").find(".fancytree-has-children .fancytree-selected").length);
									if ( $clickedNodeSpan.closest("li").find(".fancytree-has-children .fancytree-selected").length ) {
										$clickedNodeSpan.parents("ul").prev(".fancytree-has-children").find(".fancytree-title").css({
											"color": "#cb4040",
											"opacity": 0.7
										});
									}
								}
							}
							else {
								$clickedNodeSpan.parents("ul").prev(".fancytree-has-children").find(".fancytree-title").css({
									"color": "#686868",
									"opacity": 1
								});
							}
						}
						// child node deselected
						else {
							/* console.log(`child node deselected $clickedNodeSpan.closest("ul").parent("li").siblings().find(".fancytree-selected").length: `, $clickedNodeSpan.parent("ul").closest("li").siblings().find(".fancytree-selected").length); */
							var $siblingsChildDeSelected = $(".fancytree-active").closest("ul").parent("li").siblings().find(".fancytree-selected");							
								if ( $siblingsChildDeSelected.length ) {
									$(".fancytree-active").closest("ul").prev(".fancytree-has-children").not(".fancytree-selected").find(".fancytree-title").css({
										"color": "#686868",
										"opacity": 1
									});
								}
								else {
									/* if ( $clickedNodeSpan.parents("ul").prev(".fancytree-has-children").hasClass(".fancytree-selected") ) {
										$clickedNodeSpan.parents("ul").prev(".fancytree-has-children").not(".fancytree-selected").find(".fancytree-title").css({
											"color": "#cb4040",
											"opacity": 0.7
										});
									}
									else { */
										$clickedNodeSpan.parents("ul").prev(".fancytree-has-children").find(".fancytree-title").css({
											"color": "#686868",
											"opacity": 1
										});
									//}
								}
							
						}
					}
			}
	}
	
	var $rightFancytree = $('#rights-fancytree');
		$rightFancytree.niceScroll({
			zindex: 1000,
			cursorborder: "none",
			cursorborderradius: "0",
			cursorcolor: primaryColor,
			autohidemode: false
		});
})(jQuery);