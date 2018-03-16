/**
 * Created by conta on 2/23/2018.
 */
/*var dashboardFn = {
    initiate: function () {
        // Grid area to hold active widgets
        var active_grid_options = {
            width: 4,
            height: 6,
            cell_height:100,
            always_show_resize_handle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            grid_class: 'grid-stack-active',
            draggable: {
                cursor: 'move',
                cancel: '.na-icon'
            }
        };
        $('.active-widgets .grid-stack').gridstack(active_grid_options);

        // Grid area to hold in-active widgets
        var inactive_grid_options = {
            width: 2,
            height: 6,
            cell_height:100,
            animate: false,
            grid_class: 'grid-stack-inactive',
            draggable: {
                cursor: 'move',
                cancel: '.na-icon'
            }
        };
        $('.inactive-widgets .grid-stack').gridstack(inactive_grid_options);

        dashboardFn.active_grid = $('.active-widgets .grid-stack').data('gridstack');
        dashboardFn.inactive_grid = $('.inactive-widgets .grid-stack').data('gridstack');

        dashboardFn.load_grid();
    },
    activate_widget: function (widget, position) {
        // Get the position of the cell under a pixel on screen
        var cell = dashboardFn.inactive_grid.get_cell_from_pixel(widget.position);
        if(typeof(position) !== 'undefined' && position != null){
            cell = dashboardFn.inactive_grid.get_cell_from_pixel(position);
        }
        // Check if widget will fit anywhere on Active grid, auto position set to true
        if (dashboardFn.active_grid.will_it_fit(cell.x, cell.y, 1, 1, true)) {
            // Remove Widget from In-Active grid, remove from DOM set to false
            dashboardFn.inactive_grid.remove_widget(widget, false);
            // Add Widget to Active Grid, auto position set to true
            dashboardFn.active_grid.add_widget(widget, cell.x, cell.y, 1, 1, true);
            // Enable re-sizing of Widget while In-Active
            dashboardFn.active_grid.resizable('.grid-stack-active .grid-stack-item', true);
            dashboardFn.update_button(widget);
        }
        else {
            alert('Not enough free space to add the widget');
        }
    },
    deactivate_widget: function (widget, position) {
        // Get the position of the cell under a pixel on screen
        var	cell = dashboardFn.active_grid.get_cell_from_pixel(widget.position);
        if(typeof(position) !== 'undefined' && position != null){
            cell = dashboardFn.active_grid.get_cell_from_pixel(position);
        }
        // Check if widget will fit anywhere on In-Active grid, auto position set to true
        if (dashboardFn.inactive_grid.will_it_fit(cell.x, cell.y, 1, 1, true)) {
            // Remove Widget from Active grid, remove from DOM set to false
            dashboardFn.active_grid.remove_widget(widget, false);
            // Add Widget to In-Active Grid, auto position set to true
            dashboardFn.inactive_grid.add_widget(widget, cell.x, cell.y, 1, 1, true);
            // Disable re-sizing of Widget while In-Active
            dashboardFn.inactive_grid.resizable('.grid-stack-inactive .grid-stack-item', false);
            dashboardFn.update_button(widget);
        }
        else {
            alert('Not enough free space to remove the widget');
        }
    },
    update_button: function (widget, button) {
        var	button = widget.find('.portlet-header .portlet-close,.portlet-header .widget-add');
        if(button.hasClass('portlet-close')){
            button.after('<span class="na-icon na-icon-triangle-1-s widget-add" title="Add"></span>');
        }
        else{
            button.after('<span class="na-icon na-icon-close portlet-close" title="Close"></span>');
        }
        button.remove();
    },
    load_grid : function () {
        dashboardFn.active_grid.remove_all();
        dashboardFn.inactive_grid.remove_all();
        var items = GridStackUI.Utils.sort(serialized_data);
        var widget;
        _.each(items, function (node) {
            // Quick and dirty example using clone of a template widget div
            widget = $("#template .widget").clone();
            // Set Widget Id
            widget.attr('data-widget-id', node.id);
            // Set widget name
            widget.find('.header').html(node.name);
            if(node.active == true){
                // Add 'close' widget button
                widget.find('.portlet-header .header').after('<span class="na-icon na-icon-close portlet-close" title="Close"></span>');
                // If item is active place in it's position on the active widget grid
                this.active_grid.add_widget(widget, node.x, node.y, node.width, node.height);
            }
            else{
                // Add 'Add' widget button
                widget.find('.portlet-header .header').after('<span class="na-icon na-icon-triangle-1-s widget-add" title="Add"></span>');
                // If item not active place in it's position on available widgets area
                this.inactive_grid.add_widget(widget, node.x, node.y, 1, 1, true);
                // Disable re-sizing of Widget while In-Active
                this.inactive_grid.resizable('.grid-stack-inactive .grid-stack-item', false);
            }
        }, this);

        //Click Widget Close Button
        $('#dashboard').on('click', '.portlet-header .portlet-close', function(){
            dashboardFn.deactivate_widget($(this).parents(".grid-stack-item:first"));
        });

        //Click Widget Add Button
        $('#dashboard').on('click', '.portlet-header .widget-add', function(){
            dashboardFn.activate_widget($(this).parents(".grid-stack-item:first"));
        });

        // Force Active grid to accept only Widgets from In-Active Grid, otherwise allow grid-stack to do it's thing
        dashboardFn.active_grid.container.droppable({
            accept: ".grid-stack-inactive .grid-stack-item",
            tolerance: 'pointer',
            drop: function( event, ui ) {
                dashboardFn.activate_widget(ui.draggable, ui.position);
            }
        });

        // Force In-Active grid to accept only Widgets from Active Grid, otherwise allow grid-stack to do it's thing
        dashboardFn.inactive_grid.container.droppable({
            accept: ".grid-stack-active .grid-stack-item",
            tolerance: 'pointer',
            drop: function( event, ui ) {
                dashboardFn.deactivate_widget(ui.draggable, ui.position);
            }
        });

    }
};*/

