function DD3Net(protocol, config) {
    this.protocol = protocol;
    this.config = config || {};
    var peerObj = {
        id: null,
        peers: [],
        connections: [],
        buffers: [],
        peer: null,
        init: function (conn, r, c) {
            console.log('peerjs init');
            utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
            conn.on("data", peerObj.receive);
            peerObj.flush(r, c);
        },

        connect: function (r, c) {
            r = +r;
            c = +c;

            // Try to find peer with r and c as row and column - use Array.some to stop when found
            // if the row, column pair is not the same as those of the connections, return false

            return peerObj.peers.some(function (p) {
                if (+p.row !== r || +p.col !== c)
                    return false;

                var conn = peerObj.peer.connect(p.peerId, { reliable: true, metadata: { initiator: [browser.row, browser.column] } });
                conn.on("open", peerObj.init.bind(null, conn, r, c));
                peerObj.connections[r][c] = conn;
                peerObj.buffers[r][c] = [];
                return true;
            });
        },

        receive: function (data) {
            console.log('peerReceive');
            if (data instanceof Array) {
                data.forEach(peerObj.receive);
                return;
            }

            switch (data.type) {
                case 'shape':
                    utils.log("Receiving a new shape...");
                    _dd3_shapeHandler(data);
                    break;

                case 'property':
                    utils.log("Receiving a property [" + data.function + (data.property ? (":" + data.property) : "") + "] update...");
                    _dd3_propertyHandler(data);
                    break;

                case 'remove':
                    utils.log("Receiving an exiting shape...");
                    _dd3_removeHandler(data);
                    break;

                case 'transition':
                    utils.log("Receiving a transition... ");
                    _dd3_transitionHandler(data);
                    break;

                case 'endTransition':
                    utils.log("Receiving a end transition event...");
                    _dd3_endTransitionHandler(data);
                    break;

                default:
                    utils.log("Receiving an unsupported data : Aborting !", 2);
                    utils.log(data, 2);
                    return false;
            }
        },

        sendTo: function (r, c, data, buffer) {
            if (typeof peerObj.connections[r][c] === "undefined" && !peerObj.connect(r, c)) {
                // If there is no such peer
                return false;
            }

            // If connection is being established or we asked to buffer, we buffer - else we send
            if (!peerObj.connections[r][c].open || buffer) {
                peerObj.buffers[r][c].push(data);
            } else {
                //BAI:.send is the peer api
                peerObj.connections[r][c].send(data);
            }

            return true;
        },

        flush: function (r, c) {
            console.log('peerFlush');
            var buff = peerObj.buffers[r][c],
                conn = peerObj.connections[r][c];
            if (buff && buff.length > 0 && conn && conn.open) {
                conn.send(buff);
                peerObj.buffers[r][c] = [];
                return true;
            }
            return false;
        }
    };

    var signalr = {
        synchronize: function () {
           
            return function (p) {

                signalr.connect(p.destid)
            }

        }
    }

    this.peerObj = peerObj;
    this.signalr = signalr;

    switch (protocol) {
        case 'peerjs':
            this.id = this.config.id || peerObj.id || '';
            //this.id = peerObj.id;
            this.peers = peerObj.peers;
            this.connections = peerObj.connections;
            this.buffers = peerObj.buffers;

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
            this.peer = peerObj.peer = new Peer(this.id, this.peerOption);
            break;
        case 'socketio':

            break;

        case 'signalr':
            //this.dd3Server = $.connection.dD3AppHub;
            break;

        default:
            throw new Error('No specific protocal name in DD3Net parameters');
    }
}



DD3Net.prototype.init = function (conn, r, c) {
    if ('peerjs' === this.protocol) {
        return this.peerObj.init(conn, r, c);
    }
    else if ('signalr' === this.protocol) {
        //return this.signalrObj.init();
        return null;
    }
}

DD3Net.prototype.connect = function (r, c) {
    if ('peerjs' === this.protocol) {
        return this.peerObj.connect(r, c);
    }
    else if ('signalr' === this.protocol) {
    }

}


DD3Net.prototype.receive = function (data) {
    if ('peerjs' === this.protocol) {
        return this.peerObj.receive(data);
    }
    else if ('signalr' === this.protocol) {
    }
}

DD3Net.prototype.sendTo = function (r, c, data, buffer) {
    if ('peerjs' === this.protocol) {
        return this.peerObj.sendTo(r, c, data, buffer);
    }
    else if ('signalr' === this.protocol) {
    }
}

DD3Net.prototype.flush = function (r, c) {
    if ('peerjs' === this.protocol) {
        return this.peerObj.flush(r, c);
    }
    else if ('signalr' === this.protocol) {
    }
}

DD3Net.prototype.synchronize = function (r, c) {
    if ('peerjs' === this.protocol) {
        null;
    }
    else if ('signalr' === this.protocol) {
        //signalR.server.synchronize
        //= typeof signalR != 'undefined' ? signalR.server.synchronize : null;
    }
}


//var dd3PeerNet = new DD3Net('peerjs');
//dd3PeerNet.init();




/*

function DD3Net(protocol, config) {
    this.protocol = protocol;
    switch (protocol) {
        case 'peerjs':
            this.id = config.id || '';
            this.peerOption = {
                key: config.key || '',
                host: config.host || '0.peerjs.com',
                port: config.port || 9000,
                path: config.path || '/',
                secure: config.secure || false,
                config: config.config || { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }] },
                debug: config.debug || 0
            };
            this.netObj = new Peer(this.id, this.peerOption);
            break;
        case 'socketio':

            break;

        case 'signalr':
            this.netObj = $.connection('/echo').start();
            break;

        default:
            throw new Error('No specific protocal name in DD3Net parameters');
    }
}

DD3Net.prototype.connect = function (id, options) {
    if ('peerjs' === this.protocol) {

        return this.netObj.connect(id, options);
    }
    else if ('signalr' === this.protocol) {

        setTimeout(function () {
            netObj.emit('open');
        });
        return netObj;

    }
    else if ('socketio' === this.protocol) {
        netObj.join(asd, function () {
            netObj.emit('open');
        });



        setTimeout(function () {
            netObj.emit('open');
        }, 10)
        return netObj;
    }

}
*/