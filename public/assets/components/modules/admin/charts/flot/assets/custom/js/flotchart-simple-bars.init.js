$(document).ready(function(){
	
	$("body").on("change", '.dashchartbar', function() {
		simpleBarsInit($(this).val());
	});
	
	if (typeof charts == 'undefined') 
		return;

	charts.chart_simple_bars = 
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
	        	bars: {
	        		show: true,
//	        		lineWidth: 100,
	                barWidth: 12*24*60*60*60,
	                fill: true,
	                align : "center"
				},
				shadowSize: 0
	        },
	        xaxis: {
	        	mode: 'time',
	            timeformat: '%b %d',
//	            tickSize: [1, 'day'],
	            position: 'bottom',
	            tickColor: '#eee',
			},
			yaxis: {
				show : true,
				tickColor: '#eee',
				tickDecimals: 0,
				min: 0
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
			},
			
		},
		
		placeholder: "#chart_simple_bars",

		// initialize
		init: function()
		{
			if (this.plot == null){
				// hook the init function for plotting the chart
				simpleBarsInit();
			}
			
		}
	};
		
	
	// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
	window.simpleBarsInit = function(chartFor){
		if(typeof chartFor === "undefined") chartFor = 'daily';
		// get the statistics data
		$.ajax({
			type        : 'POST',
		    url         : '/melis/MelisCmsProspects/Dashboard/getDashboardStats',
		    data		: {chartFor : chartFor},
		    dataType 	: 'json',
		    encode		: true
		}).success(function(data){
			// plot the bar chart
			var opts = charts.chart_simple_bars.options;
			// Set Bar With Depend on Type of Chart
			switch (chartFor) {
	            case 'daily':
	            	opts.xaxis.timeformat = '%b %d';
	            	opts.series.bars.barWidth = 12*24*60*60*60;
	                break;
	            case 'monthly':
	            	opts.xaxis.timeformat = '%b';
	            	opts.series.bars.barWidth = 12*24*60*60*60*25;
	                break;
	            case 'yearly':
	            	opts.xaxis.timeformat = '%Y';
	            	opts.series.bars.barWidth = 12*24*60*60*60*280;
	                break;
	            default:
	                break;
			}
			
			charts.chart_simple_bars.plot = $.plot(
				$(charts.chart_simple_bars.placeholder),
	           	[{
	    			label: "Prospects", 
	    			data: data.values,
	    			color: successColor,
	    		}], charts.chart_simple_bars.options);
			
		}).error(function(xhr, textStatus, errorThrown){
			alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
		});
	}
	
	
	
	// uncomment to init on load
	// charts.chart_simple_bars.init();

	// use with tabs
	$('body').on('shown.bs.tab', 'a[href="#chart-simple-bars"]', function(){

		// ----=[ Melis customize ]=----
		// modified this event, used event delegation and hooked it up in the body so it still works after the zone is reloaded.
		// created var flot; and added or '|| flot === undefined' in the condition to make other charts reinitialize after zoneReloading.
		
		var flot = $("#chart_simple_bars").data('plot');
		if ( charts.chart_simple_bars.plot == null || flot === undefined  ){
			simpleBarsInit();
		}
			
	});
	
	$('body').on('click', '.btn-group a[href="#chart-simple-bars"]', function(){
		$(this).parent().find('[data-toggle]').removeClass('active');
		$(this).addClass('active');
		
	});
	
	

});