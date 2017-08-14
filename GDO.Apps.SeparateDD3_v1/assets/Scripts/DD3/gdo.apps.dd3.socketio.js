

function SocketioNet(config) {
    DD3NetInterface.call(this, config);
    /*The following properties are for peer*/
    this.id = this.config.id || '';
    this.peers = [];
    this.connections = [];
    this.buffers = [];
    this.peerOption = {
        //There is no response from the peerJS server if adding the whole arguments below. Maybe we should check the peerjs set-up
        //key: this.config.key || '',
        host: this.config.host || "146.169.32.109",
        port: this.config.port || 55555,
        //path: this.config.path || '/',
        //secure: this.config.secure || false,
        //config: this.config.config || { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] },
        //debug: this.config.debug || 0
    };

    /*The following properties are for signalr*/
    this.signalR_callback = {};
    /*
    this.syncCallback = function () { },
    this.receiveSynchronize = function () {
        console.log("this.syncCallback");
        console.log(this);
        console.log(this.syncCallback);
        this.syncCallback();
    }*/
    

}

inherit(SocketioNet, DD3NetInterface);

SocketioNet.prototype.setBrowser = function (browser) {
    this.browser = browser;


}

SocketioNet.prototype.setUtils = function (utils) {
    this.utils = utils;
}

SocketioNet.prototype.on = function (eventName, callback) {
    ee.addListener(eventName, callback);
}

SocketioNet.prototype.emit = function (eventName, data) {
    ee.emitEvent(eventName, [data]);
}

SocketioNet.prototype.connectPeer = function () {
    this.peer = new Peer(this.id, this.peerOption);
}
//Methods of the peer object: callback when a peer is created and opened
//Will log the connection, link to the behaviour upon data reception and call peer.flush
//BAI: this function will be called once the peer has connected to the peer Server.
//BAI: comments peer.init function and move it to the dd3Net Modul
SocketioNet.prototype.init = function (conn, r, c) {
    var _self = this;

    this.utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
    conn.on("data", function (data) {
        _self.receive(data);
    });

    this.flush(r, c);
}
//Open the connection to row, column peer
//Empty the buffers for the connection to ths peer
//TODO: unobfuscate the code 
//BAI: comments peer.connect function and move it to the dd3Net Modul
//BAI: Q: this function can not be treated as prototype function.
SocketioNet.prototype.connect = function (r, c) {
    r = +r;
    c = +c;
    // Try to find peer with r and c as row and column - use Array.some to stop when found
    // if the row, column pair is not the same as those of the connections, return false
    var _self = this;
    return _self.peers.some(function (p) {
        if (+p.row !== r || +p.col !== c) {
            //console.log(_self.peers);
            return false;
        }

        var conn = _self.peer.connect(p.peerId, { reliable: true, metadata: { initiator: [_self.browser.row, _self.browser.column] } });
        //BAI: init of peerObj is firsted called here.
        conn.on("open", function () {

            _self.init(conn, r, c);
        });
        _self.connections[r][c] = conn;
        _self.buffers[r][c] = [];
        //return true;
        console.log(_self.connections);
        return conn;
    });
}
//BAI: only trigger the dataHandler event, the listener for the data should process the recieving data. Search this function 'dd3Net.on('data',function(){})' in gdo.apps.dd3.js
SocketioNet.prototype.receive = function (data) {
    this.emit('data', data);
}
//If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
//If buffer is set to false, send the data directly
//returns false if no connection exists 
SocketioNet.prototype.sendTo = function (r, c, data, buffer) {
    //BAI: this is the first time to call _self.peerObj.connect(r, c);
    if (typeof this.connections[r][c] === "undefined" && !this.connect(r, c)) {
        console.log('If there is no such peer');
        // If there is no such peer
        return false;
    }

    // If connection is being established or we asked to buffer, we buffer - else we send
    if (!this.connections[r][c].open || buffer) {
        this.buffers[r][c].push(data);
    } else {
        //BAI:.send is the peer api
        this.connections[r][c].send(data);
    }
    return true;
}
//BAI: comments peer.flush function and move it to the dd3Net Modul
//flush the peer: i.e. SEND the data in the buffer of the connection the node (r,c) AND EMPTY the buffer
SocketioNet.prototype.flush = function (r, c) {
    var buff = this.buffers[r][c],
        conn = this.connections[r][c];
    if (buff && buff.length > 0 && conn && conn.open) {
        conn.send(buff);
        this.buffers[r][c] = [];
        return true;
    }
    return false;
}

//BAI: the two following functions defined on the singnalr server and are called on the client side.
SocketioNet.prototype.synchronize = function (r, c) {
    //signalR.server.synchronize(signalR.sid);
}

