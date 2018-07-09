var mapHandler = function (arg) {
	'use strict';
	
	var m = function (arg) {

		m.topLeftBound = arg.topLeftBound;
		m.bottomRightBound = arg.bottomRightBound;
		m.zoom = arg.zoom;
		m.projection = arg.projection;
		m.svg = arg.svg;
		m.style = arg.style;
		
		m.path = d3.geo.path().projection(m.projection);
		m.ids = 0;
		
		if (arg.autoProjection) {
			m.projection.center([(m.topLeftBound[0] + m.bottomRightBound[0]) / 2, (m.topLeftBound[1] + m.bottomRightBound[1]) / 2]);
			m.projection.scale(1);
			
			var p = m.getPointsAt([m.topLeftBound, m.bottomRightBound]),
				hscale  = dd3.cave.svgWidth  / (p[1][0] - p[0][0]),
				vscale = dd3.cave.svgHeight / (p[1][1] - p[0][1]);
				
			m.projection.scale((hscale < vscale) ? hscale : vscale);
		}

		var toCoordinateTopLeft = m.projection.invert([dd3.position.svg.left, dd3.position.svg.top]);
		var toCoordinateBottomRight = m.projection.invert([dd3.position.svg.left + dd3.browser.svgWidth, dd3.position.svg.top + dd3.browser.svgHeight]);

		m.topLeftTile = [long2tile(toCoordinateTopLeft[0], m.zoom), lat2tile(toCoordinateTopLeft[1], m.zoom)];
		m.bottomRightTile = [long2tile(toCoordinateBottomRight[0], m.zoom), lat2tile(toCoordinateBottomRight[1], m.zoom)];
		
		return m;
	};
	
	m.load = function (elem, userCallback) {
		console.log("Loading map : [" + m.topLeftTile + "] => [" + m.bottomRightTile + "]");
		elem.forEach(function (d) { m.svg.append("g").attr("id", d).unwatch(); });
		load(elem, userCallback, m.topLeftTile, m.bottomRightTile);
	};
	
	var load = function (elem, userCallback, fromTile, toTile) {
		var l = elem.length,
			end = (toTile[1] - fromTile[1] + 1) * (toTile[0] - fromTile[0] + 1);
				
		var callback = function (type, i, j) {
			var index = elem.indexOf(type);
			if (index + 1 < l) {
				loadLayer(elem[index + 1], i, j, callback);
			} else {
			    console.log("Tile (" + (i) + "," + (j) + ") loaded");
			    if (--end === 0)
				    userCallback();
			}
		};
		
		for (var i = fromTile[0] ; i <= toTile[0] ; i++) {
			for (var j = fromTile[1] ; j <= toTile[1] ; j++) {
				callback(false, i,j);
			}
		}
	};
	
	var locale = dd3.position('svg', 'global', 'svg', 'local');

	var isAbsurd = function (b) {
	   // return (locale.left(b[0][0]) < -dd3.browser.svgWidth || locale.left(b[1][0]) > 2 * dd3.browser.svgWidth || locale.top(b[0][1]) < -dd3.browser.svgHeight || locale.top(b[1][1]) > 2 * dd3.browser.svgHeight);
	    return false;
	};
	
	var loadLayer = function (type, i, j, callback) {
		//BAI
		//d3.json("http://tile.mapzen.com/mapzen/vector/v1/" + type + "/" + m.zoom + "/" + i + "/" + j + ".json" + "?api_key=mapzen-gGKpBK7", function (error, tile) {
		d3.json("https://tile.nextzen.org/tilezen/vector/v1/all/" + m.zoom + "/" + i + "/" + j+ ".json" + "?api_key=pOUZpNm8TUON3FTGcBmABw", function (error, tile) {
	    //d3.json("https://tile.mapzen.com/mapzen/vector/v1/" + type + "/" + m.zoom + "/" + i + "/" + j + ".json", function (error, tile) {
			if (error) {
				callback(type, i, j);
				return console.error(error);
			};
			
			tile[type].features = tile[type].features.filter(function (d) {
				if (isAbsurd(m.path.bounds(d))) {
					console.log("Error with : " + type + " -  Bounds incorrects", m.path.bounds(d), "Trying reversed coordinates");
					d.geometry.coordinates[0].reverse();
					if (isAbsurd(m.path.bounds(d))) {
						console.log("Error with : " + type + " -  Bounds incorrects", m.path.bounds(d));
						return false;
					}
				}
				return true;
			})
                .filter(function (d) { return m.strokeColor(type, d.properties.kind) !== "none" || m.fillColor(type, d.properties.kind) !== "none"; });
			
			m.svg.select_("g#" + type)
				.selectAll_("path")
				.data(tile[type].features, function () {return m.ids++; })
				.enter().append_("path")
				.attr_("d", m.path)
				.attr_("class", function (d) {return d.properties.kind; })
				.classed_(type, true)
				.attr_("fill", function (d) { return m.fillColor(type, d.properties.kind); })
				.attr_("stroke", function (d) { return m.strokeColor(type, d.properties.kind); })
				.attr_("stroke-width", function (d) { return m.strokeSize(type, d.properties.kind); })
				.attr_("stroke-linejoin", "round");

				callback(type, i,j);
		});
	};
	
	m.strokeColor = function (layer, kind, value) {
		if (typeof value != "undefined") {
			m.style[layer] = m.style[layer] || {};
			if (kind === 'all') {
				m.style[layer].strokeColor = value;
			} else {
				m.style[layer][kind] = m.style[layer][kind] || {};
				m.style[layer][kind].strokeColor = value;
			}
		} else {
			layer = m.style[layer];
			kind = layer[kind] ? layer[kind] : layer;
			return kind.strokeColor || "none";
		}
	};
	
	m.fillColor = function (layer, kind, value) {
		if (typeof value != "undefined") {
			m.style[layer] = m.style[layer] || {};
			if (kind === 'all') {
				m.style[layer].fillColor = value;
			} else {
				m.style[layer][kind] = m.style[layer][kind] || {};
				m.style[layer][kind].fillColor = value;
			}
		} else {
			layer = m.style[layer];
			kind = layer[kind] ? layer[kind] : layer;
			return kind.fillColor || "none";
		}
	};
	
	m.strokeSize = function (layer, kind, value) {
		if (typeof value != "undefined") {
			m.style[layer] = m.style[layer] || {};
			if (kind === 'all') {
				m.style[layer].strokeSize = value;
			} else {
				m.style[layer][kind] = m.style[layer][kind] || {};
				m.style[layer][kind].strokeSize = value;
			}
		} else {
			layer = m.style[layer];
			kind = layer[kind] ? layer[kind] : layer;
			return kind.strokeSize || "0";
		}
	};
	
	m.getPointAt = function (p) {
		return  m.projection(p);
	};
	
	m.getPointsAt = function (p) {
	    return p.map(function (p) { return m.projection(p); });
	};
	
	
	function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
	function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
	
	return m(arg);
};
