/**
 * Created by conta on 2/23/2018
 * Edited by Junry @ June - Sept 2018
 **/

var $body = $("body");

// Binding elements
$body.on("click", "#dashboard-plugin-delete-all", function () {
    melisDashBoardDragnDrop.deleteAllWidget($(this));
});

$body.on("click", ".dashboard-plugin-delete", function () {
    melisDashBoardDragnDrop.deleteWidget($(this));
});

$body.on("click", ".dashboard-plugin-refresh", function () {
    melisDashBoardDragnDrop.refreshWidget($(this));
});

var melisDashBoardDragnDrop = {

    currentPlugin: null,

    melisWidgetHandle: '.melis-core-dashboard-plugin-snippets',

    melisDashboardMsg: '.melis-core-dashboard-msg',

    init: function() {
        this.cacheDom();
        this.gsSetOptions();
        //this.bindEvents();
        this.setAdjustGridMeasurements();

        this.dragWidget();
        //this.docuReady();

        this.dropWidget(this.melisWidgetHandle);
        this.dragStopWidget();
        this.resizeStopWidget();
        //$("#disable-left-menu-overlay").hide();
    },
    cacheDom: function() {
        // jQuery DOM element
        this.$body              = $("body");
        this.$document          = $(document);
        this.$window            = $(window);
        //this.$menu              = $(".sideMenu li a");
        this.$gs                = this.$body.find("#" + activeTabId + " .grid-stack");
        this.$gsItem            = this.$gs.find(".grid-stack-item").length;
        this.$melisDBPlugins    = this.$body.find(".melis-dashboard-plugins");
        this.$pluginBox         = this.$body.find(".melis-core-dashboard-dnd-box");
        this.$pluginBtn         = this.$body.find("#melisDashBoardPluginBtn");
        this.$box               = this.$pluginBtn.closest(".melis-core-dashboard-dnd-box");
        this.$deleteAllWidget   = this.$body.find("#dashboard-plugin-delete-all"); //$dbMsg      = $body.find("#"+activeTabId + " .melis-core-dashboard-msg");
        this.$dbMsg             = this.$body.find("#"+activeTabId + " " + this.melisDashboardMsg);

        // plugin sidebar
        this.$dashPsBox         = $(".melis-core-dashboard-ps-box");
        this.$dashPluginBtn     = this.$dashPsBox.find(".melis-core-dashboard-filter-btn");
        this.$dashSnipsBox      = this.$dashPsBox.find(".melis-core-dashboard-plugin-snippets-box");

        // strings
        this.gsOptHandle        = ".grid-stack-item-content .widget-head:first"; // draggable handle selector
    },
    // set .grid-stack options
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
    // adjust grid w/h values
    setAdjustGridMeasurements: function() {
        var self = this;

            // set data min width and max width
            self.$gs.attr("data-min-width", self.$gs.outerWidth() - self.$pluginBox.outerWidth());
            self.$gs.attr("data-max-width", self.$gs.outerWidth());

            // adjust grid-stack height when dashboard msg element is found
            if ( self.$dbMsg.length ) {
                self.$gs.css({
                    "height": "745px",
                    "min-height": "745px"
                });
            } else {
                self.$gs.css({
                    "height": "840px",
                    "min-height": "840px"
                });
            }
    },
    // drags widget/plugin from dashboard's plugin sidebar
    dragWidget: function() {
        // set up draggable element / this.melisWidgetHandle / .grid-stack-item
        $(".melis-core-dashboard-plugin-filter-box .melis-core-dashboard-plugin-snippets").draggable({
            helper: 'clone',
            revert: 'invalid',
            appendTo: 'body',
            start: function(event, ui) {
                // turn off tooltip plugin snippet on gridstack
                // $(melisDashBoardDragnDrop.melisWidgetHandle+'.grid-stack-item').tooltip('dispose');
                // $(melisDashBoardDragnDrop.melisWidgetHandle+'.grid-stack-item').tooltip('hide');
                $(ui.helper).find('.melis-plugin-tooltip').hide();
            },
            drag: function (event, ui) {              
                var $gridPH = $('#' + activeTabId + ' .tab-pane .grid-stack .grid-stack-placeholder');
                    $gridPH.attr('data-gs-width', 6);
                    $gridPH.attr('data-gs-height', 3);
                
                /**
                 * During plugin drag:
                 *  - INSIDE grid-stack drag area: HIDE dashboard msg
                 *  - OUTSIDE grid-stack drag area: SHOW dashboard msg
                 *  Note: Only happens when dashboard is empty
                 */
                var pluginCount     = melisDashBoardDragnDrop.$gs.find("div[data-gs-id]").length,
                    dashboardMsg    = $("#"+activeTabId).find(melisDashBoardDragnDrop.melisDashboardMsg),
                    //dashboardMsg    = melisDashBoardDragnDrop.$body.find("#"+activeTabId+melisDashBoardDragnDrop.melisDashboardMsg),
                    dragArea        = melisDashBoardDragnDrop.$body.find(event.currentTarget);

                    if ( dragArea.hasClass("melis-core-dashboard-plugin-snippets") ) {
                        // Hide empty-dashboard message
                        if ( dashboardMsg.length > 0 ) {
                            $(dashboardMsg).hide();
                            $(this.$gs).css({
                                "height": "840px",
                                "min-height": "840px"
                            });
                        }
                    } else if ( pluginCount === 0 ) {
                        // Show empty-dashboard message
                        $(dashboardMsg).show();
                        $(this.$gs).css({
                            "height": "745px",
                            "min-height": "745px"
                        });
                    }
            }
        });
    },
    // drops a widget/plugin from dashboard's plugin sidebar
    dropWidget: function(widget) {
        var self = this,
            gridstack = $("#" + activeTabId + " .tab-pane .grid-stack").data("gridstack");
        //var gridDrop = $(gridstack.container[0]).droppable({
        var gridDrop = gridstack.container.droppable({
            accept: widget,
            tolerance: 'pointer',
            drop: function (event, ui) {

                var dataString = new Array;
                // create dashboard array
                dataString.push({
                    name: 'dashboard_id',
                    value: activeTabId
                });

                // get plugin menu data
                var pluginMenu = $(ui.helper[0]).find(".plugin-json-config").text();

                // check plugin menu
                if (pluginMenu) {

                    // parse to JSON
                    var pluginConfig = JSON.parse(pluginMenu);
                    $.each(pluginConfig, function (index, value) {
                        // push to dashboard array
                        if ($.isArray(value) || typeof value == "object") {
                            $.each(value, function (i, v) {
                                if (i == "width" && v == "") {
                                    v = 6;
                                }
                                if (i == "height" && v == "") {
                                    v = 6;
                                }
                            });
                            dataString.push({
                                name: index,
                                value: JSON.stringify(value)
                            });
                        } else {
                            dataString.push({
                                name: key,
                                value: value
                            });
                        }
                    });
                }
                // addWidget passing dataString
                self.addWidget(dataString);
            }
        });
    },
    // adding of plugins / disable droppable .gridstack while processing the plugin data
    addWidget: function(dataString) {
        var self = this;

        var $mcDashPlugSnippets = $("#" + activeTabId + " .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets");
            $mcDashPlugSnippets.attr('data-gs-width', 6);
            $mcDashPlugSnippets.attr('data-gs-height', 3);

        var mcLoader = "<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>";

        // loading effect
        $mcDashPlugSnippets.html(mcLoader);

        var gridstack = $("#" + activeTabId + " .tab-pane .grid-stack");

            // disable grid / droppable
            gridstack.droppable("disable");

            // disable sidebar plugins
            self.disablePlugSidebar();

        var request = $.post("/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

            request.done(function (data) {

                // get dashboard gridstack data
                var grid = $('#' + activeTabId + ' .grid-stack').data('gridstack');

                // get placeholder data
                var gridData = $("#" + activeTabId + ' .tab-pane .grid-stack .melis-core-dashboard-plugin-snippets').data();

                var html = $(data.html);

                // add widget to dashboard default size 6 x 6
                var widget = grid.addWidget(html, gridData.gsX, gridData.gsY, html.data("gsWidth"), html.data("gsHeight"));

                    // remove clone widgets
                    grid.removeWidget($(widget).prev());

                    // enable grid / droppable
                    gridstack.droppable("enable");

                    // disable sidebar plugins
                    self.enablePlugSidebar();

                    // serialize widget and save to db
                    self.serializeWidgetMap(grid.container[0].children);

                    // Assigning current plugin
                    self.setCurrentPlugin(widget);

                    // Executing plugin JsCallback
                    if (data.jsCallbacks.length) {
                        $.each(data.jsCallbacks, function (index, value) {
                            eval(value);
                        });
                    }
            });
    },
    // serializing plugins / re-enable dropppable .gridstack after serializing
    serializeWidgetMap: function(items) {
        var self = this;

        var dataString = new Array;

            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });

        $.each(items, function (key, value) {
            var dataTxt = $(value).find('.dashboard-plugin-json-config').text();

            // check dashboard data
            if (dataTxt) {

                // get dynamic dashboard value
                var itemData = $(value).data();

                var dashboardX = itemData._gridstack_node.x;
                var dashboardY = itemData._gridstack_node.y;
                var dashboardWidth = itemData._gridstack_node.width;
                var dashboardHeight = itemData._gridstack_node.height;

                // JSON parse dashboard txt
                var pluginConfig = JSON.parse(dataTxt);
                    $.each(pluginConfig, function (index, value) {
                        var pluginName = pluginConfig["conf"]["name"];

                        // push to dashboard array
                        if ($.isArray(value) || typeof value == "object") {
                            if (index == "datas") {
                                $.each(value, function (i, v) {
                                    // here modify x y w h of the plugin
                                    if (i == "x-axis") {
                                        v = dashboardX;
                                    }
                                    if (i == "y-axis") {
                                        v = dashboardY;
                                    }
                                    if (i == "width") {
                                        v = dashboardWidth;
                                    }
                                    if (i == "height") {
                                        v = dashboardHeight;
                                    }

                                    dataString.push({
                                        name: 'plugins[' + pluginName + '][' + pluginConfig["plugin_id"] + '][' + i + ']',
                                        value: v
                                    });
                                });
                            }
                        } else {
                            dataString.push({
                                name: 'plugins[' + pluginName + '][' + pluginConfig["plugin_id"] + '][' + index + ']',
                                value: value
                            });
                        }
                    });
            }

        });

        // save widgets to db
        self.saveDBWidgets(dataString);
    },
    // save dashboard widgets/plugins
    saveDBWidgets: function(dataString) {
        // save the lists of widgets on the dashboard to db
        var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
    },
    // check current dashboard
    checkDashboard: function() {
        var self            = this,
            $pluginBtn      = $("#melisDashBoardPluginBtn"),
            $pluginBox      = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
            $gs             = $body.find("#"+activeTabId + " .grid-stack"),
            gsItems         = $gs.find(".grid-stack-item").length,
            $tabArrowTop    = $("#tab-arrow-top");

        var minWidth        = $gs.data("min-width"),
            maxWidth        = $gs.data("max-width");

            // tab arrow top on mobile view
            /* if ( $tabArrowTop.length && melisCore.screenSize <= 767 ) {
                if ( $pluginBox.hasClass("shown") ) {
                    $tabArrowTop.addClass("hide-arrow");
                }
                else {
                    $tabArrowTop.removeClass("hide-arrow");                    
                }
            } */

            // count .grid-stack-item if found
            if ( gsItems > 0 ) {
                $pluginBox.removeClass("shown");
            }
            else {
                $pluginBox.addClass("shown");

                // tab arrow top on mobile view, 767px and below
                if ( $tabArrowTop.length && melisCore.screenSize <= 767 ) {
                    if ( $pluginBox.hasClass("shown") ) {
                        $tabArrowTop.addClass("hide-arrow");
                    }
                    else {
                        $tabArrowTop.removeClass("hide-arrow");                    
                    }
                }
            }
            
            // check plugin menu box
            if ( minWidth !== "undefined" && maxWidth !== "undefined" ) {
                if ( $pluginBox.hasClass("shown") ) {
                    $gs.animate({
                        width: minWidth
                    }, 3);
                } 
                else {
                    $gs.animate({
                        width: maxWidth
                    }, 3);
                }
            }
    },
    // disables the plugin sidebar
    disablePlugSidebar: function() {
        var self = this;

        // disables the plugins sidebar
        self.$dashPluginBtn.prop("disabled", true);
        self.$dashPluginBtn.removeClass("active");

        // remove highlight of new icon if present
        self.$pluginBox.find('.active').removeClass('active');
        self.$pluginBox.find('.reverse-color').removeClass('reverse-color');
        self.$pluginBox.find('.melis-core-dashboard-category-plugins-box').hide();

        self.$dashSnipsBox.hide();
    },
    // enables the plugin sidebar
    enablePlugSidebar: function() {
        var self = this;

        // enables the plugins sidebar
        self.$dashPluginBtn.prop("disabled", false);
    },
    // save the current dashboard
    saveCurrentDashboard: function(el) {
        var self = this,
            $grid = $('#' + activeTabId + ' .grid-stack').data('gridstack'),
            $item = el.closest('.grid-stack-item').data('_gridstack_node'),
            $items = $item._grid.container[0].children;

        // serialize & save to db the current gridstack items
        self.serializeWidgetMap($items);
    },
    // drags widget/plugin in the current dashboard
    dragStopWidget: function() {
        var self = this;

        // grid stack widget drag and stop position
        this.$gs.on('dragstop', function (event, ui) {
            var $grid = $(this),
                $el = $(event.target),
                node = $el.data('_gridstack_node'),
                items = node._grid.container[0].children;

            // update size of widgets .grid-stack-items
            self.serializeWidgetMap(items);
        });
    },
    // resizes widget/plugin
    resizeStopWidget: function() {
        var self = this;

        // grid stack stop widget resize
        this.$gs.on('gsresizestop', function (event, elem) {
            var $elem       = $(elem),
                $node       = $elem.data('_gridstack_node'),
                $items      = $node._grid.container[0].children,
                elemWidth   = $elem.attr('data-gs-width'),
                widthLimit  = 3;

                // grid-stack-item limits its smallest width to data-gs-width 3
                if (elemWidth <= widthLimit) {
                    $node.width = parseInt(widthLimit);
                    $elem.attr('data-gs-width', widthLimit);
                } else {
                    $node.width = parseInt(elemWidth);
                }

            // specific for Melis Cms Comments / Latest comments
            var $cFilters = $elem.find(".melis-cms-comments-dashboard-latest-comments .mccom-filters-tab .row .mccom-filter"),
                $sCont = $cFilters.find(".form-group .select2-container");

                if ($cFilters.length > 0) {
                    if (elemWidth < 5) { // check if it belows data-gs-width 5 and it will be in full width
                        $cFilters.css("width", "100%");
                        $sCont.css("width", "100%");
                    }
                    else {
                        $cFilters.removeAttr("style");
                        $sCont.removeAttr("style");
                    }
                }

            var $profileImg = $elem.find(".melis-cms-comments-dashboard-latest-comments .column-comment-profile-img");

                if ( elemWidth <= 3 ) {
                    $profileImg.css({
                        'flex' : '0 0 12.3333333333%',
                        'max-width' : '12.3333333333%'
                    });
                }
                else {
                    $profileImg.css({
                        'flex' : '0 0 8.3333333333%',
                        'max-width' : '8.3333333333%'
                    });
                }

                // update size of widgets passes array of .grid-stack-items
                self.serializeWidgetMap($items);
        });
    },
    // check for data-gs-width responsive below 5, Melis Cms Comments / Latest Comments
    latestCommentsPluginUIRes: function() {
        var $com = $('#' + activeTabId + ' .grid-stack .grid-stack-item').find(".melis-cms-comments-dashboard-latest-comments");

        $.each($com, function (i, v) {
            var $this       = $(this),
                gsWidth     = $this.closest(".grid-stack-item").data("gs-width"),
                $filter     = $this.find(".mccom-filters-tab .row .mccom-filter"),
                $select     = $filter.find(".form-group .select2-container"),
                $profileImg = $this.find(".column-comment-profile-img");

                if (gsWidth < 5) {
                    $filter.removeAttr("width");
                    $filter.attr("style", "width: 100%");

                    $select.removeAttr("width");
                    $select.attr("style", "width: 100%");
                }
                else {
                    $filter.removeAttr("style");
                    $select.removeAttr("style");
                }

                if ( gsWidth <= 3 ) {
                    $profileImg.css({
                        'flex' : '0 0 12.3333333333%',
                        'max-width' : '12.3333333333%'
                    });
                }
                else {
                    $profileImg.css({
                        'flex' : '0 0 8.3333333333%',
                        'max-width' : '8.3333333333%'
                    });
                }
        });
    },
    // delete single widget/plugin in the dashboard
    deleteWidget: function(el) {
        var self = this;

        var gridData = $('#' + activeTabId + ' .grid-stack').data('gridstack'),
            $del = el,
            gsNode = $del.closest('.grid-stack-item').data('_gridstack_node');

        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_meliscore_remove_dashboard_plugin,
            translations.tr_meliscore_remove_dashboard_plugin_msg,
            function () {

                // remove the item from the dashboard
                gridData.removeWidget(gsNode.el[0]);

                // check gridstack nodes positions and sizes
                $items = gsNode._grid.container[0].children;

                // serialize & save db remaining gridstack items
                self.serializeWidgetMap($items);

                // plugin delete callback
                if (typeof $del.data('callback') !== "undefined") {
                    var callback = eval($del.data("callback"));
                    if (typeof callback === "function") {
                        callback($del.closest('.grid-stack-item'));
                    }
                }

                // display empty dashboard message
                var pluginCount = melisDashBoardDragnDrop.$gs.find("div[data-gs-id]").length;

                    if (pluginCount === 0) {
                        // Show empty-dashboard message
                        var dashboardMsg = $("#"+activeTabId).find(melisDashBoardDragnDrop.melisDashboardMsg);
                            if (dashboardMsg.length > 0) {
                                dashboardMsg.show();
                                $(self.$gs).css({
                                    "height": "745px",
                                    "min-height": "745px"
                                });
                                if ( ! self.$pluginBox.hasClass("shown") ) {
                                    $("#melisDashBoardPluginBtn").trigger("click");
                                }
                            }
                    }
            }
        );
    },
    // empties the current grid-stack
    deleteAllWidget: function(el) {
        var self = this;

        var $grid       = $('#' + activeTabId + ' .grid-stack'),
            gridData    = $grid.data('gridstack'),
            gsNode      = $grid.find('.grid-stack-item').data('_gridstack_node'),
            $gs         = $('#' + activeTabId).find('.grid-stack'),
            $items      = $gs.find('.grid-stack-item'),
            $btn        = $("#melisDashBoardPluginBtn"),
            $box        = $btn.closest(".melis-core-dashboard-dnd-box"),
            dWidth      = $gs.width() - $box.width(), // grid-stack width - plugin box width
            nWidth      = $gs.width() + $box.width();

            // checks if there is a plugin available to delete
            if ($items.length !== 0) {

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
                    function () {

                        // remove all nodes on grid, grid.removeAll(gsNode.el[0]);
                        gridData.removeAll();

                        // save widgets position / size on db
                        self.saveDBWidgets(dataString);

                        // Show empty-dashboard message
                        var dashboardMsg = $("#"+activeTabId).find(melisDashBoardDragnDrop.melisDashboardMsg);
                            if (dashboardMsg.length > 0) {
                                dashboardMsg.show();
                                $(self.$gs).css({
                                    "height": "745px",
                                    "min-height": "745px"
                                });
                                if ( ! self.$pluginBox.hasClass("shown") ) {
                                    $("#melisDashBoardPluginBtn").trigger("click");
                                }
                            }

                    }
                );

                // hide plugin menu
                self.$pluginBox.removeClass("shown");

                // droppable / .gridstack to original width
                $gs.animate({
                    width: nWidth
                }, 3);

                // plugins delete callback
                $('#' + activeTabId + ' .grid-stack .grid-stack-item .dashboard-plugin-delete').each(function (i, v) {
                    var $this = $(this);

                        if (typeof $this.data('callback') !== "undefined") {
                            var callback = eval($this.data("callback"));
                            if (typeof callback === "function") {
                                callback($this.closest('.grid-stack-item'));
                            }
                        }
                });

            } else {
                melisCoreTool.closeDialog(
                    translations.tr_meliscore_remove_all_plugins,
                    translations.tr_meliscore_remove_dashboard_no_plugin_msg
                );

                // hide plugin menu
                self.$pluginBox.removeClass("shown");

                // droppable / .gridstack to original width
                $gs.animate({
                    width: nWidth
                }, 3);

                // plugins delete callback
                $('#' + activeTabId + ' .grid-stack .grid-stack-item .dashboard-plugin-delete').each(function (i, v) {
                    var $this = $(this);

                        if (typeof $this.data('callback') !== "undefined") {
                            var callback = eval($this.data("callback"));
                            if (typeof callback === "function") {
                                callback($this.closest('.grid-stack-item'));
                            }
                        }
                });
            }
    },
    // refresh a widget/plugin
    refreshWidget: function(el) {
        var self = this;

        var dataString = new Array;
            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });

        var dashboardItem   = $(el).closest('.grid-stack-item'),
            dataTxt         = $(dashboardItem).find('.dashboard-plugin-json-config').text(),
            dashboardData   = dashboardItem.data('_gridstack_node');

            // check dataTxt
            if ( dataTxt ) {
                var pluginConfig = JSON.parse(dataTxt);
                    $.each(pluginConfig, function (index, value) {
                        if ($.isArray(value) || typeof value == "object") {
                            dataString.push({
                                name: index,
                                value: JSON.stringify(value)
                            });
                        } 
                        else {
                            dataString.push({
                                name: index,
                                value: value
                            });
                        }
                    });

                var request = $.post("/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

                    // loading effect
                    dashboardItem.append("<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>");

                    request.done(function (data) {

                        // get dashboard gridstack data
                        var grid = $('#' + activeTabId + ' .grid-stack').data('gridstack');

                            // remove loader
                            $(dashboardItem).find('.overlay-loader').remove();

                            grid.removeWidget($(dashboardItem));

                        var html = $(data.html);

                        // add widget to dashboard default size 6 x 6
                        var widget = grid.addWidget(html, dashboardData.x, dashboardData.y, dashboardData.width, dashboardData.height);

                            // assigning current plugin
                            self.setCurrentPlugin(widget);

                            // executing plugin JsCallback
                            if (data.jsCallbacks.length) {
                                $.each(data.jsCallbacks, function (index, value) {
                                    eval(value);
                                });
                            }
                    });
            }
    },
    // set current widget/plugin
    setCurrentPlugin: function(widget) {
        // set current plugin
        this.currentPlugin = widget;
    },
    // get the current widget/plugin
    getCurrentPlugin: function() {
        // get current plugin
        return this.currentPlugin;
    },
    // counts .grid-stack-items on the dashboard
    countGsItems: function() {
        var self = this;

            return self.$gsItem;
    },
    // get the current, active .grid-stack for multiple dashboards
    getCurrentGsWidth: function() {
        var self    = this,
            gsWidth =  $("#"+activeTabId).find(".grid-stack").outerWidth();

            return gsWidth;
    }
};

