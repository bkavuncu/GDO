var TimeV = TimeV || {};

$(function() {
    TimeV.app = this;
    var gdo = typeof (gdo) == "undefined" ? parent.gdo : gdo;
    TimeV.app.stamp = null;
    TimeV.app.data = null;
    TimeV.app.x_accessor = null;
    TimeV.app.query_mode = null;

    $.connection.timeVAppHub.client.prepareVisualisation = function(nodeId, timeStamp, mode, accessor) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.clientId == nodeId) {
            TimeV.app.stamp = timeStamp;
            TimeV.app.x_accessor = accessor;
            TimeV.app.query_mode = mode;
            var doc = $("iframe").contents();
            doc.find("#placeholder").removeClass("show");
            doc.find("#placeholder").addClass("hidden");
            doc.find("#processing").removeClass("hidden");
            doc.find("#processing").addClass("show");
        }
    };

    $.connection.timeVAppHub.client.visualise = function(nodeId, timeStamp, data, title) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut(".TIMEV", 1, "Instance - " + gdo.clientId + " function visualise: " + nodeId);
            if (gdo.clientId == nodeId) {
                gdo.consoleOut(".TIMEV", 1, "Instance - " + gdo.clientId + " visualising");
                var doc = $("iframe").contents();
                TimeV.app.data = JSON.parse(data);
                if (TimeV.app.query_mode == "Aggregation") {
                    if (TimeV.app.data.length < 2) {
                        TimeV.makeTable("#graph", data, TimeV.makeTitle(TimeV.app.data));
                    } else {
                        TimeV.makeGraph("#graph", "line", data, TimeV.makeTitle(TimeV.app.data), "#lengnd");
                    }
                } else if (TimeV.app.query_mode == "Statistics") {
                    TimeV.makeTable("#graph", data, "results");
                } else if (TimeV.app.query_mode == "Custom") {
                    if (TimeV.app.data.length < 2) {
                        TimeV.makeTable("#graph", data, TimeV.makeTitle(TimeV.app.data));
                    } else {
                        TimeV.makeGraph("#graph", "custom", data, TimeV.makeTitle(TimeV.app.data), "#lengnd");
                    }
                } else {
                    alert("Unkown query mode");
                }
                doc.find("#placeholder").removeClass("show");
                doc.find("#placeholder").addClass("hidden");
                doc.find("#header").removeClass("show");
                doc.find("#header").addClass("hidden");
                doc.find("#processing").removeClass("show");
                doc.find("#processing").addClass("hidden");
                doc.find("#visualisation").removeClass("hidden");
                doc.find("#visualisation").addClass("show");
                doc.find("#dataholder").html("<p>" + JSON.stringify(JSON.parse(data)) + "</p>");
            } else {
                gdo.consoleOut(".TIMEV", 1, "Instance - " + gdo.clientId + " ignoring request for " + nodeId);
            }
        }
    };

    $.connection.timeVAppHub.client.dispose = function(nodeId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (gdo.clientId == nodeId) {
                gdo.consoleOut(".TIMEV", 1, "Instance - " + gdo.clientId + " visualising");
                var doc = $("iframe").contents();

                doc.find("#visualisation").removeClass("show");
                doc.find("#visualisation").addClass("hidden");
                doc.find("#placeholder").removeClass("hidden");
                doc.find("#placeholder").addClass("show");
                doc.find("#header").removeClass("hidden");
                doc.find("#header").addClass("show");
                doc.find("#graph").html("");
                doc.find("#y_axis").html("");
                doc.find("#legend").html("");
                doc.find("#dataholder").html("");
            } else {
                gdo.consoleOut(".TIMEV", 1, "Instance - " + gdo.clientId + " ignoring request for " + nodeId);
            }
        }
    };

    $.connection.timeVAppHub.client.reload = function(nodeId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.clientId == nodeId) {
            location.reload();
        }
    };
    TimeV.makeTable = function(target, data, title) {
        var frameWindow = document.getElementsByName("app_frame_content")[0].contentWindow;
        var MG = typeof (MG) == "undefined" ? frameWindow.MG : MG;
        // using the frame's constructor for MG's instanceof check
        data = frameWindow.JSON.parse(data);

        var table = MG.data_table({
                title: title,
                description: "Query Results",
                data: data,
                show_tooltips: true,
                full_width: true
            })
            .target(target);
        var keys = Object.keys(data[0]);
        for (var i = 0; i < keys.length; i++) {
            var col = new frameWindow.Object();
            col.accessor = keys[i];
            col.label = keys[i];
            col.width = Math.round($(document).width() / keys.length);
            table.text(col);
        }

        table.display();
    };

    TimeV.makeGraph = function(target, style, series, title, legend, width, height) {
        var frameWindow = document.getElementsByName("app_frame_content")[0].contentWindow;
        var MG = typeof (MG) == "undefined" ? frameWindow.MG : MG;
        // using the frame's constructor for MG's instanceof check
        series = frameWindow.JSON.parse(series);

        var w = typeof (width) == "undefined" ? 540 : width;
        var h = typeof (height) == "undefined" ? 240 : height;

        var keys = Object.keys(series[0]);
        var index = keys.indexOf(TimeV.app.x_accessor);
        if (index >= 0) {
            keys.splice(index, 1);
        }

        var time_format = "%Y-%m-%d %H:%M:%S";
        if (series.length != 0) {
            var length = series[0][TimeV.app.x_accessor].length;
            if (length == 4) {
                time_format = time_format.substring(0, 2);
            } else if (length == 7) {
                time_format = time_format.substring(0, 5);
            } else if (length == 10) {
                time_format = time_format.substring(0, 8);
            } else if (length == 13) {
                time_format = time_format.substring(0, 11);
            } else if (length == 16) {
                time_format = time_format.substring(0, 14);
            } else if (length == 19) {
                time_format = time_format.substring(0, 17);
            }
        }

        if (style != "custom") {
            series = MG.convert.date(series, TimeV.app.x_accessor, time_format);
        }

        MG.data_graphic({
            title: title,
            description: "Visualisation",
            data: series,
            width: w,
            height: h,
            target: target,
            legend: keys,
            legend_target: "#legend",
            x_accessor: TimeV.app.x_accessor,
            y_accessor: keys,
            interpolate: "monotone",
            full_width: true,
            full_height: true,
            brushing: (keys.length < 2),
            brushing_history: (keys.length < 2),
            missing_is_hidden: (keys.length < 2)
        });
    };

    TimeV.makeTitle = function(data) {
        var keys = Object.keys(data[0]);
        var index = keys.indexOf(TimeV.app.x_accessor);
        if (index >= 0) {
            keys.splice(index, 1);
        }

        var title = keys.join(", ");

        if (TimeV.app.x_accessor != "All" && TimeV.app.x_accessor != "") {
            title += " per " + TimeV.app.x_accessor;
        }

        return title;
    };
});