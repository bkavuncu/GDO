var cave = true;
var animationLines = function (arg) {
	'use strict';
	var currentTimeout = null,
		currentTime = 0,
		initialized = 0,
		running = false,
		scale = d3.scale.log().clamp(true),
        colorScale = d3.scale.linear().clamp(true).domain([1, 2200]).interpolate(d3.interpolateRgb).range(["white", "red"]),
	    polygonPosition;
		
	var a = function (arg) {
		// Given as Arguments	
		a.timeStep = arg.timeStep;
		a.map = arg.map;
		a.lines = arg.tubeLines;
		a.stations = a.lines.stations;
		a.clock = arg.clock;
		a.svg = a.map.svg;
		a.entry = arg.entry || 0; // 1 = out, 0 = in
		a.aggregate = arg.aggregate || 1;
		a.scaleContainer = arg.scaleContainer;
		a.color = arg.color || ['#fed700', "#caa130"];
		
		a.realStartTime = +(new Date(Date.UTC(2015,3,1,5))); // i.e. April 1st 2015, 06:00    // first month is 0
		a.timeInterval = min(2); // 15 min
		
	    // == Station min and max size ==
	    //GDOCONFIG
		a.sizeStationMin = cave ? 15 : 5;
		a.sizeStationMax = cave ? 50 : 20;
		
		scale.range([a.sizeStationMin, a.sizeStationMax]);

		return a;
	};
	
	a.loadData = function (callback) {
	    console.log('Loading Data for Animation');

	    var toCoordinateTopLeft = a.map.projection.invert([dd3.position.svg.left, dd3.position.svg.top]);
	    var toCoordinateBottomRight = a.map.projection.invert([dd3.position.svg.left + dd3.browser.svgWidth, dd3.position.svg.top + dd3.browser.svgHeight]);

	    console.log(toCoordinateTopLeft, toCoordinateBottomRight);

	    var limit = {
	        xmin: toCoordinateTopLeft[0] - 0.05,
	        xmax: toCoordinateBottomRight[0] + 0.05,
	        ymin: toCoordinateBottomRight[1] - 0.05,
	        ymax: toCoordinateTopLeft[1] + 0.05
	    };

        console.log(limit)


	    dd3.getPointData('stationsEntries', 'stationsData', function (data) {
			if (data.error) {
			    return console.error("UNABLE TO LOAD DATA : " + data.error);
			}

			a.data = d3.map();
			a.aggregatedData = d3.map();
			a.dataLength = 0;

			if (data.length != 0) {
			    a.dataLength = data[Object.keys(data)[0]].entries.length;
			    data.forEach(function (d) {
			        a.data.set(d.name, d.entries);
			    });

			    // Preparing Data
			    console.log("Preparing Data");

			    var val, tMax, max, xMax, name, pos;

			    var lgth = a.data.values()[0].length,
                    tenth = Math.floor(lgth / 10);

			    d3.range(0, lgth).forEach(function (x) {
			        if (x % a.aggregate === 0) {
			            var array = a.data.entries().map(function (d) {
			                name = d.key;
			                pos = a.map.getPointAt(a.stations.getStationCoordinates(name));
			                val = [0, 0];
			                d3.range(x, Math.min(x + a.aggregate, d.value.length)).forEach(function (i) { val = [val[0] + d.value[i][0], val[1] + d.value[i][1]]; });
			                tMax = (val[0] > val[1] ? val[0] : val[1]);
			                max = tMax <= max ? max : tMax;
			                if (max === tMax) { xMax = [x, name]; }
			                return [pos, val[a.entry], name];
			            });
			            a.aggregatedData.set(x, array);
			        }

			        if (x % tenth === 0) {
			            console.log(~~(x / tenth) * 10 + "%");
			        }
			    });

			    a.maxSizeNumber = max;
			    console.log("Data Ready\n==========");
			}

			console.log(a.data.keys());
			console.log(JSON.stringify(a.data.keys()));

			initialized = 1;
			console.log("Data loaded");
			callback && callback();
		}, null, null, ["coordinates", 0], ["coordinates", 1], [["name"], ["entries"]], limit);

	    dd3.getData("linesLoad", "linkLoad", function (d) {
	        a.linkLoad = d3.map(d);
	    });

        //Sync to do to callback only when ready...
	};
	
	var update = function (time) {

	    if (initialized < 2) {
	        if (initialized === 0) {
	            console.error("DATA NOT LOADED - CANNOT START ANIMATION");
	        } else if (initialized === 1) {
	            console.error("ANIMATION NOT INITIALIZED");
	        }
	        return;
	    }

	    if (a.clock) {
	        updateClock(a.timeInterval * time);
	    }

	    if (a.aggregatedData.size() !== 0) {

	        var group = a.svg.select('#dd3_animation');

	        var poly = group.selectAll("polygon");

            if (poly.empty()) {
	            var l = a.lines;
	            polygonPosition = d3.map();

	            l.lineNames.forEach(function (name, i) {
	                var line = l.lines.get(name);
	                var color = l.lineColors[i];
	                var lineGroup = group.append("g").attr("id", "line_" + name).attr("opacity", 1);
			            
	                polygonPosition.set(name, []);

	                line.forEach(function (partLine) {

	                    var pLine = map.getPointsAt(l.stations.getStationsCoordinates(partLine));
	                    var ptPrec;

	                    var posVect = pLine.map(function (d, i) {
	                        var vect;

	                        if (!a.data.get(partLine[i])) {
	                            ptPrec = null;
	                            return null;
	                        }

	                        if (!ptPrec && pLine.length - 1 > i) {
	                            var pt1 = pLine[i];
	                            var pt2 = pLine[i+1];

	                            var direction = (pt1[0] - pt2[0]) / (pt2[1] - pt1[1]); // Attention when 0 !
	                            var normInitial = Math.sqrt(1 + direction * direction);
	                            vect = [1 / normInitial, 1 * direction / normInitial];

	                            // Faire produit vectoriel avec AB pour garder le bon sens
	                            if (vect[0] * (pt2[1] - pt1[1]) > vect[1] * (pt2[0] - pt1[0])) {
	                                vect[0] *= -1;
	                                vect[1] *= -1;
	                            }

	                            ptPrec = [pt1[0] + vect[0], pt1[1] + vect[1]]; // Premier pt prec
	                            return [pt1, vect];
	                        }

	                        var pt1 = pLine[i-1];
	                        var pt2 = pLine[i];

	                        if (pLine.length - 1 > i) {
	                            var pt3 = pLine[i+1];
	                            var direction = (pt1[0] - pt3[0]) / (pt3[1] - pt1[1]); // Attention when 0 !
	                        } else {
	                            var direction = (pt1[0] - pt2[0]) / (pt2[1] - pt1[1]); // Attention when 0 !
	                        }

	                        var normInitial = Math.sqrt(1 + direction * direction);
	                        vect = [1 / normInitial, 1 * direction / normInitial];

	                        // Faire produit vectoriel avec AB pour garder le bon sens
	                        if (vect[0] * (pt2[1] - pt1[1]) > vect[1] * (pt2[0] - pt1[0])) {
	                            vect[0] *= -1;
	                            vect[1] *= -1;
	                        }

	                        ptPrec = pt2;
	                        return [pt2, vect];

	                    });

	                    polygonPosition.get(name).push(posVect);
	                });
	            });
            }

	        if (time % a.aggregate === 0) {

	            a.lines.lineNames.forEach(function (name, i) {
	                var line = a.lines.lines.get(name);
	                var color = a.lines.lineColors[i];
	                var linkLoad = a.linkLoad.get(name);
	                var lineGroup = group.select("#line_" + name);

	                line.forEach(function (partLine, j) {

	                    var array = polygonPosition.get(name)[j];
	                    array.forEach(function (d, k) {
	                        if (k == 0 || array[k - 1] === null || array[k] === null) {
	                            return;
	                        }

	                        //var normAct = a.data.get(partLine[k])[time][a.entry] / a.maxSizeNumber * (a.sizeStationMax - a.sizeStationMin) + a.sizeStationMin;
	                        var normAct = scale(a.data.get(partLine[k])[time][a.entry]);
	                        var normPrev = scale(a.data.get(partLine[k - 1])[time][a.entry]);

	                        var dPrec = array[k - 1];
	                        var ptPrecA = [dPrec[0][0] + (normPrev) * dPrec[1][0], dPrec[0][1] + (normPrev) * dPrec[1][1]];
	                        var ptPrecB = [dPrec[0][0] + -(normPrev) * dPrec[1][0], dPrec[0][1] + -(normPrev) * dPrec[1][1]];
	                        var ptActA = [d[0][0] + (normAct) * d[1][0], d[0][1] + (normAct) * d[1][1]];
	                        var ptActB = [d[0][0] + -(normAct) * d[1][0], d[0][1] + -(normAct) * d[1][1]];

	                        var n1 = partLine[k - 1].replace(/(\s+|')/g, '');
	                        var n2 = partLine[k].replace(/(\s+|')/g, '');

	                        var idA = [name, n1, n2].join("_");
	                        var idB = [name, n2, n1].join("_");
	                        var lgA = lineGroup.select("#" + "p_" + idA);
	                        var lgB = lineGroup.select("#" + "p_" + idB);

	                        if (lgA.empty()) 
	                            lgA = lineGroup.append("polygon").attr("id", "p_" + idA).attr("opacity", 0.7).attr("stroke", color);
	                        if (lgB.empty()) 
	                            lgB = lineGroup.append("polygon").attr("id", "p_" + idB).attr("opacity", 0.7).attr("stroke", color);

	                        var fillColorA = linkLoad[idA] ? colorScale(linkLoad[idA][time]) : (console.log(idA), "none");
	                        var fillColorB = linkLoad[idB] ? colorScale(linkLoad[idB][time]) : (console.log(idB), "none");

	                        lgA.transition()
                                .duration(a.timeStep * a.aggregate)
                                .ease("linear")
                                .attr("points", [ptPrecA, dPrec[0], d[0], ptActA].join(" "))
	                            .attr("stroke-width", (normAct + normPrev) / 8)
                                .attr("fill", fillColorA);

	                        lgB.transition()
                                .duration(a.timeStep * a.aggregate)
                                .ease("linear")
                                .attr("points", [ptPrecB, dPrec[0], d[0], ptActB].join(" "))
	                            .attr("stroke-width", (normAct + normPrev) / 8)
                                .attr("fill", fillColorB);
                                
	                    });
	                })
	            });

                /*
	            circlesEnter = group.selectAll('circle.enter.T' + time).data(a.aggregatedData.get(time));

	            circlesEnter.enter()
                    .append('circle')
                    .classed('T' + time, true)
                    .classed('enter', true)
                    .style('fill', 'url(#areaGradient)')
                    .attr('cx', function (d) { return d[0][0]; })
                    .attr('cy', function (d) { return d[0][1]; })
                    .attr('r', 0.2)
                    .transition()
                    .precision(0.5)
                    .delay(function (d) { return Math.random() * a.timeStep * a.aggregate; })
                    .duration(function (d) { return (d[1] > 0) ? a.timeStep * a.aggregate * 0.4 : 0; })
                    .attr('r', function (d) { return (d[1] > 0) ? scale(d[1]) : 0; })
                    .transition()
                    .duration(function (d) { return (d[1] > 0) ? a.timeStep * a.aggregate * 0.4 : 0; })
                */
	        }
	    }

		if (running && (currentTime + 1 < a.dataLength)) {
			currentTime++;
			currentTimeout = setTimeout(function () {update(currentTime);}, a.timeStep);
		}
	};
	
	/* INITIALISATION FUNCTIONS */
	
	var updateClock =  function (time) { // Interval in millisec
		var options = {year : "numeric", month : "2-digit", day : "2-digit", hour: "2-digit", minute : "2-digit"};
		var realTime = new Date(a.realStartTime + time).toLocaleString("en-GB", options);
		a.clock.text(realTime);
	};
	
	var initAnim = function () {
	    if (initialized != 1) {
	        return;
	    }

	    if (a.svg.select('#dd3_animation').empty()) {
	        a.svg.append('g').attr('id', 'dd3_animation').unwatch();

	        //Create Gradient			
	        a.svg.select('#dd3_animation').append('radialGradient').unwatch()
                .attr('id', 'areaGradient')
                .attr('cx', '50%').attr('cy', '50%')
                .attr('fx', '50%').attr('fy', '50%')
                .attr('r', '50%');

	        var stop = a.svg.select('#areaGradient').selectAll('stop')
                .data([
                    { offset: '0%', opacity: 1 },
                    { offset: '20%', opacity: 1 },
                    { offset: '100%', opacity: 0.2 }
                ]);

	        stop.enter().append('stop')
                .attr('offset', function (d) { return d.offset; })
                .attr('stop-opacity', function (d) { return d.opacity; })
                .attr('stop-color', function (d, i) { return i === 0 ? a.color[0] : a.color[1]; });
	    }

	    scale.domain([1, a.maxSizeNumber]);
	    initialized = 2;
	};

	/* ANIMATION FUNCTIONS */	
	
	a.init = initAnim;

	a.start = function (time) {
		currentTime = time || currentTime;
		running = true;
		initAnim();
		update(currentTime);
	};
	
	a.stop = function () {
		running = false;
		clearTimeout(currentTimeout);
	};
	
	a.cleanup = function () {
	    a.stop();
	    a.svg.select('#dd3_animation').selectAll('polygon').remove();
	};

	a.changeColor = function (color1, color2) {
		a.svg.select('#areaGradient').selectAll('stop').attr('stop-color', function (d, i) { return i === 0 ? color1 : color2;});
	};
	
	/* HELPER FUNCTIONS */
	
	var week = function (t) {
		return 86400000 * 7 * t;
	};
	
	var day = function (t) {
		return 86400000 * t;
	};
	
	var hour = function (t) {
		return 3600000 * t;
	};
	
	var min = function (t) {
		return 60000 * t;
	};
	
	var sec = function (t) {
		return 1000 * t;
	};
	
	return a(arg);
};