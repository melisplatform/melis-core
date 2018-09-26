(function() {
	var melisDashBoardDragnDrop = {
		currentPlugin: null,
		melisWidgetHandle: '.melis-core-dashboard-plugin-snippets',
		init: function() {
			this.cacheDom();

			this.dragWidget( this.melisWidgetHandle );
			this.dropWidget( this.melisWidgetHandle );
		},
		cacheDom: function() {
			this.$doc 		= $(document);
			this.$body 		= $("body");
			this.$gridDrop 	= this.$body.find("#grid");
			this.$pluginBox	= this.$body.find(".melis-core-dashboard-dnd-box");
		},
		dragWidget: function(widget) {
			// set up draggable element / this.melisWidgetHandle
			var widgetPlaceholder = "<div class='grid-widget-placeholder'><div class='placeholder-content'></div></div>";
			var currentDraggedWidget;

	        $(widget).draggable({
	            helper: 'clone', // element will be cloned and the clone will be dragged
	            revert: 'invalid', // when not dropped, the item will revert back to its initial position
	            appendTo: 'parent', // jQuery object containing the element to append the helper to
	            cursor: 'move' // change cursor to move when dragging
	        });
		},
		dropWidget: function(widget) {
			var self 	= this,
				$grid 	= $("#"+activeTabId+" .tab-pane #grid");

				$grid.droppable({
					accept: widget,
					tolerance: 'pointer',
					drop: function(event, ui) {
						var dataString  = new Array;

		                // create dashboard array
		                dataString.push({
		                    name: 'dashboard_id',
		                    value: activeTabId
		                });

		                // get plugin menu data
		                var pluginMenu = $(ui.helper[0]).find(".plugin-json-config").text();

		                // check plugin menu
		                if(pluginMenu) {

		                    // parse to JSON
		                    var pluginConfig = JSON.parse(pluginMenu);

		                    $.each(pluginConfig, function(index, value){

		                        // check and modify w h value 6
		                        if(index == "width" && value == "") { value = 6 };
		                        if(index == "height" && value == "") { value = 6 };

		                        // push to dashboard array
		                        dataString.push({
		                            name: index,
		                            value: value
		                        });
		                    });
		                }

		                self.addWidget(dataString);
					},
					activate: function(event, ui) {
						$grid.css('background-color', 'lightgoldenrodyellow');
					}
				});
		},
		addWidget: function($item) {
			var self 	= this;
			
			
		}
	};

	// init
	melisDashBoardDragnDrop.init();
})()