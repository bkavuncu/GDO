$(function () {
    gdo.consoleOut('.Twitter', 1, 'Loaded Twitter JS');

    $.connection.twitterAppHub.client.setMessage = function (instanceId, message) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setMessage(message);
        }
    }

    $.connection.twitterAppHub.client.receiveCaveStatus = function (instanceId, serialisedStatus) {
        gdo.consoleOut('.Twitter', 1, 'Received cave status');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].processCaveStatus(instanceId, JSON.parse(serialisedStatus));
        }
    }

    $.connection.twitterAppHub.client.createSection = function (instanceId, serialisedSection) {
        gdo.consoleOut('.Twitter', 1, 'Received reqeust to create section');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].createSection(JSON.parse(serialisedSection));
            gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId);
        }
    }

    $.connection.twitterAppHub.client.closeSection = function (instanceId, sectionId) {
        gdo.consoleOut('.Twitter', 1, 'Received request to close section: ' + sectionId);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].closeSection(sectionId);
            gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId);
        } 
    }

    $.connection.twitterAppHub.client.updateDataSets = function (instanceId, dataSets) {
        gdo.consoleOut('.Twitter', 1, 'Received new data sets');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].updateDataSetTable(instanceId, JSON.parse(dataSets));
        }
    }

    $.connection.twitterAppHub.client.updateAnalytics = function (instanceId, analytics) {
        gdo.consoleOut('.Twitter', 1, 'Received new analytics');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].updateAnalyticsTables(instanceId, JSON.parse(analytics));
        }
    }

    $.connection.twitterAppHub.client.closeApp = function (instanceId, appInstanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].closeApp(JSON.parse(appInstanceId));
            gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId);
        }
    }

    $.connection.twitterAppHub.client.deployApps = function(instanceId, serialisedSections) {
        gdo.consoleOut('.Twitter', 1, 'Received reqeust to deploy an apps');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].deployApps(instanceId, JSON.parse(serialisedSections));
            gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId);
        }
    }

    $.connection.twitterAppHub.client.clearCave = function(instanceId, sectionIds, appInstanceIds) {
        gdo.consoleOut('.Twitter', 1, 'Received reqeust clear the cave');
        console.log(sectionIds);
        console.log(appInstanceIds);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].clearCave(instanceId, sectionIds, appInstanceIds);
            gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId);
        }
    }
});


gdo.net.app["Twitter"].NodeContext = {
    ROOT_SECTION: 0,
    RESERVED: 1,
    FREE: 2
}

gdo.net.app["Twitter"].initClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Client at Node ' + gdo.clientId);
}

gdo.net.app["Twitter"].initControl = function () {

    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Control at Instance ' + gdo.controlId);
    gdo.loadScript("ui", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("section", "Twitter", gdo.SCRIPT_TYPE.APP);
   
    //app["Twitter"]
    //.data contains information on the data sets and anytics
    //.caveStatus contains information on the nodes and sections
    //.control contains information regarding interface

    gdo.net.instance[gdo.controlId].control = {}
    gdo.net.instance[gdo.controlId].data = {}
    gdo.net.instance[gdo.controlId].caveStatus = {}
    gdo.net.app["Twitter"].initialise(gdo.controlId);
    parent.gdo.net.app["Twitter"].requestDataSets();
    gdo.net.app["Twitter"].getPseudoCaveStatus(gdo.controlId);
}

gdo.net.app["Twitter"].updateDisplayCanvas = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, 'Updating Display Canvas');
    gdo.net.app["Twitter"].updateControlCanvas(instanceId);
    gdo.updateDisplayCanvas();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].processCaveStatus = function (instanceId, status) {
    gdo.consoleOut('.Twitter', 1, 'Processing cave status');
    gdo.net.instance[instanceId].caveStatus = status;
    console.log(gdo.net.instance[instanceId].caveStatus);
    gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//SERVER COMMANDS//
////////////////////////////////////////////////////////////////////////////////////////////////////
gdo.net.app["Twitter"].createSection = function (section) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server creates new section');
    var result = gdo.net.server.createSection(section.col,
        section.row,
        section.col + section.cols - 1,
        section.row + section.rows - 1);
    console.log(result);
};
gdo.net.app["Twitter"].closeSection = function(sectionId) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server close section');
    gdo.net.server.closeSection(sectionId);

}
gdo.net.app["Twitter"].closeSections = function (sectionIds) {
    sectionIds.forEach(function(sectionId) {
        gdo.net.app["Twitter"].closeSection(sectionId);
    });
}


