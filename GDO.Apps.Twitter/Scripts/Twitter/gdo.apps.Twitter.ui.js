﻿$("iframe")
    .contents()
    .find("#items_analytics_1")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected analytics with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[1] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });
$("iframe")
    .contents()
    .find("#items_graphs_1")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected graph with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[1] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });

$("iframe")
    .contents()
    .find("#items_analytics_2")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected analytics with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[2] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });
$("iframe")
    .contents()
    .find("#items_graphs_2")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected graph with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[2] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });

$("iframe")
    .contents()
    .find("#items_analytics_3")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected analytics with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[3] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });
$("iframe")
    .contents()
    .find("#items_graphs_3")
    .on("click",
        'li',
        function() {
            var id = $(this).find("span:first").text().trim();
            gdo.consoleOut(".Twitter", 1, "Selected graph with id: " + id);
            gdo.net.instance[gdo.controlId].control
                .selectedAnalytics = { id: id, dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[3] };
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        })
    .on("blur",
        "li",
        function(e) {
            if ($(e.relatedTarget).attr("id") === "load-vis-button")
                return;
            gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
            gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
        });

$(function () {
    $("iframe").contents().find('.list-group-item').on('click', function () {
        $('.fa', this)
          .toggleClass('fa-chevron-right')
          .toggleClass('fa-chevron-down');
    });
});

gdo.net.app["Twitter"].uiProperties = {
    table_width: 100,
    button_cols: 9.5,
    button_font_size: 21,
    section_font_size: 11,
    chart_aspect_ratio: 1
}

gdo.net.app["Twitter"].initialise = function(instanceId) {
    gdo.consoleOut('.Twitter', 1, 'Initialising UI Variables');
    gdo.net.instance[instanceId].control = {
        selectedNewAnalytics : [],
        selectedDataSet : -1,
        selectedSection: -1,
        selectedAnalytics: null,
        selectedDataSets: [],
        analyticsDisplay: {},
        selectedGraphApps: []
    }
    
}

gdo.net.app["Twitter"].resetControlVariables = function(instanceId) {
    gdo.net.instance[instanceId].control.isRectangle = true;
    gdo.net.instance[instanceId].control.isStarted = false;
    gdo.net.instance[instanceId].control.colStart = 1000;
    gdo.net.instance[instanceId].control.colEnd = -1;
    gdo.net.instance[instanceId].control.rowStart = 1000;
    gdo.net.instance[instanceId].control.rowEnd = -1;
}

gdo.net.app["Twitter"].setMessage = function(message) {
    $("iframe").contents().find("#message_from_server").html(message);
}

gdo.net.app["Twitter"].setAPIMessage = function (instanceId, message) {
    $("iframe").contents().find("#message_from_api_server").html(message.msg);
    gdo.net.instance[instanceId].apiStatus = message.healthy;

    if (!gdo.net.instance[instanceId].apiStatus) {
        $("iframe")
            .contents()
            .find("#message_panel")
            .removeClass("panel-success")
            .addClass("panel-danger");
        $("iframe")
            .contents()
            .find("#status-panel")
            .removeClass("panel-success")
            .addClass("panel-danger");
        $("iframe")
            .contents()
            .find("#admin-panel")
            .removeClass("panel-success")
            .addClass("panel-danger");
    } else {
        $("iframe")
           .contents()
           .find("#message_panel")
            .removeClass("panel-danger")
            .addClass("panel-success");
        $("iframe")
            .contents()
            .find("#status-panel")
            .removeClass("panel-danger")
            .addClass("panel-success");
        $("iframe")
            .contents()
            .find("#admin-panel")
            .removeClass("panel-danger")
            .addClass("panel-success");
    }

}

gdo.net.app["Twitter"].updateControlCanvas = function(instanceId) {
    gdo.consoleOut('.Twitter', 1, 'Updating control canvas');
    gdo.net.app["Twitter"].drawSectionTable(instanceId);
    gdo.net.app["Twitter"].drawButtonTable(instanceId);
    gdo.net.app["Twitter"].drawSectionControlTable(instanceId);
}

gdo.net.app["Twitter"].selectNodes = function(instanceId) {

    gdo.net.app["Twitter"].resetControlVariables(instanceId);
    var node;
    var i;
    for (i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        node = gdo.net.instance[instanceId].caveStatus.nodes[i];
        if (node.isSelected) {
            gdo.net.instance[instanceId].control.isStarted = true;
            if (node.col <= gdo.net.instance[instanceId].control.colStart) {
                gdo.net.instance[instanceId].control.colStart = node.col;
            }
            if (node.row <= gdo.net.instance[instanceId].control.rowStart) {
                gdo.net.instance[instanceId].control.rowStart = node.row;
            }
            if (node.col >= gdo.net.instance[instanceId].control.colEnd) {
                gdo.net.instance[instanceId].control.colEnd = node.col;
            }
            if (node.row >= gdo.net.instance[instanceId].control.rowEnd) {
                gdo.net.instance[instanceId].control.rowEnd = node.row;
            }
        }
    }
    for (i = gdo.net.instance[instanceId].control.colStart; i <= gdo.net.instance[instanceId].control.colEnd; i++) {
        for (var j = gdo.net.instance[instanceId].control.rowStart; j <= gdo.net.instance[instanceId].control.rowEnd; j++) {
            node = gdo.net.instance[instanceId].caveStatus.nodes[gdo.net.getNodeId(i, j)];
            
            if (!node.isSelected || node.nodeContext !== gdo.net.app["Twitter"].NodeContext.FREE) {
                console.log("A node fucked this up");
                console.log(node);
                console.log(gdo.net.app["Twitter"]);

                gdo.net.instance[instanceId].control.isRectangle = false;
            }
        }
    }
}

