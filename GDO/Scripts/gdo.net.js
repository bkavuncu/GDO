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
    // We need to register functions that server calls on client before hub connection established,
    // that is why they are on load
    $.connection.caveHub.client.receiveDefaultP2PMode = function(defaultP2PMode) {
        net.p2pmode = defaultP2PMode;
    }
    $.connection.caveHub.client.setMaintenanceMode = function (maintenanceMode) {
        net.maintenanceMode = maintenanceMode;
        updateDisplayCanvas();
    }
    $.connection.caveHub.client.receiveCaveMap = function(cols, rows, serializedCaveMap) {
        /// <summary>
        /// Receives Serialized Cave Map from Server and creates Node Object structure matching it at gdo.node[]
        /// </summary>
        /// <returns></returns>
        consoleOut('.NET', 1, 'Received the map of the Cave');
        net.cols = cols;
        net.rows = rows;
        consoleOut('.NET', 2, 'Node Length ' + net.node.length);
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
                net.node[id].col = i;
                net.node[id].row = j;
                net.node[id].id = id;
            }
        }
        if (gdo.clientMode == CLIENT_MODE.NODE) {
            net.node[gdo.clientId].connectionId = net.connection.hub.id;
            net.node[gdo.clientId].isConnectedToCaveServer = true;
            net.node[gdo.clientId].isConnectedToPeerServer = false;
            updateNodes();
            consoleOut('.NET', 2, 'Requesting the map of Neighbours');
            net.server.requestNeighbourMap(gdo.clientId);
        } else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
            net.signalRServerResponded = true;
        }
    };
    $.connection.caveHub.client.receiveNeighbourMap = function (serializedNeighbourMap) {
        /// <summary>
        ///  Receives Serialized Neighbour Map from Server and flags neighbour nodes with isNeighbour and fills this in neighbourhood matrix at gdo.net.neighbour[]
        /// </summary>
        /// <param name="serializedNeighbourMap">The serialized neighbour map.</param>
        /// <returns></returns>
        consoleOut('.NET', 1, 'Received the map of Neighbours');
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                net.neighbour[k];
                net.neighbour[k] = id;
                consoleOut('.NET', 3, 'Neighbour ' + k + ' is node ' + id);
                k++;
            }
        }
        for (var index in net.node) {
            if (!net.node.hasOwnProperty((index))) {
                continue;
            }
            net.node[index].connectedToPeer = false;
            net.node[index].isNeighbour = false;
        }
        for (var index in net.neighbour) {
            if (!net.neighbour.hasOwnProperty((index))) {
                continue;
            }
            if (net.neighbour[index] != gdo.clientId && net.neighbour[index] >0) {
                net.node[net.neighbour[index]].isNeighbour = true;
            }
        }
        updateSelf();
        net.signalRServerResponded = true;
    }
    $.connection.caveHub.client.receiveAppUpdate = function(sectionId, appName, configName, instanceId, exists) {
        if (isSignalRServerResponded()) {
            consoleOut('.NET', 1, 'Received App Update : (id:' + instanceId + ', exists: ' + exists + ")");
            if (exists) {
                net.instance[instanceId].appName = appName;
                net.instance[instanceId].id = instanceId;
                net.instance[instanceId].sectionId = sectionId;
                net.instance[instanceId].exists = true;
                net.instance[instanceId].configName = configName;
                net.section[sectionId].isDeployed = true;
            } else {
                net.instance[instanceId].exists = false;
                net.section[sectionId].isDeployed = false;
            }
            updateSelf();
        }
    }
    $.connection.caveHub.client.receiveSectionUpdate = function (exists, id, col, row, cols, rows, p2pMode, isDeployed, nodeMap) {
        /// <summary>
        /// Receives a Section Update and update the local section representation and updates self
        /// </summary>
        /// <param name="exists">If exists.</param>
        /// <param name="id">The identifier.</param>
        /// <param name="col">The start col.</param>
        /// <param name="row">The start row.</param>
        /// <param name="cols">The number of cols.</param>
        /// <param name="rows">The number of rows.</param>
        /// <param name="p2pMode">The P2P mode.</param>
        /// <param name="nodeMap">The node map.</param>
        /// <returns></returns>
        if (isSignalRServerResponded()){
            if (exists) {
                consoleOut('.NET', 1, 'Received Section Update : (id:' + id + ', exists: ' + exists + ")");
                net.section[id].id = id;
                net.section[id].exists = true;
                net.section[id].col = col;
                net.section[id].row = row;
                net.section[id].cols = cols;
                net.section[id].rows = rows;
                net.section[id].isDeployed = isDeployed;
                net.section[id].p2pmode = p2pMode;
                net.section[id].nodeMap = nodeMap;
                for(var i=0; i<cols; i++){
                    for (var j = 0; j < rows; j++) {
                        // TODO section update simplification
                        net.section[id].health = net.section[id].health + net.node[net.section[id].nodeMap[i][j]].aggregatedConnectionHealth;
                        net.node[getNodeId(col + i, row + j)].sectionId = id;
                        net.node[getNodeId(col + i, row + j)].sectionCol = i;
                        net.node[getNodeId(col + i, row + j)].sectionRow = j;
                        net.node[getNodeId(col + i, row + j)].deployed = true;
                        net.node[getNodeId(col + i, row + j)].p2pmode = p2pMode;
                        consoleOut('.NET', 3, 'Updating Node : (id:' + getNodeId(col + i, row + j) + '),(col,row:' + col + i + ',' + row + j + ')');
                    } 
                }
                net.section[id].health = net.section[id].health / (cols * rows);
            } else {
                net.section[id].id = id;
                net.section[id].exists = false;
                net.section[id].isDeployed = false;
                for (var i = 0; i < net.section[id].cols; i++) {
                    for (var j = 0; j < net.section[id].rows; j++) {
                        net.node[getNodeId(net.section[id].col + i, net.section[id].row + j)].sectionId = 0;
                        net.node[getNodeId(net.section[id].col + i, net.section[id].row + j)].deployed = false;
                        net.node[getNodeId(net.section[id].col + i, net.section[id].row + j)].p2pmode = net.p2pmode;
                        consoleOut('.NET', 3, 'Updating Node : (id:' + getNodeId(net.section[id].col + i, net.section[id].row + j) + '),(col,row:' + net.section[id].col + i + ',' + net.section[id].row + j + ')');
                    }
                }
            }
            updateSelf();
        }

    }
    $.connection.caveHub.client.receiveNodeUpdate = function (serializedNode) {
        /// <summary>
        /// Receives a Node Update and update the local node representation and updates self
        /// </summary>
        /// <param name="serializedNode">The serialized node.</param>
        /// <returns></returns>
        if (isSignalRServerResponded()){
            var node = JSON.parse(serializedNode);
            consoleOut('.NET', 2, 'Received Node Update : (id:' + node.Id + '),(col,row:' + node.Col + ',' + node.Row + '),(peerId:' + node.PeerId + ')');
            net.node[node.Id].col = node.Col;
            net.node[node.Id].row = node.Row;
            net.node[node.Id].sectionCol = node.SectionCol;
            net.node[node.Id].sectionRow = node.SectionRow;
            net.node[node.Id].sectionId = node.SectionId;
            net.node[node.Id].deployed = node.IsDeployed;
            net.node[node.Id].connectionId = node.ConnectionId;
            net.node[node.Id].isConnectedToCaveServer = node.IsConnectedToCaveServer;
            net.node[node.Id].isConnectedToPeerServer = node.IsConnectedToPeerServer;
            net.node[node.Id].aggregatedConnectionHealth = node.AggregatedConnectionHealth;
            net.node[node.Id].appInstanceId = node.AppInstanceId;
            net.node[node.Id].peerId = node.PeerId;
            net.node[node.Id].p2pmode = node.P2PMode;
            net.node[node.Id].id = node.Id;
            net.node[node.Id].connectedNodeList = node.ConnectedNodeList;
            if (net.node[node.Id].sectionId > 0) {
                net.section[net.node[node.Id].sectionId].health = 0;
                for (var i = 0; i < net.section[net.node[node.Id].sectionId].cols; i++) {
                    for (var j = 0; j < net.section[net.node[node.Id].sectionId].rows; j++) {
                        net.section[net.node[node.Id].sectionId].health = net.section[net.node[node.Id].sectionId].health + net.node[net.section[net.node[node.Id].sectionId].nodeMap[i][j]].aggregatedConnectionHealth;
                    }
                }
                net.section[net.node[node.Id].sectionId].health = net.section[net.node[node.Id].sectionId].health / (net.section[net.node[node.Id].sectionId].cols * net.section[net.node[node.Id].sectionId].rows);
            }
            updateSelf();
            consoleOut('.NET', 2, 'Received Node Update : (id:'+ node.Id + '),(col,row:' + node.Col + ','+node.Row+'),(peerId:' + node.PeerId + ')');
        }
    }
    $.connection.caveHub.client.receiveAppList = function (serializedAppList) {
        var deserializedAppList = JSON.parse(serializedAppList);
        gdo.net.app = new Array(deserializedAppList.length);
        consoleOut('.NET', 1, 'Received App List');
        for (var i = 0; i < deserializedAppList.length; i++) {
            gdo.net.app[name] = {};
            gdo.net.app[name].name = deserializedAppList[i];
            consoleOut('.NET', 2, 'App ' + i + ' : ' + gdo.net.app[name].name);
            loadModule(deserializedAppList[i], MODULE_TYPE.APP);
            var hubName = lowerCaseFirstLetter(deserializedAppList[i]) + "AppHub";
            gdo.net.app[name].server = $.connection[hubName].server;
        }
    }
});


