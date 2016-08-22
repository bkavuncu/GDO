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
            gdo.net.app["FusionChart"].processChartData(instanceId, JSON.parse(serialisedChartData));
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Processing Chart Data");
            gdo.net.app["FusionChart"].processChartData(instanceId, JSON.parse(serialisedChartData));
        }
    }

    $.connection.fusionChartAppHub.client.reRender = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": ReRendering Chart Data");
            gdo.net.instance[instanceId].chart.render();
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": ReRendering Chart Data");
            gdo.net.instance[instanceId].chart.render();
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

    $.connection.fusionChartAppHub.client.printState = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            console.log(gdo.net.app["FusionChart"]);
            console.log(gdo.net.instance[instanceId]);
        }
    }
});


gdo.net.app["FusionChart"].processChartData = function (instanceId, chartData) {
    gdo.consoleOut('.FusionChart', 1, 'Instance - ' + instanceId + ": Chart Type: " + chartData.chartType);
    $("iframe")[0].contentWindow.processChartData({
        type: chartData.chartType,
        renderAt: 'chart-container',
        width: "100%",
        height: "100%",
        dataFormat: 'json',
        dataSource: chartData.dataSource
    }, instanceId);
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

    var width = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    var height = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    var transform = "scale(" + 1920.0 / width + ")";
    var origin = "0px 0px";
    
    $("iframe")
        .contents()
        .find("#blocker")
        .css("width", 1920.0 + "px")
        .css("height", height * 1920.0 / width + "px");
    $("iframe")
        .contents()
        .find("#chart-container")
        .css("zoom", 1)
        .css("-moz-transform", transform)
        .css("-moz-transform-origin", origin)
        .css("-o-transform", transform)
        .css("-o-transform-origin", origin)
        .css("-webkit-transform", transform)
        .css("-webkit-transform-origin", origin)
        .css("width", width + "px")
        .css("height", height + "px");
//            .css("absolute", "fixed");
    gdo.net.app["FusionChart"].server.getChartData(gdo.controlId);
}



gdo.net.app["FusionChart"].terminateClient = function () {
    gdo.consoleOut('.FusionChart', 1, 'Terminating FusionChart App Client at Node ' + clientId);
}

gdo.net.app["FusionChart"].ternminateControl = function () {
    gdo.consoleOut('.FusionChart', 1, 'Terminating FusionChart App Control at Instance ' + gdo.controlId);
}

gdo.net.app["FusionChart"].processMouseEvent = function (instanceId, mouseEvent) {
    console.log(mouseEvent);
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
        if(domPath[j]["attr"].id != undefined) {
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
            for(var p in domPath[j]["attr"]){
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
        var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
        var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

        gdo.consoleOut('.FusionChart', 0, 'Node settings ScreenWidth: ' + screenWidth + " ScreenHeight: " + screenHeight +
            " xOffset: " + xOffset + " yOffset: " + yOffset + " width: " + width + " height: " + height);
        var origin = "0% 0%";
        var transform = "translate(" + xOffset + "px," + yOffset + "px)";

        $("iframe")
            .contents()
            .find("#chart-container")
            .css("zoom", 1)
                .css("-moz-transform", transform)
                .css("-moz-transform-origin", origin)
                .css("-o-transform", transform)
                .css("-o-transform-origin", origin)
                .css("-webkit-transform", transform)
                .css("-webkit-transform-origin", origin)
                .css("width", width + "px")
                .css("height", height + "px")
                .css("absolute", "fixed");

}