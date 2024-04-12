(function($){
	window.initRightsTree = function(trees, url) {
		$(trees).fancytree({
			checkbox: true,
			selectMode: 2,
			debugLevel: 0,
			toggleEffect: {
			effect: "slideToggle",
			duration: 500
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
			renderNode: function (event, data) {
				// removed .fancytree-icon class and replace it with font-awesome icons
				$(data.node.span).find('.fancytree-icon').addClass("page-icons "+data.node.data.iconTab).removeClass('fancytree-icon'); 
				$(data.node.span).find('.fancytree-checkbox').addClass("rights-custom-checkbox fa fa-square-o");
				
				if(data.node.isSelected() === true){
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
						if( ( node.isTopLevel() )  && (node.isStatusNode() === false) ){
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
					$(data.node.span).find('.fancytree-title').css("color", data.node.data.melisData.colorSelected );
					$(data.node.span).find('.fancytree-checkbox').removeClass("fa-square-o").addClass("fa-check-square-o").css("color",data.node.data.melisData.colorSelected );

					$(data.node.span).parents("ul").prev(".fancytree-expanded").addClass("fancytree-has-children-selected");

					// check if there are child nodes selected and highlight the direct parents node title color
					if ( $(data.node.span).closest("ul").find("li span.fancytree-selected").length === 0 ) {
						$(data.node.span).parents("ul").prev(".fancytree-expanded").not(".fancytree-selected").find(".fancytree-title").css({
							"color": data.node.data.melisData.colorSelected,
							"opacity": 1
						});
					}
					else {
						$(data.node.span).parents("ul").prev(".fancytree-expanded").not(".fancytree-selected").find(".fancytree-title").css({
							"color": data.node.data.melisData.colorSelected,
							"opacity": 0.7
						});
					}

					// select on parent node
					if ( $(data.node.span).closest(".fancytree-has-children.fancytree-selected").length ) {
						if ( $(data.node.span).closest(".fancytree-has-children.fancytree-selected").next("ul").find(".fancytree-selected").length ) {
							$(data.node.span).closest(".fancytree-has-children.fancytree-selected").find(".fancytree-title").css({
								"color": data.node.data.melisData.colorSelected,
								"opacity": 1
							});
						}
					}
				}
				// uncheck/deselect node
				else {
					$(data.node.span).find('.fancytree-title').css("color","#686868" );
					$(data.node.span).find('.fancytree-checkbox').removeClass("fa-check-square-o").addClass("fa-square-o").css("color","#686868" );

					// uncheck/deselect the child node and highlight the direct parents node title color
					if ( $(data.node.span).closest("ul").find("li span.fancytree-selected").length === 0 ) {
						$(data.node.span).parents("ul").prev(".fancytree-expanded").not(".fancytree-selected").find(".fancytree-title").css({
							"color": "#686868",
							"opacity": 1
						});
					}
					else {
						// .fancytree-has-children-selected
						$(data.node.span).parents("ul").prev(".fancytree-expanded").not(".fancytree-selected, .fancytree-has-children-selected").find(".fancytree-title").css({
							"color": "#686868",
							"opacity": 1
						});
					}

					// uncheck/deselect the parent node and highlight its title color accordingly
					if ( $(data.node.span).closest(".fancytree-has-children.fancytree-selected").length === 0 ) {
						if ( $(data.node.span).closest(".fancytree-has-children").next("ul").find(".fancytree-selected").length ) {
							$(data.node.span).closest(".fancytree-has-children").find(".fancytree-title").css({
								"color": data.node.data.melisData.colorSelected,
								"opacity": 0.7
							});
						}
						else {
							$(data.node.span).closest(".fancytree-has-children").find(".fancytree-title").css({
								"color": "#686868",
								"opacity": 1
							});
						}
					}
				}

				// checks for any child node selected from a parent node that is selected
				if ( $(".fancytree-selected.fancytree-has-children").find("ul li .fancytree-selected").length === 0 ) {
					$(".fancytree-selected").parents("ul").prev(".fancytree-expanded.fancytree-has-children").find(".fancytree-title").css({
						"color": data.node.data.melisData.colorSelected,
						"opacity": 1
					})
				}
				else {
					$(".fancytree-selected").parents("ul").prev(".fancytree-expanded.fancytree-has-children").find(".fancytree-title").css({
						"color": data.node.data.melisData.colorSelected,
						"opacity": 0.7
					})
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
			}
		});
	}
	
	$('#rights-fancytree').niceScroll({
		zindex: 1000,
		cursorborder: "none",
		cursorborderradius: "0",
		cursorcolor: primaryColor,
		autohidemode: false
	});
})(jQuery);