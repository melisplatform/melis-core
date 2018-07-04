(function($)
{
	if (typeof charts == 'undefined') 
		return;

	charts.chart_simple = 
	{
		// data
		data: 
		{
			d1: [],
			d2: []
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
			    borderColor: "transparent",
			    clickable: true, 
			    hoverable: true
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
				tickColor: 'transparent',
				tickDecimals: 2,
				tickSize: 2
			},
			yaxis: {
				tickSize: 1000
			},
	        legend: { position: "nw", noColumns: 2, backgroundColor: null, backgroundOpacity: 0 },
	        shadowSize: 0,
	        tooltip: true,
			tooltipOpts: {
				content: "%s : %y.3",
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
			// this.options.colors = ["#72af46", "#466baf"];
			this.options.colors = [successColor, primaryColor];
			this.options.grid.backgroundColor = { colors: ["#fff", "#fff"]};

			var that = this;

			if (this.plot == null)
			{
			 	this.data.d1 = [ [6, 1300], [7, 1600], [8, 1900], [9, 2100], [10, 2500], [11, 2200], [12, 2000], [13, 1950], [14, 1900], [15, 2000] ];
			 	this.data.d2 = [ [6, 500], [7, 600], [8, 550], [9, 600], [10, 800], [11, 900], [12, 800], [13, 850], [14, 830], [15, 1000] ];
			}
			this.plot = $.plot(
				$(this.placeholder),
	           	[{
	    			label: "Data 1", 
	    			data: this.data.d1,
	    			lines: { fill: 0.05 },
	    			points: { fillColor: "#fff" }
	    		}, 
	    		{	
	    			label: "Data 2",
	    			data: this.data.d2,
	    			lines: { fill: 0.1 },
	    			points: { fillColor: that.options.colors[1] }
	    		}], this.options);
		}
	};
	
	// uncomment to init on load
	// charts.chart_simple.init();

	// use with tabs
	$('a[href="#chart-simple-lines"]').on('shown.bs.tab', function(){
		if (charts.chart_simple.plot == null)
			charts.chart_simple.init();
	});

	$('.btn-group [data-toggle="tab"]').on('show.bs.tab', function(){
		$(this).parent().find('[data-toggle]').removeClass('active');
		$(this).addClass('active');
	});

})(jQuery);