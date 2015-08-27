$(function () {
    var self = this;
    var hub = $.connection.timeVAppHub;
    var app = $.connection.timeVAppHub.client;
    var gdo = typeof (gdo) == 'undefined' ? parent.gdo : gdo;
    self.stamp = null;
    self.data = null;
    self.x_accessor = null;
    self.query_mode = null;

    $.connection.timeVAppHub.client.prepareVisualisation = function (nodeId, timeStamp, mode, accessor) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.clientId == nodeId) {
            self.stamp = timeStamp;
            self.x_accessor = accessor;
            self.query_mode = mode;
            var doc = $("iframe").contents();
            doc.find("#placeholder").append('<p>preparing</p>');
        }
    }

    $.connection.timeVAppHub.client.visualise = function (nodeId, timeStamp, data, title) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' function visualise: ' + nodeId);

            if (gdo.clientId == nodeId) {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                var doc = $("iframe").contents();
                doc.find("#placeholder").append('<p>data received, visualising...</p>');                

                if (self.query_mode == 'Aggregation') {
                    makeGraph("#graph", 'line', data, "visualisation", '#lengnd');
                } else if (self.query_mode == 'Statistics') {
                    makeTable('#graph', data, "results")
                } else {
                    alert("Unkown query mode");
                }
                doc.find("#placeholder").removeClass("show");
                doc.find("#placeholder").addClass("hidden");
            } else {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
            }
        }
    }

    $.connection.timeVAppHub.client.dispose = function (nodeId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (gdo.clientId == nodeId) {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                var doc = $("iframe").contents();
                doc.find("#graph").html('');
                doc.find("#y_axis").html('');
                doc.find("#legend").html('');
                doc.find("#placeholder").html('<p>Pending data...</p>')

                doc.find("#placeholder").removeClass("hidden");
                doc.find("#placeholder").addClass("show");
            } else {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
            }
        }
    }

    $.connection.timeVAppHub.client.reload = function (nodeId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.clientId == nodeId) {
            location.reload();
        }
    }

    makeTable = function (target, data, title) {
        var frameWindow = document.getElementsByName("app_frame_content")[0].contentWindow;
        var MG = typeof (MG) == 'undefined' ? frameWindow.MG : MG;
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
        debugger;
        var keys = Object.keys(data[0]);
        for (var i = 0; i < keys.length; i++) {
            var col = new frameWindow.Object();
            col.accessor = keys[i];
            col.label = keys[i];
            col.width = Math.round($(document).width() / keys.length);
            table.text(col);
        }

        table.display();
    }

    makeGraph = function (target, style, series, title, legend, width, height) {
        var frameWindow = document.getElementsByName("app_frame_content")[0].contentWindow;
        var MG = typeof (MG) == 'undefined' ? frameWindow.MG : MG;
        // using the frame's constructor for MG's instanceof check
        series = frameWindow.JSON.parse(series);

        var w = typeof (width) == 'undefined' ? 540 : width;
        var h = typeof (height) == 'undefined' ? 240 : height;

        var keys = Object.keys(series[0]);
        var index = keys.indexOf(self.x_accessor);
        if (index >= 0) {
            keys.splice(index, 1);
        }

        var time_format = "%Y-%m-%d %H:%M:%S";
        if (series.length != 0) {
            var length = series[0][self.x_accessor].length;
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

        series = MG.convert.date(series, self.x_accessor, time_format);

        MG.data_graphic({
            title: title,
            description: "Visualisation",
            data: series,
            width: w,
            height: h,
            target: target,
            legend: keys,
            legend_target: "#legend",
            x_accessor: self.x_accessor,
            y_accessor: keys,
            interpolate: "monotone",
            full_width: true,
            full_height: true,
            brushing: false,
            brushing_history: false,
            missing_is_hidden: true
        });
    }

    //var d =  [
    //  {
    //      "year": "1945",
    //      "sightings": 6
    //  },
    //  {
    //      "year": "1946",
    //      "sightings": 8
    //  },
    //  {
    //      "year": "1947",
    //      "sightings": 34
    //  },
    //  {
    //      "year": "1948",
    //      "sightings": 8
    //  },
    //  {
    //      "year": "1949",
    //      "sightings": 15
    //  },
    //  {
    //      "year": "1950",
    //      "sightings": 25
    //  },
    //  {
    //      "year": "1951",
    //      "sightings": 20
    //  },
    //  {
    //      "year": "1952",
    //      "sightings": 48
    //  },
    //  {
    //      "year": "1953",
    //      "sightings": 34
    //  },
    //  {
    //      "year": "1954",
    //      "sightings": 50
    //  },
    //  {
    //      "year": "1955",
    //      "sightings": 31
    //  },
    //  {
    //      "year": "1956",
    //      "sightings": 38
    //  },
    //  {
    //      "year": "1957",
    //      "sightings": 67
    //  },
    //  {
    //      "year": "1958",
    //      "sightings": 40
    //  },
    //  {
    //      "year": "1959",
    //      "sightings": 47
    //  },
    //  {
    //      "year": "1960",
    //      "sightings": 64
    //  },
    //  {
    //      "year": "1961",
    //      "sightings": 39
    //  },
    //  {
    //      "year": "1962",
    //      "sightings": 55
    //  },
    //  {
    //      "year": "1963",
    //      "sightings": 75
    //  },
    //  {
    //      "year": "1964",
    //      "sightings": 77
    //  },
    //  {
    //      "year": "1965",
    //      "sightings": 167
    //  },
    //  {
    //      "year": "1966",
    //      "sightings": 169
    //  },
    //  {
    //      "year": "1967",
    //      "sightings": 178
    //  },
    //  {
    //      "year": "1968",
    //      "sightings": 183
    //  },
    //  {
    //      "year": "1969",
    //      "sightings": 138
    //  },
    //  {
    //      "year": "1970",
    //      "sightings": 126
    //  },
    //  {
    //      "year": "1971",
    //      "sightings": 110
    //  },
    //  {
    //      "year": "1972",
    //      "sightings": 146
    //  },
    //  {
    //      "year": "1973",
    //      "sightings": 209
    //  },
    //  {
    //      "year": "1974",
    //      "sightings": 241
    //  },
    //  {
    //      "year": "1975",
    //      "sightings": 279
    //  },
    //  {
    //      "year": "1976",
    //      "sightings": 246
    //  },
    //  {
    //      "year": "1977",
    //      "sightings": 239
    //  },
    //  {
    //      "year": "1978",
    //      "sightings": 301
    //  },
    //  {
    //      "year": "1979",
    //      "sightings": 221
    //  },
    //  {
    //      "year": "1980",
    //      "sightings": 211
    //  }
    //]

    //if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
    //    app.visualise(1, 'dummy', d, 'dummy title')
    //}


});