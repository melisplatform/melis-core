(function($)
{
	if (typeof charts == 'undefined') 
		return;

	charts.chart_ordered_bars = 
	{
		// chart data
		data: null,

		// will hold the chart object
		plot: null,

		// chart options
		options:
		{
			bars: {
				show:true,
				barWidth: 0.2,
				fill:1
			},
			grid: 
			{
			    color: "#dedede",
			    borderWidth: 1,
			    borderColor: "transparent",
			    clickable: true, 
			    hoverable: true
			},
	        series: {
	        	grow: {active:false}
	        },
	        yaxis: { tickSize: 10 },
	        legend: { position: "ne", backgroundColor: null, backgroundOpacity: 0, noColumns: 3 },
	        colors: [],
	        tooltip: true,
			tooltipOpts: {
				content: "%s : %y.0",
				shifts: {
					x: -30,
					y: -50
				},
				defaultTheme: false
			}
		},
		
		placeholder: "#chart_ordered_bars",

		// initialize
		init: function()
		{
			this.options.colors = ["#cc6666", "#cca366", "#b7cc66"];
			this.options.grid.backgroundColor = { colors: ["#fff", "#fff"]};
			
			//some data
			var d1 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d1.push([i, parseInt(Math.random() * 30)]);
		 
		    var d2 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d2.push([i, parseInt(Math.random() * 30)]);
		 
		    var d3 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d3.push([i, parseInt(Math.random() * 30)]);
		 
		    var ds = new Array();
		 
		    ds.push({
		     	label: "Data One",
		        data:d1,
		        bars: {order: 1}
		    });
		    ds.push({
		    	label: "Data Two",
		        data:d2,
		        bars: {order: 2}
		    });
		    ds.push({
		    	label: "Data Three",
		        data:d3,
		        bars: {order: 3}
		    });
			this.data = ds;

			this.plot = $.plot($(this.placeholder), this.data, this.options);
		}
	};
		
	charts.chart_ordered_bars.init();
})(jQuery);