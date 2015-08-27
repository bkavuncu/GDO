var TimeV = TimeV || {};
var hub = $.connection.timeVAppHub;
var gdo = typeof (gdo) == 'undefined' ? parent.gdo : gdo;

function Task(data) {
    this.nodeId = ko.observable(data.nodeId);
    this.query = ko.observable(data.query);
    this.x_accessor = ko.observable(data.x_accessor);
}

//$.connection.timeVAppHub.connection.disconnected(function() {
//   setTimeout(function() {
//       $.connection.timeVAppHub.connection.start();
//   }, 500); // Restart connection after 0.5 seconds.
//});

TimeV.ControlViewModel = function () {
    var self = this;

    self.appData = {
        newNodeId: ko.observable(),
        newQuery: ko.observable(),
        newXAccessor: ko.observable(),
        RuningVisualisations: ko.observableArray([]),
        availableMethods: ko.observableArray(["Aggregation", "Statistics"]),
        selectedMethod: ko.observable()        
    };

    self.appData.canSubmit = ko.computed(function () {        
        return (self.appData.newNodeId() != "" && self.appData.newQuery() != "" && (self.appData.selectedMethod() == "Statistics" || self.appData.newXAccessor() != ""))
    })

    self.handlers = {
        addTask: function () {
            var nodeId = self.appData.newNodeId(),
                query = self.appData.newQuery(),
                x_accessor = self.appData.newXAccessor();

            gdo.net.app["TimeV"].server.requestVisualisation(gdo.net.node[nodeId].appInstanceId, nodeId, query, self.appData.selectedMethod(), x_accessor);

            self.appData.RuningVisualisations.push(
                new Task({ nodeId: nodeId, query: query, x_accessor: x_accessor })
            );            

            self.appData.newNodeId("");
            self.appData.newQuery("");
            self.appData.newXAccessor("");
        },

        removeTask: function (task) {
            gdo.net.app["TimeV"].server.disposeVisualisation(gdo.net.node[task.nodeId()].appInstanceId, task.nodeId());
            self.appData.RuningVisualisations.remove(task)
        }
    };
};

$(function () {
    var model = new TimeV.ControlViewModel();
    ko.applyBindings(model);
});