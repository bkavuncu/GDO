var appTestBench = {
    orderController: null,
    loadMap: null,
    launchAnimation: null,
    map: null,
    init: function(orderController) {
        this.orderController = orderController;
        //console.log(this.orderController);
        this.test_bench['7'] = this.test_bench['6'];
        this.test_bench['8'] = this.test_bench['6'];
        this.test_bench['9'] = this.test_bench['6'];
    },
    //BAI: "dd3" variable is needed in this test_bench.
    //BAI: "orderController" variable is needed in this test_bench.
    //BAI: "d3" variable is needed in this test_bench.
    test_bench: {



        //transitions
        '0': function () {
            //BAI: window.requestAnimFrame is not Window.requestAnimationFrame
            window.requestAnimFrame = (function () {
                return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(function () {
                        callback(+new Date);
                    }, 1000 / 60);
                };
            })();

            var lastRun;
            var fps = 0;
            //var fpss = [r, c];
            var fpss = [];
            var triggered = false;
            var nbc = 0;
            var nbdc = 0;
            var nbr = 0;

            //var counter = 0;
            //BAI: TODO: connection should be a separate modeul.
            var peerObject = { host: "146.169.32.109", port: 55555 };
            //{ host: "localhost", port: 55555 };
            //{ host: "146.169.32.109", port: 55555 }
            var app_peer = new Peer(peerObject, { label: "(" + r + ", " + c + " ): " });
            var conn_to_controller;
            //BAI: this function will be called in most "orderController.orders" when it creates shapes.
            function connectToController() {
                conn_to_controller = app_peer.connect('idofthecontrollerfordd3');
                conn_to_controller.on('open', function () {
                    console.log("Connection with the controller established");
                });
            }
            //BAI: DD3Q: This function will running all the time once it is called by "loop()" below. Maybe it cause the worse browser performace.
            function loop() {
                if (!lastRun) {
                    lastRun = window.performance.now();
                    requestAnimFrame(loop);
                    return;
                }
                var delta = (new Date().getTime() - lastRun) / 1000;
                lastRun = new Date().getTime();
                fps = 1 / delta;
                //fpss.push(lastRun);
                fpss.push(Math.round(fps));
                /*
                counter++;
                if (counter % 1000 === 0) {
                    console.log("(" + r + "," + c + "):" + fpss.join(","));

                    conn_to_controller.send(fpss.join(","));
                    //send order with arguments  to control
                    fpss = [r, c];
                }
                */
                requestAnimFrame(loop);
            }

            loop();
            //BAI: this function will be called when the animation is done.
            function sendFPSAvg() {
                var total = 0, totalvar = 0;
                for (var i = 0; i < fpss.length; i++) {
                    total += fpss[i];
                }
                var avg = total / fpss.length;

                for (var i = 0; i < fpss.length; i++) {
                    totalvar += (avg - fpss[i]) * (avg - fpss[i]);
                }
                var std = Math.sqrt(totalvar / fpss.length);
                if (!triggered) {
                    console.log("Average FPS: " + avg);
                    console.log("Standard Deviation: " + std);
                    conn_to_controller.send(r + ";" + c + ";" + nbr + ";" + nbc + ";" + nbdc + ";" + new Date().getTime() + ";" + avg + ";" + std);
                    triggered = true;
                }

            };

            //BAI: TODO: Need to change the following hard coding to configed one.
            //BAI: All these parameters are obtained from the gdo.apps.dd3.js file.
            //BAI: svg is obtained from gdo.apps.dd3.js file.
            var svg = dd3.svgCanvas,
                width = dd3.cave.svgWidth,
                height = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight,
                p = dd3.position("svg", "local", "svg", "global"),
                //BAI: the properties are set in the function "getCaveConfiguration" defined in gdo.apps.dd3.js file.
                c = dd3.browser.column,
                r = dd3.browser.row;

            //console.log('cave svg width is ' + width);

            svg.append('rect')
                .attr("x", p.left(0))
                .attr("y", p.top(0))
                .attr("width", bwidth)
                .attr("height", bheight)
                .attr("stroke", "brown")
                .attr("fill", "#BBB");

            svg.append('g')
                .attr("transform", "translate(20,10)")
                .append('rect')
                .unwatch()
                .attr("x", -20)
                .attr("y", -10)
                .attr("width", width)
                .attr("height", height)
                .attr("stroke", "black")
                .attr("fill", "transparent");

            var circleGroup = svg.append("g").attr("id", "dd3_cg");
            var circleGroupDistributed = svg.append("g").attr("id", "dd3_cgd");

            var rectG = svg.append('g').attr("id", "dd3_rect").append('g');
            var rect;

            var polygonGroupOutter = svg.append('g').attr('id', 'dd3_poly').append('g'),
                polygonGroupInner;

            svg.append("text")
                .unwatch()
                .text([r, c])
                .attr("font-size", 40)
                .attr("dominant-baseline", "text-before-edge")
                .attr("transform", 'translate(' + [p.left(0), p.top(0)] + ')');

            dd3.defineEase("normalEase", d3.easeLinear());

            dd3.defineTween("myTween", function () {
                return function (t) {
                    this.setAttribute("width", t * 500);
                }
            });

            dd3.defineStyleTween("my3Tween", function (d, i, a) {
                var i = d3.interpolate(a, "#AAA");
                return function (t) {
                    return i(t);
                }
            });

            dd3.defineAttrTween("tweenRotation", function (d, i, a) {
                return d3.interpolateString(a, a.replace("rotate(0", "rotate(720"));
            });

            appTestBench.orderController.orders['createRect'] = function () {
                nbr = 1;

                rect = rectG.append('rect');
                rect.attr("x", width / 10)
                    .attr("y", 4.5 * height / 10)
                    .attr("width", width / 10)
                    .attr("height", height / 10)
                    .attr("stroke", "black")
                    .style("fill", "#EEE")
                    .text("None");

                connectToController();
            };

            appTestBench.orderController.orders['removeRect'] = function () {
                nbr = 0;
                rectG.selectAll("rect").remove();
            };

            appTestBench.orderController.orders['createCircles'] = function (number, opacity) {
                nbc += number || 10;

                circleGroup.selectAll(".new").data(d3.range(number || 10)).enter()
                    .append('circle')
                    .attr("class", "c new");

                circleGroup.selectAll(".new")
                    .attr("cx", function () { return width * Math.random(); })
                    .attr("cy", function () { return height * Math.random(); })
                    .attr("r", function () { return 20 * Math.random() + 20; })
                    .attr("stroke", "black")
                    .attr("opacity", opacity || 1)
                    .attr("fill", "#FFF")
                    .classed("new", false);


                connectToController();
            };

            appTestBench.orderController.orders['removeCircles'] = function () {
                nbc = 0;
                circleGroup.selectAll(".c").remove();
            };

            appTestBench.orderController.orders['createDistributedCircles'] = function (number, opacity) {
                //console.log('I will create ' + nbdc+' circles.');
                nbdc += number || 10;
                //console.log('I will create ' + nbdc + ' circles.');
                //console.log('number is ' + number);
                circleGroupDistributed.selectAll(".new").data(d3.range(number || 10)).enter()//.append('g')
                    .append('circle')
                    .attr("class", "c new");

                circleGroupDistributed.selectAll(".new")
                    .attr("cx", function () { return width * Math.random(); })
                    .attr("cy", function () { return height * Math.random(); })
                    .attr("r", function () { return 20 * Math.random() + 20; })
                    .attr("stroke", "black")
                    .attr("opacity", opacity || 1)
                    .attr("fill", "#FFF")
                    .classed("new", false);

                connectToController();

            };

            appTestBench.orderController.orders['removeDistributedCircles'] = function () {
                nbdc = 0;
                circleGroupDistributed.selectAll(".c").remove();
            };

            appTestBench.orderController.orders['createPolygon'] = function () {
                polygonGroupInner = polygonGroupOutter.attr('transform', 'translate(0,0)').append("g");
                polygonGroupInner
                    .append('polygon')
                    .attr("points", "50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180")
                    .attr("transform", "scale(6) translate(-25 -160)")
                    .attr("stroke", "orange")
                    .attr("stroke-width", "4")
                    .attr("fill", "transparent");

                connectToController();
            };

            appTestBench.orderController.orders['removePolygon'] = function () {
                polygonGroupOutter.selectAll('g').remove();
                polygonGroupOutter.transition();
            };

            appTestBench.orderController.orders['startXTranslation'] = function (name) {
                fpss = [];
                triggered = false;
                rect.transition(name)
                    .duration(10000)
                    .style("fill", "#AAA")
                    .attr('x', 8 * width / 10)
                    .text("test")
                    .ease(d3.easeLinear)
                    //.tween('name', 'myTween')
                    //.styleTween('fill', 'my3Tween')
                    .transition(name)
                    .duration(5000)
                    .style("fill", "#EEE")
                    .attr('x', width / 10)
                    .on("end", sendFPSAvg);
            };

            appTestBench.orderController.orders['startYTranslation'] = function (name) {
                fpss = [];
                triggered = false;
                rect.transition(name)
                    .duration(10000)
                    .attr('y', 8 * height / 10)
                    .transition(name)
                    .duration(5000)
                    .attr('y', 4.5 * height / 10)
                    .on("end", sendFPSAvg);
            };

            appTestBench.orderController.orders['startRotation'] = function (name) {
                fpss = [];
                triggered = false;
                rect.transition(name)
                    .duration(3000)
                    .attr('transform', 'rotate(-40)')
                    .transition(name)
                    .duration(3000)
                    .attr('transform', 'rotate(40)')
                    .transition(name)
                    .duration(3000)
                    .attr('transform', 'rotate(0)')
                    .on("end", sendFPSAvg);
            };

            appTestBench.orderController.orders['startMoveCircles'] = function (name) {
                fpss = [];
                triggered = false;
                circleGroup.selectAll(".c")
                    .transition()
                    .duration(15000)
                    .precision(0.05)
                    .attr("cx", function () { return width * Math.random(); })
                    .attr("cy", function () { return height * Math.random(); })
                    .attr("r", function () { return 40 * Math.random() + 20; })
                    .on("end", sendFPSAvg);
            };

            appTestBench.orderController.orders['startMoveDistributedCircles'] = function (name) {
                fpss = [];
                triggered = false;
                circleGroupDistributed.selectAll(".c")
                    .transition()
                    .duration(5000)
                    .precision(0.05)
                    .attr("cx", function () { return width * Math.random(); })
                    .attr("cy", function () { return height * Math.random(); })
                    .attr("r", function () { return 30 * Math.random() + 20; })
                    .on("end", sendFPSAvg);
            };

            appTestBench.orderController.orders['startMovePolygon'] = function () {
                fpss = [];
                triggered = false;
                var pw = 300, ph = 300, n = 50, period = 2;
                var points = d3.range(n + 1).map(function (d) { var x = d * (width - pw) / n; var y = (1 + Math.cos(d / n * 2 * Math.PI * period)) * (height - ph) / 2; return [x, y]; });

                var tr = polygonGroupOutter
                    .transition()
                    .duration(1000)
                    .attr('transform', 'translate(' + points[0][0] + ' ' + points[0][1] + ')');

                points.forEach(function (p) {
                    tr = tr.transition()
                        .duration(200)
                        .ease(d3.easeLinear)
                        .attr('transform', 'translate(' + p[0] + ' ' + p[1] + ')');
                });

                polygonGroupInner
                    .attr('transform', 'rotate(0 ' + [pw / 2, ph / 2] + ')')
                    .transition()
                    .attrTween('transform', 'tweenRotation')
                    .duration(10000)
                    .ease(d3.easeLinear)
                    .on("end", sendFPSAvg);

            };

            /*
            orderController.orders['createDistributedCircles']();
            var f = function () {
                orderController.orders['startMoveDistributedCircles']();
                setTimeout(f, 21000);
            };
            dd3.synchronize(f, 5000);
            */

        },

        //scatterPlot
        '1': function () {
            var xScale, yScale;
            var data, pathData;
            var dataId = "";

            var requestData = function (dim) {
                var extentX = dim.x.max - dim.x.min,
                    extentY = dim.y.max - dim.y.min,
                    coef = 0.05,
                    c = 1;

                var xDomain = [dim.x.min - coef * extentX - c, dim.x.max + coef * extentX + c],
                    yDomain = [dim.y.min - coef * extentY - c, dim.y.max + coef * extentY + c];

                // Setup Scales
                xScale = dd3.scaleLinear().range([0, dd3.cave.svgWidth]).domain(xDomain);
                yScale = dd3.scaleLinear().range([dd3.cave.svgHeight, 0]).domain(yDomain);

                dd3.getPointData('pointData',
                    dataId,
                    function (d) {
                        data = d;
                        draw();
                    },
                    xScale,
                    yScale);

                dd3.getPathData('pathData',
                    dataId,
                    function (d) {
                        pathData = d;
                        draw();
                    },
                    xScale,
                    yScale,
                    ['x'],
                    ['y']);

            };

            var draw = function () {
                if (!data || !pathData)
                    return;

                var svg = dd3.svgCanvas,
                    pathGroup = svg.append("g").attr("id", "dd3_path"),
                    circleGroup = svg.append("g").attr("id", "dd3_circle");

                // Setup Axis
                var xAxis = d3.axisBottom(xScale),
                    yAxis = d3.axisLeft(yScale);

                // x-axis
                svg.append("g")
                    .unwatch()
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + [0, dd3.cave.svgHeight] + ")")
                    .call(xAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("x", dd3.cave.svgWidth)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text("X axis");

                // y-axis
                svg.append("g")
                    .unwatch()
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + [0, 0] + ")")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Y axis");

                // Draw dots
                circleGroup.selectAll(".dot")
                    .data(data)
                    .enter()
                    .append("g")
                    .append("circle")
                    .attr("class", "dot")
                    .attr("cx", function (d) { return xScale(d['x']); })
                    .attr("cy", function (d) { return yScale(d['y']); })
                    .attr("r", 3)
                    .style("fill", function (d, i) { return "black"; })
                    .style("stroke", "red");

                var lineFunction = d3.line()
                    .x(function (d) { return xScale(d['x']); })
                    .y(function (d) { return yScale(d['y']); })
                    .curve(d3.curveMonotoneX);

                //*
                pathGroup.append("path").datum(pathData)
                    .unwatch()
                    .attr("d", lineFunction)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("fill", "none");
                //*/
            };

            appTestBench.orderController.orders['plot'] = function (id) {
                dataId = id;
                data = pathData = null;
                dd3.svgCanvas.selectAll("g").remove();
                dd3.getDataDimensions(dataId, requestData);
            };
        },

        //graphs
        '2': function () {
            var dim, xDomain, xRange, xAxis, yScale, yAxis;
            var svg = dd3.svgCanvas;

            dd3.getDataDimensions('barData',
                function (d) {
                    dim = d
                    var extent = dim.gdp.max - dim.gdp.min, coef = 0.2, c = 0;
                    var yDomain = [0, +dim.gdp.max + coef * extent + c];
                    xDomain = d3.range(dim.length);


                    // Setup x
                    xRange = dd3.scaleBand().range([0, dd3.cave.svgWidth]).padding(0.2);


                    // Setup y
                    yScale = dd3.scaleLinear().range([dd3.cave.svgHeight, 0]);


                    xRange.domain(xDomain);
                    yScale.domain(yDomain);

                    dd3.getBarData('bar', 'barData', draw, xRange, ['gdp']);
                });

            var draw = function (barData) {
                barData.forEach(function (d) { xDomain[d.order] = d.country; });
                xRange.domain(xDomain);

                //  PLOT X AXIS
                //TODO v4: axis doesn't show anymore'
                xAxis = d3.axisBottom(xRange);
                yAxis = d3.axisLeft(yScale);
                console.log(xAxis.scale());
                console.log(xAxis.tickArguments());

                svg.append("g")
                    .unwatch()
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + [0, dd3.cave.svgHeight] + ")")
                    .call(xAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("x", dd3.cave.svgWidth)
                    .attr("y", -6)
                    .style("text-anchor", "middle")
                    .text("Countries");


                //svg.select(".axis").call(d3.axisBottom(x));

                //  PLOT Y AXIS
                svg.append("g")
                    .unwatch()
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + [0, 0] + ")")
                    .call(yAxis)
                    .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("GDP");

                // PLOT BAR
                svg.append("g")
                    .attr("id", "dd3_rect")
                    .selectAll('rect')
                    .data(barData)
                    .enter()
                    .append('rect')
                    .attr('x',
                        function (d) {
                            return xRange(d.country);
                        })
                    .attr('y',
                        function (d) {
                            return (yScale(d.gdp));
                        })
                    .attr('width', xRange.bandwidth())
                    .attr('height',
                        function (d) {
                            return (yScale(0) - yScale(d.gdp));
                        })
                    .attr('fill', 'steelblue')
                    .attr('stroke', 'black')
                    .attr('stroke-width', '2');
            };

            var color = d3.scaleOrdinal(d3.schemeCategory10);
            i = 0;
            //console.log(appTestBench.orderController);
            //console.log(this);
            //console.log(this.orderController);
            appTestBench.orderController.orders['changeValues'] = function (time) {
                var randomGDP = xDomain.map(function () { return dim.gdp.max * Math.random(); });

                svg.selectAll('rect')
                    .transition()
                    .duration(time)
                    .precision(0.1)
                    .attr('fill', function () { return color(i); })
                    .attr({
                        'y': function (d, i) {
                            return (yScale(randomGDP[i]));
                        },
                        'height': function (d, i) {
                            return (yScale(0) - yScale(randomGDP[i]));
                        }
                    });

                i++;
            };
        },

        //handMoving
        '3': function () {
            var w = 682,
                        h = 455;
            var svg = dd3.svgCanvas,
                width = dd3.cave.svgWidth,
                height = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight;
            var max_y = 0;
            var current_y = 0;
            var last_row = 0;

            appTestBench.orderController.orders['createRect'] = function (id, image, w_img, h_img) {
                var rectG = svg.append('g').attr('id', "r" + id);
                var id_int = parseInt(id.substr(1, id.length));
                var col = (id_int - 1) % 5, row = Math.floor((id_int - 1) / 5);
                var offx = (((2 * width / 10) * col) % width) + col;
                var offy = (((2 * height / 10) * row) % height) + row;
                //*
                var inner_rect = rectG.append('rect');
                var w1 = (2 * width / 10) - 2;
                var w = w_img < w1 ? w_img : w1;
                var h1 = (2 * height / 10) - 2, h2 = w * (h_img / w_img);
                var h = h2;


                if (last_row !== row) { // Just changed of row ?
                    current_y = max_y; //set the offset to lower Y
                    max_y = 0;
                    last_row = row;
                    if (row % 5 === 0)
                        current_y = row;
                }

                max_y = max_y > (offy + h1 + row) ? max_y : (offy + h1 + row); //Get max from static layout
                max_y = max_y > (offy + h2 + row) ? max_y : (offy + h2 + row);
                //Get max from static layout with image full height
                max_y = max_y > (current_y + h1 + row) ? max_y : (current_y + h1 + row);
                //Get max from dynamic layout with static image height
                max_y = max_y > (current_y + h2 + row) ? max_y : (current_y + h2 + row);
                //Get max from dynamic layout with image full height

                rectG.attr("transform", "translate(" + [offx, current_y] + ")");


                inner_rect.attr("x", 0)
                    .attr("y", 0)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("fill", "transparent");
                //.attr("stroke", "black");
                //
                rectG.append("image")
                    .attr("xlink:href", image)
                    .attr("x", 0)
                    .attr("y", 0)
                    //.attr("preserveAspectRatio", "none")
                    .attr("width", w)
                    .attr("height", h);
            };

            appTestBench.orderController.orders['moveRect'] = function (id, x, y) {
                var rectG = svg.select("#r" + id);
                rectG.moveToFront();
                rectG.attr("transform", "translate(" + [x * width, y * height] + ")");
            };

            appTestBench.orderController.orders['resizeRect'] = function (id, x, y) {
                var img = svg.select("#r" + id).select("image");
                var r = svg.select("#r" + id).select("rect");
                img.attr("width", x * width).attr("height", y * height);
                r.attr("width", x * width).attr("height", y * height);
                svg.select("#r" + id).moveToFront();
            };

            appTestBench.orderController.orders['delRect'] = function (id) {
                svg.select("g").remove();
                //svg.select("#" + id).remove();
            };

            appTestBench.orderController.orders['delAllRect'] = function () {
                svg.selectAll("g").remove();
            };
        },

        //vizLondonMetro
        '4': function () {

            var svg = dd3.svgCanvas,
                mapGroup = svg.append('g').attr('id', 'dd3_map'),
                clockDiv = d3.select('#clock').unwatch(),
                titleDiv = d3.select('#viz_title').unwatch(),
                cwidth = dd3.cave.svgWidth,
                cheight = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight,
                anim,
                p = dd3.position("svg", "local", "svg", "global"),
                c = dd3.browser.column,
                r = dd3.browser.row;




            clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.70) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");
            titleDiv.text("London Tube").style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

            appTestBench.loadMap = function () {
                var projection = d3.geoMercator()
                    .translate([cwidth / 2, cheight / 2]);

                var zoom = 10;
                var topLeft = [-0.40, 51.76]; // LONG - LAT (of London)
                var bottomRight = [-0.10, 51.34]; // LONG - LAT (of London)

                var style = {
                    earth: {
                        fillColor: "#272a29",
                        strokeColor: "#272a29",
                        strokeSize: 2
                    },
                    water: {
                        /*
                        fillColor : "#384b4c",
                        strokeColor : "#384b4c",
                        strokeSize : 1,
                        //*/
                        riverbank: {
                            fillColor: "#384b4c",
                            strokeColor: "#384b4c",
                            strokeSize: 1
                        },/*
                            ocean: {
                                fillColor: "#384b4c",
                                strokeColor: "#384b4c",
                                strokeSize: 1
                            }//*/
                    },
                    roads: {
                        highway: {
                            strokeColor: "#555",
                            strokeSize: 1.2
                        },
                        major_road: {
                            strokeColor: "#555",
                            strokeSize: 0.7
                        }
                        /*,
                        minor_road : {
                            strokeColor : "#555",
                            strokeSize : 0.7
                        }
                        //*/
                    },
                    landuse: {
                        park: {
                            fillColor: d3.rgb("#cedfad").darker(1)
                        }
                    }
                };

                var args = {
                    topLeftBound: topLeft,
                    bottomRightBound: bottomRight,
                    zoom: zoom,
                    svg: mapGroup,
                    projection: projection,
                    style: style,
                    autoProjection: true
                };

                var callbackTube = function () {
                    tube.loadLines(function () {
                        tube.drawLines(mapGroup, appTestBench.map);
                    });
                };

                var lineNames = ["Northern", "Bakerloo", "Central", "District", "Circle", "HammersmithCity", "Metropolitan", "Piccadilly", "WaterlooCity", "Victoria", "Jubilee"];
                var lineColors = ["black", "#ae6118", "#ed1b2e", "#007229", "#FFDD00", "#f385a1", "#78004C", "#0019A8", "#76d0bd", "#00A0E2", "#8A8C8E"];

                appTestBench.map = mapHandler(args);
                tube = tubeLines(mapGroup, appTestBench.map, lineNames, lineColors);
                //app.map.load(["earth", "water", "landuse", "roads"], callbackTube);
                appTestBench.map.load(["earth", "water", "roads"], callbackTube);
            };

            // TEST ANIMATION
            appTestBench.orderController.orders['launchAnimation'] = appTestBench.launchAnimation = function (entry) {
                if (anim)
                    anim.stop();

                var args = {
                    timeStep: 2000,
                    map: appTestBench.map,
                    tubeLines: tube,
                    clock: clockDiv,
                    entry: entry
                };

                anim = animation(args);
                anim.loadData(function () {
                    anim.init();
                    dd3.synchronize(function () {
                        anim.start();
                    });
                });

            };
            appTestBench.loadMap();
        },

        //vizShanghaiMetro
        '5': function () {

            var svg = dd3.svgCanvas,
                mapGroup = svg.append('g').attr('id', 'dd3_map'),
                clockDiv = d3.select('#clock').unwatch(),
                titleDiv = d3.select('#viz_title').unwatch(),
                cwidth = dd3.cave.svgWidth,
                cheight = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight,
                anim,
                p = dd3.position("svg", "local", "svg", "global"),
                c = dd3.browser.column,
                r = dd3.browser.row;

            //clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");
            titleDiv.text("Shanghai Metro：上海地铁").style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

            appTestBench.loadMap = function () {
                var projection = d3.geoMercator()
                    .translate([cwidth / 2, cheight / 2]);

                var zoom = 11;
                /*
                var topLeft = [121.175589, 31.507919]; // LONG - LAT (of shanghai ) 121.053779, 31.478256
                var bottomRight = [122.000013, 30.866975]; // LONG - LAT (of shanghai) 121.888740, 30.908508
                /*/
                var topLeft = [121.475589, 31.357919]; // LONG - LAT (of shanghai ) 121.053779, 31.478256
                var bottomRight = [121.5, 31.1]; // LONG - LAT (of shanghai) 121.888740, 30.908508
                //*/

                var style = {
                    earth: {
                        fillColor: "#272a29",
                        strokeColor: "#272a29",
                        strokeSize: 2
                    },
                    water: {
                        /*
                        fillColor : "#384b4c",
                        strokeColor : "#384b4c",
                        strokeSize : 1,
                        //*/
                        riverbank: {
                            fillColor: "#384b4c",
                            strokeColor: "#384b4c",
                            strokeSize: 1
                        },/*
                            ocean: {
                                fillColor: "#384b4c",
                                strokeColor: "#384b4c",
                                strokeSize: 1
                            }//*/
                    },
                    roads: {
                        highway: {
                            strokeColor: "#555",
                            strokeSize: 1.2
                        },
                        major_road: {
                            strokeColor: "#555",
                            strokeSize: 0.7
                        }
                        /*,
                        minor_road : {
                            strokeColor : "#555",
                            strokeSize : 0.7
                        }
                        //*/
                    },
                    landuse: {
                        park: {
                            fillColor: d3.rgb("#cedfad").darker(1)
                        }
                    }
                };

                var args = {
                    topLeftBound: topLeft,
                    bottomRightBound: bottomRight,
                    zoom: zoom,
                    svg: mapGroup,
                    projection: projection,
                    style: style,
                    autoProjection: true,
                };

                var callbackTube = function () {
                    tube.loadLines(function () {
                        tube.drawLines(mapGroup, appTestBench.map);
                    });
                };

                var lineNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "16", "Maglev"];
                //var lineColors = ["#CC3333", "#009900", "#FFCC00", "#73418a", "#e232a0", "#ed597e", "#f07f19", "#0066cc", "#00cccc", "#ff99ff", "#5d492b", "#669999", "#cccc00", "#66ccff", "#DEDEDE"];
                var lineColors = ["#e81b38", "#8ac63f", "#fbd005", "#4f2d8b", "#9056a3", "#d7006c", "#f37120", "#009dd8", "#7ac7ea", "#bca8d1", "#7d2030", "#007c65", "#e795c0", "#8ed1c0", "#DEDEDE"];

                appTestBench.map = mapHandler(args);
                tube = tubeLines(mapGroup, appTestBench.map, lineNames, lineColors);
                //map.load(["earth", "water", "landuse", "roads"], callbackTube);
                appTestBench.map.load(["earth", "water", "roads"], callbackTube);
            };

            appTestBench.orderController.orders['launchAnimation'] = appTestBench.launchAnimation = function (entry) {
                if (anim)
                    anim.cleanup();

                clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");

                titleDiv.text(entry == 0 ? "People Entering Stations: 入站人数" : "People Exiting Stations: 出站人数")
                            .style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

                var args = {
                    timeStep: 2000,
                    map: appTestBench.map,
                    tubeLines: tube,
                    clock: clockDiv,
                    entry: entry
                };

                anim = animation(args);
                anim.loadData(function () {
                    anim.init();
                    dd3.synchronize(function () {
                        anim.start();
                    });
                });

            };

            /*
            orderController.orders['startAnimation'] = function () {
                dd3.synchronize(function () {
                    anim.start();
                });
            };

            orderController.orders['pauseAnimation'] = function () {
                anim.stop();
            };

            orderController.orders['cleanupAnimation'] = function () {
                anim.cleanup();
            };

            orderController.orders['createAnimation'] = function () {
                var args = {
                    timeStep: 2000,
                    map: map,
                    tubeLines: tube,
                    clock: clockDiv,
                    entry: 1
                };

                anim = animation(args);
            };

            orderController.orders['initAnimation'] = function () {
                anim.loadData(function () {
                    anim.init();
                });
            };
            //*/

            appTestBench.loadMap();

        },

        //vizShanghaiMetroLinkLoad
        '6': function (configId) {
            switch (configId) {
                case 6:
                    appTestBench.shanghaiViz(2 * 60 * 1000, 1);
                    break;
                case 7:
                    appTestBench.shanghaiViz(6 * 60 * 1000, 3);
                    break;
                case 8:
                    appTestBench.shanghaiViz(20 * 60 * 1000, 10);
                    break;
                case 9:
                    appTestBench.shanghaiViz(30 * 60 * 1000, 15);
                    break;
            }
        },

        //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
        '7': null,

        //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
        '8': null,

        //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
        '9': null,

        //parallelCoordinatesGraph
        '10': function () {
            var dim,
                init_dim,
                xScale = dd3.scale.ordinal().rangePoints([0, dd3.cave.svgWidth], 1),
                line = d3.svg.line(),
                xAxis = d3.svg.axis().orient("left"),
                background,
                foreground,
                dimensions,
                g,
                yScale = {},
                dragging = {},
                svg = dd3.svgCanvas;

            //Way to make a white background, because the main body is unselectable
            svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "black")
                .attr("transform",
                    "translate(" +
                    [
                        -dd3.browser.margin.left + dd3.position('svg', 'local', 'svg', 'global').left(0),
                        -dd3.browser.margin.top + dd3.position('svg', 'local', 'svg', 'global').top(0)
                    ] +
                    ")")


            dd3.getDataDimensions('speedDatingData',
                function (d) {
                    dim = d;

                    //nb_dim=Object.keys(dim).length-1;
                    dimensions = [];
                    for (var key in dim) {
                        if (key !== "length") {
                            dimensions.push(key);
                            yScale[key] = dd3.scale.linear().domain([dim[key].min, dim[key].max])
                                .range([dd3.cave.svgHeight, 0]);
                        }
                    }
                    init_dim = dimensions
                    xScale.domain(dimensions);
                    //TODO: refine the filtering
                    dd3.getData('speedDating', 'speedDatingData', draw);

                });


            var draw = function (data) {
                // Add grey background lines for context.
                background = svg.append("g")
                    .attr("class", "background")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                // Add blue foreground lines for focus.
                foreground = svg.append("g")
                    .attr("class", "foreground")
                    .selectAll("path")
                    .data(data)
                    .enter().append("path")
                    .attr("d", path);

                var drag = d3.behavior.drag()
                    .origin(function (d) { return { x: xScale(d) }; })
                    .on("dragstart",
                        function (d) {
                            dragging[d] = xScale(d);
                            background.attr("visibility", "hidden");
                        })
                    .on("drag",
                        function (d) {
                            dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                            foreground.attr("d", path);
                            dimensions.sort(function (a, b) { return position(a) - position(b); });
                            xScale.domain(dimensions);
                            g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
                        })
                    .on("dragend",
                        function (d) {
                            delete dragging[d];
                            transition(d3.select(this)).attr("transform", "translate(" + xScale(d) + ")");
                            transition(foreground).attr("d", path);
                            background
                                .attr("d", path)
                                .transition()
                                .delay(500)
                                .duration(0)
                                .attr("visibility", null);
                        });

                // Add a group element for each dimension.
                g = svg.selectAll(".dimension")
                    .data(dimensions)
                    .enter().append("g")
                    .attr("class", "dimension")
                    .attr("transform", function (l) { return "translate(" + xScale(l) + ")"; })
                    .call(drag);

                // Add an axis and title.
                g.append("g")
                    .attr("class", "axis")
                    .each(function (l) { d3.select(this).call(xAxis.scale(yScale[l])); })
                    .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .text(function (d) { return d; });

                // Add and store a brush for each axis.
                g.append("g")
                    .attr("class", "brush")
                    .each(function (d) {
                        d3.select(this).call(yScale[d].brush = d3.svg.brush().y(yScale[d])
                            .on("brushstart", brushstart).on("brush", brush));
                        d3.select(this).classed(d.replace(new RegExp(' ', 'g'), ''), true);
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);

                console.log("Drawing Parallel Coordinate graph is done");
            };

            function position(d) {
                var v = dragging[d];
                return v == null ? xScale(d) : v;
            }

            function transition(g) {
                return g.transition().duration(500);
            }

            // Returns the path for a given data point.
            function path(d) {
                return line(dimensions.map(function (p) { return [position(p), yScale[p](d[p])]; }));
            }

            function brushstart() {
                if (d3.event.sourceEvent) d3.event.sourceEvent.stopPropagation();
            }

            // Handles a brush event, toggling the display of foreground lines.
            function brush() {
                var actives = dimensions.filter(function (p) { return !yScale[p].brush.empty(); }),
                    extents = actives.map(function (p) { return yScale[p].brush.extent(); });
                foreground.style("display",
                    function (d) {
                        return actives.every(function (p, i) {
                            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                        })
                            ? null
                            : "none";
                    });
            }

            function updateDimensions(new_dim) {
                //console.log(new_dim);
                /*if(!new_dim) dimensions = ["Id", "Partner Id", "Match", "Partner's decision","Gender", "Partner Age", "Partner Race", "PP Attractiveness", "PP Sincerity", "PP Intelligence", "PP Fun", "PP Ambition", "PP Shared Interest"];
                else dimensions=new_dim;*/
                dimensions = new_dim;
                background.attr("visibility", "hidden");
                //console.log(xScale.domain());
                xScale.domain(dimensions);
                //console.log(xScale.domain());

                transition(g).attr("transform", function (d) { return "translate(" + xScale(d) + ")"; });

                transition(foreground).attr("d", path);
                background.attr("d", path).transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);

            }

            function updateFilter(dim, min, max) {
                var brush = yScale[dim].brush;
                brush.extent([min, max]);
                var rect = dd3.select("." + dim.replace(new RegExp(' ', 'g'), ''));
                brush(rect.transition());
                brush.event(rect.transition().duration(500));
            }

            function resetVisualization() {
                updateDimensions(init_dim);
                dimensions.forEach((dimension) => {
                    updateFilter(dimension, dim[dimension].min, dim[dimension].max);

                });

            }

            appTestBench.orderController.orders['updateDimensions'] = updateDimensions;
            appTestBench.orderController.orders['updateFilter'] = updateFilter;
            appTestBench.orderController.orders['resetVisualization'] = resetVisualization;

        },

        // Shor. dd3 dev environment
        '11': function () {

            appTestBench.orderController.orders['initWorldConfig'] = function (data) {

                console.log('DEBUG: ' + JSON.stringify(data));

                world.config = data;
                console.log("INFO: world config object data received");

                var peerSvrAddr = world.config.peerServerAddress, peerSvrPort = world.config.peerServerPort;
                var peerObject = { host: peerSvrAddr, port: peerSvrPort };
                var peerConn = new Peer(peerObject);
                peerConn.on('open', function (id) {
                    console.log('INFO: connected to peer server - id : ' + id);
                });

                world.config.nodeId = dd3.browser.number;
                world.config.nodeSize = [dd3.browser.svgWidth, dd3.browser.svgHeight];
                world.config.nodeCol = dd3.browser.column;
                world.config.nodeRow = dd3.browser.row;

                console.log('DEBUG: ' + JSON.stringify(world.config));
            };

        },

        // Shor. simple pie chart
        '12': function () {

            var svg = dd3.svgCanvas;
            var width = dd3.cave.svgWidth,
                height = dd3.cave.svgHeight,
                radius = Math.min(width, height) / 2;

            var draw = function (pieData) {
                var color = d3.scaleOrdinal(d3.schemeCategory20c);
                var arc = d3.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(10);
                var pie = d3.pie()
                        .sort(null)
                        .padAngle(.05)
                        .value(function (d) { return +d.gdp; });

                svg = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                var g = svg.append("g")
                    .attr("id", "paths").selectAll(".arc")
                    .data(pie(pieData))
                    .enter().append("g")
                    .attr("class", "arc");
                g.append("path")
                    .attr("d", arc)
                    .style("fill", function (d) { return color(d.country); })
                    .send();
                svg.append("g")
                    .attr("id", "texts").selectAll("text")
                    .data(pie(pieData))
                    .enter()
                    .append("text")
                    .attr("transform", function (d) {
                        var angle = (d.startAngle + d.endAngle) * 90 / Math.PI; return "translate(" + arc.centroid(d) + ")rotate(" + (-(90 - angle) + (angle > 180 ? 180 : 0)) + ")";
                    })
                    .attr("dy", ".35em")
                    .attr("font-size", "1.5em")
                    .style("text-anchor", "middle")
                    .text(function (d) { return d.country; })
                    .send();
            };

            dd3.getPieData('pie', 'pieData', draw , width / 2, height / 2);


            // Shor. CONTROL TEMPLATE

            //appTestBench.orderController.orders['initWorldConfig'] = function (data) {

            //    console.log('DEBUG: ' + JSON.stringify(data));

            //    world.config = data;
            //    console.log("INFO: world config object data received");

            //    var peerSvrAddr = world.config.peerServerAddress, peerSvrPort = world.config.peerServerPort;
            //    var peerObject = { host: peerSvrAddr, port: peerSvrPort };
            //    var peerConn = new Peer(peerObject);
            //    peerConn.on('open', function (id) {
            //        console.log('INFO: connected to peer server - id : ' + id);
            //    });

            //    world.config.nodeId = dd3.browser.number;
            //    world.config.nodeSize = [dd3.browser.svgWidth, dd3.browser.svgHeight];
            //    world.config.nodeCol = dd3.browser.column;
            //    world.config.nodeRow = dd3.browser.row;

            //    console.log('DEBUG: ' + JSON.stringify(world.config));
            //};

        },

        '99': function () {
            var svg = dd3.svgCanvas,
                width = dd3.cave.svgWidth,
                height = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight,
                p = dd3.position("svg", "local", "svg", "global"),
                c = dd3.browser.column,
                r = dd3.browser.row;

            svg.append('rect')
                .attr("x", p.left(0))
                .attr("y", p.top(0))
                .attr("width", bwidth)
                .attr("height", bheight)
                .attr("fill", "#009fe1");

            svg.append("text")
                .unwatch()
                .text([r, c])
                .attr("font-size", 20)
                .attr("dominant-baseline", "text-before-edge")
                .attr("transform", 'translate(' + [p.left(0) + 10, p.top(0) + 10] + ')')
                .attr("font-family", "monospace");

            var eqCounter = 0;

            var localEarthquakeCounter = svg.append("text")
                .unwatch()
                .text("EQ:" + 0)
                .attr("font-size", 20)
                .attr("dominant-baseline", "text-before-edge")
                .attr("transform", 'translate(' + [p.left(0) + 10, p.top(0) + 40] + ')')
                .attr("font-family", "monospace");

            // set up projection and path generator
            var projection = d3.geoEquirectangular()
                .scale(1)
                .translate([0, 0]);

            var path = d3.geoPath()
                .projection(projection);

            // function to get the X or Y of a projected coordinate
            function projectCoordinate(d, index) {
                return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[index];
            }

            // some config for the visualisation
            var cfg = {
                pulseSize: 4
            };

            // set up some scales for the earthquake circles
            var colour = d3.scaleLinear()
                .range(["yellow", "red"]);

            var radius = d3.scaleSqrt()
                .range([0, 7]);

            var mapDistributed = svg.append("g").attr("id", "dd3_map");
            var earthquakesDistributed = svg.append("g").attr("id", "dd3_earthquakes");

            var dateObj = new Date();

            function drawMap(mapData) {
                d3.json(mapData, function(error, world) {
                    if (error) throw error;
                    console.log(topojson.feature(world, world.objects.countries));

                    var land = topojson.feature(world, world.objects.land);

                    // calculate scale and translation to fit map to height/width
                    var b = path.bounds(land),
                        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

                    projection
                        .scale(s)
                        .translate(t);

                    var countries = topojson.feature(world, world.objects.countries).features;

                    mapDistributed.selectAll(".boundary")
                        .data(countries.filter(function(a) {
                            var bounds = path.bounds(a);
                            return (bounds[0][0] >= p.left(0)) &&
                                (bounds[0][0] < p.left(bwidth)) &&
                                (bounds[0][1] >= p.top(0)) &&
                                (bounds[0][1] < p.left(bheight));
                        }))
                    .enter().append("path")
                        .attr("class", "boundary")
                        .attr("d", path)
                        .style("fill", "white")
                        .style("stroke-width", 0.5)
                        .style("stroke", "black")
                });
            }

            function addEarthquakes(earthquakeData, days, time) {

                dateObj.setDate(dateObj.getDate() - days);

                d3.json(earthquakeData, function(error, earthquakes) {
                    if (error) throw error;

                    radius.domain([0, d3.max(earthquakes.features, function(d) {
                        return d.properties.mag;
                    })]);

                    colour.domain(radius.domain());

                    var filteredEarthquakes = earthquakes.features.filter(function(a) {
                        // project coordinates and filter
                        var projC = projection(a.geometry.coordinates);
                        return (projC[0] >= p.left(0)) &&
                                (projC[0] < p.left(bwidth)) &&
                                (projC[1] >= p.top(0)) &&
                                (projC[1] < p.left(bheight));
                    });

                    var setQuakeDelay = function(quakes) {
                        for(var i = 0, max = quakes.length; i < max; i++){
                            var timeDiff = quakes[i].properties.time - dateObj;
                            var timeDiffObj = new Date(timeDiff);
                            // shorten delay
                            quakes[i].delay = Date.parse(timeDiffObj) / 35000;
                        }
                    }

                    setQuakeDelay(filteredEarthquakes);

                    var earthquakeCircles = earthquakesDistributed.selectAll("g")
                        .data(filteredEarthquakes)
                    .enter().append("g");

                    earthquakeCircles.append("circle")
                        .attr("class", "earthquake")
                        .attr("cx", function(d) {
                            return projectCoordinate(d, 0);
                        })
                        .attr("cy", function(d) {
                            return projectCoordinate(d, 1);
                        })
                        .attr("r", 0)
                        .style("fill", function(d) {
                            return colour(d.properties.mag);
                        });

                    earthquakeCircles.append("circle")
                        .attr("class", "pulse")
                        .attr("cx", function(d) {
                            return projectCoordinate(d, 0);
                        })
                        .attr("cy", function(d) {
                            return projectCoordinate(d, 1);
                        })
                        .attr("r", 0)
                        .style("fill", function(d) {
                            return colour(d.properties.mag);
                        });

                    earthquakeCircles.selectAll(".earthquake")
                        .transition()
                        .delay(function(d) {
                            return d.delay;
                        })
                        .duration(1000)
                        .attr("r", function(d) {
                            if(d.properties.mag < 0) {
                                return 0.1;
                            } else {
                                return radius(d.properties.mag);
                            }
                        })
                        .on("end", function() {
                            eqCounter++;
                            localEarthquakeCounter.text("EQ:" + eqCounter);
                        })

                    earthquakeCircles.selectAll(".pulse")
                        .transition()
                        .delay(function(d) {
                            return d.delay;
                        })
                        .duration(2000)
                        .attr("r", function(d) {
                            if(d.properties.mag < 0) {
                                return 0.1 * cfg.pulseSize;
                            } else {
                                return radius(d.properties.mag) * cfg.pulseSize;
                            }
                        })
                        .style('opacity', 0)
                        .remove();

                });
            }

            appTestBench.orderController.orders['loadMap'] = function () {
                drawMap("https://d3js.org/world-50m.v1.json");
            };

            appTestBench.orderController.orders['showEarthquakes'] = function () {
                addEarthquakes("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", 7)
            };
        }

    },

    shanghaiViz : function(timeInterval, agg) {
        var svg = dd3.svgCanvas,
            mapGroup = svg.append('g').attr('id', 'dd3_map'),
            clockDiv = d3.select('#clock').unwatch(),
            titleDiv = d3.select('#viz_title').unwatch(),
            cwidth = dd3.cave.svgWidth,
            cheight = dd3.cave.svgHeight,
            bwidth = dd3.browser.svgWidth,
            bheight = dd3.browser.svgHeight,
            anim,
            p = dd3.position("svg", "local", "svg", "global"),
            c = dd3.browser.column,
            r = dd3.browser.row;

        titleDiv.text("Shanghai Metro：上海地铁").style("display", "").style("left", dd3.position.html.left + "px")
            .style("top", dd3.position.html.top + "px");

        appTestBench.loadMap = function () {
            var projection = d3.geoMercator()
                .translate([cwidth / 2, cheight / 2]);

            var zoom = 11;
            /*
            var topLeft = [121.175589, 31.507919]; // LONG - LAT (of shanghai ) 121.053779, 31.478256
            var bottomRight = [122.000013, 30.866975]; // LONG - LAT (of shanghai) 121.888740, 30.908508
            /*/
            var topLeft = [121.475589, 31.357919]; // LONG - LAT (of shanghai ) 121.053779, 31.478256
            var bottomRight = [121.5, 31.1]; // LONG - LAT (of shanghai) 121.888740, 30.908508
            //*/

            var style = {
                earth: {
                    fillColor: "#272a29",
                    strokeColor: "#272a29",
                    strokeSize: 2
                },
                water: {
                    /*
                    fillColor : "#384b4c",
                    strokeColor : "#384b4c",
                    strokeSize : 1,
                    //*/
                    riverbank: {
                        fillColor: "#384b4c",
                        strokeColor: "#384b4c",
                        strokeSize: 1
                    }, /*
                                ocean: {
                                    fillColor: "#384b4c",
                                    strokeColor: "#384b4c",
                                    strokeSize: 1
                                }//*/
                },
                roads: {
                    highway: {
                        strokeColor: "#555",
                        strokeSize: 1.2
                    },
                    major_road: {
                        strokeColor: "#555",
                        strokeSize: 0.7
                    }
                    /*,
                    minor_road : {
                        strokeColor : "#555",
                        strokeSize : 0.7
                    }
                    //*/
                },
                landuse: {
                    park: {
                        fillColor: d3.rgb("#cedfad").darker(1)
                    }
                }
            };

            var args = {
                topLeftBound: topLeft,
                bottomRightBound: bottomRight,
                zoom: zoom,
                svg: mapGroup,
                projection: projection,
                style: style,
                autoProjection: true,
            };

            var callbackTube = function() {
                tube.loadLines();
            };

            var lineNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "16"];
            var lineColors = [
                "#e81b38", "#8ac63f", "#fbd005", "#4f2d8b", "#9056a3", "#d7006c", "#f37120", "#009dd8",
                "#7ac7ea", "#bca8d1", "#7d2030", "#007c65", "#e795c0", "#8ed1c0", "#DEDEDE"
            ];

            appTestBench.map = mapHandler(args);
            console.log('loadmap', appTestBench.map);
            tube = tubeLines(mapGroup, appTestBench.map, lineNames, lineColors);
            appTestBench.map.load(["earth", "water", "roads"], callbackTube);
        };
        //console.log(appTestBench.orderController);
        //console.log(appTestBench.orderController);
        //console.log(orderController);

        appTestBench.orderController
            .orders['launchAnimation'] = appTestBench.launchAnimation =
            function(dis, outter, widthChanging, widthWithLinkLoad) {
                if (anim)
                    anim.cleanup();

                clockDiv.style("display", "").style("left",
                        ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px")
                    .style("top", dd3.position.html.top + "px");

                titleDiv.html(dis == 0
                        ? "Load on Each Metro Line – Normal: <br />  各地铁线负载 – 正常状况"
                        : "Load on Each Metro Line – Disrupted:  <br /> 各地铁线负载 – 事故状况")
                    .style("display", "").style("left", dd3.position.html.left + "px")
                    .style("top", dd3.position.html.top + "px");

                var args = {
                    timeStep: 1000,
                    map: appTestBench.map,
                    tubeLines: tube,
                    clock: clockDiv,
                    disrupted: dis,
                    aggregate: agg,
                    showOutterLine: outter,
                    timeInterval: timeInterval,
                    widthChanging: widthChanging,
                    widthWithLinkLoad: widthWithLinkLoad
                };
                console.log('orderconotroller',args.map);
                console.log('orderconotroller',appTestBench.map);
                anim = animationLines(args);
                anim.loadData(function() {
                    anim.init();
                    dd3.synchronize(function() {
                        anim.start();
                    });
                });

            };

        appTestBench.loadMap();
    }
};
