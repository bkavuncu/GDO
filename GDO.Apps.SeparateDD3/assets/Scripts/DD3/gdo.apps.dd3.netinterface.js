/*this constructer will be inheretied by the other protocols*/
function DD3Net(protocol, config) {
    var protocol = protocol || null;

    if (protocol === "peerjs") 
        return new PeerNet(config);
    
    else if (protocol === "signalr") 
        return new SignalrNet(config);

    else if (protocol === "socketio")
        return new SocketioNet(config);
    else if (protocol === null) 
        return new MixNet(config) ;

    else
        throw new Error('No specific protocal name in DD3Net parameters');
}

function inherit(subClass, superClass) {
    function F() { };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass.constructor;
}

function DD3NetInterface(config) {
    this.config = config || {};
    this.browser = {};
    this.utils = {};
}

DD3NetInterface.prototype.setBrowser = function (browser) {}

DD3NetInterface.prototype.setUtils = function (utils) {}

DD3NetInterface.prototype.on = function (eventName, callback) {}

DD3NetInterface.prototype.emit = function (eventName, data) {}
//Methods of the peer object: callback when a peer is created and opened
//Will log the connection, link to the behaviour upon data reception and call peer.flush
//BAI: this function will be called once the peer has connected to the peer Server.
//BAI: comments peer.init function and move it to the dd3Net Modul
DD3NetInterface.prototype.init = function (conn, r, c) {}
//Open the connection to row, column peer
//Empty the buffers for the connection to ths peer
//TODO: unobfuscate the code 
//BAI: comments peer.connect function and move it to the dd3Net Modul
DD3NetInterface.prototype.connect = function (r, c) {}
//BAI: only trigger the dataHandler event, the listener for the data should process the recieving data. Search this function 'dd3Net.on('data',function(){})' in gdo.apps.dd3.js
DD3NetInterface.prototype.receive = function (data) {}
//If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
//If buffer is set to false, send the data directly
//returns false if no connection exists 
DD3NetInterface.prototype.sendTo = function (r, c, data, buffer) {}
//BAI: comments peer.flush function and move it to the dd3Net Modul
//flush the peer: i.e. SEND the data in the buffer of the connection the node (r,c) AND EMPTY the buffer
DD3NetInterface.prototype.flush = function (r, c) {}

//BAI: the two following functions defined on the singnalr server and are called on the client side.
DD3NetInterface.prototype.synchronize = function (r, c) {}

DD3NetInterface.prototype.updateInformation = function () {}

DD3NetInterface.prototype.setCallBack = function (caveConfiguration, dd3_data) {}
//BAI: the following function defined in the client and are called by the singalr server side.
DD3NetInterface.prototype.updateController = function() {}

DD3NetInterface.prototype.receiveControllerOrder = function() {}

DD3NetInterface.prototype.receiveGDOConfiguration = function() {}

DD3NetInterface.prototype.dd3Receive = function() {};







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