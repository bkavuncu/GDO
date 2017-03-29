var gdo_appInstanceId;
/*gdo code*/
gdo.net.app.DD3.displayMode = 0;    //TODO: email david about it

//Initialize the application node, set the orderController, the instance id, the main callback and call initDD3App;
//BAI: this function is called in App.cshtml to initialize initDD3App(). "initDD3App" functions has a returned value "dd3".
//BAI: When we call this function in App.cshtml, the "dd3" value defined in the html file is equal to the "dd3" object defined in "gdo.apps.dd3.js" file.
gdo.net.app.DD3.initClient = function (launcher, orderController) {
    gdo.consoleOut('.DD3', 1, 'Initializing DD3 App Client at Node ' + gdo.clientId);
    gdo_appInstanceId = gdo.net.node[gdo.clientId].appInstanceId;
    orderTransmitter = orderController;
    main_callback = launcher;
    return initDD3App();
};

//Initialize the controller node.
//BAI: this function is called in Control.cshtml to get the "gdo_appInstanceId" value. "gdo_appInstanceId" represent the application set up in the GDO environment.
gdo.net.app.DD3.initControl = function (callback) {
    //console.log("gdo.initcontrol");
    gdo.consoleOut('.DD3', 1, 'Initializing DD3 App Control at Instance ' + gdo.clientId);
    //BAI: here main_callback is defined in the the "Control.cshtml" file. The name is just callback with an argument "message".
    //After this initControl is called, the above function "dd3Server.client.updateController" is also called by the function "updateController" defined in DD3AppHub.cs file.
    main_callback = callback;
    //BAI: the following code means it will call the function "defineController" which is defiend in the backend (DD3AppHub.cs).
    dd3Server.server.defineController(gdo.net.instance[gdo.controlId].id);
    return gdo.net.instance[gdo.controlId].id;
};

/**What to do when application node is killed => log it + remove the client from SignalR*/
gdo.net.app.DD3.terminateClient = function () {
    gdo.consoleOut('.DD3', 1, 'Terminating DD3 App Client at Node ' + gdo.clientId);
    dd3Server.server.removeClient(gdo_appInstanceId);//in DD3AppHub and DD3App
};

/**What to do when controller node is killed => just log it*/
gdo.net.app.DD3.terminateControl = function () {
    gdo.consoleOut('.DD3', 1, 'Terminating DD3 App Control at Instance ' + gdo.clientId);
};