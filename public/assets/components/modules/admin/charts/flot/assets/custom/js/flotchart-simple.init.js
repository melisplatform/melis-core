$(document).ready(function(){
	
	$("body").on("change", '.dashchartline', function() {
		simpleChartInit($(this).val());
	});
	
	if (typeof charts == 'undefined') 
		return;

	charts.chart_simple = 
	{
		// data
		data: 
		{
			d1: []
		},
		
		// will hold the chart object
		plot: null,

		// chart options
		options: 
		{
			grid: 
			{
				color: "#dedede",
			    borderWidth: 1,
			    borderColor: "#eee",
			    clickable: true,
			    hoverable: true,
			    labelMargin: 20,
			},
	        series: {
	            lines: {
            		show: true,
            		fill: false,
            		lineWidth: 2,
            		steps: false
            	},
	            points: {
	            	show:true,
	            	radius: 5,
	            	lineWidth: 3,
	            	fill: true,
	            	fillColor: "#000"
	            }
	        },
	        xaxis: {
	        	mode: 'time',
//	            timeformat: '%b %d',
//	            tickSize: [1, 'day'],
	            tickColor: '#eee',
			},
			yaxis: {
				show : true,
				tickColor: '#eee',
				min: 0,
				tickDecimals: 0,
			},
	        legend: { position: "nw", noColumns: 2, backgroundColor: null, backgroundOpacity: 0 },
	        shadowSize: 0,
	        tooltip: true,
			tooltipOpts: {
				content: "%y %s - %x",
				shifts: {
					x: -30,
					y: -50
				},
				defaultTheme: false
			}
		},
		
		placeholder: "#chart_simple",

		// initialize
		init: function()
		{
			if (this.plot == null){
				// hook the init function for plotting the chart
				simpleChartInit();
			}
		}
	};
	
	
	// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
	window.simpleChartInit = function(chartFor){
		if(typeof chartFor === "undefined") chartFor = 'daily';
		// get the statistics data
		$.ajax({
			type        : 'POST',
		    url         : '/melis/MelisCmsProspects/Dashboard/getDashboardStats',
		    data		: {chartFor : chartFor},
		    dataType 	: 'json',
		    encode		: true
		}).success(function(data){
			// plot the chartvar tmpData = data.values;

            var tmpData = data.values;
            var tmpdataLength  = tmpData.length;
            var finalData = [];
            var curTime = null;

            for(var i = 0; i < tmpdataLength ; i++)
            {
                var newDate = new Date(tmpData[i][0]);
                var tmpDate = new Date();

                var m = newDate.getMonth() ;
                var y = newDate.getFullYear();
                var newMonth = new Date(y, m, 1.5 );
                var newYear = new Date(y,0, 2);


                if(chartFor == 'daily'){
                    curTime = newDate.getTime();
                }
                else if (chartFor == 'monthly'){
                    curTime = newMonth.getTime();
                }
                else if (chartFor == 'yearly'){
                    curTime = newYear.getTime();

                }

                finalData.push([ curTime , tmpData[i][1]]);
            }
			charts.chart_simple.plot = $.plot(
				$(charts.chart_simple.placeholder),
	           	[{
	    			label: "Prospects", 
	    			data: finalData,
	    			color: successColor,
	    			lines: { fill: 0.2 },
	    			points: { fillColor: "#fff"}
	    		}], charts.chart_simple.options);
			
		}).error(function(xhr, textStatus, errorThrown){
			alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
		});
	}
	
	
	
	 // uncomment to init on load
	 charts.chart_simple.init();

	 // use with tabs
	 $('a[href="#chart-simple-lines"]').on('shown.bs.tab', function(){
	 	if (charts.chart_simple.plot == null)
	 		charts.chart_simple.init();
	 });
	 
	 $('body').on('click', '.btn-group a[href="#chart-simple-lines"]', function(){
		$(this).parent().find('[data-toggle]').removeClass('active');
		$(this).addClass('active');
	 });

});