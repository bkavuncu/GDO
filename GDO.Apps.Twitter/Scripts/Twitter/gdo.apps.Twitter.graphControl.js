gdo.net.app["Twitter"].hideLinks = function (instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Hide Links.");
        gdo.net.app["Graph"].server.hideLinks(id);
    }
}

gdo.net.app["Twitter"].showLinks = function (instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Show Links.");
        gdo.net.app["Graph"].server.showLinks(id);
    }
}

gdo.net.app["Twitter"].hideLabels = function (instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Hide labels.");
        gdo.net.app["Graph"].server.hideLabels(id);
    }
}

gdo.net.app["Twitter"].showLabels = function (instanceId, label, color)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Show labels.");
        gdo.net.app["Graph"].server.showLabels(id, label, color);
    }
}

gdo.net.app["Twitter"].renderMostConnectedNodes = function (instanceId, numberLinks, color)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Rendering most connected nodes.");
        gdo.net.app["Graph"].server.renderMostConnectedNodes(id, numberLinks, color);
    }
}

gdo.net.app["Twitter"].renderMostConnectedLabels = function (instanceId, numberLinks, label, color)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Rendering labels of most connected nodes.");
        gdo.net.app["Graph"].server.renderMostConnectedLabels(id, numberLinks, label, color);
    }
}

gdo.net.app["Twitter"].hideMostConnected = function (instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Hide most connected nodes.");
        gdo.net.app["Graph"].server.hideMostConnected(id);
    }  
};

gdo.net.app["Twitter"].initiateSearch = function (instanceId, keywords, fields)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Start searching for label -- " + keywords);
        gdo.net.app["Graph"].server.initiateSearch(id, keywords, fields);
    }
}

gdo.net.app["Twitter"].searchTweets = function (instanceId, keywords) {
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Start searching for tweet -- " + keywords);
        gdo.net.app["Graph"].server.initiateSearch(id, keywords, "tweet");
        gdo.net.app["Graph"].server.renderSearchLabels(id, "tweet");
    }
}

gdo.net.app["Twitter"].searchUsers = function (instanceId, keywords) {
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Start searching for user -- " + keywords);
        gdo.net.app["Graph"].server.initiateSearch(id, keywords, "username");
    }
}

gdo.net.app["Twitter"].hideTimeNodes = function (instanceId) {
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Hiding time nodes");
        gdo.net.app["Graph"].server.hideSearch(id);
    }
}

gdo.net.app["Twitter"].showTimeNodes = function (instanceId) {
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Showing time nodes");
        gdo.net.app["Graph"].server.initiateSearch(id, "time", "node_type");
        gdo.net.app["Graph"].server.renderSearchLabels(id, "time");
    }
}

gdo.net.app["Twitter"].renderSearchLabels = function(instanceId, label)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Rendering labels of selected nodes.");
        gdo.net.app["Graph"].server.renderSearchLabels(id, label);
    }
}

gdo.net.app["Twitter"].hideSublinks = function(instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Show sub links.");
        gdo.net.app["Graph"].server.hideSublinks(id);
    }
}

gdo.net.app["Twitter"].hideSearch = function (instanceId)
{
    for (var i = 0; i < gdo.net.instance[instanceId].control.selectedGraphApps.length; ++i) {
        var id = gdo.net.instance[instanceId].control.selectedGraphApps[i];
        gdo.consoleOut('.Twitter', 1, 'Instance ' + instanceId + " controlling " + id + ": Hide search.");
        gdo.net.app["Graph"].server.hideSearch(id);
    }
}

