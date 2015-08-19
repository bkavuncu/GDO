$(function () {
    $(document).ready(function () {
        var hub = $.connection.timeVAppHub;
        var app = $.connection.timeVAppHub.client;
        var gdo = typeof (gdo) == 'undefined' ? parent.gdo : gdo;
        var stamp = null;
        var data = null;     

        app.prepareVisualisation = function (nodeId, timeStamp) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.clientId == nodeId) {
                stamp = timeStamp;
            }
        }

        app.visualise = function (nodeId, timeStamp, data) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' function visualise: ' + nodeId);

                if (gdo.clientId == nodeId) {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                    stamp = timeStamp;
                    var doc = $("iframe").contents();
                    doc.find("#placeholder").removeClass("show");
                    doc.find("#placeholder").addClass("hidden");
                    doc.find("#visualisation").html('<p>' + JSON.stringify(data) + '</p>');
                } else {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
                }
            }
        }

        app.dispose = function (nodeId) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                if (gdo.clientId == nodeId) {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                    var doc = $("iframe").contents();
                    doc.find("#visualisation").html('');
                    doc.find("#placeholder").removeClass("hidden");
                    doc.find("#placeholder").addClass("show");
                } else {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
                }
            }
        }

        makeGraph = function (target, style, data, legends) {
            var graph = new Rickshaw.Graph({
                element: target,
                renderer: stlye,
                series: [{
                    data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, ...
                        color: 'steelblue'
                }, {
                    data: [ { x: 0, y: 20 }, { x: 1, y: 24 }, ...
                        color: 'lightblue'
                }]
            });

            graph.render();


            if (legends) {
                var legend = new Rickshaw.Graph.Legend({
                    graph: graph,
                    element: target
                });
            }

            var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                graph: graph,
                legend: legend
            });

            var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
                graph: graph,
                legend: legend
            });

            var order = new Rickshaw.Graph.Behavior.Series.Order({
                graph: graph,
                legend: legend
            });
        }
    });    

    
});