if (typeof $ === undefined || typeof gdo === undefined) {
    throw new Error('jQuery is not defined');
} else {
    gdo.net.app["Hercules"].displayMode = 0;

    gdo.net.app["Hercules"].initClient = function (launcher, orderController) {
        gdo.consoleOut('.Hercules', 1, 'Initializing Hercules App Client at Node ' + gdo.clientId);
    }

    gdo.net.app["Hercules"].initControl = function (callback) {
        gdo.consoleOut('.Hercules', 1, 'Initializing Hercules App Control at Instance ' + gdo.clientId);
    }

    gdo.net.app["Hercules"].terminateClient = function () {
        gdo.consoleOut('.Hercules', 1, 'Terminating Hercules App Client at Node ' + gdo.clientId);
        HerculesServer.server.removeClient(HerculesServer.instanceId);
    }

    gdo.net.app["Hercules"].terminateControl = function () {
        gdo.consoleOut('.Hercules', 1, 'Terminating DD3 App Control at Instance ' + gdo.clientId);
    }

}