(function($)
{
	if (typeof charts == 'undefined') 
		return;

	charts.chart_stacked_bars = 
	{
		// chart data
		data: null,

		// will hold the chart object
		plot: null,

		// chart options
		options: 
		{
			grid: 
			{
			    color: "#dedede",
			    borderWidth: 1,
			    borderColor: "transparent",
			    clickable: true, 
			    hoverable: true
			},
	        series: {
	        	grow: {active:false},
	        	stack: 0,
                lines: { show: false, fill: true, steps: false },
                bars: { show: true, barWidth: 0.5, fill:1}
		    },
		    yaxis: { tickSize: 10 },
	        xaxis: { tickColor: 'transparent', tickSize:2 },
	        legend: { position: "ne", backgroundColor: null, backgroundOpacity: 0, noColumns: 3 },
	        colors: [],
	        shadowSize:1,
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
		
		placeholder: "#chart_stacked_bars",
		
		// initialize
		init: function()
		{
			this.options.colors = ["#7acc66", "#66cccc", "#77b7c5"];
			this.options.grid.backgroundColor = { colors: ["#fff", "#fff"]};
			
			var d1 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d1.push([i, parseInt(Math.random() * 30)]);
		 
		    var d2 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d2.push([i, parseInt(Math.random() * 20)]);
		 
		    var d3 = [];
		    for (var i = 0; i <= 10; i += 1)
		        d3.push([i, parseInt(Math.random() * 20)]);
		 
		    this.data = new Array();
		 
		    this.data.push({
		     	label: "Data One",
		        data: d1
		    });
		    this.data.push({
		    	label: "Data Two",
		        data: d2
		    });
		    this.data.push({
		    	label: "Data Tree",
		        data: d3
		    });

		    this.plot = $.plot($(this.placeholder), this.data, this.options);
		}
	}

	charts.chart_stacked_bars.init();
})(jQuery);