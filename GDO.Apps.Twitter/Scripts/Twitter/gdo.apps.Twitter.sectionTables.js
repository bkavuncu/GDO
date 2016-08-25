gdo.net.app["Twitter"].autoAllocateSections = function(instanceId){
    var nSections = 0;
    var nAnalytics = 0;
    var nGraphs = 0;
    var analytic;
    Object.keys(gdo.net.instance[instanceId].data.analytics).forEach(function (dataSetId, index) {
        analytic = gdo.net.instance[instanceId].data.analytics[dataSetId]["Analytics"];
        nSections = analytic.length;
        //        var n = gdo.net.instance[instanceId].data.analytics[dataSetId].length;
//        analytic = gdo.net.instance[instanceId].data.analytics[dataSetId]["Analytics"];
//        var nFinishedGraph = 0;
//        var nFinishedAnalytics = 0;
//        for (var i = 0; i < n; ++i) {
//            if (gdo.net.instance[instanceId].data.analytics[dataSetId][i]["status"] === "FINISHED") {
//                if (gdo.net.instance[instanceId].data.analytics[dataSetId][i]["classification"] === "Graph") {
//                    nFinishedGraph += 1;
//                } else {
//                    nFinishedAnalytics += 1;
//                }
//            }
//        }
//        nSections += n;
        nAnalytics += nSections;
//        nGraphs += nFinishedGraph;
//        gdo.consoleOut('.Twitter', 1, 'Data set ' + dataSetId + ' has ' + nFinishedGraph + ' finished graphs and ' + nFinishedAnalytics + ' finished analytics');
        gdo.consoleOut('.Twitter', 1, 'Data set ' + dataSetId + ' has ' + nSections + ' finished analytics');
        
    });
    gdo.consoleOut('.Twitter', 1, 'Total number of analytics options (Analytics:' + nAnalytics + ")");
    var counter = 0;
    if (nSections <= 14 && nSections > 0) {
        var sectionRequests = [];
            for (var row = 0; row <= 3; row += 2) {
                for (var col = 0; col <= 14; col += 2) {
                    console.log(analytic[counter]);
                    if (counter >= nAnalytics) {
                        break;
                    }
                    if (!(analytic[counter]["status"] === "FINISHED")) {
                        counter += 1;
                    }
                    if (row === 2 && col === 0) {
                        col += 1;
                    }

                    sectionRequests.push({
                        ColStart: col,
                        RowStart: row,
                        ColEnd: (col + 1),
                        RowEnd: (row + 1),
                        DataSetId: analytic[counter].dataset_id,
                        AnalyticsId: analytic[counter].id
                    });
                    counter += 1;
                }
                if (counter >= nAnalytics) {
                    break;
                }
        }
        gdo.net.app["Twitter"].reqeustAutoLoadSections(instanceId, sectionRequests);
    }
}

gdo.net.app["Twitter"].sectionIsFree = function(instanceId, colStart, colEnd, rowStart, rowEnd){
    for (var c = colStart; c <=colEnd; ++c) {
        for (var r = rowStart; r <= rowEnd; ++r) {
            if (gdo.net.instance[instanceId].caveStatus.nodes[gdo.net.getNodeId(c, r)].nodeContext !=
                gdo.net.app["Twitter"].NodeContext.FREE) {
                return false;
            }
        }
    }
    return true;
}

gdo.net.app["Twitter"].launchSlide = function (instanceId, slideId) {
    gdo.consoleOut('.Twitter', 1, "Attempting to launch slide " + slideId);
    var slide = gdo.net.instance[instanceId].data.slides[slideId];
    console.log(slide);
    var sectionRequests = [];
    for (var i = 0; i < slide.sections.length; ++i) {
        if(!gdo.net.app["Twitter"].sectionIsFree(instanceId, slide.sections[i].colStart, slide.sections[i].colEnd,
            slide.sections[i].rowStart, slide.sections[i].rowEnd)) {
            
            var msg = 'Slide section with coordinates: ' +
                slide.sections[i].colStart +
                " " +
                slide.sections[i].colEnd +
                " " +
                slide.sections[i].rowStart +
                " " +
                slide.sections[i].rowEnd +
                " could not be started as node is already allocated";
            gdo.consoleOut('.Twitter', 1, msg);
            gdo.net.app["Twitter"].setMessage(msg);
            continue;
        }
        sectionRequests.push({
            ColStart: slide.sections[i].colStart,
            RowStart: slide.sections[i].rowStart,
            ColEnd: slide.sections[i].colEnd,
            RowEnd: slide.sections[i].rowEnd,
            DataSetId: slide.sections[i].dataSetId,
            AnalyticsId: slide.sections[i].analyticsId
        });
    }

    console.log(sectionRequests);
    if (sectionRequests.length > 0) {
        gdo.net.app["Twitter"].reqeustAutoLoadSections(instanceId, sectionRequests);
    }
}

gdo.net.app["Twitter"].drawEmptySectionTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#section_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#section_table")
            .append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#section_table tr:last")
                .append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>")
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.app["Twitter"].drawEmptySectionControlTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#section_table_control").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#section_table_control")
            .append("<tr id='section_control_table_row_" + i + "' row='" + i + "'/>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe")
                .contents()
                .find("#section_table_control tr:last")
                .append("<td  id='section_control_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'/>")
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.app["Twitter"].drawEmptyAppControlTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#app_control_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#app_control_table")
            .append("<tr id='app_control_table_row_" + i + "' row='" + i + "'/>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe")
                .contents()
                .find("#app_control_table tr:last")
                .append("<td  id='app_control_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'/>")
                .css('overflow', 'hidden');
        }
    }
}



