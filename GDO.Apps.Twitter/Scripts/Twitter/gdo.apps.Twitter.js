$(function () {
    gdo.consoleOut('.Twitter', 1, 'Loaded Twitter JS');
    $.connection.twitterAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Twitter', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Twitter', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }

    $.connection.twitterAppHub.client.setMessage = function(message) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }

    $.connection.twitterAppHub.client.updateDataSetList = function(dataSetList) {
        var dataSets = JSON.parse(dataSetList);

        gdo.consoleOut('.Twitter', 1, "Updating datasets");
        console.log(dataSetList);
        console.log(dataSets);

        $("iframe").contents().find("#dataset_table tbody tr").remove();           
        for (var i = 0; i < dataSets.length; i++) {
            $("iframe").contents().find("#dataset_table tbody").append('' +
                '<tr>' +
                    '<td><font size="3">' + dataSets[i]["Id"] + '</font></td>' +
                    '<td><font size="3">' + dataSets[i]["Description"] + '</font></td>' +
                    '<td><font size="3">' + dataSets[i]["Status"] + '</font></td>' +
                '</tr>');
        }
    }

    $.connection.twitterAppHub.client.updateAnalyticsList = function(datasetId, analyticsList) {
        console.log(analyticsList);
        var analyticsList = JSON.parse(analyticsList);
        gdo.consoleOut(".Twitter", 1, "Updating analytics list for dataset: " + datasetId);
        console.log(analyticsList);
        $("iframe").contents().find("#current_dataset_desc").html(datasetId);
        $("iframe").contents().find("#analytics_table tbody tr").remove();
        for (var i = 0; i < analyticsList.length; i++) {
            $("iframe").contents().find("#analytics_table tbody").append('' +
                '<tr>' +
                    '<td><font size="3">' + analyticsList[i]["Classification"] + '</font></td>' +
                    '<td><font size="3">' + analyticsList[i]["Type"] + '</font></td>' +
                    '<td><font size="3">' + analyticsList[i]["Description"] + '</font></td>' +
                    '<td><font size="3">' + analyticsList[i]["Status"] + '</font></td>' +
                '</tr>');
        }

        

    }

    $.connection.twitterAppHub.client.createSubSection =  function (colStart, rowStart, colEnd, rowEnd) {
        gdo.consoleOut('.Twitter', 1, "Creating subsection: " + colStart + " " + rowStart + " " + colEnd + " " + rowEnd);
        gdo.net.server.createSection(colStart, rowStart, colEnd, rowEnd);
    }

    $.connection.twitterAppHub.client.deployApp = function (sectionId, appName, config) {
        gdo.consoleOut('.Twitter', 1, "Deploying app:" + appName + " to section " + sectionId);
        gdo.net.server.deployBaseApp(sectionId, appName, config);
    }

    $.connection.twitterAppHub.client.launchStaticHTML = function (instanceId, url) {
        gdo.consoleOut('.Twitter', 1, "Setting url" + url);
        gdo.net.app["StaticHTML"].server.setURL(instanceId, url);

    }

});

gdo.net.app["Twitter"].initClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Client at Node ' + gdo.clientId);
}

gdo.net.app["Twitter"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Twitter"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Twitter', 1, 'Initializing Twitter App Control at Instance ' + gdo.controlId);
    $("iframe")
        .contents()
        .find("#get_data")
        .unbind()
        .click(function () {
            gdo.net.app["Twitter"].server.getDataSets(gdo.controlId);
            gdo.consoleOut('.Twitter', 1, "Launching");
//            gdo.net.server.createSection(0, 0, 1, 1);
//            gdo.net.server.deployBaseApp(2, "StaticHTML", "Default");
//            gdo.net.app.StaticHTML.server.setURL(1, url);
//            gdo.net.app["Twitter"].server.launch(gdo.controlId);
            //gdo.net.server.createSection(2, 0, 4, 4);
            //gdo.net.server.deployBaseApp(3, "StaticHTML", "Default");
            //gdo.net.app.StaticHTML.server.setURL(1, "http://www.bing.com");

        });
    $("iframe")
    .contents()
    .find("#launch_sections")
    .unbind()
    .click(function () {
        gdo.net.app["Twitter"].server.launch(gdo.controlId);
        gdo.consoleOut('.Twitter', 1, "Launching sections");
    });

    
}



gdo.net.app["Twitter"].terminateClient = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Client at Node ' + clientId);
}

gdo.net.app["Twitter"].ternminateControl = function () {
    gdo.consoleOut('.Twitter', 1, 'Terminating Twitter App Control at Instance ' + gdo.controlId);
}
