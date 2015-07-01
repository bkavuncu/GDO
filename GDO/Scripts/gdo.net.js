var peer;
var net;

var COMM_MODE = {
    P2P: 1,
    SERVER: 2
};

var P2P_MODE = {
    NONE : -1,
    CAVE: 1,
    SECTION: 2,
    NEIGHBOURS: 3
};

var NEIGHBOUR = {
    TOPLEFT: 0,
    TOP: 1,
    TOPRIGHT: 2,
    LEFT: 3,
    CENTER: 4,
    RIGHT: 5,
    BOTTOMLEFT: 6,
    BOTTOM: 7,
    BOTTOMRIGHT: 8
};

$(function() {
    //Registering Event Handlers on load
    // TODO document this method better
    //todo document why everything is happening on load within this method inc stackoverlfow links 
    $.connection.caveHub.client.receiveCaveMap = function (cols, rows, serializedCaveMap) {
        net.cols = cols;
        net.rows = rows;
        net.node = new Array(cols * rows);
        consoleOut('.NET', 1, 'Node Length ' + net.node.length);
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
                net.node[id] = {};
                net.node[id].col = i;
                net.node[id].row = j;
                net.node[id].id = id;
                net.node[id].connectedToPeer = false;
                net.node[id].isNeighbour = false;
                net.node[id].sendData = function (type, command, data, mode) {
                    var dataObj = {};
                    dataObj.type = type;
                    dataObj.command = command;
                    dataObj.data = data;
                    var msg = JSON.stringify(dataObj);
                    if (mode == COMM_MODE.P2P) {
                        try {
                            conn = peer.connections[id][0];
                            conn.send(msg);
                        } catch (err) {
                            net.server.sendData(gdo.id, id, msg);
                        }
                    } else if (mode == COMM_MODE.SERVER) {
                        net.server.sendData(gdo.id, id, msg);
                    }
                }
            }
        }
        net.node[gdo.id].connectionId = net.connection.hub.id;
        net.node[gdo.id].connectedToServer = true;
        net.node[gdo.id].p2pmode = P2P_MODE.NEIGHBOURS;
        consoleOut('.NET', 1, 'Received the map of the Cave');
        updateNodes();
        consoleOut('.NET', 1, 'Requesting the map of Neighbours');
        net.server.requestNeighbourMap(gdo.id);
    };
    $.connection.caveHub.client.receiveNeighbourMap = function (serializedNeighbourMap) {
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                net.neighbour[k];
                net.neighbour[k] = id;
                consoleOut('.NET', 1, 'Neighbour ' + k + ' is node ' + id);
                k++;
            }
        }
        for (var index in net.node) {
            if (!net.node.hasOwnProperty((index))) {
                continue;
            }
            if (net.node[index].id == gdo.id) {
                net.node[index].connectedToPeer = true;
            } else {
                net.node[index].connectedToPeer = false;
            }
            net.node[index].isNeighbour = false;
        }
        for (var index in net.neighbour) {
            if (!net.neighbour.hasOwnProperty((index))) {
                continue;
            }
            if (net.neighbour[index] != gdo.id && net.neighbour[index] >0) {
                net.node[net.neighbour[index]].isNeighbour = true;
            }
        }
        updateSelf();
        net.signalRServerResponded = true;
        consoleOut('.NET', 1, 'Received the map of Neighbours');
    }
    $.connection.caveHub.client.receiveNodeUpdate = function (serializedNode) {
        var node = JSON.parse(serializedNode);
        net.node[node.Id].col = node.Col;
        net.node[node.Id].row = node.Row;
        net.node[node.Id].sectionCol = node.SectionCol;
        net.node[node.Id].sectionRow = node.SectionRow;
        net.node[node.Id].sectionId = node.SectionId;
        net.node[node.Id].deployed = node.IsDeployed;
        net.node[node.Id].connectionId = node.ConnectionId;
        net.node[node.Id].connectedToServer = node.IsConnected;
        net.node[node.Id].appId = node.AppId;
        net.node[node.Id].peerId = node.PeerId;
        net.node[node.Id].p2pmode = node.P2PMode;
        net.node[node.Id].id = node.Id;
        updateSelf();
        consoleOut('.NET', 1, 'Received Update : (id:'+ node.Id + '),(col,row:' + node.Col + ','+node.Row+'),(peerId:' + node.PeerId + ')');
    }
});


function initHub() {
    consoleOut('.NET', 1, 'Initializing Hub');
    net.connection = $.connection;
    net.server = $.connection.caveHub.server;
    net.listener = $.connection.caveHub.client;
    consoleOut('.NET', 1, 'Connected to Hub');
}

function initNet() {//todo comment
    consoleOut('.NET', 1, 'Initializing Net');
    net = {};
    net.peer = peer;
    net.node = [];
    initHub();
    net.nodes = {};
    net.neighbour = {};
    net.signalRServerResponded = false;
    net.peerJSServerResponded = false;
    net.nodes.getConnected = function() {
        var i = 0;
        var connectedNodes = [];
        for (var index in net.node) {
            if (!net.node.hasOwnProperty((index))) {
                continue;
            }
            if (net.node[index].connectedToPeer) {
                connectedNodes[i] = net.node[index].id;
                i++;
            }
        }
        return connectedNodes;
    }
    initNodes();
    waitForResponse(initPeer,isSignalRServerResponded, 50, 20, 'SignalR server failed to Respond');
    return net;
}



