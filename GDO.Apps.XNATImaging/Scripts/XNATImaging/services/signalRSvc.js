app.value('$', $);
app.service('signalRSvc', ["$", "$rootScope", function ($, $rootScope) {
    var proxy = null;
    console.log("Service start");
    var initialize = function () {
        
        //Getting the connection object without generated proxy
        var connection = $.hubConnection();

        //Creating proxy
        proxy = connection.createHubProxy('xNATImagingAppHub');

        //Publishing an event when server pushes a greeting message
        proxy.on('receiveControl', function (instanceId, controlName) {
            console.log('SignalR Received: ' + instanceId + ' ' + controlName);
            $rootScope.$emit("receivingControl", instanceId, controlName);
        });

        connection.stop();
        connection.start().done(function () {
            console.log("Connected");
        });
    };
    console.log("Service end");
    /*var sendRequest = function () {
        //Invoking greetAll method defined in hub
        this.proxy.invoke('setControl');
    };*/

    return {
        initialize: initialize
        //sendRequest: sendRequest
    };
}]);