function initHub() {
    /// <summary>
    /// Assigns hub references to our object structure (Hub initialized on load)
    /// </summary>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Initializing Hub');
    net.connection = $.connection;
    net.server = $.connection.caveHub.server;
    //net.listener = $.connection.caveHub.client;
    consoleOut('.NET', 0, 'Connected to Hub');
}

function initNet(clientMode) {//todo comment
    /// <summary>
    /// Initializes the gdo.net.
    /// </summary>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Initializing Net');
    net = {};
    net.maintenanceMode = false;
    net.peer = peer;
    net.node = [];
    net.section = [];
    net.app = [];
    net.instance = [];
    initializeArrays(100);
    initHub();
    net.nodes = {};
    net.neighbour = {};
    net.clientMode = clientMode;
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
    if (gdo.clientMode == CLIENT_MODE.NODE) {
        waitForResponse(initPeer, isSignalRServerResponded, 50, 20, 'SignalR server failed to Respond');
    }
    net.server.requestMaintenanceMode();
    consoleOut('.NET', 2, 'Requesting Default P2P Mode');
    net.server.requestDefaultP2PMode();
    consoleOut('.NET', 2, 'Requesting App List');
    net.server.requestAppList();
    consoleOut('.NET', 2, 'Requesting Nodes');
    var connection = $.hubConnection();
    net.tileAppHub = connection.createHubProxy('tileAppHub');
    net.tileAppHub.on('receiveTest', function (test) {
        consoleOut('.APP.TILE', 2, 'Test ' + test);
    });
    net.server.requestAllUpdates();
    return net;
}

