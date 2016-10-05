$(function () {
    gdo.consoleOut('.Twitter', 1, 'Loaded Twitter JS');

    $.connection.twitterAppHub.client.setMessage = function (instanceId, message, error) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setMessage(message,error);
        } 
    }
    
    $.connection.twitterAppHub.client.setAPIMessage = function (instanceId, message) {
        gdo.consoleOut('.Twitter', 1, 'API message from server: ' + message);
        var messageDes = JSON.parse(message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setAPIMessage(instanceId, messageDes);
            gdo.consoleOut('.Twitter', 1, 'Using data set endpoint : ' + messageDes.uri_data_set);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
            $("iframe").contents().find("#client_api_status_message").empty().append(messageDes.msg);
            if (messageDes.healthy) {
                $("iframe")
                    .contents()
                    .find("#client_status")
                    .removeClass("fa-circle-o-notch")
                    .removeClass("fa-spin")
                    .addClass("fa-check-circle")
                .css("color", "#24ca00");
                
            } else {
                $("iframe")
                    .contents()
                    .find("#client_status")
                    .removeClass("fa-circle-o-notch")
                    .removeClass("fa-spin")
                    .addClass("fa-times-circle-o")
                 .css("color", "#ff0000");;
            }
 
        }
    }

    $.connection.twitterAppHub.client.receiveFileLists = function (instanceId, fileLists) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].setFileLists(instanceId, JSON.parse(fileLists));
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

    $.connection.twitterAppHub.client.updateSlides = function (instanceId, slides) {
        gdo.consoleOut('.Twitter', 1, 'Received new slides');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Twitter"].updateSlideTable(instanceId, JSON.parse(slides));
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

gdo.net.app["Twitter"].initClient = function() {
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Client at Node ' + gdo.clientId);

    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    var screenWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
    var screenHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
        gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;
    var xOffset = -gdo.net.node[gdo.clientId].sectionCol * screenWidth;
    var yOffset = -gdo.net.node[gdo.clientId].sectionRow * screenHeight;
    var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
    var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;
    var origin = "0% 0%";
    var transform = "translate(" + xOffset + "px," + yOffset + "px)";

    $("iframe")
       .contents()
       .find("#page_wrapper")
       .css("width", screenWidth + "px")
        .css("height", screenHeight + "px");


    $("iframe")
        .contents()
        .find("#wrapper")
        .css("-moz-transform", transform)
        .css("-moz-transform-origin", origin)
        .css("-o-transform", transform)
        .css("-o-transform-origin", origin)
        .css("-webkit-transform", transform)
        .css("-webkit-transform-origin", origin)
        .css("width", width + "px")
        .css("height", height + "px");
}

gdo.net.app["Twitter"].initControl = function () {

    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Control at Instance ' + gdo.controlId);
    gdo.loadScript("sectionTables", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("ui", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("sectionButtons", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("graphControl", "Twitter", gdo.SCRIPT_TYPE.APP);
    gdo.loadScript("util", "Twitter", gdo.SCRIPT_TYPE.APP);
    
   
    //app["Twitter"]
    //.data contains information on the data sets and anytics
    //.caveStatus contains information on the nodes and sections
    //.control contains information regarding interface
    //.apiStatus bool if connection with api is healthy

    gdo.net.instance[gdo.controlId].data = {}
    gdo.net.instance[gdo.controlId].caveStatus = {}
    gdo.net.instance[gdo.controlId].control = {
        selectedNewAnalytics: [],
        selectedDataSet: -1,
        selectedSection: -1,
        selectedAnalytics: null,
        selectedDataSets: [],
        analyticsDisplay: {},
        selectedGraphApps: [],
        selectedApp: null,
        selectedSlide: null
    }
    gdo.net.app["Twitter"].getPseudoCaveStatus(gdo.controlId, 0);
    gdo.net.app["Twitter"].server.initApiConnection(gdo.controlId);
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
    gdo.net.server.createSection(section.col, section.row,
        section.col + section.cols - 1,
        section.row + section.rows - 1);
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
            gdo.consoleOut('.Twitter', 1, 'Requesting server start Graph app with path  = ' + section.twitterVis.filePath + "' at instance " + section.appInstanceId);
            gdo.net.app["Graph"].server.initiateProcessing(section.appInstanceId, section.twitterVis.filePath);
            break;
        case "Images":
            gdo.consoleOut('.Twitter', 1, "Requesting server start Image app at instance " + section.appInstanceId);
            gdo.net.app["Images"].server.displayImage(section.appInstanceId, section.twitterVis.filePath, 2);
//            gdo.net.app["Images"].server.processAndLaunch(section.appInstanceId, section.twitterVis.filePath);
            break;
        case "StaticHTML":
            gdo.consoleOut('.Twitter', 1, 'Requesting server start StaticHTML app with url = "' + section.twitterVis.filePath + "' at instance " + section.appInstanceId);
            gdo.net.app["StaticHTML"].server.setURL(section.appInstanceId, section.twitterVis.filePath);
            break;
        case "FusionChart":
            gdo.consoleOut('.Twitter', 1, 'Requesting server start FusionChart app with path = "' + section.twitterVis.filePath + "' at instance " + section.appInstanceId);
            gdo.net.app["FusionChart"].server.processFile(section.appInstanceId, section.twitterVis.filePath);
        default:
            gdo.consoleOut('.Twitter', 2, 'App is an unknown type could not be deployed');
            break;
    }
}

gdo.net.app["Twitter"].closeApp = function(section) {
    gdo.consoleOut('.Twitter', 1, 'Requesting server close app on section ' + section.id);
    gdo.net.server.closeApp(section.appInstanceId);
}
gdo.net.app["Twitter"].closeApps = function (sections) {
    sections.forEach(function(section) {
        gdo.net.app["Twitter"].closeApp(section);
    });
};


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
gdo.net.app["Twitter"].launchSlide = function (instanceId, slide) {
    gdo.consoleOut('.Twitter', 1, "Attempting to launch slide " + slide.id);
    var sectionRequests = [];
    for (var i = 0; i < slide.sections.length; ++i) {
        if (!gdo.net.app["Twitter"].sectionIsFree(instanceId, slide.sections[i].colStart, slide.sections[i].colEnd,
            slide.sections[i].rowStart, slide.sections[i].rowEnd)) {

            var msg = 'Slide section with coordinates: ' +
                slide.sections[i].colStart + " " +
                slide.sections[i].colEnd + " " +
                slide.sections[i].rowStart + " " +
                slide.sections[i].rowEnd + " could not be started as node is already allocated";
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
    if (sectionRequests.length > 0) {
        gdo.net.app["Twitter"].server.autoLaunchSections(instanceId, JSON.stringify(sectionRequests));
    }
}


gdo.net.app["Twitter"].terminateClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Client at Node ' + clientId);
}

gdo.net.app["Twitter"].ternminateControl = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Control at Instance ' + gdo.controlId);
}