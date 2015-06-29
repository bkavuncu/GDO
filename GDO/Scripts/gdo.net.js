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

function initHub() {
    consoleOut('NET', 'INFO', 'Initializing Hub');
    var caveHub = $.connection.caveHub;
    net.connection = $.connection;
    net.server = caveHub.server;
    net.listener = caveHub.client;
    consoleOut('NET', 'INFO', 'Connected to Hub');
}

function initNet() {
    consoleOut('NET', 'INFO', 'Initializing Net');
    net = {};
    net.peer = peer;
    net.node = [];
    initHub();
    net.nodes = {};
    net.self = {};
    net.nodes.getConnected = function() {
        var i = 0;
        var connectedNodes = [];
        for (var index in net.node) {
            if (!net.node.hasOwnProperty((index))) {
                continue;
            }
            if (!net.node[index].connectedToPeer) {
                connectedNodes[i] = net.node[index].id;
                i++;
            }
        }
        return connectedNodes;
    }
    initNodes();
    initPeer(P2P_MODE.NONE);
    net.listener.receiveNodeUpdate = function (serializedNode) {
        var node = JSON.parse(serializedNode);
        net.node[node.id] = {};
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
            net.seld.connectionID = node.connectionID;
            net.self.connectedToServer = node.isConnected;
            net.self.appID = node.appID;
            net.self.peerID = node.peerID;
            net.self.p2pmode = node.p2pmode;
            updateSelf();
        }
    }
    consoleOut('NET', 'INFO', 'Net Initialized');
    return net;
}



function initPeer(p2pmode)
{
    consoleOut('NET', 'INFO', 'Initializing Peer Connections');
    net.peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    net.peer.on('open', function(peerId) {
        consoleOut('NET', 'INFO', 'Connected to PeerServer');
        net.self.peerId = peerId;
        net.server.uploadNodeInfo(gdo.id, net.connection.hub.id, JSON.parse(net.nodes.getConnected()), peerId);
        setTimeout(updatePeerConnections(p2pmode), 1000 + Math.floor((Math.random() * 1000) + 1));
    });
    net.peer.on('close', function (err) { consoleOut('NET', 'ERROR', err); });
    net.peer.on('connection', initConn);
}

function initConn(conn, nodeID) {
    consoleOut('NET', 'INFO', 'Opening Connection to Node ' + nodeID);
    conn.on('open', function(){
        conn.send('hi!');
        net.node[nodeID].connectedToPeer = true;
    });
    conn.on('close', function(err) {
        net.node[nodeID].connectedToPeer = false;
        consoleOut('NET', 'ERROR', 'nodeID : ' + nodeID + ' - ' + err);
    });
    conn.on('data', receiveData(nodeID, data));
    conn.on('error', function(err) { consoleOut('NET', 'ERROR', 'nodeID : ' + nodeID + ' - ' + err) });
}

function initNodes() {
    consoleOut('NET', 'INFO', 'Initializing Nodes');
    net.listener.receiveCaveMap = function (cols, rows, serializedCaveMap) {
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
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
                        }
                        catch (err) {
                            net.server.sendData(gdo.id, id, msg);
                        }
                    } else if (mode == COMM_MODE.SERVER) {
                        net.server.sendData(gdo.id, id, msg);
                    }
                }
            }
        }
        consoleOut('NET', 'INFO', 'Received the map of the Cave');
    }
    consoleOut('NET', 'INFO', 'Requesting the map of the Cave');
    net.server.requestCaveMap();
    net.listener.receiveNeighbourMap = function (cols, rows, serializedNeighbourMap) {
        net.cols = cols;
        net.rows = rows;
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                net.neighbour[k] = net.node[id];
                k++;
            }
        }
        consoleOut('NET', 'INFO', 'Received the map of Neighbours');
    }
    consoleOut('NET', 'INFO', 'Requesting the map of Neighbours');
    net.server.requestNeighbourMap();
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
    for (var index in net.neighbours) {
        if (!net.neighbours.hasOwnProperty((index))) {
            continue;
        }
        if (net.neighbours[index].id != gdo.id) {
            net.neighbours[index].isNeighbour = true;
        } 
    }
}

function connectToPeer(nodeID) {
    consoleOut('NET', 'INFO', 'Connecting to Node ' + nodeID);
    var c = peer.connect(nodeID);
    initConn(c,nodeID);
}

function disconnectFromPeer(nodeID) {
    consoleOut('NET', 'INFO', 'Disconnecting from Node ' + nodeID);
    var conn = peer.connections[nodeID][0];
    net.node[nodeID].connectedToPeer = false;
    conn.close();
}

function updateSelf() {
    updatePeerConnections(net.self.p2pmode);
    updateCanvas();
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

function receiveData(nodeID, data) {
    dataObj = JSON.parse(data);
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