function initPeer() {
    /// <summary>
    /// Initializes the peerjs.
    /// </summary>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Initializing Peer Connections');
    net.peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    net.peer.on('open', function(peerId) {
        consoleOut('.NET', 0, 'Connected to PeerServer with Id:' + peerId);
        net.node[gdo.clientId].peerId = peerId;
        net.node[gdo.clientId].isConnectedToPeerServer = true;
        uploadNodeInfo();
        setTimeout(updatePeerConnections(net.node[gdo.clientId].p2pmode), 1000 + Math.floor((Math.random() * 1000) + 1));
        net.peerJSServerResponded = true;
        consoleOut('.NET', 1, 'Peer Connections Initialized');
    });
    net.peer.on('close', function(err) {
        net.node[gdo.clientId].isConnectedToPeerServer = false;
        uploadNodeInfo();
        consoleOut('.NET', 5, err);
    });
    net.peer.on('connection', receiveConn);
}

function receiveConn(conn) {
    /// <summary>
    /// Initializes a connection opened by remote node.
    /// </summary>
    /// <param name="conn">The connection.</param>
    /// <returns></returns>
    var nodeId = -1;
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (net.node[index].peerId == conn.peer) {
            nodeId = Number(index);
        }
    }
    consoleOut('.NET', 2, 'Receiving Connection from Node ' + nodeId + ' - ' + conn.peer);
    if (nodeId > 0) {
        conn.on('open', function () {
            conn.send('hi!');
            net.node[nodeId].connectedToPeer = true;
            uploadNodeInfo();
            consoleOut('.NET', 0, 'Connected to Node ' + nodeId);
        });
        conn.on('close', function (err) {
            net.node[nodeId].connectedToPeer = false;
            uploadNodeInfo();
            consoleOut('.NET', 4, 'Node Connection Closed : nodeId : ' + nodeId);
        });
        conn.on('data', receiveData);
        conn.on('error', function (err) { consoleOut('.NET', 5, 'Connection Error - nodeId : ' + nodeId + ' - ' + err) });
    }
}

