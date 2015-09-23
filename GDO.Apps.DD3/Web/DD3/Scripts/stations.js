var stations = function (svg, map) {
	'use strict';

	var s = function () {},
		strokeWidth = 3,
		centerWidth = 3;

	s.stations = d3.map();
	
	s.load = function (userCallback) {
	    var coordinates, name;

	    var callback = function (data) {
	        data.forEach(function (d) {
	            s.stations.set(d.name, [d.coordinates, d.lines]);
	        });
	        userCallback && userCallback(s.stations);
	    };

	    var toCoordinateTopLeft = map.projection.invert([dd3.position.svg.left, dd3.position.svg.top]);
	    var toCoordinateBottomRight = map.projection.invert([dd3.position.svg.left + dd3.browser.svgWidth, dd3.position.svg.top + dd3.browser.svgHeight]);

	    var limit = {
	        xmin: toCoordinateTopLeft[0],
	        xmax: toCoordinateBottomRight[0],
	        ymin: toCoordinateBottomRight[1],
	        ymax: toCoordinateTopLeft[1]
	    };

	    //dd3.getPointData("stationsLocation", "stationsData", callback, null, null, ["coordinates", 0], ["coordinates", 1], [["name"], ["coordinates"], ["lines"]], limit);
	    dd3.getData("stationsLocation", "stationsData", callback, [["name"], ["coordinates"], ["lines"]]);
	};
	
	s.drawStations = function (lines) {
		var arrayPosition = map.getPointsAt(s.stations.values().map(function (d) {return d[0]; }));
		var arrayLines = s.getLinesOfStations(s.stations.keys()).map(function (d) {
			if (d !== undefined) {
				var max = d3.max(d, function (e) {return lines.lineNames.indexOf(e);});
				return lines.lineColors[max];
			} else {
				return "none";
			}
		});
		var array = arrayPosition.map(function (d, i) {return [d, arrayLines[i]];});
		
		svg.append("g")
			.attr("id", "stations")
            .unwatch()
			.selectAll("circle")
			.data(array)
			.enter()
			.append("circle")
			.attr("cx", function (d) {return d[0][0];})
			.attr("cy", function (d) {return d[0][1];})
			.attr("r", centerWidth)
			.attr("fill", function (d) {return d[1] !== "none" ? "white" : "none";})
			.attr("stroke", function (d) {return d[1];})
			.attr("stroke-width", strokeWidth);
	}
	
	s.getStationCoordinates = function (station) {
		return s.stations.get(station)[0];
	};
	
	s.getStationsCoordinates = function (allStations) {
		return allStations.map(function (d) {return s.stations.get(d)[0];});
	};
	
	s.getLinesOfStation = function (station) {
		return s.stations.get(station)[1];
	};
	
	s.getLinesOfStations = function (allStations) {
		return allStations.map(function (d) {return s.stations.get(d)[1];});
	};
	
	return s;
};