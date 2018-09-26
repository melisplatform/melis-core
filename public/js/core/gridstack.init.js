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
        this.gsSetOptions(this.melisWidgetHandle);
        this.bindEvents();
        
        this.dragWidget(this.melisWidgetHandle);
        this.docuReady();

        this.dropWidget(this.melisWidgetHandle);
        this.dragStopWidget();
        this.resizeStopWidget();
    },

    cacheDom: function() {
        // jQuery DOM element
        this.$body              = $("body");
        this.$document          = $(document);
        this.$gs1               = $(".grid-stack");
        this.$pluginBox         = $(".melis-core-dashboard-dnd-box");

        // strings
        this.gsOptHandle        = ".grid-stack-item-content .widget-head:first"; // draggable handle selector
    },

    gsSetOptions: function(widget) {
        console.log('acceptWidgets: true');
        var options = {
            cellHeight: 80,
            verticalMargin: 20,
            animate: true,
            acceptWidgets: true,
            draggable: {
                scroll: true
            },
            handle: this.gsOptHandle
        };

        this.$gs1.gridstack(options);
        //this.$gs2.gridstack(options);
    },

    dragWidget: function(widget) {
        // set up draggable element / this.melisWidgetHandle
        $(widget).draggable({
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
        var self = this;
    },

    dropWidget: function(widget) {
        console.log('accept: widget');
        var self = this;

        var grid = $("#"+activeTabId+" .tab-pane .grid-stack");

        var enabledGrid = $("#"+activeTabId+" .tab-pane .grid-stack").data("gridstack");

        var grid1Drop = enabledGrid.container.droppable({
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
                grid.css('background-color', 'lightgoldenrodyellow');
            }
        });
    },

    addWidget: function(dataString) {
        console.log('$.ajax: true');

        var self = this;

        console.log('addWidget self: ', self);

        var $mcDashPlugSnippets = $("#"+activeTabId+" .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets");
            $mcDashPlugSnippets.attr('data-gs-width', 6);
            $mcDashPlugSnippets.attr('data-gs-height', 3);

        var mcLoader            = "<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>";

        // loading effect
        $mcDashPlugSnippets.html(mcLoader);

        $.ajax({
            cache: false,
            url: "/melis/MelisCore/DashboardPlugins/getPlugin",
            type: 'POST',
            dataType: 'json',
            data: dataString,
            success: function(data) {
                console.log('addWiget data:', data);
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
                self.serializeWidgetMap( $( grid.container[0].children ) );
                        
                // Assigning current plugin
                melisDashBoardDragnDrop.setCurrentPlugin(widget);
                
                // Executing plugin JsCallback
                if(data.jsCallbacks.length) {
                    $.each(data.jsCallbacks, function(index, value) {
                        eval(value);
                    });
                }
            },
            error: function(textstatus) {
                if( textstatus === "timeout" ) {
                    alert("got timeout");
                    window.location.reload();
                }
            },
            timeout: 3000
        });

        /*var request = $.post( "/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

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
            melisDashBoardDragnDrop.setCurrentPlugin(widget);
            
            // Executing plugin JsCallback
            if(data.jsCallbacks.length) {
                $.each(data.jsCallbacks, function(index, value) {
                    eval(value);
                });
            }
        });*/
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
        this.$gs1.on('dragstop', function(event, ui) {
            var $grid   = $(this),
                $el      = $(event.target),
                node    = $el.data('_gridstack_node'),
                items   = node._grid.container[0].children;

                //node._grid = $grid;

                //var droppable_status    = $grid.droppable('option', 'disabled');

                //console.log('node: ', node);
                /*console.log('node._grid.container[0].children: ', node._grid.container[0].children);*/

                //console.log('event: ', event);

                // update position of widget passes array of .grid-stack-items
                self.serializeWidgetMap( $(items) );

                console.log('dragstop new js');
        });
    },

    resizeStopWidget: function() {
        var self = this;

        // grid stack stop widget resize
        this.$gs1.on('gsresizestop', function(event, elem) {
            var $grid   = $(this),
                el      = $(event.target),
                node    = el.data('_gridstack_node'),
                items   = node._grid.container[0].children;

                // update size of widgets passes array of .grid-stack-items
                self.serializeWidgetMap( $(items) );
        });
    },

    /** 
     * How to get coordinates( x, y ) & size( width, height ), which actually changed
     * Ref: https://github.com/gridstack/gridstack.js/issues/757.
     *
     * Items here prefix with activeTabId to always check that the code applies on the active tab 
     * which has grid stack functionality .grid-stack-item are all draggable & resizable .ui-draggable & .ui-resizable
     **/

    updateWidgetPosSize: function() {
        var self        = this,
            itemsArr    = [],
            $grid       = $('#' + activeTabId ).find('.grid-stack'),
            $items      = $grid.find('.grid-stack-item.ui-draggable.ui-resizable'),
            activeGrid  = $('#'+activeTabId+' .tab-pane .grid-stack').data('gridstack');

            if( $items ) {
                // hide plugin menu
                this.$pluginBox.removeClass("shown");

                for( var i = 0; i < $items.length; i++ ) {
                    //console.log('$items['+i+']: ', $items[i]);
                }
            }
    },

    deleteWidget: function(el) {
        var self        = this;

        var $del        = el,
            grid        = $('#'+activeTabId+' .grid-stack').data('gridstack'),
            nodeItem    = grid.container[0].children,
            gs          = $('#' + activeTabId ).find('.grid-stack');

        var dataString = new Array;

            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });
     
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_core_remove_dashboard_plugin,
            translations.tr_melis_core_remove_dashboard_plugin_msg,
            function() {
                grid.removeWidget($del.closest('.grid-stack-item'));
              
                self.saveDBWidgets(dataString);
                //self.updateWidgetPosSize(gs);
            }
        );
    },

    deleteAllWidget: function(el) {
        var self        = this;

        var grid        = $('#'+activeTabId+' .grid-stack').data('gridstack'),
            nodeItem    = grid.container[0].children,
            $gs         = $('#' + activeTabId ).find('.grid-stack'),
            $items       = $gs.find('.grid-stack-item');

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
                translations.tr_melis_core_remove_dashboard_plugin,
                // Need a separate msg for "Are you sure you want to remove all of the plugin?"
                //translations.tr_melis_core_remove_dashboard_plugin_msg,
                'Are you sure you want to remove all the plugin?',
                function() {
                    if( !$items.hasClass('ui-draggable-disabled') ) {
                        grid.removeAll();
                    }
                  
                    self.saveDBWidgets(dataString);
                }
            );

            // hide plugin menu
            this.$pluginBox.removeClass("shown");
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
        melisDashBoardDragnDrop.currentPlugin = widget;
    },
    
    getCurrentPlugin: function(){
        // get current plugin
        return melisDashBoardDragnDrop.currentPlugin;
    }
};

$(function(){
    // init
    melisDashBoardDragnDrop.init();
});