/* ======================================================================================================== */
var options = {
    cellHeight: 80,
    verticalMargin: 20,
    animate: true,
    acceptWidgets: '.melis-core-dashboard-plugin-snippets'

    // handle: ".grid-stack-item-content .widget-head:first",
};

$('.grid-stack').gridstack(options);

// load dummy grid items
/*var items = [
    { x: 6, y: 0, width: 6, height: 6 },
];

$('.grid-stack').each(function () {
    var grid = $(this).data('gridstack');
    console.log('Grid ', grid);
    _.each(items, function (node) {
        grid.addWidget($('<div><div class="grid-stack-item-content" /><div/>'),
            node.x, node.y, node.width, node.height);
    }, this);
});*/

var serializeWidgetMap = function(items) {
    var deffered = [];

    var postDashboardNew = $.post( "test.php", { 'choices[]': items[0].x } );

    /*postDashboardNew.done(function(data) {
        console.log('Success ', data);
    });

    postDashboardNew.fail(function(error) {
        console.log('Something went wrong ', error);
    });*/
};

$('.grid-stack').on('change', function(event, items) {
    console.log('grid-stack element change');
    serializeWidgetMap(items);
});

$(".melis-core-dashboard-plugin-snippets").draggable({
    connectToSortable: ".grid-stack",
    helper: "clone",
    revert: true,
    appendTo: 'body'
});


var active_grid = $('.tab-pane .grid-stack').data('gridstack');
active_grid.container.droppable({
    // accept: ".melis-core-dashboard-plugin-snippets",
    tolerance: 'pointer',
    drop: function( event, ui ) {
        console.log('event', event);
        console.log('ui ', ui);
        // adding Widget
        var grid = $('.grid-stack').data('gridstack');
        var gridData = grid.placeholder.data();
        console.log('x: ', gridData.gsWidth);
        console.log('y: ', gridData.gsHeight);
        var widgetHTML = '<div class="grid-stack-item" data-gs-height="6" data-gs-width="6">';
        widgetHTML += ' <div class="grid-stack-item-content added">';
        widgetHTML += '     <p>Dashboard (added)</p>';
        widgetHTML += ' </div>';
        widgetHTML += '</div>';
        var widget = grid.addWidget(widgetHTML, gridData.gsWidth, gridData.gsHeight, 6, 6);
        // dashboardFn.activate_widget(ui.draggable, ui.position);
    }
});


/*$("body .grid-stack").sortable({
    placeholder: {
        element: function(clone, ui) {
            return $('<div class="grid-stack-placeholder grid-stack-item" data-gs-width="6"  data-gs-height="6"><div class="placeholder-content"></div></div>');
        },
         update: function() {
            return;
         }
    },
    // placeholder: 'grid-stack-item',
    receive: function( event, ui ) {
        // ajax call wait for the response of the server
        console.log('sortable event', event);
        console.log('sortabel ui', ui);



        // adding Widget
        var grid = $('.grid-stack').data('gridstack');
        var widgetHTML = '<div class="grid-stack-item" data-gs-height="6" data-gs-width="6">';
            widgetHTML += ' <div class="grid-stack-item-content">';
            widgetHTML += '     <p>Dashboard (added)</p>';
            widgetHTML += ' </div>';
            widgetHTML += '</div>';
        var widget = grid.addWidget(widgetHTML, 0, 0, 6, 6, true);

        // remove helper
        $(ui.helper[0]).remove();
    }
});*/
