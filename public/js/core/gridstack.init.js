/**
 * Created by conta on 2/23/2018.
 */

var options = {
    cellHeight: 80,
    verticalMargin: 20,
    animate: true
};

$('.grid-stack').gridstack(options);
/*$('.grid-stack').on('dragstop', function(event, ui) {
    var grid = this;
    var element = event.target;
    console.log('grid    ', grid );
    console.log('ui    ', ui );
    console.log('element    ', element );
    var elementData = $(element).data();
    var data = {
        //dashboardName
        gsHeight    :   elementData.gsHeight,
        gsWidth     :   elementData.gsWidth,
        gsX         :   elementData.gsX,
        gsY         :   elementData.gsY
    };
    console.log('dragstop ', data);
});*/

var serializeWidgetMap = function(items) {
    var deffered = [];
    items.map(function(boom) {
        console.log(boom.x);
    });

    console.log(items);
    console.log({ 'choices': items });

    var postDashboardNew = $.post( "test.php", { 'choices[]': items[0].x } );

    postDashboardNew.done(function(data) {
        console.log('Success ', data);
    });

    postDashboardNew.fail(function(error) {
        console.log('Something went wrong ', error);
    });
};


$('.grid-stack').on('change', function(event, items) {
    serializeWidgetMap(items);
});