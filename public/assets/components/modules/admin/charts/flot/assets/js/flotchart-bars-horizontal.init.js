(function($)
{
	if (typeof charts == 'undefined') 
		return;

	charts.chart_horizontal_bars = 
	{
		// chart data
		data: null,

		// will hold the chart object
		plot: null,

		// chart options
		options: 
		{
			grid: {
				show: true,
			    aboveData: false,
			    color: "#3f3f3f" ,
			    labelMargin: 5,
			    axisMargin: 0, 
			    borderWidth: 0,
			    borderColor:null,
			    minBorderMargin: 5 ,
			    clickable: true, 
			    hoverable: true,
			    autoHighlight: false,
			    mouseActiveRadius: 20,
			    backgroundColor : { }
			},
	        series: {
	        	grow: {active:false},
		        bars: {
		        	show:true,
					horizontal: true,
					barWidth:0.2,
					fill:1
				}
	        },
	        legend: { position: "ne", backgroundColor: null, backgroundOpacity: 0 },
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
		
		placeholder: "#chart_horizontal_bars",
		
		// initialize
		init: function()
		{
			// apply styling
			charts.utility.applyStyle(this);
			
			var d1 = [];
		    for (var i = 0; i <= 5; i += 1)
		        d1.push([parseInt(Math.random() * 30),i ]);

		    var d2 = [];
		    for (var i = 0; i <= 5; i += 1)
		        d2.push([parseInt(Math.random() * 30),i ]);

		    var d3 = [];
		    for (var i = 0; i <= 5; i += 1)
		        d3.push([ parseInt(Math.random() * 30),i]);

		    this.data = new Array();
		    this.data.push({
		        data: d1,
		        bars: {
		            horizontal:true, 
		            show: true, 
		            barWidth: 0.2, 
		            order: 1
		        }
		    });
			this.data.push({
			    data: d2,
			    bars: {
			        horizontal:true, 
			        show: true, 
			        barWidth: 0.2, 
			        order: 2
			    }
			});
			this.data.push({
			    data: d3,
			    bars: {
			        horizontal:true, 
			        show: true, 
			        barWidth: 0.2, 
			        order: 3
			    }
			});

			this.plot = $.plot($(this.placeholder), this.data, this.options);
		}
	};

	charts.chart_horizontal_bars.init();
})(jQuery);