/**
 * Created by conta on 2/23/2018.
 */

    var melisDashBoardDragnDrop = {
        init: function() {
            var options = {
                cellHeight: 80,
                verticalMargin: 20,
                animate: true,
                acceptWidgets: '.melis-core-dashboard-plugin-snippets',
                draggable: {
                    scroll: true
                },
                handle: ".grid-stack-item-content .widget-head:first",
            };

            $('.grid-stack').gridstack(options);
            this.widgetDrag(".melis-core-dashboard-plugin-snippets");
            this.dropWidget(target);
            this.changeWidget();
        },

        widgetDrag: function(widget) {
            $(widget).draggable({
                helper: "clone",
                revert: true,
                appendTo: 'body'
            });
        },

        dropWidget: function(res) {

            var active_grid = $('#'+activeTabId+' .tab-pane .grid-stack').data('gridstack');
            var gridDrop = active_grid.container.droppable({
                // accept: ".melis-core-dashboard-plugin-snippets",
                tolerance: 'pointer',
                drop: function( event, ui ) {
                    var dataString = new Array;
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
                            // check and modify w h value
                            if(index == "width" && value == "") { value = 6 };
                            if(index == "height" && value == "") { value = 6 };
                            // push to dashboard array
                            dataString.push({
                                name: index,
                                value: value
                            });
                        });
                    }


                    var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);
                    request.done(function(data){
                        // get dashboard gridstack data
                        var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');
                        // get placeholder data
                        var gridData = grid.placeholder.data();
                        var html = $(data.html);
                        // add widget to dashboard
                        var widget = grid.addWidget(html, gridData.gsX, gridData.gsY, 6, 6);

                        // remove clone widgets
                         grid.removeWidget($(widget).prev());
                    });
                }
            });
        },

        serializeWidgetMap: function(items) {

            var dataString = new Array;
            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });

            $.each(items, function(key, value) {
                var dataTxt = $(items[key].el).find('.dashboard-plugin-json-config').text();
                // check dashboard data
                if(dataTxt) {
                    // get dynamic dashboard value
                    var dashboardX = value.x;
                    var dashboardY = value.y;
                    var dashboardWidth = value.width;
                    var dashboardHeight = value.height;
                    // JSON parse dashboard txt
                    var pluginConfig = JSON.parse(dataTxt);
                    $.each(pluginConfig, function(index, value){
                        // here modify x y w h of the plugin
                        if(index == "x-axis") { value = dashboardX; }
                        if(index == "y-axis") { value = dashboardY; }
                        if(index == "width") { value = dashboardWidth; }
                        if(index == "height") { value = dashboardHeight; }
                        // push to dashboard array
                        dataString.push({
                            name: 'plugins['+pluginConfig["plugin"]+']['+pluginConfig["plugin_id"]+']['+index+']',
                            value: value
                        });
                    });
                }

            });

            // save dashboard lists
            var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
        },

        changeWidget: function() {
            var self = this;
            // gridstack change
            $('.grid-stack').on('change', function(event, items) {
                // hide plugin menu
                $(".melis-core-dashboard-dnd-box").removeClass("shown");
                self.serializeWidgetMap(items);
            });
        },
    };

// init
melisDashBoardDragnDrop.init();