$(function () {
    var dnd         = melisDashBoardDragnDrop;
        // init
        dnd.init();
    
    var $body       = $("body"),
        gsi         = $("#"+activeTabId + " .grid-stack").find(".grid-stack-item").length,
        $pluginBtn  = $body.find("#melisDashBoardPluginBtn"),
        $pluginBox  = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $gs         = $body.find("#"+activeTabId + " .grid-stack"),
        boxWidth    = parseInt( $pluginBox.outerWidth() ),
        gsWidth     = parseInt( $gs.outerWidth() ),
        dWidth      = gsWidth - boxWidth,
        $dbMsg      = $body.find("#"+activeTabId + " .melis-core-dashboard-msg"),
        minWidth    = $gs.data("min-width"),
        maxWidth    = $gs.data("max-width");

        // check if any .grid-stack-item is found, hide $dbMsg
        if ( gsi > 0 ) {
            $dbMsg.hide();
        }
        else {
            $dbMsg.show();
        }

        // .select2-container width 100% specific for latest comments plugin on document ready
        dnd.latestCommentsPluginUIRes();

        // animate to full width size of #grid1
        $body.on("click", "#dashboard-plugin-delete-all", function() {
            $gs.animate({
                width: minWidth
            }, 3);
        });

        // check if plugins menu is open, adjust .grid-stack width accordingly
        if ( $pluginBox.hasClass("shown") && gsi === 0 ) {
            $gs.animate({
                width: minWidth
            }, 3);
        }

        // display .grid-stack width in pixels on document load
        $gs.css("width", $gs.width());
});