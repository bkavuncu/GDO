function SignalrNet(config) {
    DD3NetInterface.call(this, config);
    this.dd3Server = $.connection.dD3AppHub;
    this.instanceId = this.dd3Server.instanceId;
    this.server = this.dd3Server.server;
    this.client = this.dd3Server.client;
    this.signalR_callback = {};
    this.syncCallback = function () { };
    this.receiveSynchronize = function () {
        this.syncCallback();
    };
}

/*SignalrNet inherits the APIs in DD3NetInterface, this function is defined in gdo.apps.dd3.net.js*/
inherit(SignalrNet, DD3NetInterface);

/*the following interfaces are implemented in gdo.apps.dd3.singalrnet.js*/
SignalrNet.prototype.setBrowser = function (browser) {}

SignalrNet.prototype.setUtils = function (utils) {}

SignalrNet.prototype.on = function (eventName, callback) {}

SignalrNet.prototype.emit = function (eventName, data) {}

SignalrNet.prototype.init = function (conn, r, c) {}

SignalrNet.prototype.connect = function (r, c) {}

SignalrNet.prototype.receive = function (data) {}

SignalrNet.prototype.sendTo = function (r, c, data, buffer) {}

SignalrNet.prototype.flush = function (r, c) {}

/*Signalr Interface implementation*/
SignalrNet.prototype.synchronize = function (r, c) {
    signalR.server.synchronize(signalR.sid);
}

SignalrNet.prototype.updateInformation = function () {}

SignalrNet.prototype.setCallBack = function (caveConfiguration, dd3_data) {
    this.signalR_callback.receiveSynchronize = this.receiveSynchronize;
    if (caveConfiguration)
        this.signalR_callback.receiveConfiguration = caveConfiguration;
    if (dd3_data) {
        this.signalR_callback.receiveDimensions = dd3_data.receiveDimensions;
        this.signalR_callback.receiveData = dd3_data.receiveData;
        this.signalR_callback.receiveRemoteDataReady = dd3_data.receiveRemoteDataReady;
    }
}

SignalrNet.prototype.updateController = function () {

}

SignalrNet.prototype.receiveControllerOrder = function () {}

SignalrNet.prototype.receiveGDOConfiguration = function () {}

SignalrNet.prototype.dd3Receive = function () {}

