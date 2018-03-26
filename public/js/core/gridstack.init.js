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

                // handle: ".grid-stack-item-content .widget-head:first",
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
                    // adding Widget
                    var grid = $('.grid-stack').data('gridstack');
                    var gridData = grid.placeholder.data();
                    var widgetHTML = '<div class="grid-stack-item" data-gs-height="6" data-gs-width="6">';
                    widgetHTML += ' <div class="grid-stack-item-content added">';
                    widgetHTML += '     <p>Dashboard (added)</p>';
                    widgetHTML += ' </div>';
                    widgetHTML += '</div>';

                    var widget = grid.addWidget(widgetHTML, gridData.gsX, gridData.gsY, 6, 6);

                    // remove clone widgets
                    grid.removeWidget($(widget).prev());

                }
            });
        },

        serializeWidgetMap: function(items) {
            var deffered = [];

            var postDashboardNew = $.post( "test.php", { 'choices[]': items[0].x } );

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
                // hide plugin menu
                $(".melis-core-dashboard-dnd-box").removeClass("shown");
                self.serializeWidgetMap(items);
            });
        },
    };


melisDashBoardDragnDrop.init();

