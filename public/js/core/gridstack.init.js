/**
 * Created by conta on 2/23/2018
 * Edited by Junry
 **/

var melisDashBoardDragnDrop = {

    currentPlugin: null,

    melisWidgetHandle: '.melis-core-dashboard-plugin-snippets',

    melisDashboardMsg: '.melis-core-dashboard-msg',

    init: function(togglePluginBox) {
        togglePluginBox = togglePluginBox == undefined ? true : false;

        this.cacheDom();
        this.gsSetOptions();
        
        this.dragWidget();

        this.dropWidget(this.melisWidgetHandle);
        this.dragStopWidget();
        this.resizeStopWidget();

        this.setAdjustGridMeasurements();
        this.checkDashboard(togglePluginBox);
        this.latestCommentsPluginUIRes();
        //this.checkDashboardElemWidths();
    },
    cacheDom: function() {
        // jQuery DOM element
        this.$body              = $("body");
        this.$document          = $(document);
        this.$window            = $(window);
        this.$bubblePlugin      = this.$body.find("#bubble-plugin .bubble-plugin-flip-cards");
        this.$gs                = this.$body.find(".grid-stack");
        this.$activeGS          = this.$body.find("#"+activeTabId+" .grid-stack");
        this.$gsItem            = this.$gs.find(".grid-stack-item").length;
        this.$melisDBPlugins    = this.$body.find(".melis-dashboard-plugins");
        this.$melisLeftMenu     = this.$body.find("#id_meliscore_leftmenu"),
        this.$pluginBox         = this.$body.find(".melis-core-dashboard-dnd-box");
        this.$pluginBtn         = this.$body.find("#melisDashBoardPluginBtn");
        this.$box               = this.$pluginBtn.closest(".melis-core-dashboard-dnd-box");
        this.$deleteAllWidget   = this.$body.find("#dashboard-plugin-delete-all");
        this.$dbMsg             = this.$body.find("#"+activeTabId + " " + this.melisDashboardMsg);

        // plugin sidebar
        this.$dashPsBox         = $(".melis-core-dashboard-ps-box");
        this.$dashPluginBtn     = this.$dashPsBox.find(".melis-core-dashboard-filter-btn");
        this.$dashSnipsBox      = this.$dashPsBox.find(".melis-core-dashboard-plugin-snippets-box");

        // draggable handle selector
        this.gsOptHandle        = ".grid-stack-item-content .widget-head:first";
    },
    // set .grid-stack options
    gsSetOptions: function() {
        var self = this;
        var options = {
            cellHeight: 80,
            marginTop: 20,
            animate: true,
            float: false,
            acceptWidgets: '.melis-core-dashboard-plugin-snippets', // .grid-stack-item
            //alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            alwaysShowResizeHandle: false,
            draggable: {
                scroll: true
            },
            handle: this.gsOptHandle
        }

        self.$gs.gridstack(options);
    },
    // adjust grid height values
    setAdjustGridMeasurements: function() {
        var self                        = this,
            // fix for https://mantis2.uat.melistechnology.fr/view.php?id=860
            desktopGsPluginCssHeight    = {"height": "872px", "min-height": "872px"},
            desktopGsNoPluginCssHeight  = {"height": "745px", "min-height": "745px"},
            mobileGsPluginCssHeight     = {"height" : "590px", "min-height" : "590px"},
            mobileGsNoPluginCssHeight   = {"height" : "465px", "min-height" : "465px"},
            desktopGsNoPluginBubblePluginHiddenCssHeight = {"height": "790px", "min-height": "790px"},
            desktopGsNoPluginBubblePluginShownCssHeight = {"height": "640px", "min-height": "640px"};

            // adjust grid-stack height when dashboard msg element is found
            if ( self.countGsItems() === 0 ) {
                // check for mobile responsive
                if ( melisCore.screenSize > 576 && melisCore.screenSize <= 767 ) {
                    self.$gs.css(desktopGsNoPluginCssHeight);
                }
                else if ( melisCore.screenSize <= 576 ) {
                    self.$gs.css(mobileGsNoPluginCssHeight);
                }
                else {
                    if ( self.$bubblePlugin.is(":hidden") ) {
                        self.$gs.css(desktopGsNoPluginBubblePluginHiddenCssHeight);
                    }
                    else {
                        self.$gs.css(desktopGsNoPluginBubblePluginShownCssHeight);
                    }
                }
            }
            else {
                // check for mobile responsive
                if ( melisCore.screenSize > 576 && melisCore.screenSize <= 767 ) {
                    self.$gs.css(desktopGsPluginCssHeight);                        
                }
                else if ( melisCore.screenSize <= 576 ) {
                    self.$gs.css(mobileGsPluginCssHeight);
                }
                else {
                    if ( self.$bubblePlugin.is(":hidden") ) {
                        self.$gs.css(desktopGsNoPluginBubblePluginHiddenCssHeight);
                    }
                    else {
                        self.$gs.css(desktopGsNoPluginBubblePluginShownCssHeight);
                    }
                }
            }

            // set data min width and max width, from setAdjustGridMeasurements() function
            self.$activeGS.attr("data-min-width", self.$activeGS.outerWidth() - self.$melisLeftMenu.outerWidth());
            self.$activeGS.attr("data-max-width", self.$activeGS.outerWidth());

            // display .grid-stack width in pixels on document load
            self.$activeGS.css("width", self.$activeGS.outerWidth());
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

        // add a full width loading effect on mobile, https://mantis2.uat.melistechnology.fr/view.php?id=860
        if ( melisCore.screenSize <= 767 && self.countGsItems() > 2 ) {
            self.$gs.prepend(mcLoader);
        }

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
                var widget = grid?.addWidget(html, gridData.gsX, gridData.gsY, html.data("gsWidth"), html.data("gsHeight"));

                    // remove clone widgets
                    grid?.removeWidget($(widget).prev());

                    // remove full width loading effect on mobile, fix for https://mantis2.uat.melistechnology.fr/view.php?id=860
                    if ( melisCore.screenSize <= 767 ) {
                        self.$gs.find(".overlay-loader").remove();
                    }

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
    // drags widget/plugin from dashboard's plugin sidebar
    dragWidget: function() {
        var self = this;
        // set up draggable element / this.melisWidgetHandle / .grid-stack-item
        $(".melis-core-dashboard-plugin-filter-box .melis-core-dashboard-plugin-snippets").draggable({
            helper: 'clone',
            revert: 'invalid',
            appendTo: 'body',
            start: function(event, ui) {
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

                    if ( pluginCount === 0 && ! dragArea.hasClass("melis-core-dashboard-plugin-snippets") ) {
                        // Show empty-dashboard message
                        $(dashboardMsg).show();
                        //self.setAdjustGridMeasurements();
                    } 
                    else {
                        $(dashboardMsg).hide();
                        //self.setAdjustGridMeasurements();
                    }
            }
        });
    },
    // drops a widget/plugin from dashboard's plugin sidebar
    dropWidget: function(widget) {
        var self            = this;

            //var gridDrop = $(gridstack.container[0]).droppable({
            //var gridDrop = gridstack.container.droppable({
            self.$gs.droppable({
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
                            if (Array.isArray(value) || typeof value == "object") {
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

        // add a full width loading effect on mobile, https://mantis2.uat.melistechnology.fr/view.php?id=860
        if ( melisCore.screenSize <= 767 && self.countGsItems() > 2 ) {
            self.$gs.prepend(mcLoader);
        }

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

                    // remove full width loading effect on mobile, fix for https://mantis2.uat.melistechnology.fr/view.php?id=860
                    if ( melisCore.screenSize <= 767 ) {
                        self.$gs.find(".overlay-loader").remove();
                    }

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
    serializeWidgetMap: function(items, cb) {
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
        self.saveDBWidgets(dataString, cb);
    },
    // save dashboard widgets/plugins
    saveDBWidgets: function(dataString, cb) {
        // save the lists of widgets on the dashboard to db
        if(cb != undefined) {
            var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString, cb);
        }else{
            var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
        }
    },
    // check current dashboard
    checkDashboard: function(togglePluginBox) {
        togglePluginBox = togglePluginBox == undefined ? true : false;

        var self                    = this,
            $pluginBtn              = $("#melisDashBoardPluginBtn"),
            $pluginBox              = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
            pluginBoxWidth          = $pluginBox.outerWidth(),
            $activeTab              = $("#"+activeTabId),
            $dbMsg                  = $activeTab.find(".melis-core-dashboard-msg"),
            $gs                     = $activeTab.find(".grid-stack"),
            gsWidth                 = $gs.outerWidth(),
            gsItems                 = $gs.find(".grid-stack-item").length,
            $tabArrowTop            = $("#tab-arrow-top"),
            minWidth                = $gs.data("min-width"),
            maxWidth                = $gs.data("max-width"),
            $bubblePlugin           = $("#bubble-plugin"),
            bubblePluginMinWidth    = $bubblePlugin.data("min-width"),
            bubblePluginMaxWidth    = $bubblePlugin.data("max-width");

            // checks dashboard's elements widths
            self.checkDashboardElemWidths();

            // count .grid-stack-item if found
            if ( gsItems > 0 ) {
                if ( togglePluginBox ) {
                    $pluginBox.removeClass("shown");
                }

                $dbMsg.fadeOut();
            }
            else {
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

            //melisCore.showToggleDashboardPluginMenu();
            
            // check plugin menu box
            if ( minWidth !== "undefined" && maxWidth !== "undefined" ) {
                if ( $pluginBox.hasClass("shown") ) {
                    $gs.animate({
                        width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                    }, 3);

                    $dbMsg.animate({
                        width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                    }, 3);

                    if ( $bubblePlugin.length ) {
                        $bubblePlugin.animate({
                            width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                        }, 3);
                    }
                } 
                else {
                    $gs.animate({
                        width: maxWidth
                    }, 3);

                    $dbMsg.animate({
                        width: maxWidth
                    }, 3);

                    if ( $bubblePlugin.length ) {
                        $bubblePlugin.animate({
                            width: maxWidth // bubblePluginMaxWidth
                        }, 3);
                    }
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
            self.$gs.on('gsresizestop', function (event, elem) {
                var $elem           = $(elem),
                    node            = $elem.data('_gridstack_node'),
                    $items          = node._grid.container[0].children,
                    elemWidth       = $elem.attr('data-gs-width'),
                    classArray      = node.el[0].classList.value.split(/\s+/),
                    currentClass    = '',
                    widthLimit      = 3,
                    // latest comments
                    $cFilters       = $elem.find(".melis-cms-comments-dashboard-latest-comments .mccom-filters-tab .row .mccom-filter"),
                    $sCont          = $cFilters.find(".form-group .select2-container"),
                    $profileImg     = $elem.find(".melis-cms-comments-dashboard-latest-comments .column-comment-profile-img");
                    
                    // check if the resized dashboard plugin is melis-cms-comments-latest or prospects-statistics
                    if ( $.inArray("melis-cms-comments-latest", classArray) !== -1 ) {
                        currentClass = '.melis-cms-comments-latest';
                    }
                    else if ( $.inArray("prospects-statistics", classArray) !== -1 ) {
                        currentClass = '.prospects-statistics';
                    }

                    if ( currentClass != '' && elemWidth <= widthLimit ) {
                        node.width = widthLimit;
                        $elem.attr("data-gs-width", node.width);
                    }

                    // specific for Melis Cms Comments / Latest comments
                    if ( $cFilters.length > 0 ) {
                        // check if it belows data-gs-width 5 and it will be in full width
                        if ( elemWidth < 5 ) { 
                            $cFilters.css("width", "100%");
                            $sCont.css("width", "100%");
                        }
                        else {
                            $cFilters.prop("style", null);
                            $sCont.prop("style", null);
                        }
                    }

                    // check if it belows data-gs-width 3 for $profileImg
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
            function() {

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
                var pluginCount     = melisDashBoardDragnDrop.$gs.find("div[data-gs-id]").length,
                    // Show empty-dashboard message
                    $dashboardMsg   = $("#"+activeTabId).find(melisDashBoardDragnDrop.melisDashboardMsg);

                    if ( pluginCount === 0 ) {
                        $dashboardMsg.show();

                        if ( self.$bubblePlugin.is(":hidden") ) {
                            self.$gs.css({
                                "height": "790px",
                                "min-height": "790px"
                            });
                        }
                        else {
                            self.$gs.css({
                                "height": "640px",
                                "min-height": "640px"
                            });
                        }

                        if ( ! self.$pluginBox.hasClass("shown") ) {
                            $("#melisDashBoardPluginBtn").trigger("click");
                        }
                    }
                    else {
                        $dashboardMsg.hide();

                        if ( self.$bubblePlugin.is(":hidden") ) {
                            self.$gs.css({
                                "height": "790px",
                                "min-height": "790px"
                            });
                        }
                        else {
                            self.$gs.css({
                                "height": "640px",
                                "min-height": "640px"
                            });
                        }
                    }
            }
        );
    },
    // empties the current grid-stack
    deleteAllWidget: function(el) {
        var self = this;

        var $grid           = $('#' + activeTabId + ' .grid-stack'),
            gridData        = $grid.data('gridstack'),
            gsNode          = $grid.find('.grid-stack-item').data('_gridstack_node'),
            $gs             = $('#' + activeTabId).find('.grid-stack'),
            $dbMsg          = $("#"+activeTabId + " .melis-core-dashboard-msg"),
            $items          = $gs.find('.grid-stack-item'),
            $btn            = $("#melisDashBoardPluginBtn"),
            $bubblePlugin   = $("#bubble-plugin"),
            $box            = $btn.closest(".melis-core-dashboard-dnd-box"),
            dWidth          = $gs.width() - $box.width(), // grid-stack width - plugin box width
            nWidth          = $gs.width() + $box.width();

            // checks if there is a plugin available to delete
            if ( $items.length !== 0 ) {

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
                            if ( dashboardMsg.length > 0 ) {
                                dashboardMsg.show();

                                if ( self.$bubblePlugin.is(":hidden") ) {
                                    self.$gs.css({
                                        "height": "790px",
                                        "min-height": "790px"
                                    });
                                }
                                else {
                                    self.$gs.css({
                                        "height": "640px",
                                        "min-height": "640px"
                                    });
                                }

                                if ( ! self.$pluginBox.hasClass("shown") ) {
                                    $("#melisDashBoardPluginBtn").trigger("click");
                                }
                            }

                            // hide plugin menu
                            self.$pluginBox.removeClass("shown");

                            // droppable / .gridstack to original width
                            $gs.animate({
                                width: nWidth
                            }, 3);

                            if ( $dbMsg.length ) {
                                $dbMsg.animate({
                                    width: nWidth
                                }, 3);
                            }

                            if ( $bubblePlugin.length ) {
                                $bubblePlugin.animate({
                                    width: nWidth
                                }, 3);
                            }

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
                );
            }
            else {
                melisCoreTool.closeDialog(
                    translations.tr_meliscore_remove_all_plugins,
                    translations.tr_meliscore_remove_dashboard_no_plugin_msg,
                    function() {
                        // hide plugin menu
                        self.$pluginBox.removeClass("shown");

                        // droppable / .gridstack to original width
                        $gs.animate({
                            width: dWidth
                        }, 3);

                        if ( $dbMsg.length ) {
                            $dbMsg.animate({
                                width: dWidth
                            }, 3);
                        }

                        if ( $bubblePlugin.length ) {
                            $bubblePlugin.animate({
                                width: dWidth
                            }, 3);
                        }

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
                );

                
            }
    },
    // refresh a widget/plugin
    refreshWidget: function(el, additionalParam) {
        var self = this;

        additionalParam = (additionalParam != undefined) ? additionalParam : {};

        var dataString = new Array;
            // create dashboard array
            dataString.push({
                name: 'dashboard_id',
                value: activeTabId
            });

        var dashboardItem   = $(el).closest('.grid-stack-item'),
            dataTxt         = $(dashboardItem).find('.dashboard-plugin-json-config').text(),
            dashboardData   = dashboardItem.data('_gridstack_node'),
            nextElementId   = dashboardItem.next().data('gsId');
            // check dataTxt
            if ( dataTxt ) {
                var pluginConfig = JSON.parse(dataTxt);
                    $.each(pluginConfig, function (index, value) {
                        if (Array.isArray(value) || typeof value == "object") {
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

                if(!$.isEmptyObject(additionalParam)){
                    $.each(additionalParam, function(index, value){
                        dataString.push({
                            name: index,
                            value: value
                        });
                    });
                }

                var request = $.post("/melis/MelisCore/DashboardPlugins/getPlugin", dataString);

                    // loading effect
                    dashboardItem.append("<div class='overlay-loader'><img class='loader-icon spinning-cog' src='/MelisCore/assets/images/cog12.svg' alt=''></div>");

                    request.done(function (data) {

                        // get dashboard gridstack data
                        var grid = $('#' + activeTabId + ' .grid-stack').data('gridstack');

                            // remove loader
                            $(dashboardItem).find('.overlay-loader').remove();
                            
                            if ( grid ) {
                                grid.removeWidget($(dashboardItem));
                            }

                        var html = $(data.html);

                        // add widget to dashboard default size 6 x 6
                        var widget = grid?.addWidget(html, dashboardData.x, dashboardData.y, dashboardData.width, dashboardData.height);
                        
                            // place in the last location
                            $(widget).insertBefore($("div").find("[data-gs-id='" + nextElementId + "']"));

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
    // serializing plugins / re-enable dropppable .gridstack after serializing
    serializeWidgetMap: function(items, cb) {
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
                        if (Array.isArray(value) || typeof value == "object") {
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
        self.saveDBWidgets(dataString, cb);
    },
    // save dashboard widgets/plugins
    saveDBWidgets: function(dataString, cb) {
        // save the lists of widgets on the dashboard to db
        if(cb != undefined) {
            var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString, cb);
        }else{
            var saveDashboardLists = $.post("/melis/MelisCore/DashboardPlugins/saveDashboardPlugins", dataString);
        }
    },
    // check current dashboard
    checkDashboard: function() {
        var self                    = this,
            $pluginBtn              = $("#melisDashBoardPluginBtn"),
            $pluginBox              = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
            pluginBoxWidth          = $pluginBox.outerWidth(),
            $activeTab              = $("#"+activeTabId),
            $dbMsg                  = $activeTab.find(".melis-core-dashboard-msg"),
            $gs                     = $activeTab.find(".grid-stack"),
            gsWidth                 = $gs.outerWidth(),
            gsItems                 = $gs.find(".grid-stack-item").length,
            $tabArrowTop            = $("#tab-arrow-top"),
            minWidth                = $gs.data("min-width"),
            maxWidth                = $gs.data("max-width"),
            $bubblePlugin           = $("#bubble-plugin"),
            bubblePluginMinWidth    = $bubblePlugin.data("min-width"),
            bubblePluginMaxWidth    = $bubblePlugin.data("max-width");

            // checks dashboard's elements widths
            self.checkDashboardElemWidths();

            // shown class toggled
            $pluginBox.toggleClass("shown");

            // count .grid-stack-item if found
            if ( gsItems > 0 ) {
                $pluginBox.removeClass("shown");
                $dbMsg.fadeOut();
            }
            else {
                $pluginBox.addClass("shown");
                $dbMsg.fadeIn();

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
                        width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                    }, 3);

                    $dbMsg.animate({
                        width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                    }, 3);

                    if ( $bubblePlugin.length ) {
                        $bubblePlugin.animate({
                            width: maxWidth - pluginBoxWidth // gsWidth - pluginBoxWidth
                        }, 3);
                    }
                } 
                else {
                    $gs.animate({
                        width: maxWidth
                    }, 3);

                    $dbMsg.animate({
                        width: maxWidth
                    }, 3);

                    if ( $bubblePlugin.length ) {
                        $bubblePlugin.animate({
                            width: maxWidth // bubblePluginMaxWidth
                        }, 3);
                    }
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
    // check for data-gs-width responsive below 5, Melis Cms Comments / Latest Comments, added on init function
    latestCommentsPluginUIRes: function() {
        var $com = $('#' + activeTabId + ' .grid-stack .grid-stack-item').find(".melis-cms-comments-dashboard-latest-comments");

            $.each($com, function (i, v) {
                var $this       = $(this),
                    gsWidth     = $this.closest(".grid-stack-item").data("gs-width"),
                    $filter     = $this.find(".mccom-filters-tab .row .mccom-filter"),
                    $select     = $filter.find(".form-group .select2-container"),
                    $profileImg = $this.find(".column-comment-profile-img");

                    if ( gsWidth < 5 ) {
                        $filter.prop("width", null);
                        $filter.attr("style", "width: 100%");
                        $filter.attr("style", "max-width: 100%");

                        $select.prop("width", null);
                        $select.attr("style", "width: 100%");
                        $select.attr("style", "max-width: 100%");
                    }
                    else {
                        $filter.prop("style", null);
                        $select.prop("style", null);
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
    // open properties modal for the dashboard plugin
    createDashboardPluginModal: function (el) {
        var $this = $(el);
        var gridStackItem = $this.closest('.grid-stack-item');
        var pluginId = gridStackItem.attr('data-gs-id');
        var pluginName = gridStackItem.attr('data-gs-name');
        var pluginModule = gridStackItem.attr('data-gs-module');

        // initialation of local variable
        zoneId = 'id_meliscms_plugin_modal_interface';
        melisKey = 'meliscms_plugin_modal_interface';
        modalUrl = '/melis/MelisCore/DashboardPlugins/renderDashboardPluginModal';

        var modalParams = {
            dashboardId : activeTabId,
            pluginName: pluginName,
            pluginId : pluginId,
            pluginModule : pluginModule,
        };

        // requesitng to create modal and display after
        window.parent.melisHelper.createModal(zoneId, melisKey, false, modalParams, modalUrl, function() {});
    },
    dashboardPluginModalSubmit: function (el) {
        var self = this;
        // var grid = $('#' + activeTabId + ' .grid-stack').data('gridstack');
        // self.serializeWidgetMap(grid.container[0].children);

        // Assign in function for bug issue in closing and opening tabs
        var $this = $(el);
        var melisPluginDashboardId = $this.closest("#id_meliscore_dashboard_plugin_modal_container").data("melis-plugin-dashboard-id");
        var pluginModule = $this.closest("#id_meliscore_dashboard_plugin_modal_container").data("melis-plugin-module");
        var pluginName = $this.closest("#id_meliscore_dashboard_plugin_modal_container").data("melis-plugin-name");
        var pluginId = $this.closest("#id_meliscore_dashboard_plugin_modal_container").data("melis-plugin-id");
        var dataString = $this.closest('.modal-content').find("form");

        // Construct data string
        var datastring = dataString.serializeArray();

        //add to datastring the unchecked checkbox fields
        $this.closest('.modal-content').find("form input:checkbox").each(function(){
            if (!this.checked) {
                datastring.push({name: this.name, value: 0});
            }                
        });

        datastring.push({name: "dashboardId", value: melisPluginDashboardId});
        datastring.push({name: "pluginModule", value: pluginModule});
        datastring.push({name: "pluginName", value: pluginName});
        datastring.push({name: "pluginId", value: pluginId});

        try {
            self.validateDashboardPluginModal(pluginId, datastring);
        } catch (e) {
            console.log(e);
        }
    },
    validateDashboardPluginModal: function (pluginId, datastring) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: "/melis/MelisCore/DashboardPlugins/validateDashboardPluginModal?validate",
            data: datastring,
            dataType: 'json'
        }).done(function(data) {
            if (data.success) {
                // update config for saving
                self.updateDashboardPluginConfig(pluginId, datastring);
                // save dashboard plugins
                var grid = $('#' + activeTabId + ' .grid-stack').data('gridstack');
                self.serializeWidgetMap(grid.container[0].children, function(){
                    // refresh widget
                    $('.grid-stack-item[data-gs-id="' + pluginId + '"]').find('.dashboard-plugin-refresh').trigger("click");
                });

                // close modal
                // $('#id_meliscore_dashboard_plugin_modal_container').modal('hide');
                melisCoreTool.hideModal("id_meliscore_dashboard_plugin_modal_container");
            } else {
                dashboardPluginHelpepr.melisMultiKoNotification(data.errors);
            }
        }).fail(function(xhr, textStatus, errorThrown) {
            alert( translations.tr_meliscore_error_message );
        });
    },
    updateDashboardPluginConfig: function (pluginId, datastring) {
        // get plugin config that is saved in the dom
        var pluginConfig = $('.grid-stack-item[data-gs-id="' + pluginId + '"]').find('.dashboard-plugin-json-config').text();
        pluginConfig = JSON.parse(pluginConfig);

        /**
         * This will store data if field is multi select,
         * make sure multi_select_fields key is present in your
         * plugin config under datas
         *
         * Example: multi_select_fields => ['mutli_select_field_name' => []]
         *
         * @type {Array}
         */
        var arrDatas = [];
        $.each(datastring, function(i, val){
            if (~val.name.indexOf("[]")){
                var fieldName = val.name.replace("[]","");
                if(!Array.isArray(arrDatas[fieldName])){
                    arrDatas[fieldName] = [];
                }
                arrDatas[fieldName].push(val.value);
            }
        });

        // override config from plugin to the ones that we get from the modal form
        $.each(pluginConfig.datas, function (index, value) {
            var field = datastring.find(input => input.name == index);

            if (typeof field != 'undefined') {
                pluginConfig.datas[field.name] = field.value;
            }
            else{
                //try to get data from multi select datas
                if(index in arrDatas){
                    pluginConfig.datas[index] = arrDatas[index];
                }else{//check if fields is in multi select fields to assign its default data
                    if(pluginConfig.datas['multi_select_fields'] != undefined) {
                        if (index in pluginConfig.datas['multi_select_fields']) {
                            //set its default data
                            pluginConfig.datas[index] = pluginConfig.datas['multi_select_fields'][index];
                        }
                    }
                }
            }
        });

        // update plugin config in dom
        $('.grid-stack-item[data-gs-id="' + pluginId + '"]').find('.dashboard-plugin-json-config').text(JSON.stringify(pluginConfig));
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
        var count = 0,
            $activeGs = $("#"+activeTabId+" .grid-stack");

            if ( ! this.isEmpty( $activeGs ) ) {
                if ( $activeGs.find(".grid-stack-item").length )
                    count = $activeGs.find(".grid-stack-item").length;           
            }

            return count;
    },
    // get the current, active .grid-stack for multiple dashboards
    getCurrentGsWidth: function() {
        var self    = this,
            gsWidth = $("#"+activeTabId).find(".grid-stack").outerWidth();

            return gsWidth;
    },
    // check if gs is empty
    isEmpty: function(el) {
        return !el.html().trim();
    },
    // checks dashboard's elements width adjustment
    checkDashboardElemWidths: function() {
        var self                    = this,
            $body                   = $("body"),
            $pluginBtn              = $body.find("#melisDashBoardPluginBtn"),
            $pluginBox              = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
            $gs                     = $body.find("#"+activeTabId + " .grid-stack"),      
            $dbMsg                  = $body.find("#"+activeTabId + " .melis-core-dashboard-msg"),
            $bubblePlugin           = $body.find("#"+activeTabId + " .bubble-plugin");

            // set data min and max width, from setAdjustGridMeasurements() function
            $gs.attr("data-min-width", $gs.outerWidth() - $pluginBox.outerWidth());
            $gs.attr("data-max-width", $gs.outerWidth());

            // display .grid-stack width in pixels on document load
            $gs.css("width", $gs.outerWidth());

            // set data min and max width for bubble plugin
            $bubblePlugin.attr("data-min-width", $gs.outerWidth() - $pluginBox.outerWidth() );
            $bubblePlugin.attr("data-max-width", $gs.outerWidth() );

            // display #bubble-plugin width
            $bubblePlugin.css("width", $gs.outerWidth() );

            // dbMsg, sets min and max widths
            $dbMsg.attr("data-min-width", $gs.outerWidth() - $pluginBox.outerWidth() );
            $dbMsg.attr("data-max-width", $gs.outerWidth() );

            // display .dbMsg width in pixels on document load
            // $gs.outerWidth so that same width on .grid-stack
            $dbMsg.css("width", $gs.outerWidth() );

            // add or remove .pt-0 for spacing between the #bubble-plugin and .grid-stack div elements
            if ( $bubblePlugin.length ) {    
                if ( $dbMsg.length && $dbMsg.is(":visible") ) {
                    if ( $dbMsg.closest(".melis-dashboard-plugins").find(".pt-0").length > 0 ) {
                        $dbMsg.closest(".melis-dashboard-plugins").removeClass("pt-0");
                    }
                    else {
                        $dbMsg.closest(".melis-dashboard-plugins").addClass("pt-0");
                    }
                }
                else if ( self.countGsItems() > 0 ) {
                    if ( $dbMsg.closest(".melis-dashboard-plugins").find(".pt-0").length > 0 ) {
                        $dbMsg.closest(".melis-dashboard-plugins").removeClass("pt-0");
                    }   
                    else {
                        $dbMsg.closest(".melis-dashboard-plugins").addClass("pt-0");
                    }
                }
            }
    }
};

$(function() {
    var $body                   = $("body"),
        $melisLeftMenu          = $("#id_meliscore_leftmenu"),      
        gsi                     = $("#"+activeTabId + " .grid-stack").find(".grid-stack-item").length,
        $pluginBtn              = $body.find("#melisDashBoardPluginBtn"),
        $pluginBox              = $pluginBtn.closest(".melis-core-dashboard-dnd-box"),
        $gs                     = $body.find("#"+activeTabId + " .grid-stack"),      
        $dbMsg                  = $body.find("#"+activeTabId + " .melis-core-dashboard-msg"),
        dbMsgMinWidth           = $dbMsg.data("min-width"),
        dbMsgMaxWidth           = $dbMsg.data("max-width"),
        minWidth                = $gs.data("min-width"),
        //minWidth                = $gs.data().minWidth,
        maxWidth                = $gs.data("max-width"),
        $bubblePlugin           = $("#bubble-plugin"),
        bubblePluginWidth       = $bubblePlugin.outerWidth(),
        bubblePluginMinWidth    = $bubblePlugin.data("min-width"),
        bubblePluginMaxWidth    = $bubblePlugin.data("max-width");

        // init
        melisDashBoardDragnDrop.init();

        // check if any .grid-stack-item is found, hide $dbMsg
        if ( gsi > 0 ) {
            $dbMsg.hide();
        }
        else {
            $dbMsg.show();
            // load dashboard plugin content
            if ($pluginBox.hasClass("shown") && typeof dashboard !== "undefined") {
                dashboard.loadDashboardPluginContent();
            }
        }

        // .select2-container width 100% specific for latest comments plugin on document ready, added on init
        //melisDashBoardDragnDrop.latestCommentsPluginUIRes();

        // animate to full width size of #grid1
        $body.on("click", "#dashboard-plugin-delete-all", function() {
            $gs.animate({
                width: minWidth
            }, 3);

            $dbMsg.animate({
                width: minWidth
            }, 3);

            if ( $bubblePlugin.length ) {
                $bubblePlugin.animate({
                    width: minWidth // bubblePluginMinWidth
                }, 3);
            }
        });

        setTimeout(function() {
            // check if plugins menu is open, adjust .grid-stack width accordingly
            if ( $pluginBox.hasClass("shown") && gsi === 0 ) {
                $gs.animate({
                    width: minWidth
                }, 3);

                $dbMsg.animate({
                    width: minWidth
                }, 3);

                if ( $bubblePlugin.length ) {
                    $bubblePlugin.animate({
                        width: minWidth // bubblePluginMinWidth
                    }, 3);
                }
            }
        }, 1000);

        /**
         * gridstack
         * Binding elements
         */
        $body.on("click", "#dashboard-plugin-delete-all", function() {
            melisDashBoardDragnDrop.deleteAllWidget($(this));
        });

        $body.on("click", ".dashboard-plugin-delete", function() {
            melisDashBoardDragnDrop.deleteWidget($(this));
        });

        $body.on("click", ".dashboard-plugin-refresh", function() {
            melisDashBoardDragnDrop.refreshWidget($(this));
        });

        $body.on("click", ".dashboard-plugin-properties", function() {
            melisDashBoardDragnDrop.createDashboardPluginModal($(this));
        });

        $body.on("click", "#dashboard-plugin-properties-save", function() {
            melisDashBoardDragnDrop.dashboardPluginModalSubmit($(this));
        });
});

var dashboardPluginHelpepr = (function($, window) {
    var $body = window.parent.$("body");
        /**
         * KO NOTIFICATION for Multiple Form
         */
        function melisMultiKoNotification(errors, closeByButtonOnly) {
            if (!closeByButtonOnly) closeByButtonOnly = true;

            var closeByButtonOnly   = ( closeByButtonOnly !== true ) ?  'overlay-hideonclick' : '',
                errorTexts          = '<div class="row">';

                // remove red color for correctly inputted fields
                $body.find("#id_meliscore_dashboard_plugin_modal .form-group label").css("color", "inherit");

                $.each(errors, function(idx, errorData) {
                    if ( errorData['success'] === false ) {
                        errorTexts += '<h3>'+ (errorData['name']) +'</h3>';
                        if (errorData['message'] != "") {
                            errorTexts +='<h4>'+ (errorData['message']) +'</h4>';
                        }
 
                        // Highlighting errors fields
                        highlightMultiErrors(errorData['success'], errorData['errors']);

                        $.each( errorData['errors'], function( key, error ) {
                            if ( key !== 'label' ) {
                                errorTexts += '<div class="col-xs-12 col-sm-5">';
                                errorTexts += '  <b>'+ (( error['label'] == undefined ) ? ((error['label']== undefined) ? key : errors['label'] ) : error['label'] ) +'</b>';
                                errorTexts += '</div>';
                                errorTexts += '<div class="col-xs-12 col-sm-7">';
                                errorTexts += ' <div class="modal-error-container">';
                                // catch error level of object
                                try {
                                    $.each( error, function( key, value ) {
                                        if(key !== 'label' && key !== 'form'){
                                            $errMsg = '';
                                            if(value instanceof Object){
                                                $errMsg = value[0];
                                            }else{
                                                $errMsg = value;
                                            }
                                            if($errMsg != '') {
                                                errorTexts += '<span class="tets error-list"><i class="fa fa-circle"></i>'+ $errMsg + '</span><br/>';
                                            }
                                        }
                                    });
                                } catch(e) {
                                    if(key !== 'label' && key !== 'form') {
                                        errorTexts +=  '<span class="hoy error-list"><i class="fa fa-circle"></i>'+ error + '</span>';
                                    }
                                }
                            }
                            errorTexts += '</div></div>';
                        });
                    }
                });

                errorTexts += '</div>';
                var div = '<div class="melis-modaloverlay '+ closeByButtonOnly +'"></div>';
                    div += '<div class="melis-modal-cont KOnotif page-edition-multi-ko">  <div class="modal-content error">'+ errorTexts +' <span class="btn btn-block btn-primary">' + translations.tr_meliscore_notification_modal_Close +'</span></div> </div>';

                $body.append(div);
        }

        function highlightMultiErrors(success, errors){
            // if all form fields are error color them red
            if ( !success ) {
                $.each( errors, function( key, error ) {
                    $body.find("#id_meliscore_dashboard_plugin_modal .form-control[name='"+key +"']").parents(".form-group").find("label").css("color","red");
                });
            }
        }

    return {
        melisMultiKoNotification : melisMultiKoNotification
    }

})(jQuery, window);