function initPeer() {
    consoleOut('.NET', 1, 'Initializing Peer Connections');
    net.peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    net.peer.on('open', function(peerId) {
        consoleOut('.NET', 1, 'Connected to PeerServer with Id:' + peerId);
        net.node[gdo.id].peerId = peerId;
        uploadNodeInfo();
        setTimeout(updatePeerConnections(net.node[gdo.id].p2pmode), 1000 + Math.floor((Math.random() * 1000) + 1));
        net.peerJSServerResponded = true;
        consoleOut('.NET', 1, 'Peer Connections Initialized');
    });
    net.peer.on('close', function (err) { consoleOut('.NET', 3, err); });
    net.peer.on('connection', receiveConn);
}

function receiveConn(conn) {
    var nodeId = -1;
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (net.node[index].peerId == conn.peer) {
            nodeId = index;
        }
    }
    consoleOut('.NET', 1, 'Receiving Connection from Node ' + nodeId + ' - ' + conn.peer);
    if (nodeId > 0) {
        conn.on('open', function () {
            conn.send('hi!');
            net.node[nodeId].connectedToPeer = true;
            uploadNodeInfo();
            consoleOut('.NET', 1, 'Connected to Node ' + nodeId);
        });
        conn.on('close', function (err) {
            net.node[nodeId].connectedToPeer = false;
            uploadNodeInfo();
            consoleOut('.NET', 3, 'nodeId : ' + nodeId + ' - ' + err);
        });
        conn.on('data', receiveData);
        conn.on('error', function (err) { consoleOut('.NET', 3, 'Connection Error - nodeId : ' + nodeId + ' - ' + err) });
    }
}

function initConn(conn, nodeId) {
    consoleOut('.NET', 1, 'Opening Connection to Node ' + nodeId);
    conn.on('open', function(){
        conn.send('hi!');//todo send node id's in init messages
        net.node[nodeId].connectedToPeer = true;
        uploadNodeInfo();
        consoleOut('.NET', 1, 'Connected to Node ' + nodeId);
    });
    conn.on('close', function(err) {
        net.node[nodeId].connectedToPeer = false;
        uploadNodeInfo();
        consoleOut('.NET', 3, 'Node Connection Closed - nodeId : ' + nodeId + ' - ' + err);
    });
    conn.on('data', receiveData);
    conn.on('error', function(err) { consoleOut('.NET', 3, 'nodeId : ' + nodeId + ' - ' + err) });
}

function initNodes() {
    consoleOut('.NET', 1, 'Initializing Nodes');
    consoleOut('.NET', 1, 'Requesting the map of the Cave');
    net.server.requestCaveMap();
}

function uploadNodeInfo() {
    var connectedNodes = JSON.stringify(net.nodes.getConnected())
    net.server.uploadNodeInfo(gdo.id, net.connection.hub.id, connectedNodes, net.node[gdo.id].peerId);
}

function connectToPeer(nodeId) {
    if (net.node[nodeId].peerId != null && !net.node[nodeId].connectedToPeer) {
        consoleOut('.NET', 1, 'Connecting to Node ' + nodeId + ' - ' + net.node[nodeId].peerId + ' - Connection Status :' + net.node[nodeId].connectedToPeer);
        var c = net.peer.connect(net.node[nodeId].peerId);
        initConn(c, nodeId);
    }
}

function disconnectFromPeer(nodeId) {
    consoleOut('.NET', 1, 'Disconnecting from Node ' + nodeId);
    var conn = peer.connections[net.node[nodeId].peerId][0];
    net.node[nodeId].connectedToPeer = false;
    conn.close();
}

function updateNodes() {
    for (var index in net.neighbour) {
        if (!net.neighbour.hasOwnProperty((index))) {
            continue;
        }
        if (net.neighbour[index] != gdo.id && net.neighbour[index] > 0) {
           net.node[net.neighbour[index]].isNeighbour = true;
        }
    }
    //more to come
}

function updateSelf() {
    updateNodes();
    updatePeerConnections(net.node[gdo.id].p2pmode);
    updateGDOCanvas();
}

function updatePeerConnections(p2pmode) {
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (p2pmode == P2P_MODE.CAVE) {
            if (!net.node[index].connectedToPeer) {
                connectToPeer(net.node[index].id);
            }
        } else if (p2pmode == P2P_MODE.SECTION) {
            if (!net.node[index].connectedToPeer && net.node[index].sectionId == net.node[gdo.id].sectionId) {
                connectToPeer(net.node[index].id);
            } else if (net.node[index].connectedToPeer && net.node[index].sectionId != net.node[gdo.id].sectionId) {
                disconnectFromPeer(net.node[index].id);
            }
        } else if (p2pmode == P2P_MODE.NEIGHBOURS) {
            if (!net.node[index].connectedToPeer && net.node[index].isNeighbour) {
                connectToPeer(net.node[index].id);
            }else if (net.node[index].connectedToPeer && !net.node[index].isNeighbour && net.node[index].id != gdo.id) {
                disconnectFromPeer(net.node[index].id);
            }
        } 
    }
}

function receiveData(data) {
    consoleOut('.NET', 2, 'RECEIVED DATA');
    //dataObj = JSON.parse(data);

    //var type = dataObj.type;
    //var command = dataObj.command;
    //var data = dataObj.data;

    //if file start, and save to file system
    // if control, do stuff
    // if app command, call the function of the app and drop the data in that function 
}

/*function sendFile(conn, path, file) {
    //peerjs file send

}

function receiveFile(path,name,data){
    if(state == 'start'){
        //check if exists
        //if it exists delete and recreate
    }else if(state == 'data'){
        //add data
    }
}*/

function isSignalRServerResponded() {
    return net.signalRServerResponded;
}

function isPeerJSServerResponded(){
    return net.peerJSServerResponded;
}