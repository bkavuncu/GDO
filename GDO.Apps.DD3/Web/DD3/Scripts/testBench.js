var testBench = {

    //transitions
    '0' : function () {
    

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
        var peerObject = { host: "146.169.32.109", port: 55555 };
        //{ host: "localhost", port: 55555 };
        //{ host: "146.169.32.109", port: 55555 }


        var app_peer = new Peer(peerObject, { label: "(" + r + ", " + c + " ): " });
        var conn_to_controller;

        function connectToController() {
            conn_to_controller = app_peer.connect('idofthecontrollerfordd3');
            conn_to_controller.on('open', function () {
                console.log("Connection with the controller established");
            });
        }

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

        orderController.orders['createRect'] = function () {
            nbr = 1;

            rect = rectG.append('rect');
            rect.attr("x", width / 10)
                .attr("y", 4.5 * height / 10)
                .attr("width", width / 10)
                .attr("height", height / 10)
                .attr("stroke", "black")
                .style("fill", "#EEE")
                .text("None");

            connectToController()
        };

        orderController.orders['removeRect'] = function () {
            nbr = 0;
            rectG.selectAll("rect").remove();
        };

        orderController.orders['createCircles'] = function (number, opacity) {
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

        orderController.orders['removeCircles'] = function () {
            nbc = 0;
            circleGroup.selectAll(".c").remove();
        };

        orderController.orders['createDistributedCircles'] = function (number, opacity) {
            nbdc += number || 10;
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

        orderController.orders['removeDistributedCircles'] = function () {
            nbdc = 0;
            circleGroupDistributed.selectAll(".c").remove();
        };

        orderController.orders['createPolygon'] = function () {
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

        orderController.orders['removePolygon'] = function () {
            polygonGroupOutter.selectAll('g').remove();
            polygonGroupOutter.transition();
        };

        orderController.orders['startXTranslation'] = function (name) {
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

        orderController.orders['startYTranslation'] = function (name) {
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

        orderController.orders['startRotation'] = function (name) {
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

        orderController.orders['startMoveCircles'] = function (name) {
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

        orderController.orders['startMoveDistributedCircles'] = function (name) {
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

        orderController.orders['startMovePolygon'] = function () {
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
    //*/

    },

    //scatterPlot
    '1' : function () {

    },

    //graphs
    '2' : function () {

    },

    //handMoving
    '3' : function () {
    
    },

    //vizLondonMetro
    '4' : function () {
       
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
            r = dd3.browser.row,
            loadMap;




        clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.70) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");
        titleDiv.text("London Tube").style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

        loadMap = function () {
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
                autoProjection: true,
            };

            var callbackTube = function () {
                tube.loadLines(function () {
                    tube.drawLines(mapGroup, map);
                });
            };

            var lineNames = ["Northern", "Bakerloo", "Central", "District", "Circle", "HammersmithCity", "Metropolitan", "Piccadilly", "WaterlooCity", "Victoria", "Jubilee"];
            var lineColors = ["black", "#ae6118", "#ed1b2e", "#007229", "#FFDD00", "#f385a1", "#78004C", "#0019A8", "#76d0bd", "#00A0E2", "#8A8C8E"];

            map = mapHandler(args);
            tube = tubeLines(mapGroup, map, lineNames, lineColors);
            //map.load(["earth", "water", "landuse", "roads"], callbackTube);
            map.load(["earth", "water", "roads"], callbackTube);
        };

        // TEST ANIMATION
        orderController.orders['launchAnimation'] = launchAnimation = function (entry) {
            if (anim)
                anim.stop();

            var args = {
                timeStep: 2000,
                map: map,
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
        loadMap();
    },

    //vizShanghaiMetro
    '5' : function () {
   
        var svg = dd3.svgCanvas,
            mapGroup = svg.append('g').attr('id', 'dd3_map'),
            clockDiv = d3.select('#clock').unwatch(),
            titleDiv = d3.select('#viz_title').unwatch(),
            cwidth = dd3.cave.svgWidth,
            cheight = dd3.cave.svgHeight,
            bwidth = dd3.browser.svgWidth,
            bheight = dd3.browser.svgHeight,
            p = dd3.position("svg", "local", "svg", "global"),
            c = dd3.browser.column,
            r = dd3.browser.row,
            loadMap;

        //clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");
        titleDiv.text("Shanghai Metro：上海地铁").style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

        loadMap = function () {
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
                    tube.drawLines(mapGroup, map);
                });
            };

            var lineNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "16", "Maglev"];
            //var lineColors = ["#CC3333", "#009900", "#FFCC00", "#73418a", "#e232a0", "#ed597e", "#f07f19", "#0066cc", "#00cccc", "#ff99ff", "#5d492b", "#669999", "#cccc00", "#66ccff", "#DEDEDE"];
            var lineColors = ["#e81b38", "#8ac63f", "#fbd005", "#4f2d8b", "#9056a3", "#d7006c", "#f37120", "#009dd8", "#7ac7ea", "#bca8d1", "#7d2030", "#007c65", "#e795c0", "#8ed1c0", "#DEDEDE"];

            map = mapHandler(args);
            tube = tubeLines(mapGroup, map, lineNames, lineColors);
            //map.load(["earth", "water", "landuse", "roads"], callbackTube);
            map.load(["earth", "water", "roads"], callbackTube);
        };

        orderController.orders['launchAnimation'] = launchAnimation = function (entry) {
            if (anim)
                anim.cleanup();

            clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");

            titleDiv.text(entry == 0 ? "People Entering Stations: 入站人数" : "People Exiting Stations: 出站人数")
                        .style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

            var args = {
                timeStep: 2000,
                map: map,
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

        loadMap();
        
    },

    //vizShanghaiMetroLinkLoad
    '6': function (configId) {
       // test_bench['6'] = test_bench['7'] = test_bench['8'] = test_bench['9'] = function (configId) {
            switch (configId) {
                case 6:
                    shanghaiViz(2 * 60 * 1000, 1);
                    break;
                case 7:
                    shanghaiViz(6 * 60 * 1000, 3);
                    break;
                case 8:
                    shanghaiViz(20 * 60 * 1000, 10);
                    break;
                case 9:
                    shanghaiViz(30 * 60 * 1000, 15);
                    break;
            }
        //};

        var shanghaiViz = function (timeInterval, agg) {
            var svg = dd3.svgCanvas,
                mapGroup = svg.append('g').attr('id', 'dd3_map'),
                clockDiv = d3.select('#clock').unwatch(),
                titleDiv = d3.select('#viz_title').unwatch(),
                cwidth = dd3.cave.svgWidth,
                cheight = dd3.cave.svgHeight,
                bwidth = dd3.browser.svgWidth,
                bheight = dd3.browser.svgHeight,
                p = dd3.position("svg", "local", "svg", "global"),
                c = dd3.browser.column,
                r = dd3.browser.row;

            titleDiv.text("Shanghai Metro：上海地铁").style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

            loadMap = function () {
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
                    tube.loadLines();
                };

                var lineNames = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "16"];
                var lineColors = ["#e81b38", "#8ac63f", "#fbd005", "#4f2d8b", "#9056a3", "#d7006c", "#f37120", "#009dd8", "#7ac7ea", "#bca8d1", "#7d2030", "#007c65", "#e795c0", "#8ed1c0", "#DEDEDE"];

                map = mapHandler(args);
                tube = tubeLines(mapGroup, map, lineNames, lineColors);
                map.load(["earth", "water", "roads"], callbackTube);
            };

            orderController.orders['launchAnimation'] = launchAnimation = function (dis, outter, widthChanging, widthWithLinkLoad) {
                if (anim)
                    anim.cleanup();

                clockDiv.style("display", "").style("left", ((dd3.cave.width * 0.85) - dd3.position.html.left) + "px").style("top", dd3.position.html.top + "px");

                titleDiv.html(dis == 0 ? "Load on Each Metro Line – Normal: <br />  各地铁线负载 – 正常状况" : "Load on Each Metro Line – Disrupted:  <br /> 各地铁线负载 – 事故状况")
                            .style("display", "").style("left", dd3.position.html.left + "px").style("top", dd3.position.html.top + "px");

                var args = {
                    timeStep: 1000,
                    map: map,
                    tubeLines: tube,
                    clock: clockDiv,
                    disrupted: dis,
                    aggregate: agg,
                    showOutterLine: outter,
                    timeInterval: timeInterval,
                    widthChanging: widthChanging,
                    widthWithLinkLoad: widthWithLinkLoad
                };

                anim = animationLines(args);
                anim.loadData(function () {
                    anim.init();
                    dd3.synchronize(function () {
                        anim.start();
                    });
                });

            };

            loadMap();
        };
    },

    //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
    '7': null,

    //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
    '8': null,

    //vizShanghaiMetroLinkLoad with different timeInterval and initialized in case '6'
    '9': null,

    //parallelCoordinatesGraph
    '10' : function () {

    }
};