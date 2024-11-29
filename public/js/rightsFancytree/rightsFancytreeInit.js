var melisCoreRights = (function ($, window, document) {
	//Check this for updates: https://github.com/mar10/fancytree/blob/master/demo/sample-api.html
	window.initRightsTree = function (trees, url) {
		return $(trees).fancytree({
			checkbox: true,
			selectMode: 2,
			debugLevel: 0,
			toggleEffect: {
				effect: "slideToggle",
				duration: 500,
			},
			source: {
				url: url /* ,
				cache: true,
				dataType: "json" */,
			},
			//load
			lazyLoad: function (event, data) {
				var lazyURL = data.node.data.melisData.lazyURL;
				data.result = {
					url: lazyURL,
				};
			},
			// clicking of the nodes callback function
			renderNode: function (event, data) {
				const fnode = data.node;

					// hightlight parents of selected child nodes
					updateParentHighlight(fnode);

					// removed .fancytree-icon class and replace it with font-awesome icons
					$(fnode.span)
						.find(".fancytree-icon")
						.addClass("page-icons " + fnode.data.iconTab)
						.removeClass("fancytree-icon");
					$(fnode.span)
						.find(".fancytree-checkbox")
						.addClass("rights-custom-checkbox fa fa-square-o");

					if (fnode.isSelected() === true) {
						$(fnode.span)
							.find(".fancytree-title")
							.css("color", fnode.data.melisData.colorSelected);
						$(fnode.span)
							.find(".fancytree-checkbox")
							.removeClass("fa-square-o")
							.addClass("fa-check-square-o")
							.css("color", fnode.data.melisData.colorSelected);
					} else {
						$(fnode.span).find(".fancytree-title").css("color", "#686868");
					}
			},
			loadChildren: function (event, data) {
				userRightsData = [{ treeStatus: [] }];

				//var tree = $(trees).fancytree('getTree');
				var tree = $.ui.fancytree.getTree(trees);
				// console.log(`rightsFancytreeInit.js loadChildren() tree: `, tree);
				tree.findAll(function (node) {
					userRightsData[0]["treeStatus"].push(node.key);

					// on first render of the tree get all the toplevel parent node and add them to the array
					if (node.isTopLevel() && node.isStatusNode() === false) {
						var parentObj = {};
						parentObj[node.key] = [];
						userRightsData.push(parentObj);
					}

					if (node.isSelected() === true) {
						// get the parent list of each node
						var parents = $.map(
							node.getParentList(false, true),
							function (node) {
								return node.key;
							}
						);

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
			select: function (event, data) {
				const fnode = data.node;

					// hightlight parents of selected child nodes
					updateParentHighlight(fnode);

					if (fnode.isSelected() === true) {
						$(fnode.span)
							.find(".fancytree-title")
							.css("color", fnode.data.melisData.colorSelected);
						$(fnode.span)
							.find(".fancytree-checkbox")
							.removeClass("fa-square-o")
							.addClass("fa-check-square-o")
							.css("color", fnode.data.melisData.colorSelected);
						
						/* fnode.visitParents(function(parent) {
							$(parent.span).addClass("parent-with-child-selected");
						}); */

					} else {
						$(fnode.span).find(".fancytree-title").css("color", "#686868");
						$(fnode.span)
							.find(".fancytree-checkbox")
							.removeClass("fa-check-square-o")
							.addClass("fa-square-o")
							.css("color", "#686868");
						
						/* fnode.visitParents(function(parent) {
							const hasCheckedChildren = parent.children.some(child => child.isSelected());
								if (!hasCheckedChildren) {
									$(parent.span).removeClass("parent-with-child-selected");
								}
						}); */
					}

					// reset the values of the array everytime a node is checked or unchecked to update values
					for (var i = 0; i < userRightsData.length; i++) {
						$.each(userRightsData[i], function (key, value) {
							// dont empty the treeStatus array
							if (key !== "treeStatus") {
								userRightsData[i][key] = [];
							}
						});
					}

					// Get a list of all selected nodes, and convert to a key array:
					var selKeys = $.map(data.tree.getSelectedNodes(), function (node) {
						// get the parent list of each node
						var parents = $.map(node.getParentList(false, true), function (node) {
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
			},
		});
	};

	function updateParentHighlight(node) {
		node.tree.visit(function(n) {
			$(n.span).removeClass("parent-with-child-selected");
		});

		node.tree.visit(function(n) {
			if (n.isSelected()) {
				let currentNode = n.parent;
					while (currentNode) {
						$(currentNode.span).addClass("parent-with-child-selected");
						currentNode = currentNode.parent;
					}
			}
		});
	}

	$("#rights-fancytree").niceScroll({
		zindex: 1000,
		cursorborder: "none",
		cursorborderradius: "0",
		cursorcolor: primaryColor,
		autohidemode: false,
	});

	return {
		updateParentHighlight : updateParentHighlight
	}
})(jQuery, window);