function initConn(conn, nodeId) {
    /// <summary>
    /// Initializes a connection opened by this node.
    /// </summary>
    /// <param name="conn">The connection.</param>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Opening Connection to Node ' + nodeId);
    conn.on('open', function(){
        conn.send('hi!');//todo send node id's in init messages
        net.node[nodeId].connectedToPeer = true;
        uploadNodeInfo();
        consoleOut('.NET', 0, 'Connected to Node ' + nodeId);
    });
    conn.on('close', function(err) {
        net.node[nodeId].connectedToPeer = false;
        uploadNodeInfo();
        consoleOut('.NET', 4, 'Node Connection Closed - nodeId : ' + nodeId);
    });
    conn.on('data', receiveData);
    conn.on('error', function(err) { consoleOut('.NET', 5, 'nodeId : ' + nodeId + ' - ' + err) });
}

function initNodes() {
    /// <summary>
    /// Initializes the nodes.
    /// </summary>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Initializing Nodes');
    consoleOut('.NET', 2, 'Requesting the map of the Cave');
    net.server.requestCaveMap();
}

function uploadNodeInfo() {
    /// <summary>
    /// Uploads the node information to server.
    /// </summary>
    /// <returns></returns>
    var connectedNodes = JSON.stringify(net.nodes.getConnected());
    net.server.uploadNodeInfo(gdo.clientId, net.connection.hub.id, connectedNodes, net.node[gdo.clientId].peerId, net.node[gdo.clientId].isConnectedToPeerServer)
        .done(function (result) { net.node[gdo.clientId].isConnectedToCaveServer = true; })
        .fail(function(result) {
            consoleOut(".NET", 5, "Failed to Upload Node Info");
            net.node[gdo.clientId].isConnectedToCaveServer = false;
            net.node[gdo.clientId].aggregatedConnectionHealth = 0;
            updateSelf();
        });
}

function connectToPeer(nodeId) {
    /// <summary>
    /// Connects to peer.
    /// </summary>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    if (net.node[nodeId].peerId != null && !net.node[nodeId].connectedToPeer && nodeId != gdo.clientId) {
        consoleOut('.NET', 2, 'Connecting to Node ' + nodeId + ' - ' + net.node[nodeId].peerId + ' - Connection Status :' + net.node[nodeId].connectedToPeer);
        var c = net.peer.connect(net.node[nodeId].peerId);
        initConn(c, nodeId);
    }
}

function disconnectFromPeer(nodeId) {
    /// <summary>
    /// Disconnects from peer.
    /// </summary>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    consoleOut('.NET', 2, 'Disconnecting from Node ' + nodeId);
    var conn = net.peer.connections[net.node[nodeId].peerId][0];
    net.node[nodeId].connectedToPeer = false;
    conn.close();
}

function updateNodes() {
    /// <summary>
    /// Updates the nodes.
    /// </summary>
    /// <returns></returns>
    for (var index in net.neighbour) {
        if (!net.neighbour.hasOwnProperty((index))) {
            continue;
        }
        if (net.neighbour[index] != gdo.clientId && net.neighbour[index] > 0) {
           net.node[net.neighbour[index]].isNeighbour = true;
        }
    }
    //more to come
}

function updateSelf() {
    /// <summary>
    /// Updates the self.
    /// </summary>
    /// <returns></returns>
    if (gdo.clientMode == CLIENT_MODE.NODE) {
        updateNodes();
        updatePeerConnections(net.node[gdo.clientId].p2pmode);
    }
    updateDisplayCanvas();
}

