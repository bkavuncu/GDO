var TimeV = TimeV || {};
var gdo = typeof (gdo) == 'undefined' ? parent.gdo : gdo;

function Task(data) {
    this.nodeId = ko.observable(data.nodeId);
    this.query = ko.observable(data.query);
}

TimeV.ControlViewModel = function () {
    var self = this;

    self.appData = {
        newNodeId: ko.observable(),
        newQuery: ko.observable(),
        RuningVisualisations: ko.observableArray([])
    };

    self.handlers = {
        addTask: function () {
            var nodeId = self.appData.newNodeId(),
                query = self.appData.newQuery();

            gdo.net.app["TimeV"].server.requestVisulisation(gdo.net.node[nodeId].appInstanceId, nodeId, query);            

            self.appData.RuningVisualisations.push(
                new Task({ nodeId: nodeId, query: query })
            );            

            self.appData.newNodeId("");
            self.appData.newQuery("");
        },

        removeTask: function (task) {
            gdo.net.app["TimeV"].server.disposeVisulisation(gdo.net.node[task.nodeId()].appInstanceId, task.nodeId());
            self.appData.RuningVisualisations.remove(task)
        }
    };
};

$(function () {
    var model = new TimeV.ControlViewModel();
    ko.applyBindings(model);
});