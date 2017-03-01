function DD3Net(protocol, config) {
    var _self = this;
    this.protocol = protocol;
    this.config = config || {};
    
    this.peerObj  = {
        id: null,
        peers: [],
        connections: [],
        buffers: [],
        peer: null,
        init: function (conn, r, c) {
            console.log('peerjs init');
            utils.log("Connection established with Peer (" + [r, c] + "): " + conn.peer, 0);
            conn.on("data", _self.peerObj.receive);
            _self.peerObj.flush(r, c);
        },

        connect: function (r, c) {
            r = +r;
            c = +c;

            // Try to find peer with r and c as row and column - use Array.some to stop when found
            // if the row, column pair is not the same as those of the connections, return false

            return _self.peerObj.peers.some(function (p) {
                if (+p.row !== r || +p.col !== c)
                    return false;

                var conn = _self.peerObj.peer.connect(p.peerId, { reliable: true, metadata: { initiator: [browser.row, browser.column] } });
                conn.on("open", _self.peerObj.init.bind(null, conn, r, c));
                _self.peerObj.connections[r][c] = conn;
                _self.peerObj.buffers[r][c] = [];
                return true;
            });
        },

        receive: function (data) {
            console.log('peerReceive');
            if (data instanceof Array) {
                data.forEach(_self.peerObj.receive);
                return;
            }

            switch (data.type) {
                case 'shape':
                    utils.log("Receiving a new shape...");
                    receiveDataHandler._dd3_shapeHandler(data);
                    break;

                case 'property':
                    utils.log("Receiving a property [" + data.function + (data.property ? (":" + data.property) : "") + "] update...");
                    receiveDataHandler._dd3_propertyHandler(data);
                    break;

                case 'remove':
                    utils.log("Receiving an exiting shape...");
                    receiveDataHandler._dd3_removeHandler(data);
                    break;

                case 'transition':
                    utils.log("Receiving a transition... ");
                    receiveDataHandler. _dd3_transitionHandler(data);
                    break;

                case 'endTransition':
                    utils.log("Receiving a end transition event...");
                    receiveDataHandler._dd3_endTransitionHandler(data);
                    break;

                default:
                    utils.log("Receiving an unsupported data : Aborting !", 2);
                    utils.log(data, 2);
                    return false;
            }
        },

        sendTo: function (r, c, data, buffer) {
            //console.log('123');
          
            console.log(_self.peerObj.connections);
            console.log(_self.connections);

            if (typeof _self.peerObj.connections[r][c] === "undefined" && !_self.peerObj.connect(r, c)) {
                console.log('If there is no such peer');
                // If there is no such peer
                return false;
            }
            
            // If connection is being established or we asked to buffer, we buffer - else we send
            if (!_self.peerObj.connections[r][c].open || buffer) {
                console.log('data buffer');
                _self.peerObj.buffers[r][c].push(data);
            } else {
                //BAI:.send is the peer api
                console.log('data send');
                _self.peerObj.connections[r][c].send(data);
            }

            return true;
        },

        flush: function (r, c) {
            console.log('peerFlush');
            var buff = _self.peerObj.buffers[r][c],
                conn = _self.peerObj.connections[r][c];
            if (buff && buff.length > 0 && conn && conn.open) {
                conn.send(buff);
                _self.peerObj.buffers[r][c] = [];
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

   // this.peerObj = peerObj;
    this.signalr = signalr;

    switch (protocol) {
        case 'peerjs':
            this.id = this.config.id || this.peerObj.id || '';
            //this.id = peerObj.id;
            this.peers = this.peerObj.peers;
            this.connections = this.peerObj.connections;
            this.buffers = this.peerObj.buffers;

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
            this.peer = this.peerObj.peer = new Peer(this.id, this.peerOption);
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



DD3Net.prototype.setConnection = function (con_array) {
    this.connections = this.peerObj.connections = con_array;

}

DD3Net.prototype.setBuffer = function (con_array) {
    this.buffers = this.peerObj.buffers = con_array;

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


// Returun the next HTML element in an ordered group. Used solely for shape handling
// g: Current element in the ordered group.
// order: current 'position' of in the ordered group
//TODO v4: the selector can't find the order. Is that a problem?
//BAI: this function is only used in the function "_dd3_shapeHandler" below
var getOrderFollower = function (g, order) {
    var s = order.split("_");
    var elems = g.selectAll_("#" + g.node().id + " > [order^='" + s[0] + "']"),//TODO document this CSS selector query
        follower,
        o;

    if (!elems.empty()) {
        s[1] = +s[1];
        //TODO v4: use selection.nodes() to return an array

        elems = elems.nodes();


        elems.some(function (a) {
            o = +a.getAttribute('order').split("_")[1];
            if (o > s[1]) {
                follower = a;
                return true;
            }
            return false;
        });

        if (!follower) {

            follower = elems[elems.length - 1].nextElementSibling;
        }

    } else {
        elems = g.selectAll_("#" + g.node().id + " > [order]");

        elems = elems.nodes();


        elems.some(function (a) {
            var o = a.getAttribute('order');
            if (o > order) {//TODO: What if order is NaN as suggested by the first line of the function
                follower = a;
                return true;
            }
            return false;
        });
    }

    return follower;
};


var receiveDataHandler = (function() {
    
    var receiveDataHandler = {
            //BAI: all the following handler functions are called in the above "peer.receive" function.
            //Handler to be called upon the reception of a shape from peerjs.
            // Create the element from the data received (data.sendId), add it to the group (data.containers) in the proper ordering.
            _dd3_shapeHandler: function (data) {
                var mainId = data.containers.shift(),
                    obj = d3.select("#" + data.sendId),
                    g1 = d3.select("#" + mainId), g2,
                    c = false; // Whether the object was changed of group since last time


                if (g1.empty()) {
                    utils.log("The group with id '" + mainId + "' received doesn't exist in the dom - A group with an id must exist in every browsers !", 2);
                    return;
                }

                if (!(data.containers instanceof Array)) utils.log("V4 Error: data.containers is a Map and handled as an array", 4);
                data.containers.forEach(function (o) {
                    g2 = g1.select_("#" + o.id);
                    if (g2.empty()) {
                        c = true;

                        g1.insert_('g', function () { return getOrderFollower(g1, o.order); });
                    } else {
                        g1 = g2;
                    }
                    //g1 = g2.empty() ? (c = true, g1.insert_('g', function () { return getOrderFollower(g1, o.order); })) : g2;
                    g1.attr_(o);//TODO v4: does this actually work
                    if (!g1) utils.log('Warning!!! attr_ in _dd3_shapeHandler has failed', 4);

                    if (o.transition)
                        //BAI: change from peer.receive to dd3Net.receive
                        dd3Net.receive(o.transition);
                });

                // Here we create an absolute ordering in one group
                if (obj.empty() || c) {
                    obj.remove_();
                    obj = g1.insert_(data.name, function () { return getOrderFollower(g1, data.attr.order); });
                }

                if (data.name === "image") {
                    obj.attr_("xlink:href", data.attr.href);
                    delete data.attr.href;
                }

                for (var a in data.attr) {
                    if (data.attr[a]) obj.attr_(a, data.attr[a]);
                }

                obj.html_(data.html)
                    .classed_('dd3_received', true)
                    .attr_("id", data.sendId); // Here because attr can contain id

            },

            //Handler to be called upon the reception of a remove request from peerjs.
            // removes the corresponding element (data.sendId) and all its children from the DOM
            _dd3_removeHandler: function (data) {
                var el = d3.select('#' + data.sendId).node();
                while (el && _dd3_isReceived(el.parentElement) && el.parentElement.childElementCount == 1)
                    el = el.parentElement;
                d3.select(el).remove();
            },

    
            //Handler to be called upon the reception of a property from peerjs.
            //find the object and set the properties to their values
            _dd3_propertyHandler: function (data) {
                var obj = d3.select("#" + data.sendId);
                if (!obj.empty()) {
                    var args = typeof data.property !== "undefined" ? [data.property, data.value] : [data.value];
                    obj[data.function].apply(obj, args)
                        .classed_('dd3_received', true)
                        .attr_("id", data.sendId);
                }
            },

            //Handler to be called upon the reception of a transition from peerjs.
            //TODO: v4: d3.ease implementation changed radically
            _dd3_transitionHandler : function (data) {

                //TODO v4: reread to handle all edge cases
                var launchTransition = function (data) {

                    var obj = d3.select("#" + data.sendId);
                    //interrupt any ongoing animation
                    obj.interrupt(data.name);
                    var trst = _dd3_hook_selection_transition.call(obj, data.name);

                    //utils.log("Delay taken: " + (data.delay + (syncTime + data.elapsed - Date.now())), 0);
                    utils.log("Transition on " + data.sendId + ". To be plot between " + data.min + " and " + data.max + ". (" + (data.max - data.min) / 1000 + "s)");

                    for (var a in data.start.attr) {
                        if (data.start.attr[a]) obj.attr_(a, data.start.attr[a]);
                    }

                    for (var a in data.start.style) {
                        if (data.start.style[a]) obj.style_(a, data.start.style[a]);
                    }


                    for (var a in data.end.attr) {
                        if (data.end.attr[a]) trst.attr(a, data.end.attr[a]);
                    }

                    for (var a in data.end.style) {
                        if (data.end.style[a]) trst.style(b, data.end.style[a]);
                    }

                    trst.duration(data.duration);

                    if (data.tweens) {
                        data.tweens.forEach(function (o) {//v4
                            if (_dd3_tweens[o.value]) {
                                trst.tween(o.key, _dd3_tweens[o.value]);
                            }
                        });
                    }

                    //TODO v4: should be fixed to ignore attr

                    /*
                    if (data.attrTweens) {
                        data.attrTweens.forEach(function (o) {
                            if(_dd3_tweens["dd3_"+o.key+"_std_value"]){
                                trst.attr(o.key, _dd3_tweens["dd3_"+o.key+"_std_value"]);
                            } else if(_dd3_tweens["dd3_"+o.key+"_std_function"]){
                                trst.attr(o.key, _dd3_tweens["dd3_"+o.key+"_std_function"]);
                            }else if (_dd3_tweens[o.value]) {
                                trst.attrTween(o.key, _dd3_tweens[o.value]);
                            }
                        });
                    }
                    */


                    if (data.styleTweens) {
                        data.styleTweens.forEach(function (o) {
                            var args = typeof o.value[1] !== "undefined" ? [o.key, _dd3_tweens[o.value[0]], o.value[1]] : [o.key, _dd3_tweens[o.value[0]]];
                            if (_dd3_tweens[o.value[0]]) {
                                trst.styleTween.apply(trst, args);
                            }
                        });
                    }



                    if (_dd3_timeTransitionRelative) {
                        trst.delay(data.delay + (syncTime + data.elapsed - Date.now()));
                    } else {
                        var tmp = data.delay + (data.elapsed - Date.now());

                        trst.delay((tmp <= 0) ? 0 : tmp);
                        //trst.delay(-tmp);
                    }

                    if (data.ease) {
                        if (typeof data.ease === "string" && _dd3_eases[data.ease]) {
                            trst.ease(_dd3_eases[data.ease]);
                        } else if (typeof data.ease === "string" && _dd3_eases["dd3_" + data.ease]) {
                            trst.ease(_dd3_eases["dd3_" + data.ease]);
                        } else if (typeof data.ease === "string" && d3[data.ease]) {
                            trst.ease(d3[data.ease]);
                        } else if (typeof data.ease === "function" && _dd3_eases[utils.getFnName(data.ease)]) {//v4
                            trst.ease(_dd3_eases[utils.getFnName(data.ease)]);//v4
                        } else {
                            utils.log("Warning! ease not found", 4);
                            trst.ease(d3.easeLinear);//TODO v4: change the parsing of the easing
                        }
                    }


                };


                launchTransition(data);

                /*
                if (data.min < Date.now())
                    launchTransition(data);
                else if (data.max > Date.now()) {
                    clearTimeout(_dd3_timeoutStartReceivedTransition.get(data.sendId + data.name));
                    _dd3_timeoutStartReceivedTransition.set(data.sendId + data.name, setTimeout(launchTransition.bind(null, data), data.min - Date.now()));
                }
                clearTimeout(_dd3_timeoutEndReceivedTransition.get(data.sendId + data.name));
                _dd3_timeoutEndReceivedTransition.set(data.sendId + data.name, setTimeout(_dd3_endTransitionHandler.bind(null, {sendId : data.sendId, name: data.name, remove : false}), data.max - Date.now()));
                */
            },


            //Handler to be called upon the reception of an end transition from peerjs.
            //Interrupt the transition and remove element if data.remove is true.
            _dd3_endTransitionHandler : function (data) {
                var obj = d3.select("#" + data.sendId);
                obj.interrupt(data.name);
                if (data.remove)
                    _dd3_removeHandler(data);
            }
    }


    var _dd3_isReceived = function (e) {
        return [].indexOf.call(e.classList || [], 'dd3_received') >= 0;
    };

    var _dd3_hook_selection_transition = d3.selection.prototype.transition;//TODO: v4 still exist?


    return receiveDataHandler;

})();




















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