gdo.net.app["Twitter"].deployApps = function (instanceId, sections) {
    sections.forEach(function (section) {
        gdo.net.app["Twitter"].deployApp(section);
    });
}
gdo.net.app["Twitter"].deployApp = function (section) {
    gdo.consoleOut('.Twitter', 1, 'Deploying app to section ' + section.id);
    switch (section.twitterVis.appType) {
        case "Graph":
            gdo.net.app["Twitter"].deployGraphApp(section.id, "Default", section.twitterVis.filePath);
            break;
        case "Images":
            gdo.net.app["Twitter"].deployImageApp(section.id, "Default", section.twitterVis.filePath);
            break;
        case "StaticHTML":
            gdo.net.app["Twitter"].deployStaticHTMLApp(section.id, "Default", section.twitterVis.filePath);
            break;
        default:
            gdo.consoleOut('.Twitter', 2, 'App is an unknown type could not be deployed');
            break;
    }
}
gdo.net.app["Twitter"].deployStaticHTMLApp = function (sectionId, config, url) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server start StaticHTML app');
    var appInstanceId = gdo.net.server.deployBaseApp(sectionId, "StaticHTML", config);
    gdo.net.app["StaticHTML"].server.setURL(appInstanceId, url);
    console.log(appInstanceId);
    return appInstanceId;
}
gdo.net.app["Twitter"].deployImageApp = function (sectionId, config, path) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server start Image app');
    var appInstanceId = gdo.net.server.deployBaseApp(sectionId, "Images", config);
    gdo.net.app["Images"].server.processImage(appInstanceId, path);
    console.log(appInstanceId);
    return appInstanceId;
}
gdo.net.app["Twitter"].deployGraphApp = function (sectionId, config, path) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server start Graph app');
    var appInstanceId = gdo.net.server.deployBaseApp(sectionId, "Graph", config);
    gdo.net.app["Graph"].server.InitiateProcessing(appInstanceId, path);
    console.log(appInstanceId);
    return appInstanceId;
}


gdo.net.app["Twitter"].closeApp = function(appInstanceId) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server close app');
    var result = gdo.net.server.closeApp(appInstanceId);
    console.log(result);
}
gdo.net.app["Twitter"].closeApps = function (appInstanceIds) {
    appInstanceIds.forEach(function(appInstanceId) {
        gdo.net.app["Twitter"].closeApp(appInstanceId);
    })
};


gdo.net.app["Twitter"].clearCave = function (instanceId, sectionIds, appInstanceIds) {
    gdo.net.app["Twitter"].closeApps(appInstanceIds);
    gdo.net.app["Twitter"].closeSections(sectionIds);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//Functions Calling Twitter Hub
////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].getPseudoCaveStatus = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, 'Getting pseudo cave status: ' + instanceId);
    gdo.net.app["Twitter"].server.getPseudoCaveStatus(instanceId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].requestLoadVisualisation = function (instanceId, sectionId, selectedAnalytics) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub load visualisation for section: " + sectionId);
    gdo.net.app["Twitter"].server.loadVisualisation(instanceId, sectionId, selectedAnalytics.id, selectedAnalytics.dsid);
};
gdo.net.app["Twitter"].requestUnLoadVisualisation = function (instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub unload visualisation for section: " + sectionId);
    gdo.net.app["Twitter"].server.unLoadVisualisation(instanceId, sectionId);
}


gdo.net.app["Twitter"].requestCreateSection = function (instanceId, colStart, rowStart, colEnd, rowEnd) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub create new section for instance: " + instanceId);
    gdo.net.app["Twitter"].server.createSection(instanceId, colStart, rowStart, colEnd, rowEnd);
}
gdo.net.app["Twitter"].requestCloseSection= function(instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub close section: " + sectionId);
    gdo.net.app["Twitter"].server.closeSection(instanceId, sectionId);
    gdo.net.instance[instanceId].selectedSection = -1;
}


gdo.net.app["Twitter"].requestDeployApp = function(instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub deploy app at section: " + sectionId);
    gdo.net.instance[instanceId].selectedSection = -1;
    gdo.net.app["Twitter"].server.deployApps(instanceId, [sectionId]);
}
gdo.net.app["Twitter"].requestDeployAllApps = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub deploy all loaded visualisation apps");
    gdo.net.instance[instanceId].selectedSection = -1;
    gdo.net.app["Twitter"].server.deployApps(instanceId, []);
}
gdo.net.app["Twitter"].requestCloseApp = function (instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub close app at section: " + sectionId);
    gdo.net.instance[instanceId].selectedSection = -1;
    gdo.net.app["Twitter"].server.closeApp(instanceId, sectionId);
}


gdo.net.app["Twitter"].requestClearCave = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub to clear cave");
    gdo.net.instance[instanceId].selectedSection = -1;
    gdo.net.app["Twitter"].server.clearCave(instanceId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].requestAnalytics = function (dataSetIds) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub for analytics for data sets: " + dataSetIds);
    gdo.net.app["Twitter"].setMessage("Getting analytic for datasets: " + dataSetIds);
    gdo.net.app["Twitter"].server.getAnalytics(gdo.controlId, dataSetIds);
}

gdo.net.app["Twitter"].requestDataSets = function() {
    gdo.consoleOut('.Twitter', 1, "Requesting hub for data sets");
    gdo.net.app["Twitter"].server.getDataSets(gdo.controlId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].terminateClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Client at Node ' + clientId);
}

gdo.net.app["Twitter"].ternminateControl = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Control at Instance ' + gdo.controlId);
}