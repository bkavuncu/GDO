$(function () {
    gdo.consoleOut('.FusionChart', 1, 'Loaded FusionChart JS');
   
    $.connection.fusionChartAppHub.client.receiveMouseEvent = function (instanceId, serialisedMouseEvent) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Processing Mouse Event");
            gdo.net.app["FusionChart"].processMouseEvent(instanceId, JSON.parse(serialisedMouseEvent));

        }
    }

    $.connection.fusionChartAppHub.client.receiveChartData = function (instanceId, serialisedChartData) {
        if (serialisedChartData == null) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": No data loaded yet");
            return;
        }
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Processing Chart Data");
            var chartData = JSON.parse(serialisedChartData);
            gdo.net.app["FusionChart"].processChartData(instanceId, chartData);
            $("iframe").contents().find('#chartType').val(chartData.chartType);
            $("iframe").contents().find('#chartConfigKey').empty();
            var configKeys = Object.keys(chartData.dataSource.chart);
            for (var i = 0 ; i < configKeys.length ; i++) {
                $("iframe").contents().find('#chartConfigKey').append("<option value=\"" + configKeys[i] + "\">" + configKeys[i] + "</option>");
            }
            $("iframe").contents().find('#chartConfigKey').val(configKeys[0]);
            $("iframe").contents().find('#chartConfigValue').val(chartData.dataSource.chart[configKeys[0]]);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Processing Chart Data");
            gdo.net.app["FusionChart"].processChartData(instanceId, JSON.parse(serialisedChartData));
        }
    }

    $.connection.fusionChartAppHub.client.deleteFileFinished = function (instanceId, filePath) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            $("iframe")[0].contentWindow.location.reload();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.fusionChartAppHub.client.reRender = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": ReRendering Chart Data");
            if (gdo.net.instance[instanceId].chartDatasetURL) {
                var currentData = gdo.net.instance[instanceId].chart.getJSONData();
                $.getJSON(gdo.net.instance[instanceId].chartDatasetURL, function (json) {
                    currentData.dataset = json;
                    gdo.net.instance[instanceId].chart.setJSONData(currentData);
                    gdo.net.instance[instanceId].chart.render();
                });
            } else if (gdo.net.instance[instanceId].chartDataURL) {
                var currentData = gdo.net.instance[instanceId].chart.getJSONData();
                $.getJSON(gdo.net.instance[instanceId].chartDataURL, function (json) {
                    currentData.data = json;
                    gdo.net.instance[instanceId].chart.setJSONData(currentData);
                    gdo.net.instance[instanceId].chart.render();
                });
            } else {
                gdo.net.instance[instanceId].chart.render();
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": ReRendering Chart Data");
            if (gdo.net.instance[instanceId].chartDatasetURL) {
                var currentData = gdo.net.instance[instanceId].chart.getJSONData();
                $.getJSON(gdo.net.instance[instanceId].chartDatasetURL, function (json) {
                    currentData.dataset = json;
                    gdo.net.instance[instanceId].chart.setJSONData(currentData);
                    gdo.net.instance[instanceId].chart.render();
                });
            } else if (gdo.net.instance[instanceId].chartDataURL) {
                var currentData = gdo.net.instance[instanceId].chart.getJSONData();
                $.getJSON(gdo.net.instance[instanceId].chartDataURL, function (json) {
                    currentData.data = json;
                    gdo.net.instance[instanceId].chart.setJSONData(currentData);
                    gdo.net.instance[instanceId].chart.render();
                });
            } else {
                gdo.net.instance[instanceId].chart.render();
            }
        }
    }

    $.connection.fusionChartAppHub.client.receiveChartType = function (instanceId, chartType) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Setting chart typr: " + chartType);
            gdo.net.instance[instanceId].chart.chartType(chartType);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Setting chart typr: " + chartType);
            gdo.net.instance[instanceId].chart.chartType(chartType);
        }
    }

    $.connection.fusionChartAppHub.client.receiveChartConfig = function (instanceId, configKey, configValue) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Setting chart config: " + configKey + ": " + configValue);
            gdo.net.instance[instanceId].chart.setChartAttribute(configKey, configValue);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Setting chart config: " + configKey + ": " + configValue);
            gdo.net.instance[instanceId].chart.setChartAttribute(configKey, configValue);
        }
    }

    $.connection.fusionChartAppHub.client.saveConfigFinished = function (instanceId, success, filename) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            if (success) {
                alert("Chart config saved successfully!");
                gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + "Saving configuration succeed!");
                $("iframe")[0].contentWindow.location.reload();
                url = "FusionChart/data/" + filename;
                var a = document.createElement('a');
                a.download = filename;
                a.href = url;
                a.click();
            } else {
                gdo.consoleOut('.FusionChart', 5, 'Instance - ' + instanceId + "Saving configuration failed!");
            }
            $("iframe").contents().find('#saveConfig').html("Save Config");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }

    $.connection.fusionChartAppHub.client.setDebugMode = function (instanceId, showDebug) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Setting debug mode " + showDebug);
            if (showDebug) {
                $("iframe").contents().find('#wrapper').css("z-index", "-1");
                $("iframe").parent().parent().siblings(".overlay").css("z-index", "8");
                gdo.net.instance[instanceId].debug = true;
            } else {
                $("iframe").contents().find('#wrapper').css("z-index", "1");
                $("iframe").parent().parent().siblings(".overlay").css("z-index", "999");
                gdo.net.instance[instanceId].debug = false;
            }
        }
    }

