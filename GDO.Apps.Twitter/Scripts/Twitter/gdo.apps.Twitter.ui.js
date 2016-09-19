gdo.net.app["Twitter"].uiProperties = {
    table_width: 100,
    button_cols: 9.5,
    button_font_size: 21,
    section_font_size: 11,
    chart_aspect_ratio: 1
}

gdo.net.app["Twitter"].resetControlVariables = function(instanceId) {
    gdo.net.instance[instanceId].control.isRectangle = true;
    gdo.net.instance[instanceId].control.isStarted = false;
    gdo.net.instance[instanceId].control.colStart = 1000;
    gdo.net.instance[instanceId].control.colEnd = -1;
    gdo.net.instance[instanceId].control.rowStart = 1000;
    gdo.net.instance[instanceId].control.rowEnd = -1;
}

gdo.net.app["Twitter"].setRedownloadButton = function(instanceId, state) {
    if (state) {
        $("iframe")
            .contents()
            .find("#redownload")
            .removeClass("btn-danger")
            .addClass("btn-success")
            .html("Don't Redownload");
    } else {
        $("iframe").contents().find("#redownload")
            .removeClass("btn-success")
            .addClass("btn-danger")
            .html("Redownload");
    }    
};

gdo.net.app["Twitter"].setFileLists = function (instanceId, fileLists) {
    
    $("iframe")
      .contents()
      .find("#file_list_body")
      .empty();
    Object.keys(fileLists)
        .forEach(function (fileType, index) {
            if (fileLists[fileType].length > 0) {
                $("iframe")
                .contents()
                .find("#file_list_body")
                .append("<h6>" + fileType + "</h6><ul class='list-group' id=" + fileType + "_file_list></ul>");
                for (var i = 0; i < fileLists[fileType].length; ++i) {
                    $("iframe")
                        .contents()
                        .find("#" + fileType + "_file_list")
                        .append(" <li class='list-group-item'>" + fileLists[fileType][i] + "</li>");
                }
            }   
        });
}

gdo.net.app["Twitter"].setMessage = function (message, error) {
    error = error || false;
    $("iframe").contents().find("#message_from_server").html(message);
    if (error) {
        $("iframe")[0].contentWindow.showErrorModal(message);
        gdo.consoleOut('.Twitter', 5, 'Recieved Error message: ' + message);
    }
}

