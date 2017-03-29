var dd3;

//start final intergrating.
//we load the d3 library WITHOUT the requestAnimationFrame function. Therefore, the d3.timer will fall back on using the timeout function
//This prevents animations from slowing down.
var temp_raf = requestAnimationFrame;
var temp_perf = performance;
requestAnimationFrame = undefined;
performance = undefined;
//BAI: use AJAX to load a js file from server.
$.getScript('Scripts/d3.v4.js',
    function (data, textStatus) {
        d3.now();
        requestAnimationFrame = temp_raf;
        performance = temp_perf;
    });
//BAI: refer to selection.raise in d3.v4
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};
//BAI: refer to selection.lower in d3.v4
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};



var app = {
    //BAI: the reason we use parent is that this App.cshtml file will emebeded into instance.cshtml as an iframe item. 
    //BAI: Therefore, parent represents the object of instance.cshtml. And there must be a gdo object in the instance.cshtml file.
    gdo: parent.gdo,
    gdoApp: parent.gdo.net.app["DD3"].initClient,
    test_bench: {},
    init: function (launcher, orderController) {
        dd3 = this.gdoApp(launcher, orderController);
        appTestBench.init(app.orderController);
        app.test_bench = appTestBench.test_bench;
        return dd3;
    },
    //Launch the data viz if dd3 is ready, else wait before launching
    //BAI: this launcher function will be defined as "main callback" function in gdo.apps.dd3.js
    launcher: function (configId) {
        console.log("dd3 obj", dd3);
        if (dd3.state() === "ready") {
            //console.log(configId);
            //console.log(this.test_bench);
            //console.log(app.test_bench);
            //console.log(123);
            app.test_bench[configId](configId);
        } else {
            dd3.on('ready', app.test_bench[configId].bind(null, configId));
        }
    },
    //BAI: this orderController function will be defined as "orderTransmitter" function in gdo.apps.dd3.js
    orderController : (function () {
        var t = function (order) {
            app.orderController.orders[order.name] ?
            app.orderController.orders[order.name].apply(null, order.args) :
            app.gdo.consoleOut('.DD3', 4, 'No test function corresponding to ' + order.name);
        };
        //BAI: ".orders" reprents what kind of commands the controler wants to clients to follow
        t.orders = {};

        return t;
    })()
}

$(document).ready(function () {
 
   
  
    if (!app.gdoApp) {
        $("#error").css("display", "");
        //BAI: parent reprents the instance.cshtml file. Because this app.cshtml will be embeded into instance.cshtml as an iframe item.
        parent.location.reload();
        return;
    }
    // Launch dd3 providing the orderController to receive order from the controller page
    //BAI: this function is defined in gdo.apps.dd3.js file which is called "gdo.net.app.DD3.initClient".
    //BAI: orderController means the controller to receive order
    dd3 = app.init(app.launcher, app.orderController);


   

    //BAI: the following code is before the code organization
    /*
    // Get the configId
    gdo.net.app.DD3.config.some(function (c) { return (gdo.net.app.DD3.config[c]) ? (configName = c, true) : false; });
    configId = gdo.net.app.DD3.config[configName].id;
    */

   
});


