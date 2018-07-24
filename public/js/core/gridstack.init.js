/**
 * Created by conta on 2/23/2018.
 **/

// Binding elements
$("body").on("click", ".dashboard-plugin-delete", function() {
    melisDashBoardDragnDrop.deleteWidget($(this));
});

$("body").on("click", ".dashboard-plugin-refresh", function() {
    melisDashBoardDragnDrop.refreshWidget($(this));
});

var melisDashBoardDragnDrop = {
        
    currentPlugin: null,

    melisWidgetHandle: '.melis-core-dashboard-plugin-snippets',
    
    init: function() {
        this.cacheDom();
        this.bindEvents();
        this.gsSetOptions();
        
        this.dragWidget(this.melisWidgetHandle);
        this.docuReady();
        this.dropWidget();
        //this.dragStartWidget();
        this.dragStopWidget();
        //this.resizeStartWidget();
        this.resizeStopWidget();
    },

    cacheDom: function() {
        // jQuery DOM element
        this.$body              = $("body");
        this.$document          = $(document);
        this.$gs                = $(".grid-stack");
        this.$pluginBox         = $(".melis-core-dashboard-dnd-box");
        this.$delWidget         = $(".dashboard-plugin-delete");
        this.$refWidget         = $(".dashboard-plugin-refresh");

        // strings
        this.gsOptHandle        = ".grid-stack-item-content .widget-head:first"; // draggable handle selector
    },

    bindEvents: function() {
        this.$document.ready(this.docuReady.bind(this));
    },

    gsSetOptions: function() {
        var options = {
            cellHeight: 80,
            verticalMargin: 20,
            animate: true,
            acceptWidgets: this.melisWidgetHandle,
            draggable: {
                scroll: true
            },
            handle: this.gsOptHandle
        };

        this.$gs.gridstack(options);
    },

    dragWidget: function(widget) {
        // set up draggable element / this.melisWidgetHandle
        $(widget).draggable({
            helper: "clone",
            revert: true,
            appendTo: 'body',

            drag: function(event, ui) {
                var grid        = $('#'+activeTabId+' .tab-pane .grid-stack');
                var gridPH      = $('#'+activeTabId+' .tab-pane .grid-stack .grid-stack-placeholder');

                gridPH.attr('data-gs-width', 6);
                gridPH.attr('data-gs-height', 3);

            }
        });
    },

    docuReady: function() {       
        //.tab-pane .page-loaded height: calc(100vh - 48px);
        if( this.$body.find('.grid-stack') ) {
            this.$body.find('.grid-stack').closest('.tab-pane').css('height', 'calc(100vh - 50px)');
            this.$body.find('.grid-stack').css('height', '100%');
        } else {
            this.$body.find('.tab-pane').closest('.tab-pane').css('height', '100%');
            this.$body.find('.grid-stack').css('height', '700px');
        }
    },

    dropWidget: function() {
        var self = this;
        var active_grid = $('#'+activeTabId+' .tab-pane .grid-stack').data('gridstack');

        var gridDrop = active_grid.container.droppable({
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
            }

        });
    },

    addWidget: function(dataString) {
        var self = this;

        var $mcDashPlugSnippets = $("#"+activeTabId+" .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets");
            $mcDashPlugSnippets.attr('data-gs-width', 6);
            $mcDashPlugSnippets.attr('data-gs-height', 3);

        var mcLoader            = "<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>";

        // hide plugin menu
        this.$pluginBox.removeClass("shown");

        // loading effect
        $mcDashPlugSnippets.html(mcLoader);

        var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

        request.done(function(data){
            // get dashboard gridstack data
            var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');

            // get placeholder data
            var gridData = $("#"+activeTabId+' .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets').data();

            var html = $(data.html);

            // add widget to dashboard default size 6 x 6
            var widget = grid.addWidget(html, gridData.gsX, gridData.gsY, html.data("gsWidth"), html.data("gsHeight"));

            // remove clone widgets
            grid.removeWidget($(widget).prev());

            // serialize widget and save to db
            self.serializeWidgetMap( grid.container[0].children );
                    
            // Assigning current plugin
            self.setCurrentPlugin(widget);
            
            // Executing plugin JsCallback
            if(data.jsCallbacks.length) {
                $.each(data.jsCallbacks, function(index, value) {
                    eval(value);
                });
            }
        });
    },

    serializeWidgetMap: function(items) {
        var self = this;

        var dataString = new Array;

        // create dashboard array
        dataString.push({
            name: 'dashboard_id',
            value: activeTabId
        });

        $.each(items, function(key, value) {
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

        // save widgets to db
        self.saveDBWidgets(dataString);
    },

    saveDBWidgets: function(dataString) {
        // save the lists of widgets on the dashboard to db
        var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
    },

    dragStopWidget: function() {
        var self = this;

        // grid stack widget drag and stop position
        this.$gs.on('dragstop', function(event, ui) {
            var $this = $(this);

            // update position / size of the widget
            self.updateWidgetPosSize($this);

        });
    },

    resizeStopWidget: function() {
        var self = this;

        // grid stack stop widget resize
        this.$gs.on('gsresizestop', function(event, ui) {
            var $this   = $(this);
          
            // update position / size of widget
            self.updateWidgetPosSize($this);

        });
    },

    updateWidgetPosSize: function(gs) {
        var self        = this;

        // jQuery element
        var $grid       = $('#' + activeTabId ).find(gs);
        var items       = [];
        var gsiUiDrag   = $grid.find('.grid-stack-item.ui-draggable.ui-resizable');
        var posChanged  = false;
        var sizChanged  = false;

        gsiUiDrag.each(function() {
            // refer to gsiUiDrag
            var $this   = $(this);
            var node    = $this.data('_gridstack_node');

            items.push({
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
                content: $this.data()
            });

            if( node.x != node._beforeDragX || node.y != node._beforeDragY ) {
                posChanged = true;
            }

            /*console.log('node width: ', node.width);
            console.log('node height: ', node.height);
            console.log('__________________________');
            console.log('item width: ', items.width);
            console.log('item height: ', items.height);

            console.log('items:',items);*/

        });
        
        if(posChanged) {
            // serialize widget
            self.serializeWidgetMap( $(items[0].content._gridstack_node._grid.container[0].children) );
        }
    },

    deleteWidget: function(el) {
        var self = this;
        var $del = el;
        var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');
        
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_core_remove_dashboard_plugin,
            translations.tr_melis_core_remove_dashboard_plugin_msg,
            function() {
                grid.removeWidget($del.closest('.grid-stack-item'));

                var dataString = new Array;

                //create dashboard array
                dataString.push({
                    name: 'dashboard_id',
                    value: activeTabId
                });

                //save dashboard lists
                self.saveDBWidgets(dataString);
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

                // add widget to dashboard default size 6 x 6
                var widget = grid.addWidget(html, dashboardData.x, dashboardData.y, dashboardData.width, dashboardData.height);
                
                // Assigning current plugin
                melisDashBoardDragnDrop.setCurrentPlugin(widget);
                
                // Executing plugin JsCallback
                if(data.jsCallbacks.length) {
                    $.each(data.jsCallbacks, function(index, value) {
                        eval(value);
                    });
                }
            });
            // end of part of addWidget
        }
    },

    setCurrentPlugin: function(widget){
        // set current plugin
        this.currentPlugin = widget
    },
    
    getCurrentPlugin: function(){
        // get current plugin
        return this.currentPlugin
    }
};

$(function(){
    // init
    melisDashBoardDragnDrop.init();
});