// These functions need to be defined before signalR is started, so we need to use a callback system:
// signalR_callback is defined later in dd3 when it is initiated.




//BAI: "dd3Server" represents a object of the class "DD3AppHub" in "DD3AppHub.cs" file.
var dd3Server = $.connection.dD3AppHub;//Contains all methods of AppHub

//console.log("dd3Server", dd3Server);
//console.log("dd3Hub", dd3Hub);
//BAI: signalR_callback.receiveConfiguration = init.getCaveConfiguration;
//BAI: signalR_callback.receiveSynchronize = signalR.receiveSynchronize;
//BAI: signalR_callback.receiveDimensions = dd3_data.receiveDimensions;
//BAI: signalR_callback.receiveData = dd3_data.receiveData;
//BAI: signalR_callback.receiveRemoteDataReady = dd3_data.receiveRemoteDataReady;
//var signalR_callback = {};//Contains server interaction functions
//BAI: this argument will be set the value in the function "gdo.net.app.DD3.initClient". Therefore, the main_callback is the function "launcher" in "App.cshtml" file.
//BAI "main_callback" is the "launcher" function.
var main_callback; // Callback inside the html file called when the configuration of GDO is received for application node or when the controller is updated for a controller
var orderTransmitter; // Callback inside the html file when the client is initialized

// Function used for dd3 callback
// BAI: all the following function starting with dd3Server are called in the C# code in the DD3AppHub.cs file.
// BAI: DD3Q: if dd3Server.client has no relationship with the functions defined in the DD3AppHub.cs file. 
// BAI: the following code is to define a function called "dd3Receive" in the front end which can be called by backend. (Here, it will be called by DD3AppHub.cs and some part in this file.)
// BAI: DD3Q: why the arguments in the definition is only one, but when we call this function in the above code in this file, several arguments are passed into this function.


//BAI: f represents the name of the function.

/*
dd3Server.client.dd3Receive = function (f) {
    console.log("fffffffffffffff", f);
    console.log("arguments", arguments);
    //BAI: arguments is the object to call the "slice" method, and "1" is the parameter in the "slice" method like arguments.slice(1);
    dd3Net.signalR_callback[f].apply(null, [].slice.call(arguments, 1));
};
*/

// Non-dd3 functions

// called by AppHub when the configuration is broadcasted. Execute main_callback as defined in HTML file
// BAI: TODO: this part should be replaced by a separated singalr server not the gdo server
// BAI: this function only decides which test_bench will be called.

/*
dd3Server.client.receiveGDOConfiguration = function (id) {
    console.log("receiveGDOConfiguration", main_callback);
    // To get configId from server
    if (main_callback) {
        main_callback(id);
    } else {
        gdo.consoleOut('.DD3', 1, 'No callback defined');
    }
    main_callback = null;
};
*/


//called from AppHub. orderTransmitter is actually the orderController defined in html file. 
//It isn't in the library as the controller embed the application logic.

/*
dd3Server.client.receiveControllerOrder = function (orders) {
    console.log("run receiveControllerOrder");
    if (orderTransmitter) {
        orders = JSON.parse(orders);
        gdo.consoleOut('.DD3', 1, 'Order received : ' + orders.name + ' [' + orders.args + ']');
        orderTransmitter(orders);
    } else {
        gdo.consoleOut('.DD3', 4, 'No test controller defined');
    }
};
*/


// ==== IF THIS NODE IS A CONTROLLER ====
//BAI: I dont think the following code is for the contoller node.
//What to do when the controller is updated by the server => execute main_callback on  the received object.
//dd3Net.net.clientupdateController();

/*
dd3Server.client.updateController = function (obj) {
    console.log("run updateController");
    gdo.consoleOut('.DD3', 1, 'Controller : Receiving update from server');
    if (main_callback) {
        //console.log("main_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callback");
        //console.log(main_callback);
        main_callback(JSON.parse(obj));
    }
};
*/