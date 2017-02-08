$(document).ready(function () {
    console.log('Document Ready');
    var gdo = parent.gdo,
        configName,
        configId,
        test_bench = {};

    /*
    // Get the configId
    gdo.net.app.DD3.config.some(function (c) { return (gdo.net.app.DD3.config[c]) ? (configName = c, true) : false; });
    configId = gdo.net.app.DD3.config[configName].id;
    */

    //Launch the data viz if dd3 is ready, else wait before launching
    var launcher = function (configId) {
        if (dd3.state() === "ready") {
            test_bench[configId](configId);
        } else {
            dd3.on('ready', test_bench[configId].bind(null, configId));
        }
    };

    var orderController = (function () {
        var t = function (order) {
            orderController.orders[order.name] ?
            orderController.orders[order.name].apply(null, order.args) :
            gdo.consoleOut('.DD3', 4, 'No test function corresponding to ' + order.name);
        };

        t.orders = {};

        return t;
    })();

    if (!gdo.net.app["DD3"].initClient) {
        $("#error").css("display", "");
        parent.location.reload();
        return;
    }

    // Launch dd3 providing the orderController to receive order from the controller page
    dd3 = gdo.net.app["DD3"].initClient(launcher, orderController);

});