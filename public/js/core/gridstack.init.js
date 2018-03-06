/**
 * Created by conta on 2/23/2018.
 */

var options = {
    cellHeight: 80,
    verticalMargin: 20,
    animate: true,
    handle: ".grid-stack-item-content .widget-head:first",
};

$('.grid-stack').gridstack(options);

var serializeWidgetMap = function(items) {
    var deffered = [];
    items.map(function(boom) {
        console.log(boom.x);
    });

    console.log(items);
    console.log({ 'choices': items });

    var postDashboardNew = $.post( "test.php", { 'choices[]': items[0].x } );

    /*postDashboardNew.done(function(data) {
        console.log('Success ', data);
    });

    postDashboardNew.fail(function(error) {
        console.log('Something went wrong ', error);
    });*/
};


$('.grid-stack').on('change', function(event, items) {
    serializeWidgetMap(items);
});