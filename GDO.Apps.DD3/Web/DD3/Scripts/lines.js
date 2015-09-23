var tubeLines = function (svg, map) {
	'use strict';

	var l = function () {
		l.lineNames = ["Northern","Bakerloo", "Central", "District", "Circle", "HammersmithCity", "Metropolitan", "Piccadilly", "WaterlooCity", "Victoria", "Jubilee"];
		l.lineColors = ["black","#ae6118", "#ed1b2e", "#007229", "#FFDD00", "#f385a1", "#78004C", "#0019A8", "#76d0bd",  "#00A0E2", "#8A8C8E"];
		l.ids = 0;
		return l;
	};
	
	l.loadLines = function (callback) {
		var end = l.lineNames.length;
		l.stations = stations(svg, map);

		l.stations.load(function () {
		    console.log("Loading tube lines");
		    dd3.getData('lines', 'linesData', function (data) {
		        l.lines = d3.map(data);
		        callback && callback();
		    });
		});
	};
	
	l.drawLines = function () {
		var lineGenerator = d3.svg.line().interpolate("cardinal");
		var g = svg.append("g").unwatch().attr("id", "tubeLines").style("filter", "url(#shadow)");
		
		// filters go in defs element
		var defs = svg.append("defs");

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		var filter = defs.append("filter")
			.attr("id", "shadow")
			.attr("height", "150%")
			.attr("width", "150%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		
		filter.append("feColorMatrix")
			.attr("in", "SourceGraphic")
			.attr("type", "matrix")
			.attr("values", "0 0 0 0.005 0 0 0 0 0.005 0 0 0 0 0.005 0 0 0 0 1 0")
			.attr("result", "test");
		
		filter.append("feGaussianBlur")
			.attr("in", "test")
			.attr("stdDeviation", 4)
			.attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		filter.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 2)
			.attr("dy", 2)
			.attr("result", "offsetBlur");
			
		var feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode")
			.attr("in", "offsetBlur");
		feMerge.append("feMergeNode")
			.attr("in", "SourceGraphic");
			
		l.lineNames.forEach(function (name, i) {
			var line = l.lines.get(name);
			var color = l.lineColors[i];
			g.append("g").attr("id", name).attr("opacity", 1);
			
			line.forEach(function (partLine) {
				l.stations.getStationsCoordinates(partLine).forEach(function (d,i) { if (!d) console.log("Error converting station : ", i, partLine[i]);});
				var pLine = map.getPointsAt(l.stations.getStationsCoordinates(partLine));
				
				g.select("g#" + name)
					.append("path")
					.classed("tube", true)
					.attr("d", lineGenerator(pLine))
					.attr("stroke", color)
					.attr("fill", "none")
					.attr("stroke-width", "3")
					.attr("stroke-linejoin", "round")
					.attr("stroke-linecap", "round");
			});
		});

		l.stations.drawStations(l);
	};

	return l(); 
};