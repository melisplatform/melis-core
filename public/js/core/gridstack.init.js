/**
 * Created by conta on 2/23/2018
 * Edited by Junry @ June - Sept 2018
 **/

var $body = $("body");

// Binding elements
$body.on("click", "#dashboard-plugin-delete-all", function() {
    melisDashBoardDragnDrop.deleteAllWidget($(this));
});

$body.on("click", ".dashboard-plugin-delete", function() {
    melisDashBoardDragnDrop.deleteWidget($(this));
});

$body.on("click", ".dashboard-plugin-refresh", function() {
    melisDashBoardDragnDrop.refreshWidget($(this));
});

var melisDashBoardDragnDrop = {

    currentPlugin: null,

    melisWidgetHandle: '.melis-core-dashboard-plugin-snippets',
    
    init: function() {
        this.cacheDom();
        this.gsSetOptions();
        this.bindEvents();
        
        this.dragWidget();
        this.docuReady();

        this.dropWidget( this.melisWidgetHandle );
        this.dragStopWidget();
        this.resizeStopWidget();
    },

    cacheDom: function() {
        // jQuery DOM element
        this.$body              = $("body");
        this.$document          = $(document);
        this.$window            = $(window);
        this.$gs                = this.$body.find("#"+activeTabId+" .grid-stack");
        this.$pluginBox         = this.$body.find(".melis-core-dashboard-dnd-box");
        this.$pluginBtn         = this.$body.find("#melisDashBoardPluginBtn");
        this.$box               = this.$pluginBtn.closest(".melis-core-dashboard-dnd-box");
        this.$deleteAllWidget   = this.$body.find("#dashboard-plugin-delete-all");
        this.$dWidth            = this.$gs.width() - this.$box.width(); // shrink, 1584 - 220 = 1364
        this.$nWidth            = this.$dWidth + this.$box.width();

        // strings
        this.gsOptHandle        = ".grid-stack-item-content .widget-head:first"; // draggable handle selector
    },

    gsSetOptions: function() {
        var options = {
            cellHeight: 80,
            verticalMargin: 20,
            animate: true,
            float: false,
            acceptWidgets: '.melis-core-dashboard-plugin-snippets', // .grid-stack-item
            alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            draggable: {
                scroll: true
            },
            handle: this.gsOptHandle
        };

        this.$gs.gridstack(options);
    },

    dragWidget: function() {
        // set up draggable element / this.melisWidgetHandle / .grid-stack-item
        $(".melis-core-dashboard-plugin-filter-box .melis-core-dashboard-plugin-snippets").draggable({
            helper: 'clone',
            revert: 'invalid',
            appendTo: 'body',
            drag: function(event, ui) {
                var grid        = $('#'+activeTabId+' .tab-pane .grid-stack');
                var gridPH      = $('#'+activeTabId+' .tab-pane .grid-stack .grid-stack-placeholder');

                gridPH.attr('data-gs-width', 6);
                gridPH.attr('data-gs-height', 3);
            }
        });
    },

    bindEvents: function() {
        this.$document.ready(this.docuReady.bind(this));
    },

    docuReady: function() {
        var $btn    = this.$body.find("#melisDashBoardPluginBtn"),
            $box    = $btn.closest(".melis-core-dashboard-dnd-box"),
            $window = $(window),
            $gs     = this.$gs,
            dWidth  = $gs.width() - $box.width(), // grid-stack width - plugin box width
            nWidth  = dWidth + $box.width();
        /* 
         * Subtracts the .grid-stack width with the plugins sidebar's width so that it would not overlap
         * workaround solution for the issue: http://mantis.melistechnology.fr/view.php?id=2418
         * this is also applied on mobile responsive as it would not allow to drop plugins if sidebar is position fixed
         * in melisCore.js @ 494 #melisDashBoardPluginBtn click event
         */

        // remove class shown on plugin box
        this.$body.on("click", "ul.sideMenu li a[data-toggle='collapse']", function() {
            if ($box.hasClass("shown")) {
                $box.removeClass("shown");

                $gs.animate({
                    width: nWidth
                }, 3);
            }
        });

        // animate to full width size of #grid1
        this.$body.on("click", "#dashboard-plugin-delete-all", function() {
            $gs.animate({
                width: nWidth
            }, 3);
        });
    },

    dropWidget: function( widget ) {
        var self        = this,
            $tabPane    = $("#"+activeTabId+" .tab-pane"),
            $grid       = $("#"+activeTabId+" .tab-pane .grid-stack"),
            gridstack   = $("#"+activeTabId+" .tab-pane .grid-stack").data("gridstack");

        var dropTimer,
            dropCount = 0;

        var gridDrop = gridstack.container.droppable({
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

                // addWidget passing dataString
                self.addWidget(dataString);
            }
        });
    },

    addWidget: function(dataString) {
        var self    = this;

        var $btn = $("#melisDashBoardPluginBtn"),
            $box = $btn.closest(".melis-core-dashboard-dnd-box"),
            $window = $(window),
            $gs = this.$gs;

        var $mcDashPlugSnippets = $("#"+activeTabId+" .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets");
            $mcDashPlugSnippets.attr('data-gs-width', 6);
            $mcDashPlugSnippets.attr('data-gs-height', 3);

        var mcLoader            = "<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>";

            // loading effect
            $mcDashPlugSnippets.html(mcLoader);

        var gridstack   = $("#"+activeTabId+" .tab-pane .grid-stack").data("gridstack");
        //var isDisabled  = gridstack.container.droppable("option", "disable", true);

            //if ( this.$body.find('.grids-stack .melis-core-dashboard-plugin-snippets') ) {
                // disable grid
                gridstack.container.droppable("disable");

                //alert( 'A plugin is still loading..' );
            //}

        var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

            request.done(function(data){

                // enable grid
                gridstack.container.droppable("enable");

                // get dashboard gridstack data
                var grid = $('#'+activeTabId+' .grid-stack').data('gridstack');

                // get placeholder data
                var gridData = $("#"+activeTabId+' .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets').data();

                var html = $(data.html);

                // add widget to dashboard default size 6 x 6
                var widget = grid.addWidget(html, gridData.gsX, gridData.gsY, html.data("gsWidth"), html.data("gsHeight"));

                // remove clone widgets
                grid.removeWidget( $(widget).prev() );

                if ( $box.hasClass("shown") ) {
                    // hide plugin menu
                    $box.removeClass("shown");

                    //if ( $window.width() <= 768 ) {
                        $gs.animate({
                            width: $gs.width() + $box.width()
                        }, 3);
                    //}
                }

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

    saveCurrentDashboard: function(el) {
        var self    = this,
            $grid   = $('#'+activeTabId+' .grid-stack').data('gridstack'),
            $item   = el.closest('.grid-stack-item').data('_gridstack_node'),
            $items  = $item._grid.container[0].children;

            // serialize & save to db the current gridstack items
            self.serializeWidgetMap( $items );
    },

    dragStopWidget: function() {
        var self = this;

        // grid stack widget drag and stop position
        this.$gs.on('dragstop', function(event, ui) {
            var $grid   = $(this),
                $el     = $(event.target),
                node    = $el.data('_gridstack_node'),
                items   = node._grid.container[0].children;

                // update size of widgets .grid-stack-items
                self.serializeWidgetMap( $(items) );
        });
    },

    resizeStopWidget: function() {
        var self = this;

        // grid stack stop widget resize
        this.$gs.on('gsresizestop', function(event, elem) {
            var $grid   = $(this),
                node    = $(elem).data('_gridstack_node');
                items   = node._grid.container[0].children;

                // update size of widgets passes array of .grid-stack-items
                self.serializeWidgetMap( $(items) );
        });
    },

    deleteWidget: function(el) {
        var self    = this;

        var grid    = $('#'+activeTabId+' .grid-stack').data('gridstack'),
            $del    = el,
            $item   = $del.closest('.grid-stack-item').data('_gridstack_node');

            melisCoreTool.confirm(
                translations.tr_meliscore_common_yes,
                translations.tr_meliscore_common_no,
                translations.tr_meliscore_remove_dashboard_plugin,
                translations.tr_meliscore_remove_dashboard_plugin_msg,
                function() {

                    // remove the item from the dashboard
                    grid.removeWidget( $item.el[0] );

                    // check gridstack nodes positions and sizes
                    $items = $item._grid.container[0].children;
                    
                    // serialize & save db remaining gridstack items
                    self.serializeWidgetMap( $items );

                    // Plugin delete callback
                    if (typeof $del.data('callback') !== "undefined") {
                        var callback = eval($del.data("callback"));
                        if (typeof callback === "function") {
                            callback($del.closest('.grid-stack-item'));
                        }
                    }
                }
            );
    },

    deleteAllWidget: function(el) {
        var self        = this;

        var grid        = $('#'+activeTabId+' .grid-stack').data('gridstack'),
            $gs         = $('#' + activeTabId ).find('.grid-stack'),
            $items      = $gs.find('.grid-stack-item');

        if( $items.length != 0 ) {

            var dataString = new Array;

            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });

            melisCoreTool.confirm(
                translations.tr_meliscore_common_yes,
                translations.tr_meliscore_common_no,
                translations.tr_meliscore_remove_all_plugins,
                translations.tr_meliscore_remove_dashboard_all_plugin_msg,
                function() {
                    grid.removeAll();
                    
                    // save widgets position / size on db
                    self.saveDBWidgets(dataString);
                }
            );

            // hide plugin menu
            this.$pluginBox.removeClass("shown");

            // Plugins delete callback
            $('#'+activeTabId+' .grid-stack .grid-stack-item .dashboard-plugin-delete').each(function(i, v){
                var $this = $(this);

                if (typeof $this.data('callback') !== "undefined") {
                    var callback = eval($this.data("callback"));
                    if (typeof callback === "function") {
                        callback($this.closest('.grid-stack-item'));
                    }
                }
            });

        } else {
            // 'Ok', 'Close', 'Remove all plugins', 'No plugins to delete.'
            melisCoreTool.confirm(
                translations.tr_meliscore_common_yes,
                translations.tr_meliscore_common_no,
                translations.tr_meliscore_remove_all_plugins,
                translations.tr_meliscore_remove_dashboard_no_plugin_msg
            );
        }
    },

    refreshWidget: function(el) {
        var self = this;

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
                
                // assigning current plugin
                self.setCurrentPlugin(widget);
                
                // executing plugin JsCallback
                if(data.jsCallbacks.length) {
                    $.each(data.jsCallbacks, function(index, value) {
                        eval(value);
                    });
                }
            });
        }
    },

    setCurrentPlugin: function(widget){
        // set current plugin
        this.currentPlugin = widget;
    },
    
    getCurrentPlugin: function(){
        // get current plugin
        return this.currentPlugin;
    }
};

$(function(){
    // init
    melisDashBoardDragnDrop.init();
});
