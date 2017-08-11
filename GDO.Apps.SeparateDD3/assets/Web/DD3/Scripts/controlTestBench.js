var controlTestBench = {
    server: null,
    dataset: [],
    numClients: null,
    eventLog:[],
    init: function (server, numClients) {
        this.server = server;
        //this.dataset = dataset;
        this.numClients = numClients;
        //console.log(numClients);
        //console.log(this.numClients);
        //console.log(controlTestBench.numClients);
        //this.eventLog = eventLog;
        //console.log(eventLog);
        this.test_bench['7'] = this.test_bench['6'];
        this.test_bench['8'] = this.test_bench['6'];
        this.test_bench['9'] = this.test_bench['6'];
    },
    test_bench: {


        //BAI: "server" variable is needed in this test_bench
        //BAI: "eventLog" variable is needed in this test_bench
        '0': function() {
            var rect = false, circles = 0, dcircles = 0, polygon = false;

            // == Basic Moves ==

            $('#createRect').click(function () {
                if (!rect) {
                    //BAI: the following commands will be sent by control.cshtml to the app.cshmtl to invoke corresponding commands.
                    //BAI: DD3Q: if sendOrder uses AJAX to send data?
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createRect", []), false);
                    $(".basic_moves .red").removeClass("red").addClass("green");
                    $(this).removeClass("green").addClass("red");
                    rect = true;
                    //console.log(controlTestBench.eventLog);
                    controlTestBench.eventLog.push([new Date().getTime(), "Creating Rectangles"]);
                }
            });

            $('#removeRect').click(function () {
                if (rect) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("removeRect", []), false);
                    $(".basic_moves .green").removeClass("green").addClass("red");
                    $('#createRect').removeClass("red").addClass("green");
                    rect = false;
                    controlTestBench.eventLog.push([new Date().getTime(), "Removing Rectangles"]);
                }
            });

            $('#translationX').click(function () {
                if (rect) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startXTranslation", ['X']), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Starting X Translation"]);
                }
            });

            $('#translationY').click(function () {
                if (rect) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startYTranslation", ['Y']), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Starting Y Translation"]);
                }

            });

            $('#rotation').click(function () {
                if (rect) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startRotation", ['R']), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Starting Rotation"]);
                }
            });

            $('#allMoves').click(function () {
                if (rect) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startXTranslation", ["X"]), false);
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startYTranslation", ["Y"]), false);
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startRotation", ["R"]), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Starting All moves"]);
                }
            });
            $('#createCircles').click(function () {
                if (!circles) {
                    circles = 5;
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createCircles", [circles, 1]), false);
                    $(".superposition.non_distributed .red").removeClass("red").addClass("green");
                    $(this).removeClass("green").addClass("red");
                    $("#spanc").text(circles)
                    controlTestBench.eventLog.push([new Date().getTime(), "Creating Circles"]);
                }
            });

            $('#createDistributedCircles').click(function () {
                if (!dcircles) {
                    dcircles = 1;
                    //BAI: Create distributedcircles means to broadcast the circles to all the connected screen.
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createDistributedCircles", [dcircles, 0.9]), true);
                    $(".superposition.distributed .red").removeClass("red").addClass("green");
                    $(this).removeClass("green").addClass("red");
                    $("#spandc").text(dcircles * controlTestBench.numClients);
                    controlTestBench.eventLog.push([new Date().getTime(), "Creating Distributed Circles"]);
                }
            });

            $('#removeCircles').click(function () {
                if (!!circles) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("removeCircles", []), false);
                    $(".superposition.non_distributed .green").removeClass("green").addClass("red");
                    $('#createCircles').removeClass("red").addClass("green");
                    circles = 0;
                    $("#spanc").text("");
                    controlTestBench.eventLog.push([new Date().getTime(), "Removing Circles"]);
                }
            });

            $('#removeDistributedCircles').click(function () {
                if (!!dcircles) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("removeDistributedCircles", []), true);
                    $(".superposition.distributed .green").removeClass("green").addClass("red");
                    $('#createDistributedCircles').removeClass("red").addClass("green");
                    dcircles = 0;
                    $("#spandc").text("");
                    controlTestBench.eventLog.push([new Date().getTime(), "Removing Distributed Circles"]);
                }
            });


            $("#nbAddCircles").click(function(e) { e.stopPropagation(); });

            $('#addCircles').click(function () {
                var n = +$("#nbAddCircles").val();
                if (circles) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createCircles", [n]), false);
                    $("#spanc").text(circles += n);
                    controlTestBench.eventLog.push([new Date().getTime(), "Adding " + n + " Circles"]);
                }
            });

            $("#nbAddDistributedCircles").click(function(e) { e.stopPropagation(); });

            $('#addDistributedCircles').click(function () {
                var n = +$("#nbAddDistributedCircles").val();
                if(dcircles){
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createDistributedCircles", [n, 0.9]), true);
                    $("#spandc").text((dcircles += n) * controlTestBench.numClients);
                    controlTestBench.eventLog.push([new Date().getTime(), "Adding "+n+" Distributed Circles"]);
                }
            });

            $('#moveCircles').click(function () {
                if(circles){
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startMoveCircles", []), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Moving Circles"]);
                }
            });

            $('#moveDistributedCircles').click(function () {
                if(dcircles){
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startMoveDistributedCircles", []), true);
                    controlTestBench.eventLog.push([new Date().getTime(), "Moving Distributed Circles"]);
                }
            });

            // == Group Transition ==

            $('#createPolygon').click(function () {
                if (!polygon) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createPolygon", []), false);
                    $(".group .red").removeClass("red").addClass("green");
                    $(this).removeClass("green").addClass("red");
                    polygon = true;
                    controlTestBench.eventLog.push([new Date().getTime(), "Creating Polygons"]);
                }
            });

            $('#removePolygon').click(function () {
                if (polygon) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("removePolygon", []), false);
                    $(".group .green").removeClass("green").addClass("red");
                    $('#createPolygon').removeClass("red").addClass("green");
                    polygon = false;
                    controlTestBench.eventLog.push([new Date().getTime(), "Removing Polygons"]);
                }
            });

            $('#movePolygon').click(function () {
                if (polygon) {
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("startMovePolygon", []), false);
                    controlTestBench.eventLog.push([new Date().getTime(), "Moving Polygons"]);
                }
            });

            $('#fps_data').click(function () {
                var csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Row; Column; Rectangles; Circles; Distributed Circles; Timestamp; Average FPS; Standard Deviation FPS \n";
                controlTestBench.dataset.forEach(function (infoArray, index) {
                    dataString = infoArray.join(";");
                    csvContent += index < controlTestBench.dataset.length ? dataString + "\n" : dataString;
                });
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "fps_data.csv");
                link.click();
            });

            $('#event_data').click(function () {
                var csvContent = "data:text/csv;charset=utf-8,";
                controlTestBench.eventLog.forEach(function (infoArray, index) {
                    dataString = infoArray.join(",");
                    csvContent += index < controlTestBench.eventLog.length ? dataString + "\n" : dataString;
                });
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "event_data.csv");
                link.click();
            });
        },
        //BAI: "server" variable is needed in this test_bench
        '1': function () {
            var dataIds = ["scatterplot33", "scatterplot100", "scatterplot500", "scatterplot1000", "scatterplot4000", "scatterplot20000"];
            var table = $("#control_1 table");
            var send = function(value) {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("plot", [value]), true);
            };

            dataIds.forEach(function(d) {
                table.append('<tr><td>' + d + '</td></tr>');
                table.find("tr:last td").addClass('green').click(send.bind(null, d));
            });
        },
        //BAI: "server" variable is needed in this test_bench
        '2': function () {
            $("#changeValues").click(function () {
                var n = +$("#timeTr").val();
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("changeValues", [n]), true);
            });
        },
        //BAI: "d3" varibale is needed. But d3 is from this other script.
        //BAI: "server" variable is needed in this test_bench
        '3': function () {
            var id = 0;
            var previous;
            var timeout = -1;
            var sensibility = 100;
            var pos = {};
            var posC = {};
            var wr = 1400, hr = 600;
            var selected = "";

            d3.select("#control_3").selectAll("svg").remove();
            var svg = d3.select("#control_3").append("svg").attr("width", wr + "px").attr("height", hr + "px");

            svg.append("rect").attr("x", 0)
                .attr("y", 0)
                .attr("width", wr + "px")
                .attr("height", hr + "px")
                .attr("stroke", "black")
                .style("fill", "#EEE")
                .on("click", function () {
                    selected !== "" ? d3.select("#" + selected + " rect").style("fill", "#EEE") : false;
                    selected = "";
                });

            var g = svg.append("g");

            var moveRect = function () {
                var o = controlTestBench.order("moveRect", [this.parentElement.id, (d3.mouse(g.node())[0] + pos.x) / wr, (d3.mouse(g.node())[1] + pos.y) / hr]),
                    tr = [d3.mouse(g.node())[0] + pos.x, d3.mouse(g.node())[1] + pos.y];

                var move = function () {
                    controlTestBench.server.sendOrder(instanceId, o, false);
                    previous = Date.now();
                };

                d3.select(this.parentElement).attr("transform", "translate(" + tr + ")");
                clearTimeout(timeout);
                timeout = setTimeout(move, Math.max(0, sensibility - (Date.now() - previous)));
            };

            var resizeRect = function () {
                var x = Math.max(d3.mouse(this)[0], 0),
                    y = Math.max(0, d3.mouse(this)[1]),
                    o = controlTestBench.order("resizeRect", [this.parentElement.id, x / wr, y / hr]);

                var resize = function () {
                    controlTestBench.server.sendOrder(instanceId, o, false);
                    previous = Date.now();
                };

                d3.select(this.parentElement).select('rect').attr("width", x).attr("height", y);
                d3.select(this).attr("cx", x).attr("cy", y);
                clearTimeout(timeout);
                timeout = setTimeout(resize, Math.max(0, sensibility - (Date.now() - previous)));
            };


            var delRect = function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("delRect", [this.id]), false);
                d3.select(this).remove();
            };

            var drag = d3.drag();
            var dragC = d3.drag();
            drag.on("drag", function () {
                moveRect.call(this);
            });
            drag.on("start", function () {
                console.log('move');
                console.log(this);
                d3.select(this.parentElement).moveToFront();
                var t = d3.transform(d3.select(this.parentElement).attr("transform")).translate;
                previous = Date.now();
                pos.x = t[0] - d3.mouse(g.node())[0];
                pos.y = t[1] - d3.mouse(g.node())[1];
            });
            dragC.on("drag", function () {
                resizeRect.call(this);
            });
            dragC.on("start", function () {
                console.log('resize');
                console.log(this);
                d3.select(this.parentElement).moveToFront();
                var t = d3.transform(d3.select(this.parentElement).attr("transform")).translate;
                previous = Date.now();
                posC.x = t[0] - d3.mouse(g.node())[0];
                posC.y = t[1] - d3.mouse(g.node())[1];
            });

            var createHostedRect = function (url) {

                var that = this;
                var img = new Image();
                img.onload = function () {
                    console.log(this.width + 'x' + this.height);

                    id++;
                    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createRect", ['d' + id, url, this.width, this.height]), false);
                    //Custom offset that stays in bounds and translate image on x&y according to ID
                    var col = (id - 1) % 5, row = Math.floor((id - 1) / 5);
                    var offx = (((2 * wr / 10) * col) % wr) + col;
                    var offy = (((2 * hr / 10) * row) % hr) + row;
                    var rg = g.append("g").attr("id", "d" + id).classed("r", true).attr("transform", "translate(" + [offx, offy] + ")");
                    var r = rg.append("rect").attr("x", 0)
                        .attr("y", 0)
                        .attr("width", (2 * wr / 10) - 2)
                        .attr("height", (2 * hr / 10) - 2)
                        .attr("stroke", "black")
                        .attr("fill", "#EEE")
                        .call(drag, this)
                        .on("click", function () {
                            selected !== "" ? d3.select("#" + selected + " rect").style("fill", "#EEE") : false;
                            selected = this.parentElement.id;
                            d3.select(this).style("fill", "#FDD1FD");
                        });

                    rg.append("circle").attr("cx", wr * 2 / 10)
                        .attr("cy", hr * 2 / 10)
                        .attr("r", 20)
                        .attr("stroke", "transparent")
                        .attr("fill", "rgba(252,231,31,0.5)")
                        .call(dragC, that);
                }
                img.src = url;


            };

            var createLocalRect = function (name, fileobj) {
                id++;
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("createRect", ['d' + id, "\\Web\\Images\\images\\" + name]), false);

                //Custom offset that stays in bounds and translate image on x&y according to ID
                var col = (id - 1) % 5, row = Math.floor((id - 1) / 5);
                var offx = (((2 * wr / 10) * col) % wr) + col;
                var offy = (((2 * hr / 10) * row) % hr) + row;
                var rg = g.append("g").attr("id", "d" + id).classed("r", true).attr("transform", "translate(" + [offx, offy] + ")");
                var r = rg.append("rect").attr("x", 0)
                    .attr("y", 0)
                    .attr("width", (2 * wr / 10) - 2)
                    .attr("height", (2 * hr / 10) - 2)
                    .attr("stroke", "black")
                    .attr("fill", "#EEE")
                    .call(drag, this)
                    .on("click", function () {
                        selected !== "" ? d3.select("#" + selected + " rect").style("fill", "#EEE") : false;
                        selected = this.parentElement.id;
                        d3.select(this).style("fill", "#FDD1FD");
                    });

                rg.append("circle").attr("cx", wr * 2 / 10)
                    .attr("cy", hr * 2 / 10)
                    .attr("r", 20)
                    .attr("stroke", "transparent")
                    .attr("fill", "rgba(252,231,31,0.5)")
                    .call(dragC, this);
            };

            $('#fileSelectButton').on('click', function (event) {
                event.preventDefault();
                var urlval = $('#fileSelect').val();
                createHostedRect(urlval);
            }); //End handler onclick input

            $('#allFileSelectButton').on('click', function (event) {
                event.preventDefault();
                $('#fileSelect > option').each(function () {
                    createHostedRect(this.value);
                });
            }); //End handler onclick input

            $('#addUrl').click(function () {
                var urlval = $('#inputUrl').val();
                if (urlval === "") {
                    $('#inputUrl').val('https://upload.wikimedia.org/wikipedia/commons/6/65/Kochsim.gif');
                    return;
                }
                createHostedRect(urlval);
            });

            $("#addRect").click(function () {
                createHostedRect('illustration.png');
            });

            $("#sens").change(function () {
                sensibility = +this.value;
            });


            $("#removeAllRect").click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("delAllRect", []), true);
                d3.selectAll('g.r').remove();
                id = 0;
            });

            controlTestBench.server.sendOrder(instanceId, controlTestBench.order("delAllRect", []), true);
        },
        //BAI: "server" variable is needed in this test_bench
        '4': function () {
            $('#launchEntryAnimationLondon').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [0]), true);
            });

            $('#launchExitAnimationLondon').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [1]), true);
            });
        },
        //BAI: "server" variable is needed in this test_bench
        '5': function () {
            $('#launchEntryAnimationShanghai').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [0]), true);
            });

            /*
            $('#cleanupAnimationShanghai').click(function () {
                server.sendOrder(instanceId, order("cleanupAnimation", []), true);
            });

            $('#pauseAnimationShanghai').click(function () {
                server.sendOrder(instanceId, order("pauseAnimation", []), true);
            });

            $('#startAnimationShanghai').click(function () {
                server.sendOrder(instanceId, order("startAnimation", []), true);
            });

            $('#initAnimationShanghai').click(function () {
                server.sendOrder(instanceId, order("initAnimation", []), true);
            });

            $('#createAnimationShanghai').click(function () {
                server.sendOrder(instanceId, order("createAnimation", []), true);
            });
            //*/

            $('#launchExitAnimationShanghai').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [1]), true);
            });
        },
        //BAI: "server" variable is needed in this test_bench
        '6': function () {
            var cb = $('#outterCheckbox');
            var cb2 = $('#widthChangingCheckbox');
            var cb3 = $('#widthChangingLinkLoadCheckbox');

            $('#launchNormalAnimationShanghaiLines').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [0, cb.prop("checked"), cb2.prop("checked"), cb3.prop("checked")]), true);
            });

            $('#launchDisruptedAnimationShanghaiLines').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("launchAnimation", [1, cb.prop("checked"), cb2.prop("checked"), cb3.prop("checked")]), true);
            });
        },
        '7': null,
        '8': null,
        '9': null,
        //Parallel Coordinates Graph Control
        //BAI: "server" variable is needed in this test_bench
        '10': function () {
            /*var raw_dim, dimensions;
            dd3.getDataDimensions('speedDatingData', function(d){
                raw_dim=d;
                dimensions=[];
                for(var key in dim){
                    if(key !== "length"){
                        dimensions.push(key);
                    }
                }
                $("#dimension_list").val(dimensions.join());
            });*/

            $("#dimension_list").click(function (e) { e.stopPropagation(); });

            $('#updim').click(function () {
                var dimensions = $("#dimension_list").val().split(",");
                console.log(dimensions);
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("updateDimensions", [dimensions]), true);
            });

            $("#attr").click(function (e) { e.stopPropagation(); });
            $("#min").click(function (e) { e.stopPropagation(); });
            $("#max").click(function (e) { e.stopPropagation(); });

            $('#upfilter').click(function () {
                var attrib = $("#attr").val();
                var min = $("#min").val();
                var max = $("#max").val();
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("updateFilter", [attrib, min, max]), true);
            });

            $('#resetviz').click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("resetVisualization", []), true);
            });


        },

        // Shor. dd3 dev environment
        '11': function () {

            $("#dd3-start").click(function () {

                world.config.configId = 11;
                // world.config.nodeId = 1;
                world.config.configSize = [3000, 4000];
                // world.config.nodeSize = [100, 100];
                world.config.peerServerAddress = "146.169.32.109";
                world.config.peerServerPort = "55555";
                world.config.peerGroupId = "G1";
                // world.config.nodeCol = 0;
                // world.config.nodeRow = 0;
                // world.config.isMaster = true;

                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("initWorldConfig", [world.config]), true);
            });

        },

        // Shor. simple pie chart
        '12': function () {

            // Shor. CONTROL TEMPLATE

            //$("#dd3-start").click(function () {

            //    world.config.configId = 11;
            //    // world.config.nodeId = 1;
            //    world.config.configSize = [3000, 4000];
            //    // world.config.nodeSize = [100, 100];
            //    world.config.peerServerAddress = "146.169.32.109";
            //    world.config.peerServerPort = "55555";
            //    world.config.peerGroupId = "G1";
            //    // world.config.nodeCol = 0;
            //    // world.config.nodeRow = 0;
            //    // world.config.isMaster = true;

            //    controlTestBench.server.sendOrder(instanceId, controlTestBench.order("initWorldConfig", [world.config]), true);
            //});

        },

        '99': function () {
            $("#start-anim").click(function () {
                controlTestBench.server.sendOrder(instanceId, controlTestBench.order("loadMap", []), true);
            });
        }

    },
    order: function (name, args) {
        return JSON.stringify({ name: name, args: args });
    }

};
