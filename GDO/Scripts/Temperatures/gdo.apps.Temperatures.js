$(function () {
    gdo.consoleOut('.Temperatures', 1, 'Loaded GDO Temps JS');
 
    $.connection.temperaturesAppHub.client.setMessage = function(message) {
        gdo.consoleOut('.Temperatures', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    // a command from the server to call back to server to request a new URL 
    $.connection.temperaturesAppHub.client.refresh = function() {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Temperatures', 1, 'Server has requested client to ask server for new config ');
            //$("iframe").contents().find("#tempDisplay").attr("src", videoUrl);
            //
            // call back to the server to request our new poll url
            gdo.consoleOut('.Temperatures', 1, 'asking for config for ' + gdo.net.node[gdo.clientId].appInstanceId + ' ' +
                gdo.net.node[gdo.clientId].sectionCol + ' ' +
                gdo.net.node[gdo.clientId].sectionRow + ' ' +
                gdo.clientId);
            gdo.net.app["Temperatures"].server.requestNewUrl(gdo.net.node[gdo.clientId].appInstanceId,
                gdo.net.node[gdo.clientId].sectionCol,
                gdo.net.node[gdo.clientId].sectionRow,
                gdo.clientId);
            gdo.consoleOut('.Temperatures', 1, 'asked ');
        }
    }

    // receive a new url from server and then poll on it, also set the datafield to view
    $.connection.temperaturesAppHub.client.receiveDataUpdate = function(url, datafield) {
        gdo.consoleOut('.Temperatures', 1, 'Received new url from server: ' + url + ' datafield=' + datafield);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Temperatures', 1, 'received new config ' + url + ' ' + datafield);
            gdo.net.app["Temperatures"].pollURL = url;
            gdo.net.app["Temperatures"].datakey = datafield;
            $.connection.temperaturesAppHub.client.refreshData();
        }
    }

    // refresh data from the postURL 
    $.connection.temperaturesAppHub.client.refreshData = function () {
        var url = gdo.net.app["Temperatures"].pollURL;
        var dataKey = gdo.net.app["Temperatures"].datakey;
        if (url == null) return;

        // get the url 

        $.getJSON(url, function(data) {
            // parse the 1 record we requested

            $.each(data.sensorRecords[0].sensorObject, function () {
                gdo.consoleOut('.Temperatures', 1, 'data'+this.fieldName +"="+this.value);
                gdo.net.app["Temperatures"].pollURL = url;
                if (this.fieldName == dataKey) {
                    gdo.consoleOut('.Temperatures', 1, 'found data'+this.fieldName +"="+this.value);
                    $("iframe").contents().find("#CurrentData").html( parseFloat(this.value).toFixed(2));
                }              
            });

                        // todo get bounds
                        // todo post bounds 
                        // todo get bounds
                        // todo set up the refresh methods
                        
        });
    }

});

// data stores
gdo.net.app["Temperatures"].datakey = "";
gdo.net.app["Temperatures"].pollURL = "";
gdo.net.app["Temperatures"].mindata = "";
gdo.net.app["Temperatures"].maxdata = "";

gdo.net.app["Temperatures"].initClient = function () {
    gdo.consoleOut('.Temperatures', 1, 'Initializing GDO Temps App Client at Node ' + gdo.clientId); 
}

gdo.net.app["Temperatures"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.consoleOut('.Temperatures', 1, 'Initializing Temperatures App Control at Instance ' + gdo.controlId);    
}

gdo.net.app["Temperatures"].terminateClient = function () {
    gdo.consoleOut('.Temperatures', 1, 'Terminating Temperatures App Client at Node ' + gdo.clientId);
}

gdo.net.app["Temperatures"].ternminateControl = function () {
    gdo.consoleOut('.Temperatures', 1, 'Terminating Temperatures App Control at Instance ' + gdo.controlId);
}

