function PeerNet(config) {
    DD3NetInterface.call(this, config);
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
    this.peer = new Peer(this.id, this.peerOption);
}

/*PeerNet inherits the APIs in DD3NetInterface, this function is defined in gdo.apps.dd3.net.js*/
inherit(PeerNet, DD3NetInterface);

/*Peer Interface implementation*/
PeerNet.prototype.setBrowser = function (browser) {
    this.browser = browser;
}

PeerNet.prototype.setUtils = function (utils) {
    this.utils = utils;
}

PeerNet.prototype.on = function (eventName, callback) {
    ee.addListener(eventName, callback);
}

PeerNet.prototype.emit = function (eventName, data) {
    ee.emitEvent(eventName, [data]);
}

PeerNet.prototype.init = function (conn, r, c) {
    var _self = this;

    this.utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
    conn.on("data", function (data) {
        _self.receive(data);
    });

    this.flush(r, c);
}

PeerNet.prototype.connect = function (r, c) {

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

PeerNet.prototype.receive = function (data) {
   this.emit('data', data);
}

PeerNet.prototype.sendTo = function (r, c, data, buffer) {
  
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

PeerNet.prototype.flush = function (r, c) {
   
    var buff = this.buffers[r][c],
        conn = this.connections[r][c];
    if (buff && buff.length > 0 && conn && conn.open) {
        conn.send(buff);
        this.buffers[r][c] = [];
        return true;
    }
    return false;
   
}

/*the following interfaces are implemented in gdo.apps.dd3.singalrnet.js*/
PeerNet.prototype.synchronize = function (r, c) {}

PeerNet.prototype.updateInformation = function () {}

PeerNet.prototype.setCallBack = function (caveConfiguration, dd3_data) {}

PeerNet.prototype.updateController = function () {}

PeerNet.prototype.receiveControllerOrder = function () {}

PeerNet.prototype.receiveGDOConfiguration = function () {}

PeerNet.prototype.dd3Receive = function () {}

