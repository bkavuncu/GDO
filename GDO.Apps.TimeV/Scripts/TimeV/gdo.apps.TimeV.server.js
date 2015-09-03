var TimeV = TimeV || {};
var hub = $.connection.timeVAppHub;
var gdo = typeof (gdo) == "undefined" ? parent.gdo : gdo;

TimeV.ControlViewModel = function() {
    function Task(data) {
        this.nodeId = ko.observable(data.nodeId);
        this.query = ko.observable(data.query);
        this.x_accessor = ko.observable(data.x_accessor);
    }

    function DataField(name, type) {
        this.name = name;
        this.type = type;
        this.fullName = name + "(" + type + ")";
        this.method = null;
    }

    function Method(name, signature) {
        this.name = name;
        this.signature = signature;
    }

    var self = this;

    self.appData = {
        newNodeId: ko.observable(),
        newQuery: ko.observable(),
        customXAccessor: ko.observable(),
        RuningVisualisations: ko.observableArray([]),
        availableModes: ko.observableArray(["Aggregation", "Statistics", "Custom"]),
        selectedMode: ko.observable("Aggregation"),
        availableMethods: ko.observableArray([
            new Method("Average", "AVG"),
            new Method("Count", "COUNT"),
            new Method("Max", "MAX"),
            new Method("Min", "MIN"),
            new Method("Sum", "SUM")
        ]),
        selectedMethod: ko.observable(),
        availableFilelds: ko.observableArray([
            new DataField("node", "long"),
            new DataField("record_id", "long"),
            new DataField("user", "string"),
            new DataField("created", "timestamp"),
            new DataField("seq_no", "long"),
            new DataField("node_time", "long"),
            new DataField("system_time", "long"),
            new DataField("time_stamp", "timestamp"),
            new DataField("cpu_power", "double"),
            new DataField("lpm_power", "double"),
            new DataField("listen_power", "double"),
            new DataField("transmit_power", "double"),
            new DataField("average_power", "double"),
            new DataField("temperature", "double"),
            new DataField("battery_voltage", "double"),
            new DataField("battery_indicator", "double"),
            new DataField("radio_intensity", "double"),
            new DataField("latency", "double"),
            new DataField("humidity", "double"),
            new DataField("light1", "double"),
            new DataField("light2", "double"),
            new DataField("best_neighbour_id", "double"),
            new DataField("best_neighbour_etx", "double"),
            new DataField("sink", "long"),
            new DataField("is_duplicate", "boolean"),
            new DataField("hops", "long")
        ]),
        selectedField: ko.observable(),
        selectedFields: ko.observableArray([]),
        availableTimeInterval: ["All", "Year", "Month", "Day", "Hour", "Minute", "Second"],
        selectedTimeInterval: ko.observable("All"),
        availableNodes: ko.observableArray([]),
        datetimepickerFrom: undefined,
        datetimepickerTo: undefined,
        customCondition: ko.observable(),
        customQuery: ko.observable()
    };

    if (!gdo) {
        self.appData.availableNodes(["1", "2", "3"]);
    } else {
        var nodes = [];
        var nodeMap = gdo.net.section[gdo.clientId].nodeMap;

        for (var i = 0; i < nodeMap.length; i++) {
            var col = nodeMap[i];
            for (var j = 0; j < col.length; j++) {
                nodes.push(col[j]);
            }
        }

        nodes.sort(function(a, b) { return a - b; });
        self.appData.availableNodes(nodes);
    }

    self.appData.newNodeId(self.appData.availableNodes()[0]);
    self.appData.selectedField(self.appData.availableFilelds()[0]);
    self.appData.selectedMethod(self.appData.availableMethods()[0]);
    self.appData.sampleQueries = [
        {
            query: "SELECT SUBSTRING(time_stamp, 1, 13) AS Hour, AVG(humidity) AS avg_humidity FROM log GROUP BY SUBSTRING(time_stamp, 1, 13)",
            x_accessor: "Hour",
            mode: "Aggregation"
        },
        {
            query: "SELECT AVG(humidity) AS avg_humidity, SUBSTRING(time_stamp, 12, 2) AS Hour_of_Day FROM log WHERE (SUBSTRING(time_stamp, 1, 13) >= '2015-03-01 00') AND (SUBSTRING(time_stamp, 1, 13) <= '2015-05-31 24') GROUP BY SUBSTRING(time_stamp, 12, 2)",
            x_accessor: "Hour_of_Day",
            mode: "Custom"
        },
        {
            query: "SELECT SUBSTRING(time_stamp, 1, 7) AS Month, COUNT(*) AS log_count, MIN(humidity) AS min_humidity, MAX(temperature) As max_temperature FROM log GROUP BY SUBSTRING(time_stamp, 1, 7)",
            x_accessor: "Month",
            mode: "Statistics"
        },
        {
            query: "SELECT SUBSTRING(time_stamp, 1, 10) AS Day, MAX(temperature) As max_temperature FROM log GROUP BY SUBSTRING(time_stamp, 1, 10)",
            x_accessor: "Day",
            mode: "Aggregation"
        }
    ];

    self.handlers = {
        addTask: function() {
            var nodeId = self.appData.newNodeId(),
                query = undefined,
                x_accessor = undefined;

            if (self.appData.selectedMode() != "Custom") {
                x_accessor = self.appData.selectedTimeInterval();
            } else if (self.appData.selectedMode() == "Statistics") {
                x_accessor = self.appData.customXAccessor();
            } else if (self.appData.selectedMode() == "Custom") {
                x_accessor = self.appData.customXAccessor();
            }

            query = self.handlers.buildQuery();

            gdo.net.app["TimeV"].server.requestVisualisation(gdo.net.node[nodeId].appInstanceId, nodeId, query, self.appData.selectedMode(), x_accessor);

            self.appData.RuningVisualisations.push(
                new Task({ nodeId: nodeId, query: query, x_accessor: x_accessor })
            );

            self.handlers.reload();
        },

        removeTask: function(task) {
            gdo.net.app["TimeV"].server.disposeVisualisation(gdo.net.node[task.nodeId()].appInstanceId, task.nodeId());
            self.appData.RuningVisualisations.remove(task);
        },

        addField: function() {
            var field = new self.appData.selectedField();
            field.method = self.appData.selectedMethod().signature;
            self.appData.selectedFields.push(field);
        },

        removeField: function(field) {
            self.appData.selectedFields.remove(field);
        },

        buildQuery: function() {
            var query = "";
            if (self.appData.selectedMode() != "Custom") {
                query = "SELECT ";

                $.each(self.appData.selectedFields(), function(idx, field) {
                    if (!field.method) {
                        query += field.name + ", ";
                    } else {
                        query += field.method + "(" + field.name + ") AS " + field.method.toLowerCase() + "_" + field.name + ", ";
                    }
                });

                query = query.substring(0, query.length - 2);

                var actualInterval = self.intervalMap[self.appData.selectedTimeInterval()];
                if (self.appData.selectedTimeInterval() != "All") {
                    query += ", " + actualInterval + " AS " + self.appData.selectedTimeInterval();
                }

                query += " FROM log";
                var fromDate = self.appData.datetimepickerFrom.date();
                var toDate = self.appData.datetimepickerTo.date();
                var customCondition = $.trim(self.appData.customCondition());

                if (!!fromDate || !!toDate || customCondition != "") {
                    query += " WHERE ";
                }

                if (!!fromDate) {
                    fromDate = self.handlers.dateToString(fromDate);
                    query += "(" + actualInterval + " >= " + fromDate + ") ";
                }

                if (!!toDate) {
                    toDate = self.handlers.dateToString(toDate);
                    var t = self.intervalMap[self.appData.selectedTimeInterval()];
                    if (!!fromDate) {
                        query += " AND ";
                    }
                    query += "(" + actualInterval + " <= " + toDate + ") ";
                }

                if (customCondition != "") {
                    if (!!fromDate || !!toDate) {
                        query += " AND ";
                    }

                    query += customCondition;
                }

                if (self.appData.selectedTimeInterval() != "All") {
                    query += " GROUP BY " + actualInterval;
                }
            } else if (self.appData.selectedMode() == "Custom") {
                query = $.trim(self.appData.customQuery());
            }

            return query;
        },

        dateToString: function(date) {
            var str = date.format("YYYY-MM-DD HH:mm:ss");
            var interval = self.appData.selectedTimeInterval();
            if (interval == "Year") {
                str = str.substring(0, 4);
            } else if (interval == "Month") {
                str = str.substring(0, 7);
            } else if (interval == "Day") {
                str = str.substring(0, 10);
            } else if (interval == "Hour") {
                str = str.substring(0, 13);
            } else if (interval == "Minute") {
                str = str.substring(0, 16);
            } else if (interval == "Second") {
                str = str.substring(0, 19);
            }

            return "'" + str + "'";
        },

        reload: function() {
            self.appData.newNodeId(self.appData.availableNodes()[0]);
            self.appData.selectedField(self.appData.availableFilelds()[0]);
            self.appData.selectedFields([]);
            self.appData.selectedMethod(self.appData.availableMethods()[0]);
            self.appData.selectedMode(self.appData.availableModes()[0]);
            self.appData.selectedTimeInterval("All");
            self.appData.newQuery("");
            self.appData.customCondition("");
            self.appData.customQuery("");
            self.appData.customXAccessor("");
            self.appData.datetimepickerFrom.date(null);
            self.appData.datetimepickerTo.date(null);
        },

        canSubmit: ko.computed(function() {
            if (self.appData.selectedMode() != "Custom") {
                return (self.appData.selectedFields().length != 0);
            } else if (self.appData.selectedMode() == "Custom") {
                return ($.trim(self.appData.customQuery()) != "");
            } else {
                return false;
            }
        }),

        runSamples: function() {
            $.each(self.appData.RuningVisualisations(), function(idx, task) {
                self.handlers.removeTask(task);
            });

            var nodes = self.appData.availableNodes();
            var queries = self.appData.sampleQueries;
            for (var i = 0; i < nodes.length; i++) {
                if (i < queries.length) {
                    var sampleQuery = queries[i];
                    gdo.net.app["TimeV"].server.requestVisualisation(gdo.net.node[nodes[i]].appInstanceId, nodes[i], sampleQuery.query, sampleQuery.mode, sampleQuery.x_accessor);

                    self.appData.RuningVisualisations.push(
                        new Task({ nodeId: nodes[i], query: sampleQuery.query, x_accessor: sampleQuery.x_accessor })
                    );
                }
            }
        },


    };

    self.intervalMap = {
        "All": "time_stamp",
        "Year": "SUBSTRING(time_stamp, 1, 4)",
        "Month": "SUBSTRING(time_stamp, 1, 7)",
        "Day": "SUBSTRING(time_stamp, 1, 10)",
        "Hour": "SUBSTRING(time_stamp, 1, 13)",
        "Minute": "SUBSTRING(time_stamp, 1, 16)",
        "Second": "SUBSTRING(time_stamp, 1, 19)"
    };
};

$(function() {
    TimeV.model = new TimeV.ControlViewModel();
    $("#datetimepickerFrom").datetimepicker();
    $("#datetimepickerTo").datetimepicker();
    TimeV.model.appData.datetimepickerFrom = $("#datetimepickerFrom").data("DateTimePicker");
    TimeV.model.appData.datetimepickerTo = $("#datetimepickerTo").data("DateTimePicker");

    ko.applyBindings(TimeV.model);
});