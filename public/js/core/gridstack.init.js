/**
 * Created by conta on 2/23/2018.
 */

// Binding elements
$("body").on("click", ".dashboard-plugin-delete", function() {
    melisDashBoardDragnDrop.deleteWidget($(this));
});

$("body").on("click", ".dashboard-plugin-refresh", function() {
    melisDashBoardDragnDrop.refreshWidget($(this));
});

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
        this.dropWidget();
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

                // loading effect
                $("#"+activeTabId+' .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets')
                    .html("<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>");


                var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);
                request.done(function(data){
                    // get dashboard gridstack data
                    var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');
                    // get placeholder data
                    var gridData = $("#"+activeTabId+' .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets').data()
                    var html = $(data.html);
                    // add widget to dashboard default size 6 x 6
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
            // var dataTxt = $(items[key].el).find('.dashboard-plugin-json-config').text();
            var dataTxt = $(value).find('.dashboard-plugin-json-config').text();
            // check dashboard data
            if(dataTxt) {
                // get dynamic dashboard value
                var itemData = $(value).data();
                var dashboardX = itemData._gridstack_node.x;
                var dashboardY = itemData._gridstack_node.y;
                var dashboardWidth = itemData._gridstack_node.width;
                var dashboardHeight = itemData._gridstack_node.height;
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
            if(items) {
                // hide plugin menu
                $(".melis-core-dashboard-dnd-box").removeClass("shown");
                self.serializeWidgetMap( $(items[0]._grid.container[0].children) );
            }
        });
    },

    deleteWidget: function(el) {
        var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');
            var self = el;
            melisCoreTool.confirm(
                translations.tr_melistoolcalendar_delete_event_btn_yes,
                translations.tr_melistoolcalendar_delete_event_btn_no,
                translations.tr_melis_core_remove_dashboard_plugin,
                translations.tr_melis_core_remove_dashboard_plugin_msg,
                function() {
                    grid.removeWidget(self.closest('.grid-stack-item'));
                    if( $('#'+activeTabId+' .grid-stack .grid-stack-item').length === 0 ) {
                        var dataString = new Array;
                        // create dashboard array
                        dataString.push({
                            name: 'dashboard_id',
                            value: activeTabId
                        });
                        // save dashboard lists
                        var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
                    }
                }
            );
    },
    refreshWidget: function(el) {
        var dataString = new Array;
        // create dashboard array
        dataString.push({
            name: 'dashboard_id',
            value: activeTabId
        });
        var dashboardItem = $(el).closest('.grid-stack-item');
        var dataTxt = $(dashboardItem).find('.dashboard-plugin-json-config').text();
        var dashboardData =  dashboardItem.data('_gridstack_node');

        // check dataTxt
        if(dataTxt) {
            var pluginConfig = JSON.parse(dataTxt);
            $.each(pluginConfig, function(index, value){
                // here modify x y w h of the plugin
                if(index == "x-axis") { value = dashboardData.x }
                if(index == "y-axis") { value = dashboardData.y }
                if(index == "width") { value = dashboardData.width }
                if(index == "height") { value = dashboardData.height }

                // push to dashboard array
                dataString.push({
                    name: index,
                    value: value
                });
            });
            var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

            // loading effect
            dashboardItem.append("<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>");

            request.done(function(data){

                // get dashboard gridstack data
                var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');

                // remove loader
                $(dashboardItem).find('.overlay-loader').remove();
                grid.removeWidget($(dashboardItem));
                var html = $(data.html);
                if(data.jsCallbacks.length) {
                    $.each(data.jsCallbacks, function(index, value) {
                        eval(value);
                    });

                }

                // add widget to dashboard default size 6 x 6
                var widget = grid.addWidget(html, dashboardData.x, dashboardData.y, dashboardData.width, dashboardData.height);
            });
        }
    }
};

// init
melisDashBoardDragnDrop.init();

