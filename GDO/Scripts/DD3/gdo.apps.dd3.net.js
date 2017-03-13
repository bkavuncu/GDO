function DD3Net(protocol, config) {
    this.protocol = protocol;
    this.config = config || {};
    this.browser = {};
    this.utils = {};
    switch (protocol) {
        case 'peerjs':
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
            break;
        case 'socketio':

            break;

        case 'signalr':
            this.dd3Server = $.connection.dD3AppHub;
            this.sid = this.dd3Server.instanceId;
            this.server = this.dd3Server.server;
            this.client = this.dd3Server.client;
            this.syncCallback= function () { };
            this.receiveSynchronize= function () {
                this.syncCallback();
            };
            break;

        default:
            throw new Error('No specific protocal name in DD3Net parameters');
    }
}

DD3Net.prototype.setBrowser = function (browser) {
    this.browser = browser;
}

DD3Net.prototype.setUtils = function (utils) {
    this.utils = utils;
}

DD3Net.prototype.on = function (eventName, callback) {
    ee.addListener(eventName, callback);
}

DD3Net.prototype.emit = function (eventName, data) {
    ee.emitEvent(eventName, [data]);
}
//Methods of the peer object: callback when a peer is created and opened
//Will log the connection, link to the behaviour upon data reception and call peer.flush
//BAI: this function will be called once the peer has connected to the peer Server.
//BAI: comments peer.init function and move it to the dd3Net Modul
DD3Net.prototype.init = function (conn, r, c) {
    var _self = this;
    if ('peerjs' === this.protocol) {
            this.utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
            conn.on("data", function (data) {
                _self.receive(data);
            });
           
            this.flush(r, c);
     
    }else if ('signalr' === this.protocol) {
        //return this.signalrObj.init();
        return null;
    }
}
//Open the connection to row, column peer
//Empty the buffers for the connection to ths peer
//TODO: unobfuscate the code 
//BAI: comments peer.connect function and move it to the dd3Net Modul
DD3Net.prototype.connect = function (r, c) {
    if ('peerjs' === this.protocol) {
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
    else if ('signalr' === this.protocol) {

    }

}

//BAI: only trigger the dataHandler event, the listener for the data should process the recieving data. Search this function 'dd3Net.on('data',function(){})' in gdo.apps.dd3.js
DD3Net.prototype.receive = function (data) {
    if ('peerjs' === this.protocol) {
        //console.log('peerReceive');
        this.emit('data', data);
    }
    else if ('signalr' === this.protocol) {
    }
}
//If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
//If buffer is set to false, send the data directly
//returns false if no connection exists 
DD3Net.prototype.sendTo = function (r, c, data, buffer) {
    if ('peerjs' === this.protocol) {
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
    else if ('signalr' === this.protocol) {
    }
}
//BAI: comments peer.flush function and move it to the dd3Net Modul
//flush the peer: i.e. SEND the data in the buffer of the connection the node (r,c) AND EMPTY the buffer
DD3Net.prototype.flush = function (r, c) {
    if ('peerjs' === this.protocol) {
        var buff = this.buffers[r][c],
            conn = this.connections[r][c];
        if (buff && buff.length > 0 && conn && conn.open) {
            conn.send(buff);
            this.buffers[r][c] = [];
            return true;
        }
        return false;
    }
    else if ('signalr' === this.protocol) {
    }
}

//BAI: the two following functions defined on the singnalr server and are called on the client side.
DD3Net.prototype.synchronize = function (r, c) {
    if ('peerjs' === this.protocol) {
        null;
    }
    else if ('signalr' === this.protocol) {
        signalR.server.synchronize(signalR.sid);
    }
}

DD3Net.prototype.updateInformation = function () {
    
}

//BAI: the following function defined in the client and are called by the singalr server side.
DD3Net.prototype.updateController = function() {
    if ('peerjs' === this.protocol) {
        null;
    }
    else if ('signalr' === this.protocol) {
       
    }

}

DD3Net.prototype.receiveControllerOrder = function() {
    if ('peerjs' === this.protocol) {
        null;
    }
    else if ('signalr' === this.protocol) {

    }
}

DD3Net.prototype.receiveGDOConfiguration = function() {
    if ('peerjs' === this.protocol) {
        null;
    }
    else if ('signalr' === this.protocol) {

    }
}

DD3Net.prototype.dd3Receive = function() {
    if ('peerjs' === this.protocol) {
        null;
    } else if ('signalr' === this.protocol) {

    }
};




/*The following code is used to emit event.
 * /
 */
/*!
 * EventEmitter v5.1.0 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */
(function () { "use strict"; function t() { } function i(t, n) { for (var e = t.length; e--;) if (t[e].listener === n) return e; return -1 } function n(e) { return function () { return this[e].apply(this, arguments) } } var e = t.prototype, r = this, s = r.EventEmitter; e.getListeners = function (n) { var r, e, t = this._getEvents(); if (n instanceof RegExp) { r = {}; for (e in t) t.hasOwnProperty(e) && n.test(e) && (r[e] = t[e]) } else r = t[n] || (t[n] = []); return r }, e.flattenListeners = function (t) { var e, n = []; for (e = 0; e < t.length; e += 1) n.push(t[e].listener); return n }, e.getListenersAsObject = function (n) { var e, t = this.getListeners(n); return t instanceof Array && (e = {}, e[n] = t), e || t }, e.addListener = function (r, e) { var t, n = this.getListenersAsObject(r), s = "object" == typeof e; for (t in n) n.hasOwnProperty(t) && -1 === i(n[t], e) && n[t].push(s ? e : { listener: e, once: !1 }); return this }, e.on = n("addListener"), e.addOnceListener = function (e, t) { return this.addListener(e, { listener: t, once: !0 }) }, e.once = n("addOnceListener"), e.defineEvent = function (e) { return this.getListeners(e), this }, e.defineEvents = function (t) { for (var e = 0; e < t.length; e += 1) this.defineEvent(t[e]); return this }, e.removeListener = function (r, s) { var n, e, t = this.getListenersAsObject(r); for (e in t) t.hasOwnProperty(e) && (n = i(t[e], s), -1 !== n && t[e].splice(n, 1)); return this }, e.off = n("removeListener"), e.addListeners = function (e, t) { return this.manipulateListeners(!1, e, t) }, e.removeListeners = function (e, t) { return this.manipulateListeners(!0, e, t) }, e.manipulateListeners = function (r, t, i) { var e, n, s = r ? this.removeListener : this.addListener, o = r ? this.removeListeners : this.addListeners; if ("object" != typeof t || t instanceof RegExp) for (e = i.length; e--;) s.call(this, t, i[e]); else for (e in t) t.hasOwnProperty(e) && (n = t[e]) && ("function" == typeof n ? s.call(this, e, n) : o.call(this, e, n)); return this }, e.removeEvent = function (e) { var t, r = typeof e, n = this._getEvents(); if ("string" === r) delete n[e]; else if (e instanceof RegExp) for (t in n) n.hasOwnProperty(t) && e.test(t) && delete n[t]; else delete this._events; return this }, e.removeAllListeners = n("removeEvent"), e.emitEvent = function (n, u) { var r, e, t, i, o, s = this.getListenersAsObject(n); for (i in s) if (s.hasOwnProperty(i)) for (r = s[i].slice(0), t = 0; t < r.length; t++) e = r[t], e.once === !0 && this.removeListener(n, e.listener), o = e.listener.apply(this, u || []), o === this._getOnceReturnValue() && this.removeListener(n, e.listener); return this }, e.trigger = n("emitEvent"), e.emit = function (e) { var t = Array.prototype.slice.call(arguments, 1); return this.emitEvent(e, t) }, e.setOnceReturnValue = function (e) { return this._onceReturnValue = e, this }, e._getOnceReturnValue = function () { return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0 }, e._getEvents = function () { return this._events || (this._events = {}) }, t.noConflict = function () { return r.EventEmitter = s, t }, "function" == typeof define && define.amd ? define(function () { return t }) : "object" == typeof module && module.exports ? module.exports = t : r.EventEmitter = t }).call(this);
var ee = new EventEmitter();