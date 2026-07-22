var melisCoreRights = (function ($, window, document) {
	//Check this for updates: https://github.com/mar10/fancytree/blob/master/demo/sample-api.html
	// options.cascade === true -> selectMode 3 (multi-hier) : checking a parent checks all
	// its children. Opt-in per caller so existing trees keep the historical flat behaviour.
	window.initRightsTree = function (trees, url, options) {
		var opts = options || {};

		return $(trees).fancytree({
			checkbox: true,
			selectMode: opts.cascade === true ? 3 : 2,
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
			// clicking of the nodes callback function, node is rendered or re-rendered
			renderNode: function (event, data) {
				const fnode = data.node;

					// removed .fancytree-icon class and replace it with font-awesome icons
					$(fnode.span)
						.find(".fancytree-icon")
						.addClass("page-icons " + fnode.data.iconTab)
						.removeClass("fancytree-icon");

					paintNode(fnode);

					// hightlight parents of selected child nodes
					updateParentHighlight(fnode);
			},
			// load or update the children of a node in the tree
			loadChildren: function (event, data) {
				
				// hightlight parents of selected child nodes
				updateParentHighlight(data.node);

				userRightsData = [{ treeStatus: [] }];

				//var tree = $(trees).fancytree('getTree');
				var tree = $.ui.fancytree.getTree(trees);
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

					// selectMode 3 : cocher/decocher un noeud change aussi l'etat de ses
					// descendants et de ses ancetres sans declencher d'evenement `select`
					// pour eux -> on repeint tout l'arbre.
					data.tree.visit(paintNode);

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
			click: function(event, data) {
				// event.originalEvent.target.className = fancytree-title
				var targetType = data.targetType;
					if(targetType === "title") {
						data.node.tree.visit(function(n) {
							if (n.isSelected()) {
								let currentNode = n.parent;
									while (currentNode) {
										$(currentNode.span).addClass("parent-with-child-selected");
										// $(currentNode.span).find(".fancytree-title").addClass("fancytree-parent-has-child-selected");
										currentNode = currentNode.parent;
									}
							}
						});

						event.preventDefault();
					}
			}
		});
	};

	// applique le glyphe font-awesome + la couleur correspondant a l'etat coche du noeud
	function paintNode(node) {
		if (!node.span) {
			return;
		}

		var selectedColor =
			(node.data.melisData && node.data.melisData.colorSelected) || "#686868";
		var $checkbox = $(node.span).find(".fancytree-checkbox");
		var $title = $(node.span).find(".fancytree-title");

		$checkbox.addClass("rights-custom-checkbox fa");

		if (node.isSelected() === true) {
			$title.css("color", selectedColor);
			$checkbox
				.removeClass("fa-square-o")
				.addClass("fa-check-square-o")
				.css("color", selectedColor);
		} else {
			$title.css("color", "#686868");
			$checkbox
				.removeClass("fa-check-square-o")
				.addClass("fa-square-o")
				.css("color", "#686868");
		}
	}

	function updateParentHighlight(node) {
		node.tree.visit(function(n) {
			$(n.span).removeClass("parent-with-child-selected");
		});

		node.tree.visit(function(n) {
			if (n.isSelected()) {
				let currentNode = n.parent;
					while (currentNode) {
						$(currentNode.span).addClass("parent-with-child-selected");
						// $(currentNode.span).find(".fancytree-title").addClass("fancytree-parent-has-child-selected");
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
