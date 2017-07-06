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


var ctrlConn = null;

var control = {
    //gdo: parent.gdo,
    //gdoApp: false,//gdoApp: parent.gdo.net.app["DD3"].initControl,
    //server: parent.gdo.net.app.DD3.server,
    server: {
        sendOrder: function(instanceId, order, all){
            console.log("@Controller", instanceId, order, all);
            // control.socket.emit('sendOrder',{applicationId: control.confId, instanceId: instanceId, order: order, all: all });

            if(ctrlConn){
                console.log("@Controller ctrl net exists", ctrlConn);
                ctrlConn.send({ functionName: "sendOrder", data: { instanceId, order, all }});

            }else{
                console.log("@Controller ctrl net DONT exist");
            }

        },
    },

    //dataset:null,
    eventLog:[],

    //confId is used to confirm which application you want to launch
    confId:null,
    numClients:null,
    test_bench: {},

    init: function() {
        //BAI: not sure if the following code is useful or not
        this.test_bench = controlTestBench.test_bench;
        //controlId is the instance ID
        this.controlId = parseInt(this.getUrlVar("controlId"));
        //confId is the application ID
        this.confId = parseInt(this.getUrlVar("confId"));
        this.numClients = parseInt(this.getUrlVar("numClients"));

        // connect to peer server
        var timestamp = Date.now();
        this.peerOption = { host: "127.0.0.1", port: 33333 },

        this.peerId = "ctrl" + this.controlId + "_conf" + this.confId + "_control" + "_numClients" + this.numClients + "_" + timestamp;
        this.peerConn = new Peer(this.peerId, this.peerOption);

        this.peerConn.on('connection', function(conn) {
            console.log("@Controller master found", conn.peer);

            ctrlConn = conn;

            conn.on('open', function(){

                conn.on('data', function(order){
                    console.log("@Controller received", order);

                    switch (order.functionName) {
                        case "updateController":
                            // console.log(order.data.show);
                            if(order.data.show){
                                main_callback();
                                $("#wait").css("display", "none");
                                if (control.confId == '6' || control.confId == '7' || control.confId == '8' || control.confId == '9') { // all of these are Shangai LinkLoad, and should share the control menu
                                    $("#control_6").css("display", "");
                                } else {
                                    $("#control_" + control.confId).css("display", "");
                                } 
                            }else{
                                // location.reload();
                            }
                            break;
                    
                        default:
                            console.log("@Controller", "undefined function name");
                            break;
                    }

                    // conn.send("message");
                });

                // conn.send("message");
            })

        });



        // this.socket = io('http://localhost:8080');

        var _self = this;
       

        // this.socket.on('connected',function(){
        //     _self.socket.emit('joinroom',{instanceId: control.controlId, applicationId: control.confId, numClients: control.numClients});
        // });

        // this.socket.on('refresh',function(){
        //     location.reload();
        // });
        
        main_callback = this.callback;
        
        // this.socket.on('updateController',function(data){
        //     if(data.show){
        //         main_callback();
        //         $("#wait").css("display", "none");
        //         if (control.confId == '6' || control.confId == '7' || control.confId == '8' || control.confId == '9') { // all of these are Shangai LinkLoad, and should share the control menu
        //             $("#control_6").css("display", "");
        //         } else {
        //             $("#control_" + control.confId).css("display", "");
        //         } 
        //     }
        //     else{
        //         location.reload();
        //     }
        // });

        return this.controlId;
    },
   
    getUrlVar: function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    callback: function() {
        //BAI: we need to init controlTestBench, because we need to get the numClients in this callback function. After we get the numClients, we can pass this value into controlTestBench obj.
        controlTestBench.init(control.server, control.numClients);
    
        control.test_bench[control.confId] && control.test_bench[control.confId]();
        control.test_bench[control.confId] = null;
        /*
        $("#wait").css("display", "none");
        //BAI:change the num to string
        if (control.confId === '6' || control.confId === '7' || control.confId === '8' || control.confId === '9') {  // all of these are Shangai LinkLoad, and should share the control menu
            $("#control_6").css("display", "");
        }
        else {
            $("#control_" + control.confId).css("display", "");
        } 
        */
    }
};

var peer = {
    // == FPS ==
    peerObject: { host: "146.169.32.109", port: 55555 },

    init: function () {
        //{ host: "localhost", port: 55555 };
        //{ host: "146.169.32.109", port: 55555 }
        var con_peer = new Peer("idofthecontrollerfordd3", this.peerObject);
        con_peer.on('open', function (conn) {
            //console.log("control.gdo before", control.gdo);
           // control.gdo.consoleOut()(".DD3", 4, "The peer client of the controller is opened");
            //console.log("control.gdo after", control.gdo);
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
        instanceId = control.init();

        
        //BAI: change num to string
      

        //$("#error").css("display", "");
    
   
        //peer.init();
  

});