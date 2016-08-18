$(function () {
    gdo.consoleOut('.Twitter', 1, 'Loaded Twitter JS');

    $.connection.twitterAppHub.client.setMessage = function (instanceId, message) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setMessage(message);
        } 
    }

    $.connection.twitterAppHub.client.setAPIMessage = function (instanceId, message) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        var messageDes = JSON.parse(message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setAPIMessage(instanceId, messageDes);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
            $("iframe").contents().find("#client_api_status_message").empty().append(messageDes.msg);
        }
    }

    $.connection.twitterAppHub.client.receiveCaveStatus = function (instanceId, serialisedStatus, refresh) {
        gdo.consoleOut('.Twitter', 1, 'Received cave status');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].processCaveStatus(instanceId, JSON.parse(serialisedStatus), refresh);
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

    $.connection.twitterAppHub.client.updateAnalyticsOptions = function (instanceId, analyticsOptions) {
        gdo.consoleOut('.Twitter', 1, 'Received new analytics options');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].updateAnalyticsOptionsTable(instanceId, JSON.parse(analyticsOptions));
        }
    }

    $.connection.twitterAppHub.client.setRedownloadButton = function (instanceId, state) {
        gdo.consoleOut('.Twitter', 1, 'Received state of redownload button: ' + state);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setRedownloadButton(instanceId, state);
        }
    }
});


gdo.net.app["Twitter"].NodeContext = {
    ROOT_SECTION: 0,
    RESERVED: 1,
    SECTION_REQEUSTED: 2,
    SECTION_CREATED: 3,
    SECTION_REMOVAL_REQUESTED: 4,
    VISUALISATION_LOADED: 5,
    APP_REQUESTED: 6,
    APP_DEPLOYED: 7,
    APP_REMOVAL_REQUESTED:8,
    FREE: 9
}

gdo.net.app["Twitter"].initClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Client at Node ' + gdo.clientId);
}

gdo.net.app["Twitter"].initControl = function () {

    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Control at Instance ' + gdo.controlId);
    gdo.loadScript("sectionTables", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("ui", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("sectionButtons", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("graphControl", "Twitter", gdo.SCRIPT_TYPE.APP);
    
   
    //app["Twitter"]
    //.data contains information on the data sets and anytics
    //.caveStatus contains information on the nodes and sections
    //.control contains information regarding interface
    //.apiStatus bool if connection with api is healthy

    gdo.net.instance[gdo.controlId].data = {}
    gdo.net.instance[gdo.controlId].caveStatus = {}
    gdo.net.app["Twitter"].initialise(gdo.controlId);
    gdo.net.app["Twitter"].server.getApiStatus(gdo.controlId);
    parent.gdo.net.app["Twitter"].requestDataSets();
    gdo.net.app["Twitter"].getPseudoCaveStatus(gdo.controlId, 0);
    

}

gdo.net.app["Twitter"].updateDisplayCanvas = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, 'Updating Display Canvas');
    gdo.net.app["Twitter"].updateControlCanvas(instanceId);
    gdo.updateDisplayCanvas();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].processCaveStatus = function (instanceId, status, refreshN) {
    gdo.consoleOut('.Twitter', 1, 'Processing cave status');
    gdo.net.instance[instanceId].caveStatus = status;

    console.log(gdo.net.instance[instanceId].caveStatus);

    gdo.consoleOut('.Twitter', 1, "Checking if sections need to be created");
    gdo.net.app["Twitter"].createSections(status.sectionsToCreate);
    gdo.consoleOut('.Twitter', 1, "Checking if apps need to be deployed");
    gdo.net.app["Twitter"].deployApps(status.appsToDeploy);
    gdo.consoleOut('.Twitter', 1, "Checking if apps need to be closed");
    gdo.net.app["Twitter"].closeApps(status.appsToDispose);
    gdo.consoleOut('.Twitter', 1, "Checking if sections need to be closed");
    gdo.net.app["Twitter"].closeSections(status.sectionsToDispose);
    gdo.consoleOut('.Twitter', 1, "Checking if apps need to be launched");
    gdo.net.app["Twitter"].launchApps(instanceId, status.appsToLaunch);
    

    gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);

    if (refreshN > 0) {
        gdo.consoleOut('.Twitter', 1, 'Will request cave status another ' + refreshN + " times ");
        gdo.net.app["Twitter"].getPseudoCaveStatus(instanceId, --refreshN);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
//SERVER COMMANDS//
////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].createSections = function (sections) {
    sections.forEach(function (section) {
        gdo.net.app["Twitter"].createSection(section);
    });
}
gdo.net.app["Twitter"].createSection = function (section) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server creates new section');
    var result = gdo.net.server.createSection(section.col,
        section.row,
        section.col + section.cols - 1,
        section.row + section.rows - 1);
    console.log(result);
}

gdo.net.app["Twitter"].closeSection = function(section) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server close section');
    gdo.net.server.closeSection(section.id);
}
gdo.net.app["Twitter"].closeSections = function (sections) {
    sections.forEach(function(section) {
        gdo.net.app["Twitter"].closeSection(section);
    });
}

gdo.net.app["Twitter"].deployApps = function (sections) {
    sections.forEach(function (section) {
        gdo.net.app["Twitter"].deployApp(section);
    });
}
gdo.net.app["Twitter"].deployApp = function(section) {
    gdo.net.server.deployBaseApp(section.id, section.twitterVis.appType, section.twitterVis.config);
}

