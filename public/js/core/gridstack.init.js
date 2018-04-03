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

        dropWidget: function() {
            var active_grid = $('.tab-pane .grid-stack').data('gridstack');
            var gridDrop = active_grid.container.droppable({
                // accept: ".melis-core-dashboard-plugin-snippets",
                tolerance: 'pointer',
                drop: function( event, ui ) {
                    var request = $.get( "/melis/MelisCore/DashboardPlugins/getPlugin");
                    request.done(function(data){
                        // adding Widget
                        var grid = $('.grid-stack').data('gridstack');
                        var gridData = grid.placeholder.data();
                        console.log('data ', $(data.html));
                        var html = $(data.html);
                        var widget = grid.addWidget(html, gridData.gsX, gridData.gsY, 6, 6);

                        // remove clone widgets
                        grid.removeWidget($(widget).prev());


                    });

                }
            });
        },

        serializeWidgetMap: function(items) {
            $.each(items, function(key, value) {
                var dataString = $(items[key].el).find('.hidden').text();
                if(dataString) {
                    // send dashboard lists
                    console.log('items ', JSON.parse(dataString) );
                }

            });

            /*postDashboardNew.done(function(data) {
             console.log('Success ', data);
             });

             postDashboardNew.fail(function(error) {
             console.log('Something went wrong ', error);
             });*/
        },

        changeWidget: function() {
            var self = this;
            // gridstack change
            $('.grid-stack').on('change', function(event, items) {
                console.log('event change ', event);
                console.log('items change ', items);
                // hide plugin menu
                $(".melis-core-dashboard-dnd-box").removeClass("shown");
                self.serializeWidgetMap(items);
            });
        },
    };


melisDashBoardDragnDrop.init();