gdo.net.app["Twitter"].updateAnalyticsTables = function (instanceId, analytics) {
    gdo.consoleOut('.Twitter', 1, 'Updating analytics tables for instance: ' + instanceId);

    gdo.net.instance[instanceId].data.analytics = analytics;
    $("iframe").contents().find("#analytics_table tbody tr").remove();
    
    Object.keys(analytics).forEach(function (dataSetId, index) {
        gdo.consoleOut('.Twitter', 1, 'Updating analytics table for: ' + instanceId + " and data set " + dataSetId);
        gdo.net.instance[instanceId].control.analyticsDisplay[(index + 1)] = dataSetId;
        $("iframe").contents().find("#deployTabDescription_" + (index+1))
            .html(gdo.net.instance[instanceId].data.dataSets[dataSetId].description);
        gdo.net.app["Twitter"].updateSingleAnalyticsTable((index+1), analytics[dataSetId]);
    });
}

gdo.net.app["Twitter"].updateSingleAnalyticsTable = function(listNumber, analytics) {

    $("iframe").contents().find("#items_graphs_" + listNumber).empty();
    $("iframe").contents().find("#items_analytics_" + listNumber).empty();
    for (var i = 0; i < analytics.length; i++) {
        $("iframe").contents().find("#analytics_table tbody").append("" +
                "<tr>" +
                "<td><font size='3'>" + analytics[i]["classification"] + "</font></td>" +
                "<td><font size='3'>" + analytics[i]["type"] + "</font></td>" +
                "<td><font size='3'>" + analytics[i]["description"] + "</font></td>" +
                "<td><font size='3'>" + analytics[i]["status"] + "</font></td>" +
                "</tr>");
        if (analytics[i]["status"] !== "FINISHED") {
            continue;
        }
        if (analytics[i]["classification"] === "Graph") {
            $("iframe").contents().find("#items_graphs_" + listNumber).append("" +
                "<li><a href='#' class='list-group-item'>" +
                "<span>" + analytics[i]["id"] + "  </span>  " +
                "<span>" + analytics[i]["type"] + "  </span>  " +
                "<span>" + analytics[i]["description"] + "</span>" +
                "</li>");
        } else {
            $("iframe").contents().find("#items_analytics_" + listNumber).append("" +
                "<li><a href='#' class='list-group-item'>" +
                    "<span>Id: " + analytics[i]["id"] + "</span>" +
                    "<span>Type: " + analytics[i]["type"] + "</span>" +
                    "<span>:Description: " + analytics[i]["description"] + "</span></a>" +
                    "</li>");
        }
    }
}

gdo.net.app["Twitter"].updateDataSetTable = function(instanceId, dataSets) {
    gdo.consoleOut(".Twitter", 1, "Updating data set table" + instanceId);
    gdo.net.instance[instanceId].data.dataSets = dataSets;
    $("iframe").contents().find("#dataset_table tbody tr").remove();
    for (var key in dataSets) {
        if (dataSets.hasOwnProperty(key)) {
            $("iframe").contents().find("#dataset_table tbody").append("" +
                    "<tr>" +
                    "<td><font size='3'>" + dataSets[key]["id"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["description"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["status"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["collection_size"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["type"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["start_time"] + "</font></td>" +
                    "<td><font size='3'>" + dataSets[key]["end_time"] + "</font></td>" +
                    "</tr>");
        }
    }
}

gdo.net.app["Twitter"].updateAnalyticsOptionsTable = function(instanceId, analyticsOptions) {
    gdo.net.instance[instanceId].data.analyticsOptions = analyticsOptions;
    $("iframe").contents().find("#analytics_options_table tbody tr").remove();

    for (var i = 0; i < analyticsOptions.length; i++) {
        var analyticsClassification = analyticsOptions[i];
        for (var j = 0; j < analyticsClassification.types.length; j++) {
            $("iframe").contents().find("#analytics_options_table tbody").append("" +
                   "<tr>" +
                   "<td><font size='3'>" + analyticsClassification.classification + "</font></td>" +
                   "<td><font size='3'>" + analyticsClassification.types[j].type + "</font></td>" +
                   "</tr>");
        }
    }

}