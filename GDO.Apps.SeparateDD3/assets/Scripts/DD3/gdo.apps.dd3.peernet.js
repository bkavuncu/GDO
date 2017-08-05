
function PeerNet(config) {
    DD3NetInterface.call(this, config);
    /*The following properties are for peer*/
    this.id = this.config.id || '';
    this.peers = [];
    this.connections = [];
    this.buffers = [];
    this.peerOption = {
        //There is no response from the peerJS server if adding the whole arguments below. Maybe we should check the peerjs set-up
        //key: this.config.key || '',

        // host: this.config.host || "146.169.32.109",
        // port: this.config.port || 55555,

        host: this.config.host || "127.0.0.1",
        port: this.config.port || 33333,

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

inherit(PeerNet, DD3NetInterface);

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

PeerNet.prototype.connectPeer = function () {
    this.peer = new Peer(this.id, this.peerOption);
}
//Methods of the peer object: callback when a peer is created and opened
//Will log the connection, link to the behaviour upon data reception and call peer.flush
//BAI: this function will be called once the peer has connected to the peer Server.
//BAI: comments peer.init function and move it to the dd3Net Modul
PeerNet.prototype.init = function (conn, r, c) {
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
PeerNet.prototype.connect = function (r, c) {
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
PeerNet.prototype.receive = function (data) {
    this.emit('data', data);
}
//If buffer is set to true, Put data in the buffer of the connection to the node at row r and column c
//If buffer is set to false, send the data directly
//returns false if no connection exists
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
//BAI: comments peer.flush function and move it to the dd3Net Modul
//flush the peer: i.e. SEND the data in the buffer of the connection the node (r,c) AND EMPTY the buffer
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

//BAI: the two following functions defined on the singnalr server and are called on the client side.
PeerNet.prototype.synchronize = function (r, c) {
    // signalR.server.synchronize(signalR.sid);
}

PeerNet.prototype.updateInformation = function (thisConn, thisNodeInfo) {
    // console.log(thisConn, thisNodeInfo); 
}

PeerNet.prototype.setClientCallbackFunc = function (callBackObj) {
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

PeerNet.prototype.onClientCallbackFunc = function () {
    var getUrlVar = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var _self = this;

    var clientId =  parseInt(getUrlVar("clientId"));
    var numClients = parseInt(getUrlVar("numClients"));

    var ctrlId = parseInt(getUrlVar("controlId"));
    var confId = parseInt(getUrlVar("confId")); 
    var appInstanceId = "ctrl" + ctrlId + "_conf" + confId;

    var ctrlConn = null;
    var peerConns = null;
    this.net = {
        init: {
            peerNet: function(thisInfo, callback) {
                console.log("@PeerNet 1 init master net");

                // function initPeerNet() {
                //     var p = dd3Net.peer;
                //     p.listAllPeers(function (list) {
                //         console.log("@PN 1 list", list);

                //         // select client peer ids
                //         var newList = [];
                //         list.forEach(function(l, i) {

                //             var ls = l.split("_");

                //             var thisAppInstanceId = ls[0] + "_" + ls[1];
                //             // console.log("PN 1 Master appInstanceId", thisAppInstanceId, appInstanceId);

                //             if (thisAppInstanceId == appInstanceId) {   
                //                 console.log("PN 1 Master peerId type", ls[2]);
                //                 if (ls[2] == "client") {
                //                     newList.push(l);
                //                 }
                //             }
                //         }, this);
                //         console.log("@PN 1 Master list after", newList);

                //         if (newList.length == numClients) {
                //             clearInterval(initPeerNetTimer);
                //             // console.log("@PN 1", list.length, numClients);

                //             var conns = [];
                //             var infos = [ thisInfo ];  // add self info
                //             newList.forEach(function(id, i) {
                //                 // console.log("@PN 1", id);
                //                 var idAry = id.split("_");  // get all peer info
                //                 var idInt = parseInt(idAry[5][4]);
                //                 // var rowInt = parseInt(idAry[3][1]);
                //                 // var colInt = parseInt(idAry[4][1]);

                //                 if (idInt != 1) {

                //                     var conn = p.connect(id);

                //                     conns.push(conn);

                //                     conn.on('open', function() {
                //                         console.log("@PN 1", this.peer + " is connected");

                //                         conn.on('data', function(info) {
                //                             console.log("@PN 1 master received", info);

                //                             // collect other peers info
                //                             infos.push(info.thisInfo);

                //                             // broadcast to all
                //                             console.log("@PN 1 check same", infos.length, numClients)
                //                             if (infos.length == numClients) {

                //                                 // convert objects to an array
                //                                 var infosAry = $.map(infos, function(value, index) { return [value]; });
                //                                 infosAry = [JSON.stringify(infosAry)];
                //                                 console.log("@PN 1 convert array", infosAry); 

                //                                 peerConns = conns;
                //                                 callback(conns, infosAry);

                //                                 // conns.forEach(function(c) {
                //                                 //     c.send({ functionName: 'receiveConfiguration', data: infosAry });
                //                                 // }, this);

                //                                 // // for master node

                //                                 // dd3Net.net.test.dd3Receive({ functionName: 'receiveConfiguration', data: infosAry }); 

                //                                 // dd3Net.net.test.receiveGDOConfiguration({ id: gdo_appInstanceId.applicationId });

                //                                 // dd3Net.net.test.updateController({ show: true });

                //                             }

                //                         });
                                    
                //                         conn.on('close', function(){
                //                             console.log("@PN 1 peer disconnected", this.peer);
                //                             location.reload();
                //                         });

                //                         // ^^ on 'close', to reconnect non-master
                //                         // search the non-master node id, re-connect

                //                     });
                //                 }
                //             });
                //         }
                //     });
                // };
                    
                // initPeerNet();

                // var initPeerNetTimer = setInterval(initPeerNet, 1000);
            },
            ctrlNet: function(callback) {
                console.log("@PeerNet 1 init control net");
                var p = dd3Net.peer;
                p.listAllPeers(function (list) {

                    // no room, but separate network
                    list.forEach(function(l, i) {

                        var ls = l.split("_");

                        var thisAppInstanceId = ls[0] + "_" + ls[1];
                        // console.log("PN 1 appInstanceId", thisAppInstanceId, appInstanceId);

                        if (thisAppInstanceId == appInstanceId) {   // same as room
                            // console.log("PN 1 peerId type", ls[2]);

                            if(ls[2] == "control") {
                                var ctrlPeerId = list[i];
                                ctrlConn = p.connect(ctrlPeerId);
                                // switch received order
                                ctrlConn.on('data', function(data) {
                                    switch (data.functionName) {
                                        case "sendOrder":
                                            console.log("@PN 1", data);

                                            if(data.data.all){
                                                console.log("@PN 1 send to all")
                                                // use peer net to broadcast 
                                                _self.net.server.broadcastControllerOrder(data.data.order);
                                            }else{
                                                console.log("@PN 1 send to master");
                                                _self.net.test.receiveControllerOrder(data.data.order);
                                            }
                                            break;
                                    
                                        default:
                                            console.log("@PN 1 init", "undefined function name");
                                            break;
                                    }
                                    // console.log("##init", data);
                                });

                                ctrlConn.on('close', function() {
                                    console.log("@PN 1 controller disconnected");
                                    location.reload();
                                    // ^^ re-conect without reloading
                                });

                                callback(ctrlConn);
                            }

                        }

                    }, this);
                });
            }
        },
        server: {
            updateInformation: function(gdo_appInstanceId, thisInfo) {
                console.log("@PN 1 updateInformation", gdo_appInstanceId, thisInfo);

                // var clientId =  parseInt(getUrlVar("clientId"));
                // var numClients = parseInt(getUrlVar("numClients"));

                if (clientId == 1) {
                    console.log("@PN 1 master");

                    // _self.net.init.peerNet(thisInfo, function(conns, infos){

                    //     // for non-master node

                    //     conns.forEach(function(c) {
                    //         c.send({ functionName: 'receiveConfiguration', data: infos });
                    //     }, this);

                    //     // for master node

                    //     dd3Net.net.test.dd3Receive({ functionName: 'receiveConfiguration', data: infos }); 

                    //     dd3Net.net.test.receiveGDOConfiguration({ id: gdo_appInstanceId.applicationId });

                    //     dd3Net.net.test.updateController({ show: true });

                    // });
                    
                    function getList(callback) {
                        var getList_callback = callback;
                        var p = dd3Net.peer;
                        p.listAllPeers(function (list) {
                            console.log("@PN 1 list", list);

                            // select client peer ids
                            var newList = [];
                            list.forEach(function(l, i) {

                                var ls = l.split("_");

                                var thisAppInstanceId = ls[0] + "_" + ls[1];
                                // console.log("PN 1 Master appInstanceId", thisAppInstanceId, appInstanceId);

                                if (thisAppInstanceId == appInstanceId) {   
                                    console.log("PN 1 Master peerId type", ls[2]);
                                    if (ls[2] == "client") {
                                        newList.push(l);
                                    }
                                }
                            }, this);
                            console.log("@PN 1 Master list after", newList);

                            if (newList.length == numClients) {
                                // console.log("@PN 1", list.length, numClients);
                                getList_callback(p, newList);   // TODO ? is callback necessary
                            } else {

                                setTimeout(function(){ getList(updateInfo) }, 1000);
                            }
                            
                        });
                    };

                    updateInfo = function(p, newList){

                        var conns = [];
                        var infos = [ thisInfo ];  // add self info
                        
                        newList.forEach(function(id, i) {
                            // console.log("@PN 1", id);
                            var idAry = id.split("_");  // get all peer info
                            var idInt = parseInt(idAry[5].slice(4));
                            // console.log("@PN 1 Master self", thisInfo.browserNum, idInt);
                            
                            if (idInt != thisInfo.browserNum) {

                                var conn = p.connect(id);

                                conns.push(conn);

                                console.log("@PN 1 connection", conn);
                                conn.on('open', function() {
                                    console.log("@PN 1", this.peer + " is connected");

                                    conn.on('data', function(info) {
                                        console.log("@PN 1 master received", info.thisInfo);

                                        // collect other peers info
                                        infos.push(info.thisInfo);

                                        // broadcast to all
                                        console.log("@PN 1 info array", infos);
                                        console.log("@PN 1 check same", infos.length, numClients);
                                        if (infos.length == numClients) {

                                            // convert objects to an array
                                            var infosAry = $.map(infos, function(value, index) { return [value]; });
                                            infosAry = [JSON.stringify(infosAry)];
                                            console.log("@PN 1 convert array", infosAry); 

                                            peerConns = conns;
                                            conns.forEach(function(c) {
                                                c.send({ functionName: 'receiveConfiguration', data: infosAry });
                                            }, this);

                                            // for master node

                                            dd3Net.net.test.dd3Receive({ functionName: 'receiveConfiguration', data: infosAry }); 

                                            dd3Net.net.test.receiveGDOConfiguration({ id: gdo_appInstanceId.applicationId });

                                            dd3Net.net.test.updateController({ show: true });

                                        }

                                    });
                                
                                    conn.on('close', function(){
                                        console.log("@PN 1 peer disconnected", this.peer);
                                        location.reload();
                                    });

                                    // ^^ on 'close', to reconnect non-master
                                    // search the non-master node id, re-connect

                                });
                            }
                        });
                    }

                    getList(updateInfo); 

                }

            },
            broadcastControllerOrder: function (order) {
                console.log("@PN 1 broadcastControllerOrder", order);

                if(peerConns){
                    console.log("@@@ PN 1 peer net exists", peerConns);

                    peerConns.forEach(function(c, i) {
                        c.send({ functionName: "receiveControllerOrder", data: order });
                    }, this);

                    _self.net.test.receiveControllerOrder(order);

                }else{
                    console.log("### PN 1 peer net DONT exist");
                }

            }
        },
        test: {
          dd3Receive: function (data) {
              console.log("@PeerNet 1 dd3Receive", data);
              var f = data.functionName;
              var argsArray = data.data;
              _self.signalR_callback[f].apply(null, [].slice.call(argsArray, 0));
          },
          receiveGDOConfiguration: function (data) {
              console.log("@PeerNet 1 receiveGDOConfiguration", data);
              var id = data.id;
              if (main_callback) {
                  main_callback(id);
              } else {
                  console.log('.DD3', 1, 'No callback defined');
              }
              main_callback = null;
          },
          updateController: function (data) {
              console.log("@PeerNet 1 updateController", data);
              
              _self.net.init.ctrlNet(function(conn){
                    console.log("@PeerNet 1 check control net", conn);
                    if (conn.open == false) {
                        conn.open = open;   // a peerjs bug
                    }
                    
                    console.log("@PeerNet 1 after fix", conn);
                    // conn.on('open', function(){
                        conn.send({ functionName: "updateController", data: data});
                    // });
              });

          },
          receiveControllerOrder: function (orders) {
                console.log('@PN 1 orderTransmitter', orderTransmitter);
                if (orderTransmitter) {
                    console.log('@PN 1 receiveControllerOrder received', orders);
                    orders = JSON.parse(orders);
                    //gdo.consoleOut('.DD3', 1, 'Order received : ' + orders.name + ' [' + orders.args + ']');
                    orderTransmitter(orders);
                } else {
                    //gdo.consoleOut('.DD3', 4, 'No test controller defined');
                }
          },
          reloadThisNode: function () {
                console.log('@PN 1 reloadThisNode');
                // location.reload();
          }
        }
    };

};