gdo.net.app["Twitter"].launchApps = function(instanceId, sections) {
    sections.forEach(function (section) {
        gdo.consoleOut('.Twitter', 1, "Launching app with url " + section.twitterVis.filePath + " to section " + section.id + " at instance" + section.appInstanceId);
        gdo.net.app["Twitter"].launchApp(section);
    });
    if (sections.length > 0) {
        gdo.net.app["Twitter"].server.confirmLaunch(instanceId, sections.map(function (section) { return section.id; }));
    }
}

gdo.net.app["Twitter"].launchApp = function (section) {

gdo.consoleOut('.Twitter', 1, 'Starting app at section ' + section.id);
    switch (section.twitterVis.appType) {
        case "Graph":
            gdo.net.app["Twitter"].startGraphApp(section.appInstanceId, section.twitterVis.filePath);
            break;
        case "Images":
            gdo.net.app["Twitter"].startImageApp(section.appInstanceId, section.twitterVis.filePath);
            break;
        case "StaticHTML":
            gdo.net.app["Twitter"].startStaticHTMLApp(section.appInstanceId, section.twitterVis.filePath);
            break;
        default:
            gdo.consoleOut('.Twitter', 2, 'App is an unknown type could not be deployed');
            break;
    }
}
gdo.net.app["Twitter"].startStaticHTMLApp = function (appInstanceId, url) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server start StaticHTML app with url = "' + url + "' at instance " + appInstanceId);
    gdo.net.app["StaticHTML"].server.setURL(appInstanceId, url);
    return appInstanceId;
}
gdo.net.app["Twitter"].startImageApp = function (appInstanceId, path) {
    gdo.consoleOut('.Twitter', 1, "Requesting server start Image app at instance " + appInstanceId);
    gdo.net.app["Images"].server.processImage(appInstanceId, path);
}
gdo.net.app["Twitter"].startGraphApp = function (appInstanceId, path) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server start Graph app at instance ' + appInstanceId);
    gdo.net.app["Graph"].server.initiateProcessing(appInstanceId, path);
}

gdo.net.app["Twitter"].closeApp = function(section) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server close app');
    var result = gdo.net.server.closeApp(section.appInstanceId);
    console.log(result);
}
gdo.net.app["Twitter"].closeApps = function (sections) {
    sections.forEach(function(section) {
        gdo.net.app["Twitter"].closeApp(section);
    })
};

//
//gdo.net.app["Twitter"].clearCave = function (instanceId, sectionIds, appInstanceIds) {
//    gdo.net.app["Twitter"].closeApps(appInstanceIds);
//    gdo.net.app["Twitter"].closeSections(sectionIds);
//}

////////////////////////////////////////////////////////////////////////////////////////////////////
//Functions Calling Twitter Hub
////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].getPseudoCaveStatus = function (instanceId, refreshN) {
    gdo.consoleOut('.Twitter', 1, 'Getting pseudo cave status: ' + instanceId + " refresh loop: " + refreshN);
    gdo.net.app["Twitter"].server.getPseudoCaveStatus(instanceId, refreshN);
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

gdo.net.app["Twitter"].requestCreateSections = function(instanceId, sections) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub create new sections (" + sections.length + ") for instance: " + instanceId);
    gdo.net.app["Twitter"].server.createSections(instanceId, JSON.stringify(sections));
}

gdo.net.app["Twitter"].reqeustAutoLoadSections = function(instanceId, sections) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub auto create sections");
    gdo.net.app["Twitter"].server.autoLaunchSections(instanceId, JSON.stringify(sections));
}

gdo.net.app["Twitter"].requestCreateSection = function (instanceId, colStart, rowStart, colEnd, rowEnd) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub create new section for instance: " + instanceId);
    gdo.net.app["Twitter"].server.createSection(instanceId, colStart, rowStart, colEnd, rowEnd);
}
gdo.net.app["Twitter"].requestCloseSection= function(instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub close section: " + sectionId);
    gdo.net.instance[instanceId].control.selectedSection = -1;
    gdo.net.app["Twitter"].server.closeSection(instanceId, sectionId);
    
}


gdo.net.app["Twitter"].requestDeployApp = function(instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub deploy app at section: " + sectionId);
    gdo.net.instance[instanceId].control.selectedSection = -1;
    gdo.net.app["Twitter"].server.deployApps(instanceId, [sectionId]);
}
gdo.net.app["Twitter"].requestDeployAllApps = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub deploy all loaded visualisation apps");
    gdo.net.instance[instanceId].control.selectedSection = -1;
    gdo.net.app["Twitter"].server.deployApps(instanceId, []);
}
gdo.net.app["Twitter"].requestCloseApp = function (instanceId, sectionId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub close app at section: " + sectionId);
    gdo.net.instance[instanceId].control.selectedSection = -1;
    gdo.net.app["Twitter"].server.closeApp(instanceId, sectionId);
}


gdo.net.app["Twitter"].requestClearCave = function (instanceId) {
    gdo.consoleOut('.Twitter', 1, "Requesting hub to clear cave");
    gdo.net.instance[instanceId].control.selectedSection = -1;
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

gdo.net.app["Twitter"].requestNewAnalytics = function(newAnalytics) {
    gdo.net.app["Twitter"].server.getNewAnalytics(gdo.controlId, JSON.stringify(newAnalytics));
}

////////////////////////////////////////////////////////////////////////////////////////////////////

gdo.net.app["Twitter"].terminateClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Client at Node ' + clientId);
}

gdo.net.app["Twitter"].ternminateControl = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Control at Instance ' + gdo.controlId);
}