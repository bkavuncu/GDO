var instanceId;


d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};



var control = {
    gdo: parent.gdo,
    gdoApp: parent.gdo.net.app["DD3"].initControl,
    server: parent.gdo.net.app.DD3.server,
    //dataset:null,
    eventLog:[],
    confId:null,
    numClients:null,
    test_bench: {},
    init: function(callback) {
        //BAI: not sure if the following code is useful or not
        this.gdo.controlId = parseInt(this.getUrlVar("controlId"));
        return this.gdoApp(callback);
    },
    getUrlVar: function (variable) {
        /// <summary>
        /// Gets the URL variable.
        /// </summary>
        /// <param name="variable">The variable.</param>
        /// <returns></returns>
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        query = window.frames['control_frame_content'].location.search.substring(1);
        vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        return false;
    },
    callback: function(message) {
        control.gdo.consoleOut(".DD3", 4, "Callback Message: " + message);
        //BAI: change num to string
        control.confId = message.configurationId+'';
        control.numClients = message.numClient;
        //BAI: we need to init controlTestBench, because we need to get the numClients in this callback function. After we get the numClients, we can pass this value into controlTestBench obj.
        controlTestBench.init(control.server, control.numClients);
        control.test_bench = controlTestBench.test_bench;

        if (message.state == 1) {
            control.test_bench[control.confId] && control.test_bench[control.confId]();
            control.test_bench[control.confId] = null;
            $("#wait").css("display", "none");
            //BAI:change the num to string
            if (control.confId === '6' || control.confId === '7' || control.confId === '8' || control.confId === '9') {  // all of these are Shangai LinkLoad, and should share the control menu
                $("#control_6").css("display", "");
            }else {
                $("#control_" + control.confId).css("display", "");
            }
        }
    }
};

var peer = {
    // == FPS ==
    peerObject: { host: "146.169.32.109", port: 55555 },

    init: function () {
        //{ host: "localhost", port: 55555 };
        //{ host: "146.169.32.109", port: 55555 }
        var con_peer = new Peer("idofthecontrollerfordd3", this.peerObject);
        con_peer.on('open', function(conn) {
            control.gdo.consoleOut()(".DD3", 4, "The peer client of the controller is opened");
        });
        con_peer.on('connection', function(conn) {
            control.eventLog.push([new Date().getTime(), "Connecting with  "+ conn.label]);
            //BAI: "con_peer" is the controller peer connection object
            conn.on('data', function (data) {
                var raw = data.split(';');
                var row = raw[0];
                var col = raw[1];
                var nbr = raw[2];
                var nbc = raw[3];
                var nbdc = raw[4];
                var ts = raw[5];
                var fps = raw[6];
                var std = raw[7];
                controlTestBench.dataset.push([row, col, nbr, nbc, nbdc, ts, fps, std]);
                //gdo.consoleOut(".DD3", 4, dataset);
                //updateFPSChart();
            });  
        });
    }
}


$(document).ready(function () {
    //BAI: controlTestBench init is put in the "callback" in the above control object. The reason is the callback is asynchronous.
    //controlTestBench.init(control.server, control.dataset, control.numClients, control.eventLog);
    //control.test_bench = controlTestBench.test_bench;
    

    if (!control.gdoApp) {
        $("#wait").css("display", "none");
        //BAI: change num to string
        if (control.confId === '6' || control.confId === '7' || control.confId === '8' || control.confId === '9') { // all of these are Shangai LinkLoad, and should share the control menu
            $("#control_6").css("display", "");
        } else {
            $("#control_" + control.confId).css("display", "");
        }
    }

    peer.init();

    if (!control.gdoApp) {
        $("#wait").css("display", "none");
        $("#error").css("display", "");
        return;
    }

    instanceId = control.init(control.callback);

});