SocketioNet.prototype.updateInformation = function (thisConn, thisNodeInfo) {
    console.log("###### UPDATE INFORMATION START ######");

    // TODO. use connect() to initialise the connection
    // NOTE. listeners may be registered outside

    // connect to master
    // send info to master
    // listen broadcast from master

    // ** for master 

    //peer.on('open', function () {
    //    console.log("this peer id is xxx");
    //})

    //peer.on('connection', function (conn) {
    //    console.log("xxx node is connected");

    //    conn.on('data', function () {
    //        console.log("xxx node's info received");

    //        if (same) {
    //            // broadcast to all conns
    //        }
    //    });
    //});

    // ** end master 
    
    //conn = dd3net.connect("master");
    //conn.on('open', function () {
    //    console.log("connected to master");

    //    conn.send(thisInfo); // send back node info 

    //    conn.on('data', function () {
    //        console.log("data received"); // master broadcast info
    //    });
    //});


    console.log(this);
    console.log(thisConn, thisNodeInfo);

    console.log("###### UPDATE INFORMATION END ######");
}

SocketioNet.prototype.setClientCallbackFunc = function (callBackObj) {
    var dd3DataObj = callBackObj.dd3DataObj || null;
    var syncObj = callBackObj.syncObj || null;
    var caveConfigurationObj = callBackObj.caveConfigurationObj || null;

    if (caveConfigurationObj) {
        this.signalR_callback.receiveConfiguration = caveConfigurationObj;
    }

    if (dd3DataObj) {
        this.signalR_callback.receiveDimensions = dd3DataObj.receiveDimensions;
        this.signalR_callback.receiveData = dd3DataObj.receiveData;
        this.signalR_callback.receiveRemoteDataReady = dd3DataObj.receiveRemoteDataReady;
    }

    if (syncObj) {
        this.signalR_callback.receiveSynchronize = function () {
            syncObj();
        };
    }
}

SocketioNet.prototype.onClientCallbackFunc = function () {
    var getUrlVar = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    var socketUrl;
        if(window.location.hostname == 'localhost'  || window.location.hostname == '127.0.0.1')
            socketUrl = 'http://localhost:8000';
        else
            socketUrl = 'http://146.169.32.196:8000';
    var _self = this;
    this.net = {
        server: {
            updateInformation: function(gdo_appInstanceId, thisInfo){
                console.log('_self.net',_self.net);
                _self.net.client.emit("updateInformation",{gdo_appInstanceId: gdo_appInstanceId, browserInfo: thisInfo});
            },
            getDimensions:function(gdo_appInstanceId, dataId){
                _self.net.client.emit("getDimensions",{gdo_appInstanceId: gdo_appInstanceId, dataId: dataId});   
            }
            //这里只有这一个方程其余的都是在获取数据。应该由peer完成。
        },
        client: io(socketUrl,{
            reconnection: false
          })
    };
    


  

    //BAI: all the these functions should be implemented by Peer.
    this.net.client.on("dd3Receive", function (data) {
        var f = data.functionName;
        //var argsArray = JSON.stringify(data.data);
        var argsArray = data.data;
        //console.log('argsArray', argsArray);
        //console.log('[].slice.call(argsArray,0)',[].slice.call(argsArray,0));
        //console.log(_self.signalR_callback);
        //console.log('args',args[0]);
        //console.log('args',[args]);
        console.log('dd3Receive');
        _self.signalR_callback[f].apply(null, [].slice.call(argsArray,0));

        //_self.signalR_callback[f].apply(null, args);
        
    });

    this.net.client.on("receiveGDOConfiguration", function (data) {
        console.log('receiveGDOConfiguration')
        var id =data.id;
        // To get configId from server
        //Here the main_callback is the client callback as the launcher. Not the control callback
        if (main_callback) {
            //Bai: put "id" as the arguments in the main_callback() in the signalR version.
            main_callback(id);
        } else {
            console.log('.DD3', 1, 'No callback defined');
        }
        main_callback = null;
      
    });
    
    this.net.client.on("receiveControllerOrder", function (orders) {
        console.log('orderTransmitter',orderTransmitter);
        if (orderTransmitter) {
            console.log('receiveControllerOrder received',orders);
            orders = JSON.parse(orders);
            //gdo.consoleOut('.DD3', 1, 'Order received : ' + orders.name + ' [' + orders.args + ']');
            orderTransmitter(orders);
        } else {
            //gdo.consoleOut('.DD3', 4, 'No test controller defined');
        }
    });

    //this function is only needed for the control nodes not the client nodes. Maybe this is a mistake in the orignal code.
    /*
    this.net.client.on("updateController", function (obj) {
        if (main_callback) {
            main_callback(JSON.parse(obj));
        }
    });*/
};