gdo.net.app["Twitter"].setAPIMessage = function(instanceId, message) {
    $("iframe").contents().find("#message_from_api_server").html(message.msg);
    $("iframe").contents().find("#error_message_from_api_server").html(message.msg);
    gdo.net.instance[instanceId].apiStatus = message.healthy;
    $("iframe")[0].contentWindow.showAPIModal(message.healthy);
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
    gdo.net.app["Twitter"].drawAppControlTable(instanceId);
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
        for (var j = gdo.net.instance[instanceId].control.rowStart;
            j <= gdo.net.instance[instanceId].control.rowEnd;
            j++) {
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

gdo.net.app["Twitter"].updateGraphFields = function(instanceId) {

    var elem1 = $("iframe").contents().find("#gc_select_label");
    var elem2 = $("iframe").contents().find("#gc_select_SearchFields");
    var elem3 = $("iframe").contents().find("#gc_select_SearchLabels");
    var elem4 = $("iframe").contents().find("#gc_select_mostConnectedLabels");
    elem1.empty();
    elem2.empty();
    elem3.empty();
    elem4.empty();

    var selectedGraphApps = gdo.net.instance[instanceId].control.selectedGraphApps;
    if (selectedGraphApps.length > 0) {
        var fields = gdo.net.instance[selectedGraphApps[0]].graphFields.filter(function(n) {
            var foundInAll = true;
            for (var i = 1; i < selectedGraphApps.length; ++i) {
                foundInAll = gdo.net.instance[selectedGraphApps[i]].graphFields.indexOf(n) !== -1;
            }
            return foundInAll;
        });
        $.each(fields,
            function() {
                elem1.append($("<option />").val(this).text(this));
                elem2.append($("<option />").val(this).text(this));
                elem3.append($("<option />").val(this).text(this));
                elem4.append($("<option />").val(this).text(this));
            });
    }

}


gdo.net.app["Twitter"].updateAnalyticsTables = function(instanceId, analytics) {
    gdo.consoleOut('.Twitter', 1, 'Updating analytics tables for instance: ' + instanceId);
    console.log(analytics);
    gdo.net.instance[instanceId].data.analytics = analytics;
    $("iframe").contents().find("#analytics_table tbody tr").remove();

    Object.keys(analytics)
        .forEach(function(dataSetId, index) {
            gdo.consoleOut('.Twitter', 1, 'Updating analytics table for: ' + instanceId + " and data set " + dataSetId);
            gdo.net.instance[instanceId].control.analyticsDisplay[(index + 1)] = dataSetId;
            $("iframe")
                .contents()
                .find("#deployTabDescription_" + (index + 1))
                .html(gdo.net.instance[instanceId].data.dataSets[dataSetId].description);
            gdo.net.app["Twitter"].updateSingleAnalyticsTable((index + 1), analytics[dataSetId]);
        });
}

gdo.net.app["Twitter"].updateSlideTable = function(instanceId, slides) {
    gdo.consoleOut('.Twitter', 1, 'Updating slide tables for instance: ' + instanceId);
    gdo.net.instance[instanceId].data.slides = slides;
    $("iframe").contents().find("#slide_table tbody tr").remove();
    for (var i = 0; i < slides.length; ++i) {
            $("iframe")
                .contents()
                .find("#slide_table tbody")
                .append("<tr>" +
                        "<td>" + slides[i]["description"] + "</td>" +
                        "<td>" + slides[i]["sections"].length + "</td>");
        }
    }


gdo.net.app["Twitter"].updateSingleAnalyticsTable = function(listNumber, dataSetanalytics) {
    $("iframe")
        .contents()
        .find("#analytics_deploy_list")
        .empty();

    Object.keys(dataSetanalytics)
        .forEach(function(analyticsClassification, index) {
            var analytics = dataSetanalytics[analyticsClassification];

            $("iframe")
                .contents()
                .find("#analytics_deploy_list")
                .append("<a href='#items_" + analyticsClassification + "' id = 'items_" + analyticsClassification + "_toggle' class='list-group-item' data-toggle='collapse'>" +
                            "<i class='fa fa-chevron-right fa-fw'></i>" + analyticsClassification + "</a>" +
                        "<ul class='list-group collapse in' id='items_" + analyticsClassification + "'" + "></ul>");

            $("iframe")
                .contents()
                .find("#items_" + analyticsClassification + "_toggle")
                .on('click',
                    function () {
                        $('.fa', this)
                            .toggleClass('fa-chevron-right')
                            .toggleClass('fa-chevron-down');
                    });


            $("iframe")
              .contents()
              .find("#items_" + analyticsClassification)
              .on("click", 'li',
                  function () {
                      var id = $(this).find("span:first").text().trim();
                      gdo.consoleOut(".Twitter", 1, "Selected analytics with id: " + id);
                      gdo.net.instance[gdo.controlId].control.selectedAnalytics = {
                              id: id,
                              dsid: gdo.net.instance[gdo.controlId].control.analyticsDisplay[1]
                          };
                      gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
                  })
              .on("blur", "li",
                  function (e) {
                      if ($(e.relatedTarget).attr("id") === "load-vis-button")
                          return;
                      gdo.net.instance[gdo.controlId].control.selectedAnalytics = null;
                      gdo.net.app["Twitter"].updateControlCanvas(gdo.controlId);
                  })
            .collapse();

            for (var i = 0; i < analytics.length; i++) {
                $("iframe")
                    .contents()
                    .find("#analytics_table tbody")
                    .append("<tr>" +
                            "<td>" + analytics[i]["classification"] + "</td>" +
                            "<td>" + analytics[i]["type"] + "</td>" +
                            "<td>" + analytics[i]["description"] + "</td>" +
                            "<td>" + analytics[i]["status"] + "</td>" +
                            "</tr>");

                if (analytics[i]["status"] !== "FINISHED") {
                    continue;
                }

                $("iframe")
                    .contents()
                    .find("#items_" + analyticsClassification)
                    .append("<li><a href='#' class='list-group-item'>" +
                            "<span>" + analytics[i]["id"] + "</span>  " +
                            "<span>" + analytics[i]["type"] + "</span>  " +
                            "<span>" + analytics[i]["description"] + "</span>" +
                            "</a></li>");
            }
        });
}


gdo.net.app["Twitter"].updateDataSetTable = function(instanceId, dataSets) {
    gdo.consoleOut(".Twitter", 1, "Updating data set table" + instanceId);
    gdo.net.instance[instanceId].data.dataSets = dataSets;
    $("iframe").contents().find("#dataset_table tbody tr").remove();
    for (var key in dataSets) {
        if (dataSets.hasOwnProperty(key)) {
            $("iframe")
                .contents()
                .find("#dataset_table tbody")
                .append("<tr>" +
                    "<td>" + dataSets[key]["id"] + "</td>" +
                    "<td>" + dataSets[key]["description"] + "</td>" +
                    "<td>" + dataSets[key]["status"] + "</td>" +
                    "<td>" + dataSets[key]["collection_size"] + "</td>" +
                    "<td>" + dataSets[key]["type"] + "</td>" +
                    "<td>" + dataSets[key]["start_time"] + "</td>" +
                    "<td>" + dataSets[key]["end_time"] + "</td>" +
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
            $("iframe")
                .contents()
                .find("#analytics_options_table tbody")
                .append("<tr>" +
                        "<td>" + analyticsClassification.classification + "</td>" +
                        "<td>" + analyticsClassification.types[j].type + "</td>" +
                        "</tr>");
        }
    }
}