//    $.connection.fusionChartAppHub.client.printState = function (instanceId) {
//        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
//        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
//            console.log(gdo.net.app["FusionChart"]);
//            console.log(gdo.net.instance[instanceId]);
//        }
//    }
});


gdo.net.app["FusionChart"].processChartData = function (instanceId, chartData) {
    gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Chart Type: " + chartData.chartType);
    gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Chart Width: " + gdo.net.section[gdo.net.instance[instanceId].sectionId].width);
    gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Chart Height: " + gdo.net.section[gdo.net.instance[instanceId].sectionId].height);
    $("iframe")[0].contentWindow.processChartData(chartData, instanceId);
}

gdo.net.app["FusionChart"].initClient = function () {
    gdo.consoleOut('.FusionChart', 1, 'Initializing FusionChart App Client at Node ' + gdo.clientId);
    gdo.net.app["FusionChart"].setupHTMLTransform(gdo.net.node[gdo.clientId].appInstanceId);
    gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].debug = false;  
    gdo.net.app["FusionChart"].server.getChartData(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["FusionChart"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.FusionChart', 1, 'Initializing FusionChart App Control at Instance ' + gdo.controlId);
    gdo.net.instance[gdo.controlId].controlWidth = 1920.0;
    gdo.net.instance[gdo.controlId].mouseForwarding = false;
    gdo.net.app["FusionChart"].setControlSize(gdo.controlId);

//    $("iframe")
//        .contents()
//        .find("#blocker")
//        .css("width", 1920.0 + "px")
//        .css("height", height * 1920.0 / width + "px");


    gdo.net.app["FusionChart"].server.getChartData(gdo.controlId);
}

gdo.net.app["FusionChart"].setControlSize = function (instanceId) {


    var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
    var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;
    var transform = "scale(" + gdo.net.instance[instanceId].controlWidth / width + ")";
    var origin = "0px 0px";

    $("iframe")
    .contents()
    .find("#chart-container")
    .css("-moz-transform", transform)
    .css("-moz-transform-origin", origin)
    .css("-o-transform", transform)
    .css("-o-transform-origin", origin)
    .css("-webkit-transform", transform)
    .css("-webkit-transform-origin", origin)
    .css("width", width + "px")
    .css("height", height + "px");
}

gdo.net.app["FusionChart"].terminateClient = function () {
    gdo.consoleOut('.FusionChart', 1, 'Terminating FusionChart App Client at Node ' + clientId);
}

gdo.net.app["FusionChart"].ternminateControl = function () {
    gdo.consoleOut('.FusionChart', 1, 'Terminating FusionChart App Control at Instance ' + gdo.controlId);
}

gdo.net.app["FusionChart"].processMouseEvent = function (instanceId, mouseEvent) {
    
    mouseEvent["clientX"] = mouseEvent["scaledX"] - (gdo.net.node[gdo.clientId].sectionCol * gdo.net.app["FusionChart"].screenWidth);
    mouseEvent["clientY"] = mouseEvent["scaledY"] - (gdo.net.node[gdo.clientId].sectionRow * gdo.net.app["FusionChart"].screenHeight);

    var targetObj = gdo.net.app["FusionChart"].get_object_from_dom(JSON.parse(mouseEvent["serialisedPath"]), instanceId);
    if (targetObj[0] != null) {
        $("iframe")[0].contentWindow.processMouseEvent(mouseEvent, targetObj[0]);
    } else {
        console.log("Failed");
        $("iframe").contents().find("#mouseEventDebug").html("Debug: DOM traversal failed");
    }
}

gdo.net.app["FusionChart"].get_object_from_dom = function(domPath, instanceId) {

    var root = $("iframe").contents().find("#chart-container");

    if (gdo.net.instance[instanceId].debug) {
        console.log(root);
        console.log(domPath);
    }
    for(var j = 0; j < domPath.length; ++j){
        if (domPath[j]["index"] >= 0) {
            root = root.children().eq(domPath[j]["index"]);
            if (gdo.net.instance[instanceId].debug) {
                console.log("Using index to find obj: " + domPath[j]["index"]);
                console.log(root);
            }
        }else if(domPath[j]["attr"].id != undefined) {
            root = root.children("#" + domPath[j]["attr"].id);
            if (gdo.net.instance[instanceId].debug) {
                console.log("Using id to find obj: " + domPath[j]["attr"].id);
                console.log(root);
            }
        } else if (domPath[j]["attr"].class != undefined) {
            var classStr = domPath[j]["nodeName"] + "." + domPath[j]["attr"].class.split(" ").join(", .");
            root = root.children(classStr);
            if (gdo.net.instance[instanceId].debug) {
                console.log("Using class: " + classStr);
                console.log(root);
            }
        } else {
            var query = domPath[j]["nodeName"];
            for (var p in domPath[j]["attr"]) {
                if (domPath[j]["attr"].hasOwnProperty(p)) {
                    query += "[" + p + "='" + domPath[j]["attr"][p] + "']";
                }
            }
            root = root.children(query);
            if (gdo.net.instance[instanceId].debug) {
                console.log("Using attributes to find obj: " + query);
                console.log(root);
            }
        }
    }
    if (gdo.net.instance[instanceId].debug) {
        console.log("====================================");
        console.log("Found");
        console.log(root);
    }
    
    return root;

}

gdo.net.app["FusionChart"].sendMouseEvent = function (e) {
    var oe = e.originalEvent;
    var elementPath;
    for (var i = oe.path.length - 1; i >= 0; i--) {
        if (oe.path[i].id == "chart-container") {
            elementPath = oe.path.reverse().splice(oe.path.length - i, oe.path.length - 1)
            break;
        }
    }
    var pathAttributes = [];
    for (var j = 0; j < elementPath.length; ++j) {
        var c = {"attr": {}, "nodeName": {} }
        for (var l = 0; l < elementPath[j].attributes.length; ++l) {
            if (elementPath[j].attributes[l].name != "fill" && elementPath[j].attributes[l].name != "transform") {
                c["attr"][elementPath[j].attributes[l].name] = elementPath[j].attributes[l].value;
            }
        }
        c["nodeName"] = elementPath[j].nodeName;
        if (j > 0) {
            var i = 0;
            var child = elementPath[j];
            while ((child = child.previousSibling) != null)
                i++;
            c["index"] = i;
        }
        pathAttributes.push(c);
    }

    var jsonPath = JSON.stringify(pathAttributes);

    var rect = e.currentTarget.getBoundingClientRect();

    console.log("clientX" + e.clientX + " clientY" + e.clientY + " screenX:" + e.screenX + " screenY:" + e.screenY +
        "offsetX: " + e.offsetX + " offsetY: " + e.offsetY + " pageX: " + e.pageX + " pageY: " + e.pageY
        + "type: " + e.type + " width: " + rect.width + " height: "  + rect.height);
    
    var jsonEvent = JSON.stringify({
        "x": (e.pageX - $("iframe").contents().find("#chart-container").offset().left),
        "y": (e.pageY - $("iframe").contents().find("#chart-container").offset().top),
        "eventType": e.type,
        "controlWidth": rect.width,
        "controlHeight": rect.height,
        "serialisedPath" : jsonPath
    });

    gdo.net.app["FusionChart"].server.sendMouseEvent(gdo.controlId, jsonEvent);
}

gdo.net.app["FusionChart"].setupHTMLTransform = function (instanceId) {
    $("iframe")
       .contents()
       .find("#wrapper")
       .css("width",
           gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
           gdo.net.section[gdo.net.instance[instanceId].sectionId].cols +
           "px")
       .css("height",
           gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
           gdo.net.section[gdo.net.instance[instanceId].sectionId].rows +
           "px");

        var screenWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
       gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
        var screenHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
            gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

    gdo.net.app["FusionChart"].screenWidth = screenWidth;
    gdo.net.app["FusionChart"].screenHeight = screenHeight;

        var xOffset = -gdo.net.node[gdo.clientId].sectionCol * screenWidth;
        var yOffset = -gdo.net.node[gdo.clientId].sectionRow * screenHeight;

        gdo.consoleOut('.FusionChart', 0, 'Node settings ScreenWidth: ' + screenWidth + " ScreenHeight: " + screenHeight +
            " xOffset: " + xOffset + " yOffset: " + yOffset);

        var origin = "0% 0%";
        var transform = "translate(" + xOffset + "px," + yOffset + "px)";

    $("iframe")
        .contents()
        .find("#chart-container")
        .css("-moz-transform", transform)
        .css("-moz-transform-origin", origin)
        .css("-o-transform", transform)
        .css("-o-transform-origin", origin)
        .css("-webkit-transform", transform)
        .css("-webkit-transform-origin", origin);

}