function updatePeerConnections(p2pmode) {
    /// <summary>
    /// Updates the peer connections.
    /// </summary>
    /// <param name="p2pmode">The p2pmode.</param>
    /// <returns></returns>
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (p2pmode == P2P_MODE.CAVE) {
            if (!net.node[index].connectedToPeer) {
                connectToPeer(net.node[index].id);
            }
        } else if (p2pmode == P2P_MODE.SECTION) {
            if (!net.node[index].connectedToPeer && net.node[index].sectionId == net.node[gdo.clientId].sectionId) {
                connectToPeer(net.node[index].id);
            } else if (net.node[index].connectedToPeer && net.node[index].sectionId != net.node[gdo.clientId].sectionId) {
                disconnectFromPeer(net.node[index].id);
            }
        } else if (p2pmode == P2P_MODE.NEIGHBOURS) {
            if (!net.node[index].connectedToPeer && net.node[index].isNeighbour) {
                connectToPeer(net.node[index].id);
            } else if (net.node[index].connectedToPeer && !net.node[index].isNeighbour && net.node[index].id != gdo.clientId) {
                disconnectFromPeer(net.node[index].id);
            }
        } else {
            if (net.node[index].connectedToPeer && index != gdo.clientId) {
                disconnectFromPeer(net.node[index].id);
            }
        }
    }
}

function isNeighbourOf(id1, id2) {
    /// <summary>
    /// Determines whether two nodes are neighbours.
    /// </summary>
    /// <param name="id1">The id1.</param>
    /// <param name="id2">The id2.</param>
    /// <returns></returns>
    if ((net.node[id1].col - 1) <= net.node[id2].col && net.node[id2].col <= (net.node[id1].col + 1) && (net.node[id1].row - 1) <= net.node[id2].row && net.node[id2].row <= (net.node[id1].row + 1)) {
        return true;
    }
    return false;
}

function getNodeId(col, row) {
    /// <summary>
    /// Gets the node identifier.
    /// </summary>
    /// <param name="col">The col.</param>
    /// <param name="row">The row.</param>
    /// <returns></returns>
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (net.node[index].col == col && net.node[index].row == row) {
            return Number(index);
        }
    }
    return -1;
}

function receiveData(data) {
    /// <summary>
    /// Receives the data.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns></returns>
    consoleOut('.NET', 4, 'RECEIVED DATA');
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
    /// <summary>
    /// Determines whether [is signal r server responded].
    /// </summary>
    /// <returns></returns>
    if (net != null && net != undefined) {
    if (net.signalRServerResponded != null && net.signalRServerResponded != undefined) {
            return net.signalRServerResponded;
        } else {
            return false;
        }
    }
}

function isPeerJSServerResponded(){
    /// <summary>
    /// Determines whether [is peer js server responded].
    /// </summary>
    /// <returns></returns>
    if (net != null && net != undefined) {
        if (net.peerJSServerResponded != null && net.peerJSServerResponded != undefined) {
            return net.peerJSServerResponded;
        } else {
            return false;
        }
    }
}

function initializeArrays(num) {
    net.node = new Array(num);
    for (var i = 0; i < num; i++) {
        net.node[i] = {};
        net.node[i].col = -1;
        net.node[i].row = -1;
        net.node[i].id = i;
        net.node[i].connectedToPeer = false;
        net.node[i].isNeighbour = false;
        net.node[i].isSelected = false;
        net.node[i].sectionId = 0;
        net.node[i].appInstanceId = -1;
        net.node[i].sendData = function (id, type, command, data, mode) {
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
                    net.server.sendData(gdo.clientId, id, msg);
                }
            } else if (mode == COMM_MODE.SERVER) {
                net.server.sendData(gdo.clientId, id, msg);
            }
        }
        net.section[i] = {};
        net.section[i].id = i;
        net.section[i].exists = false;
        net.section[i].health = 0;
        net.section[i].isSelected = false;
        net.section[i].isDeployed = false;

        net.instance[i] = {}
        net.instance[i].id = i;
        net.instance[i].appName = null;
        net.instance[i].sectionId = -1;
        net.instance[i].exists = false;
        net.instance[i].isSelected = false;
        net.instance[i].configName = null;
    }
}