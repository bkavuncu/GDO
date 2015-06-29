var peer;
var net;
var module = 'NET';

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
    $.connection.caveHub.client.receiveCaveMap = function (cols, rows, serializedCaveMap) {
        net.cols = cols;
        net.rows = rows;
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
                net.node[id] = {};
                net.node[id].col = i;
                net.node[id].row = j;
                net.node[id].id = id;
                net.node[id].connectedToPeer = false;
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
        updateNodes();
        consoleOut(module, 1, 'Received the map of the Cave');
    };
    $.connection.caveHub.client.receiveNeighbourMap = function (serializedNeighbourMap) {
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                net.neighbour[k];
                net.neighbour[k] = id;
                consoleOut(module, 1, 'Neighbour ' + k + ' is node ' + id);
                k++;
            }
        }
        updateNodes();
        consoleOut(module, 1, 'Received the map of Neighbours');
    }
    $.connection.caveHub.client.ReceiveNodeUpdate = function (serializedNode) {
        var node = JSON.parse(serializedNode);
        net.node[node.id].col = node.col;
        net.node[node.id].row = node.row;
        net.node[node.id].sectionCol = node.sectionCol;
        net.node[node.id].sectionRow = node.sectionRow;
        net.node[node.id].sectionID = node.sectionID;
        net.node[node.id].deployed = node.isDeployed;
        net.node[node.id].connectionID = node.connectionID;
        net.node[node.id].connectedToServer = node.isConnected;
        net.node[node.id].appID = node.appID;
        net.node[node.id].peerID = node.peerID;
        net.node[node.id].p2pmode = node.p2pmode;
        net.node[node.id].id = node.id;
        if (node.id == gdo.id) {
            net.self.sectionCol = node.sectionCol;
            net.self.sectionRow = node.sectionRow;
            net.self.sectionID = node.sectionID;
            net.self.deployed = node.isDeployed;
            net.self.connectionID = node.connectionID;
            net.self.connectedToServer = node.isConnected;
            net.self.appID = node.appID;
            net.self.peerID = node.peerID;
            net.self.p2pmode = node.p2pmode;
        }
        updateSelf();
        consoleOut(module, 1, 'Received Update : (id:'+ node.id + '),(col,row:' + node.col + ','+node.row+'),(peerID:' + node.peerID + ')');
    }
});


function initHub() {
    consoleOut(module, 1, 'Initializing Hub');
    net.connection = $.connection;
    net.server = $.connection.caveHub.server;
    net.listener = $.connection.caveHub.client;
    consoleOut(module, 1, 'Connected to Hub');
}

function initNet() {
    consoleOut(module, 1, 'Initializing Net');
    net = {};
    net.peer = peer;
    net.node = [];
    initHub();
    net.nodes = {};
    net.self = {};
    net.neighbour = {};
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
        if (net.neighbour[index] != gdo.id) {
            net.node[net.neighbour[index]].isNeighbour = true;
        }
    }
    initPeer(P2P_MODE.NEIGHBOURS);
    consoleOut(module, 1, 'Net Initialized');
    return net;
}



function initPeer(p2pmode) {
    consoleOut(module, 1, 'Initializing Peer Connections');
    net.self.p2pmode = p2pmode;
    net.peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    net.peer.on('open', function(peerID) {
        consoleOut(module, 1, 'Connected to PeerServer with ID:' + peerID);
        net.self.peerID = peerID;
        uploadNodeInfo();
        setTimeout(updatePeerConnections(p2pmode), 1000 + Math.floor((Math.random() * 1000) + 1));
    });
    net.peer.on('close', function (err) { consoleOut(module, 3, err); });
    net.peer.on('connection', receiveConn);
    consoleOut(module, 1, 'Peer Connections Initialized');
}

function receiveConn(conn) {
    var nodeID = -1;
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (net.node[index].peerId == conn.peer) {
            nodeID = conn.peer;
        }
    }
    consoleOut(module, 1, 'Receiving Connection from Node ' + nodeID + ' - ' + conn.peer);
    if (nodeID > 0) {
        conn.on('open', function () {
            conn.send('hi!');
            net.node[nodeID].connectedToPeer = true;
            uploadNodeInfo();
            consoleOut(module, 1, 'Connected to Node ' + nodeID);
        });
        conn.on('close', function (err) {
            net.node[nodeID].connectedToPeer = false;
            uploadNodeInfo();
            consoleOut(module, 3, 'nodeID : ' + nodeID + ' - ' + err);
        });
        conn.on('data', receiveData);
        conn.on('error', function (err) { consoleOut(module, 3, 'nodeID : ' + nodeID + ' - ' + err) });
    }
}

function initConn(conn, nodeID) {
    consoleOut(module, 1, 'Opening Connection to Node ' + nodeID);
    conn.on('open', function(){
        conn.send('hi!');
        net.node[nodeID].connectedToPeer = true;
        uploadNodeInfo();
        consoleOut(module, 1, 'Connected to Node ' + nodeID);
    });
    conn.on('close', function(err) {
        net.node[nodeID].connectedToPeer = false;
        uploadNodeInfo();
        consoleOut(module, 3, 'nodeID : ' + nodeID + ' - ' + err);
    });
    conn.on('data', receiveData);
    conn.on('error', function(err) { consoleOut(module, 3, 'nodeID : ' + nodeID + ' - ' + err) });
}

function initNodes() {
    consoleOut(module, 1, 'Initializing Nodes');
    consoleOut(module, 1, 'Requesting the map of the Cave');
    net.server.requestCaveMap();
    consoleOut(module, 1, 'Requesting the map of Neighbours');
    net.server.requestNeighbourMap(gdo.id);
}

function uploadNodeInfo() {
    var connectedNodes = JSON.stringify(net.nodes.getConnected())
    net.server.uploadNodeInfo(gdo.id, net.connection.hub.id, connectedNodes, net.self.peerID);
}

function connectToPeer(nodeID) {
    if (net.node[nodeID].peerID != null && !net.node[nodeID].connectedToPeer) {
        consoleOut(module, 1, 'Connecting to Node ' + nodeID + ' - ' + net.node[nodeID].peerID + ' - Connection Status :' + net.node[nodeID].connectedToPeer);
        var c = net.peer.connect(net.node[nodeID].peerID);
        initConn(c, nodeID);
    }
}

function disconnectFromPeer(nodeID) {
    consoleOut(module, 1, 'Disconnecting from Node ' + nodeID);
    var conn = peer.connections[net.node[nodeID].peerId][0];
    net.node[nodeID].connectedToPeer = false;
    conn.close();
}

function updateNodes() {
    for (var index in net.neighbour) {
        if (!net.neighbour.hasOwnProperty((index))) {
            continue;
        }
        if (net.neighbour[index] != gdo.id && net.neighbour[index] > 0) {
            net.node[net.neighbour[index]].isNeighbour = true;
            consoleOut(module, 2, 'Neighbour ' + index + ' - node ' + net.neighbour[index]);
        }
    }
    //more to come
}

function updateSelf() {
    updateNodes();
    updatePeerConnections(net.self.p2pmode);
    //$.updateGDOCanvas();
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
            if (!net.node[index].connectedToPeer && net.node[index].sectionID == net.self.sectionID) {
                connectToPeer(net.node[index].id);
            } else if (net.node[index].connectedToPeer && net.node[index].sectionID != net.self.sectionID) {
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
    consoleOut(module, 2, 'RECEIVED DATA');
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



var test = function() {

};