function MixNet(config) {
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
    this.signalR_callback = {},
    this.syncCallback = function () { },
    this.receiveSynchronize = function () {
        this.syncCallback();
    }
}

inherit(MixNet, DD3NetInterface);

MixNet.prototype.setBrowser = function (browser) {
    this.browser = browser;
}

MixNet.prototype.setUtils = function (utils) {
    this.utils = utils;
}

MixNet.prototype.on = function (eventName, callback) {
    ee.addListener(eventName, callback);
}

MixNet.prototype.emit = function (eventName, data) {
    ee.emitEvent(eventName, [data]);
}

MixNet.prototype.connectPeer = function () {
    this.peer = new Peer(this.id, this.peerOption);
}
//Methods of the peer object: callback when a peer is created and opened
//Will log the connection, link to the behaviour upon data reception and call peer.flush
//BAI: this function will be called once the peer has connected to the peer Server.
//BAI: comments peer.init function and move it to the dd3Net Modul
MixNet.prototype.init = function (conn, r, c) {
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
MixNet.prototype.connect = function (r, c) {
    r = +r;
    c = +c;
    // Try to find peer with r and c as row and column - use Array.some to stop when found
    // if the row, column pair is not the same as those of the connections, return false
    var _self = this;
    return _self.peers.some(function (p) {
        if (+p.row !== r || +p.col !== c)
            return false;

        var conn = _self.peer.connect(p.peerId, { reliable: true, metadata: { initiator: [_self.browser.row, _self.browser.column] } });
        //BAI: init of peerObj is firsted called here.
        conn.on("open", function () {

            _self.init(conn, r, c);
        });
        _self.connections[r][c] = conn;
        _self.buffers[r][c] = [];
        return true;
    });
}
//BAI: only trigger the dataHandler event, the listener for the data should process the recieving data. Search this function 'dd3Net.on('data',function(){})' in gdo.apps.dd3.js
MixNet.prototype.receive = function (data) {
    this.emit('data', data);
}
//If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
//If buffer is set to false, send the data directly
//returns false if no connection exists 
MixNet.prototype.sendTo = function (r, c, data, buffer) {
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
MixNet.prototype.flush = function (r, c) {
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
MixNet.prototype.synchronize = function (r, c) {
    //signalR.server.synchronize(signalR.sid);
}

MixNet.prototype.updateInformation = function () {

}

MixNet.prototype.setCallBack = function (caveConfiguration, dd3_data) {
  
    if (caveConfiguration) {
        this.signalR_callback.receiveSynchronize = this.receiveSynchronize;
        this.signalR_callback.receiveConfiguration = caveConfiguration;
    }
       
    if (dd3_data) {
        this.signalR_callback.receiveDimensions = dd3_data.receiveDimensions;
        this.signalR_callback.receiveData = dd3_data.receiveData;
        this.signalR_callback.receiveRemoteDataReady = dd3_data.receiveRemoteDataReady;
    }
}

MixNet.prototype.defineSignalrClientFunc = function () {
    this.net = {
        server: dd3Server.server,
        client: dd3Server.client
    }
    var _self = this;
    dd3Server.on("dd3Receive", function (f) {
        _self.signalR_callback[f].apply(null, [].slice.call(arguments, 1));
    });

    dd3Server.on("receiveGDOConfiguration", function (id) {
        // To get configId from server
        if (main_callback) {
            main_callback(id);
        } else {
            gdo.consoleOut('.DD3', 1, 'No callback defined');
        }
        main_callback = null;
    });
    
    dd3Server.on("receiveControllerOrder", function (orders) {
        if (orderTransmitter) {
            orders = JSON.parse(orders);
            gdo.consoleOut('.DD3', 1, 'Order received : ' + orders.name + ' [' + orders.args + ']');
            orderTransmitter(orders);
        } else {
            gdo.consoleOut('.DD3', 4, 'No test controller defined');
        }
    });

    dd3Server.on("updateController", function (obj) {
        gdo.consoleOut('.DD3', 1, 'Controller : Receiving update from server');
        if (main_callback) {
            //console.log("main_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callbackmain_callback");
            //console.log(main_callback);
            main_callback(JSON.parse(obj));
        }
    });
};



