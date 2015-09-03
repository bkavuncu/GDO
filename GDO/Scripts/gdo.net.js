gdo.net.COMM_MODE = {
    P2P: 1,
    SERVER: 2
};

gdo.net.P2P_MODE = {
    NONE : -1,
    CAVE: 1,
    SECTION: 2,
    NEIGHBOUR: 3
};

gdo.net.NEIGHBOUR_ENUM = {
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
        gdo.net.p2pmode = defaultP2PMode;
    }
    $.connection.caveHub.client.setMaintenanceMode = function (maintenanceMode) {
        gdo.net.maintenanceMode = maintenanceMode;
        gdo.consoleOut('.NET', 1, 'Maintenance Mode:' + maintenanceMode);
        gdo.updateDisplayCanvas();
    }
    $.connection.caveHub.client.reloadNodeIFrame = function () {
        gdo.consoleOut('.NET', 1, 'Reload Node IFrame');
        gdo.reloadNodeIFrame();
    }
    $.connection.caveHub.client.receiveCaveUpdate = function (cols,rows, maintenanceMode,p2pmode,nodeMap,neighbourMap,appList,nodes,sections,apps,instances) {
        gdo.consoleOut('.NET', 1, 'Received the image of the Cave');
        gdo.net.maintenanceMode = maintenanceMode;
        gdo.net.p2pmode = p2pmode;
        gdo.net.processNodeMap(cols, rows, nodeMap);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.processNeighbourMap(neighbourMap);
        }
        gdo.net.apps = JSON.parse(appList);
        gdo.net.numApps = gdo.net.apps.length;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] != null) {
                var node = JSON.parse(nodes[i]);
                gdo.net.processNode(node);
            }
        }
        for (var i = 0; i < sections.length; i++) {
            if (sections[i] != null) {
                var section = JSON.parse(sections[i]);
                gdo.net.processSection(true,section.Id,section);
            }
        }
        for (var i = 0; i < apps.length; i++) {
            if (apps[i] != null) {
                var app = JSON.parse(apps[i]);
                gdo.net.processApp(app);
            }
        }
        for (var i = 0; i < instances.length; i++) {
            if (instances[i] != null) {
                var instance = JSON.parse(instances[i]);
                gdo.net.processInstance(instance);
            }
        }
        gdo.net.NodeInitialized = true;
        gdo.updateSelf();
    }

    $.connection.caveHub.client.receiveNodeUpdate = function (serializedNode) {
        /// <summary>
        /// Receives a Node Update and update the local node representation and updates self
        /// </summary>
        /// <param name="serializedNode">The serialized node.</param>
        /// <returns></returns>
        if (gdo.net.isNodeInitialized()) {
            var node = JSON.parse(serializedNode);
            gdo.net.processNode(node);
            gdo.updateSelf();
        }
    }

    $.connection.caveHub.client.receiveSectionUpdate = function (status, id, serializedSection) {
        gdo.consoleOut('.NET', 1, 'Received Section Update : (id:' + id + ', exists: ' + status + ")");
        if (gdo.net.isNodeInitialized()) {
            var section;
            if (status) {
                section = JSON.parse(serializedSection);
            }
            gdo.net.processSection(status, id, section);
            gdo.updateSelf();
        }
    }

    $.connection.caveHub.client.receiveAppUpdate = function(sectionId, appName, configName, instanceId, p2pMode, exists) {
        if (gdo.net.isNodeInitialized()) {
            gdo.consoleOut('.NET', 1, 'Received App Update : (id:' + instanceId + ', exists: ' + exists + ")");
            if (exists) {
                gdo.net.instance[instanceId].appName = appName;
                gdo.net.instance[instanceId].id = instanceId;
                gdo.net.instance[instanceId].sectionId = sectionId;
                gdo.net.instance[instanceId].exists = true;
                gdo.net.instance[instanceId].configName = configName;
                gdo.net.section[sectionId].appInstanceId = instanceId;
                if (gdo.net.app[appName].config[configName] == null) {
                    gdo.net.server.requestAppConfiguration(instanceId);
                }
                gdo.net.app[appName].p2pMode = p2pMode;
                for (var i = 0; i < gdo.net.section[sectionId].cols; i++) {
                    for (var j = 0; j < gdo.net.section[sectionId].rows; j++) {
                        gdo.net.node[gdo.net.getNodeId(gdo.net.section[sectionId].col + i, gdo.net.section[sectionId].row + j)].p2pmode = p2pMode;
                        gdo.net.node[gdo.net.getNodeId(gdo.net.section[sectionId].col + i, gdo.net.section[sectionId].row + j)].appInstanceId = instanceId;
                    }
                }
                if (gdo.net.node[gdo.clientId].sectionId == sectionId && gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                    gdo.net.app[appName].server.joinGroup(gdo.net.node[gdo.clientId].appInstanceId);
                    gdo.consoleOut('.NET', 1, 'Joining Group: (app:' + appName+ ', instanceId: ' + instanceId + ")");
                }
            } else {
                if (gdo.net.node[gdo.clientId].sectionId == sectionId && gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.app[appName] != undefined) {
                    gdo.net.app[appName].server.exitGroup(gdo.net.node[gdo.clientId].appInstanceId);
                    gdo.consoleOut('.NET', 1, 'Exiting Group: (app:' + appName + ', instanceId: ' + instanceId + ")");
                }
                gdo.net.instance[instanceId].exists = false;
                gdo.net.section[sectionId].appInstanceId = -1;
                for (var i = 0; i < gdo.net.section[sectionId].cols; i++) {
                    for (var j = 0; j < gdo.net.section[sectionId].rows; j++) {
                        gdo.net.node[gdo.net.getNodeId(gdo.net.section[sectionId].col + i, gdo.net.section[sectionId].row + j)].p2pmode = gdo.net.p2pmode;
                        gdo.net.node[gdo.net.getNodeId(gdo.net.section[sectionId].col + i, gdo.net.section[sectionId].row + j)].appInstanceId = -1;
                    }
                }
            }
            gdo.updateSelf();
        }
    }

    $.connection.caveHub.client.receiveAppConfig = function (instanceId, appName, configName, config) {
        if (gdo.net.isNodeInitialized()) {
            gdo.consoleOut('.NET', 1, 'Received App Config : (id:' + instanceId + ', config: ' + configName + ")");
            gdo.net.app[appName].config[configName] = JSON.parse(JSON.parse(config));
            gdo.updateSelf();
        }
    }

});


gdo.net.initHub = function () {
    /// <summary>
    /// Assigns hub references to our object structure (Hub initialized on load)
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Initializing Hub');
    gdo.net.connection = $.connection;
    gdo.net.server = $.connection.caveHub.server;
    //gdo.net.listener = $.connection.caveHub.client;
    gdo.consoleOut('.NET', 0, 'Connected to Hub');
}

gdo.net.initNet = function (clientMode) {//todo comment
    /// <summary>
    /// Initializes the gdo.net.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Initializing Net');
    gdo.net.maintenanceMode = true;
    gdo.net.initializeArrays(100);
    gdo.net.initHub();
    gdo.net.clientMode = clientMode;
    gdo.net.signalRServerResponded = false;
    gdo.net.peerJSServerResponded = false;
    gdo.net.numApps = 0;
    gdo.net.nodes.getConnected = function () {
        var i = 0;
        var connectedNodes = [];
        for (var index in gdo.net.node) {
            if (!gdo.net.node.hasOwnProperty((index))) {
                continue;
            }
            if (gdo.net.node[index].connectedToPeer) {
                connectedNodes[i] = gdo.net.node[index].id;
                i++;
            }
        }
        return connectedNodes;
    }
    gdo.net.initNodes();
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        waitForResponse(gdo.net.initPeer, gdo.net.isNodeInitialized, 50, 20, 'Node Failed to Initialize');
    }
}

gdo.net.initPeer = function () {
    /// <summary>
    /// Initializes the peerjs.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Initializing Peer Connections');
   // gdo.net.peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); // public server for testing outside of college

    gdo.net.peer = new Peer({ host: "dsigdoprod.doc.ic.ac.uk", port: 55555 }); //DSI Server only accessible within VPN own server will replace here
   
    gdo.net.peer.on('open', function(peerId) {
        gdo.consoleOut('.NET', 0, 'Connected to PeerServer with Id:' + peerId);
        gdo.net.node[gdo.clientId].peerId = peerId;
        gdo.net.node[gdo.clientId].isConnectedToPeerServer = true;
        setTimeout(gdo.net.updatePeerConnections(gdo.net.node[gdo.clientId].p2pmode), 1000 + Math.floor((Math.random() * 1000) + 1));
        gdo.net.peerJSServerResponded = true;
        gdo.consoleOut('.NET', 1, 'Peer Connections Initialized '+peerId);
    });
    gdo.net.peer.on('close', function(err) {
        gdo.net.node[gdo.clientId].isConnectedToPeerServer = false;
        gdo.consoleOut('.NET', 5,'ERROR'+ err);
    });
    gdo.net.peer.on('connection', gdo.net.receiveConn);
}

gdo.net.receiveConn = function (conn) {
    /// <summary>
    /// Initializes a connection opened by remote node.
    /// </summary>
    /// <param name="conn">The connection.</param>
    /// <returns></returns>
    var nodeId = -1;
    for (var index in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((index))) {
            continue;
        }
        if (gdo.net.node[index].peerId == conn.peer) {
            nodeId = Number(index);
        }
    }
    gdo.consoleOut('.NET', 2, 'Receiving Connection from Node ' + nodeId + ' - ' + conn.peer);
    if (nodeId > 0) {
        conn.on('open', function () {
            conn.send('hi!');
            gdo.net.node[nodeId].connectedToPeer = true;
            gdo.consoleOut('.NET', 0, 'Connected to Node ' + nodeId);
        });
        conn.on('close', function (err) {
            gdo.net.node[nodeId].connectedToPeer = false;
            gdo.consoleOut('.NET', 4, 'Node Connection Closed : nodeId : ' + nodeId);
        });
        conn.on('data', gdo.net.receiveData);
        conn.on('error', function (err) { gdo.consoleOut('.NET', 5, 'Connection Error - nodeId : ' + nodeId + ' - ' + err) });
    }
}

gdo.net.initConn = function (conn, nodeId) {
    /// <summary>
    /// Initializes a connection opened by this node.
    /// </summary>
    /// <param name="conn">The connection.</param>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Opening Connection to Node ' + nodeId);
    conn.on('open', function(){
        conn.send('hi!');//todo send node id's in init messages
        gdo.net.node[nodeId].connectedToPeer = true;
        gdo.consoleOut('.NET', 0, 'Connected to Node ' + nodeId);
    });
    conn.on('close', function(err) {
        gdo.net.node[nodeId].connectedToPeer = false;
        gdo.consoleOut('.NET', 4, 'Node Connection Closed - nodeId : ' + nodeId);
    });
    conn.on('data', gdo.net.receiveData);
    conn.on('error', function(err) { gdo.consoleOut('.NET', 5, 'nodeId : ' + nodeId + ' - ' + err) });
}

gdo.net.initNodes = function () {
    /// <summary>
    /// Initializes the nodes.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Initializing Nodes');
    gdo.consoleOut('.NET', 2, 'Requesting the map of the Cave');
    gdo.net.server.requestCaveUpdate(gdo.clientId);
}

gdo.net.uploadNodeInfo = function () {
    /// <summary>
    /// Uploads the node information to server.
    /// </summary>
    /// <returns></returns>
    var connectedNodes = JSON.stringify(gdo.net.nodes.getConnected());
    //gdo.consoleOut(".NET", 2, "Uploading Node Info to to Server id =" + gdo.clientId + " hub id=" + gdo.net.connection.hub.id + " peer id= " + gdo.net.node[gdo.clientId].peerId);
    gdo.net.server.uploadNodeInfo(gdo.clientId, gdo.net.connection.hub.id, connectedNodes, gdo.net.node[gdo.clientId].peerId, gdo.net.node[gdo.clientId].isConnectedToPeerServer)
        .done(function (result) { gdo.net.node[gdo.clientId].isConnectedToCaveServer = true; })
        .fail(function(result) {
            gdo.consoleOut(".NET", 5, "Failed to Upload Node Info");
            gdo.net.node[gdo.clientId].isConnectedToCaveServer = false;
            gdo.net.node[gdo.clientId].aggregatedConnectionHealth = 0;
            gdo.updateSelf();
        });
}

gdo.net.connectToPeer = function (nodeId) {
    /// <summary>
    /// Connects to peer.
    /// </summary>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    if (gdo.net.node[nodeId].peerId != null && !gdo.net.node[nodeId].connectedToPeer && nodeId != gdo.clientId) {
        gdo.consoleOut('.NET', 2, 'Connecting to Node ' + nodeId + ' - ' + gdo.net.node[nodeId].peerId + ' - Connection Status :' + gdo.net.node[nodeId].connectedToPeer);
        var c = gdo.net.peer.connect(gdo.net.node[nodeId].peerId);
        gdo.net.initConn(c, nodeId);
    }
}

gdo.net.disconnectFromPeer = function (nodeId) {
    /// <summary>
    /// Disconnects from peer.
    /// </summary>
    /// <param name="nodeId">The node identifier.</param>
    /// <returns></returns>
    gdo.consoleOut('.NET', 2, 'Disconnecting from Node ' + nodeId);
    var conn = gdo.net.peer.connections[gdo.net.node[nodeId].peerId][0];
    gdo.net.node[nodeId].connectedToPeer = false;
    conn.close();
}

gdo.net.updateNodes = function () {
    /// <summary>
    /// Updates the nodes.
    /// </summary>
    /// <returns></returns>

    //depreciated for now
}

gdo.updateSelf = function () {
    /// <summary>
    /// Updates the self.
    /// </summary>
    /// <returns></returns>
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        //gdo.net.updateNodes();
        gdo.net.updatePeerConnections(gdo.net.node[gdo.clientId].p2pmode);
    }
    gdo.updateDisplayCanvas();
}

gdo.net.updatePeerConnections = function (p2pmode) {
    /// <summary>
    /// Updates the peer connections.
    /// </summary>
    /// <param name="p2pmode">The p2pmode.</param>
    /// <returns></returns>
    for (var index in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((index))) {
            continue;
        }
        if (p2pmode == gdo.net.P2P_MODE.CAVE) {
            if (!gdo.net.node[index].connectedToPeer) {
                gdo.net.connectToPeer(gdo.net.node[index].id);
            }
        } else if (p2pmode == gdo.net.P2P_MODE.SECTION) {
            if (!gdo.net.node[index].connectedToPeer && gdo.net.node[index].sectionId == gdo.net.node[gdo.clientId].sectionId) {
                gdo.net.connectToPeer(gdo.net.node[index].id);
            } else if (gdo.net.node[index].connectedToPeer && gdo.net.node[index].sectionId != gdo.net.node[gdo.clientId].sectionId) {
                gdo.net.disconnectFromPeer(gdo.net.node[index].id);
            }
        } else if (p2pmode == gdo.net.P2P_MODE.NEIGHBOUR) {
            if (!gdo.net.node[index].connectedToPeer && gdo.net.node[index].isNeighbour) {
                gdo.net.connectToPeer(gdo.net.node[index].id);
            } else if (gdo.net.node[index].connectedToPeer && !gdo.net.node[index].isNeighbour && gdo.net.node[index].id != gdo.clientId) {
                gdo.net.disconnectFromPeer(gdo.net.node[index].id);
            }
        } else {
            if (gdo.net.node[index].connectedToPeer && index != gdo.clientId) {
                gdo.net.disconnectFromPeer(gdo.net.node[index].id);
            }
        }
    }
}

gdo.net.isNeighbourOf = function (id1, id2) {
    /// <summary>
    /// Determines whether two nodes are neighbours.
    /// </summary>
    /// <param name="id1">The id1.</param>
    /// <param name="id2">The id2.</param>
    /// <returns></returns>
    if ((gdo.net.node[id1].col - 1) <= gdo.net.node[id2].col && gdo.net.node[id2].col <= (gdo.net.node[id1].col + 1) && (gdo.net.node[id1].row - 1) <= gdo.net.node[id2].row && gdo.net.node[id2].row <= (gdo.net.node[id1].row + 1)) {
        return true;
    }
    return false;
}

gdo.net.getNodeId = function (col, row) {
    /// <summary>
    /// Gets the node identifier.
    /// </summary>
    /// <param name="col">The col.</param>
    /// <param name="row">The row.</param>
    /// <returns></returns>
    for (var index in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((index))) {
            continue;
        }
        if (gdo.net.node[index].col == col && gdo.net.node[index].row == row) {
            return Number(index);
        }
    }
    return -1;
}

gdo.net.receiveData = function (data) {
    /// <summary>
    /// Receives the data.
    /// </summary>
    /// <param name="data">The data.</param>
    /// <returns></returns>
    gdo.consoleOut('.NET', 4, 'RECEIVED DATA');
    //dataObj = JSON.parse(data);

    //var type = dataObj.type;
    //var command = dataObj.command;
    //var data = dataObj.data;

    //if file start, and save to file system
    // if control, do stuff
    // if app command, call the function of the app and drop the data in that function 
}

sendFile = function (conn, path, file) {
    //peerjs file send

}

gdo.net.receiveFile = function (path,name,data){
    if(state == 'start'){
        //check if exists
        //if it exists delete and recreate
    }else if(state == 'data'){
        //add data
    }
}


gdo.net.isNodeInitialized = function () {
    if (gdo.net != null && gdo.net != undefined) {
        if (gdo.net.NodeInitialized != null && gdo.net.NodeInitialized != undefined) {
            return gdo.net.NodeInitialized;
        } else {
            return false;
        }
    }
}

gdo.net.initializeArrays = function (num) {
    gdo.net.node = new Array(num);
    for (var i = 0; i < num; i++) {
        gdo.net.node[i] = {};
        gdo.net.node[i].col = -1;
        gdo.net.node[i].row = -1;
        gdo.net.node[i].id = i;
        gdo.net.node[i].connectedToPeer = false;
        gdo.net.node[i].isNeighbour = false;
        gdo.net.node[i].isSelected = false;
        gdo.net.node[i].sectionId = 0;
        gdo.net.node[i].appInstanceId = -1;
        gdo.net.node[i].sendData = function (id, type, command, data, mode) {
            var dataObj = {};
            dataObj.type = type;
            dataObj.command = command;
            dataObj.data = data;
            var msg = JSON.stringify(dataObj);
            if (mode == gdo.net.COMM_MODE.P2P) {
                try {
                    conn = peer.connections[id][0];
                    conn.send(msg);
                } catch (err) {
                    gdo.net.server.sendData(gdo.clientId, id, msg);
                }
            } else if (mode == gdo.net.COMM_MODE.SERVER) {
                gdo.net.server.sendData(gdo.clientId, id, msg);
            }
        }
        gdo.net.section[i] = {};
        gdo.net.section[i].id = i;
        gdo.net.section[i].exists = false;
        gdo.net.section[i].health = 0;
        gdo.net.section[i].isSelected = false;
        gdo.net.section[i].appInstanceId = -1;

        gdo.net.instance[i] = {}
        gdo.net.instance[i].id = i;
        gdo.net.instance[i].appName = null;
        gdo.net.instance[i].sectionId = -1;
        gdo.net.instance[i].exists = false;
        gdo.net.instance[i].isSelected = false;
        gdo.net.instance[i].configName = null;
        gdo.net.instance[i].sectionId = -1;
    }
}

gdo.net.processNodeMap = function (cols, rows, serializedNodeMap) {
    gdo.consoleOut('.NET', 1, 'Processing the map of the Nodes');
    gdo.net.cols = cols;
    gdo.net.rows = rows;
    gdo.consoleOut('.NET', 2, 'Node Length ' + gdo.net.node.length);
    deserializedNodeMap = JSON.parse(serializedNodeMap);
    for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
            var id = deserializedNodeMap[i][j];
            gdo.net.node[id].col = i;
            gdo.net.node[id].row = j;
            gdo.net.node[id].id = id;
        }
    }
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        gdo.net.node[gdo.clientId].connectionId = gdo.net.connection.hub.id;
        for (var index in gdo.net.neighbour) {
            if (!gdo.net.neighbour.hasOwnProperty((index))) {
                continue;
            }
            if (gdo.net.neighbour[index] != gdo.clientId && gdo.net.neighbour[index] > 0) {
                gdo.net.node[gdo.net.neighbour[index]].isNeighbour = true;
            }
        }
    }
}

gdo.net.processNeighbourMap = function (serializedNeighbourMap) {
    gdo.consoleOut('.NET', 1, 'Processing the map of Neighbours');
    deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
    var k = 0;
    for (j = 0; j < 3; j++) {
        for (i = 0; i < 3; i++) {
            var id = deserializedNeighbourMap[i][j];
            gdo.net.neighbour[k];
            gdo.net.neighbour[k] = id;
            gdo.consoleOut('.NET', 3, 'Neighbour ' + k + ' is node ' + id);
            k++;
        }
    }
    for (var index in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((index))) {
            continue;
        }
        gdo.net.node[index].connectedToPeer = false;
        gdo.net.node[index].isNeighbour = false;
    }
    for (var index in gdo.net.neighbour) {
        if (!gdo.net.neighbour.hasOwnProperty((index))) {
            continue;
        }
        if (gdo.net.neighbour[index] != gdo.clientId && gdo.net.neighbour[index] > 0) {
            gdo.net.node[gdo.net.neighbour[index]].isNeighbour = true;
        }
    }
}

gdo.net.processNode = function (node)
{
    gdo.net.node[node.Id].col = node.Col;
    gdo.net.node[node.Id].row = node.Row;
    gdo.net.node[node.Id].width = node.Width;
    gdo.net.node[node.Id].height = node.Height;
    gdo.net.node[node.Id].sectionCol = node.SectionCol;
    gdo.net.node[node.Id].sectionRow = node.SectionRow;
    gdo.net.node[node.Id].sectionId = node.SectionId;
    gdo.net.node[node.Id].deployed = node.IsDeployed;
    gdo.net.node[node.Id].connectionId = node.ConnectionId;
    gdo.net.node[node.Id].isConnectedToCaveServer = node.IsConnectedToCaveServer;
    gdo.net.node[node.Id].isConnectedToPeerServer = node.IsConnectedToPeerServer;
    gdo.net.node[node.Id].aggregatedConnectionHealth = node.AggregatedConnectionHealth;
    gdo.net.node[node.Id].appInstanceId = node.AppInstanceId;
    gdo.net.node[node.Id].peerId = node.PeerId;
    gdo.net.node[node.Id].p2pmode = node.P2PMode;
    gdo.net.node[node.Id].id = node.Id;
    gdo.net.node[node.Id].connectedNodeList = node.ConnectedNodeList;
    if (gdo.net.node[node.Id].sectionId > 0) {
        gdo.net.section[gdo.net.node[node.Id].sectionId].health = 0;
        for (var i = 0; i < gdo.net.section[gdo.net.node[node.Id].sectionId].cols; i++) {
            for (var j = 0; j < gdo.net.section[gdo.net.node[node.Id].sectionId].rows; j++) {
                gdo.net.section[gdo.net.node[node.Id].sectionId].health = gdo.net.section[gdo.net.node[node.Id].sectionId].health + gdo.net.node[gdo.net.section[gdo.net.node[node.Id].sectionId].nodeMap[i][j]].aggregatedConnectionHealth;
            }
        }
        gdo.net.section[gdo.net.node[node.Id].sectionId].health = gdo.net.section[gdo.net.node[node.Id].sectionId].health / (gdo.net.section[gdo.net.node[node.Id].sectionId].cols * gdo.net.section[gdo.net.node[node.Id].sectionId].rows);
    }
    gdo.consoleOut('.NET', 2, 'Received Node Update : (id:'+ node.Id + '),(col,row:' + node.Col + ','+node.Row+'),(peerId:' + node.PeerId + ')');
}

gdo.net.processSection = function(exists, id, section) {
    if (exists) {
        if (gdo.net.node[gdo.clientId].sectionId && gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.server.joinGroup(gdo.net.node[gdo.clientId].sectionId);
        }
        gdo.net.section[id].id = id;
        gdo.net.section[id].exists = true;
        gdo.net.section[id].col = section.Col;
        gdo.net.section[id].row = section.Row;
        gdo.net.section[id].cols = section.Cols;
        gdo.net.section[id].rows = section.Rows;
        gdo.net.section[id].width = section.Width;
        gdo.net.section[id].height = section.Height;
        gdo.net.section[id].appInstanceId = section.AppInstanceId;
        gdo.net.section[id].p2pmode = section.P2PMode;
        gdo.net.section[id].nodeMap = section.NodeMap;
        gdo.net.section[id].health = 0;
        for (var i = 0; i < section.Cols; i++) {
            for (var j = 0; j < section.Rows; j++) {
                gdo.net.section[id].health = gdo.net.section[id].health + gdo.net.node[gdo.net.section[id].nodeMap[i][j]].aggregatedConnectionHealth;
                gdo.net.node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionId = id;
                gdo.net.node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionCol = i;
                gdo.net.node[gdo.net.getNodeId(section.Col + i, section.Row + j)].sectionRow = j;
                gdo.net.node[gdo.net.getNodeId(section.Col + i, section.Row + j)].deployed = true;
                gdo.net.node[gdo.net.getNodeId(section.Col + i, section.Row + j)].p2pmode = section.P2PMode;
                gdo.consoleOut('.NET', 3, 'Updating Node : (id:' + gdo.net.getNodeId(section.Col + i, section.Row + j) + '),(col,row:' + (section.Col + i) + ',' + (section.Row + j) + ')');
            }
        }
        gdo.net.section[id].health = gdo.net.section[id].health / (section.Cols * section.Rows);
    } else {
        if (gdo.net.node[gdo.clientId].sectionId && gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.server.exitGroup(gdo.net.node[gdo.clientId].sectionId);
        }
        gdo.net.section[id].id = id;
        gdo.net.section[id].exists = false;
        gdo.net.section[id].appInstanceId = -1;
        for (var i = 0; i < gdo.net.section[id].cols; i++) {
            for (var j = 0; j < gdo.net.section[id].rows; j++) {
                gdo.net.node[gdo.net.getNodeId(gdo.net.section[id].col + i, gdo.net.section[id].row + j)].sectionId = 0;
                gdo.net.node[gdo.net.getNodeId(gdo.net.section[id].col + i, gdo.net.section[id].row + j)].deployed = false;
                gdo.net.node[gdo.net.getNodeId(gdo.net.section[id].col + i, gdo.net.section[id].row + j)].p2pmode = gdo.net.p2pmode;
                gdo.consoleOut('.NET', 3, 'Updating Node : (id:' + gdo.net.getNodeId(gdo.net.section[id].col + i, gdo.net.section[id].row + j) + '),(col,row:' + gdo.net.section[id].col + i + ',' + gdo.net.section[id].row + j + ')');
            }
        }
    }
}

gdo.net.processApp = function (app) {
    if (gdo.net.app[app.Name] == null) {
        gdo.net.app[app.Name] = {};    
    }
    gdo.consoleOut('.NET', 2, 'Updating App: ' + app.Name);
    gdo.net.app[app.Name].name = app.Name;
    var hubName = lowerCaseFirstLetter(app.Name) + "AppHub";
    gdo.net.app[app.Name].server = $.connection[hubName].server;
    gdo.net.app[app.Name].config = new Array();
    gdo.net.app[app.Name].p2pMode = app.P2PMode;
    gdo.net.app[app.Name].config = new Array(app.ConfigurationList.length);
    for (var i = 0; i < app.ConfigurationList.length; i++) {
        gdo.net.app[app.Name].config[i] = app.ConfigurationList[i];
    }
}

gdo.net.processInstance = function (instance) {
    gdo.consoleOut('.NET', 2, 'Updating Instance: ' + instance.Id);
    gdo.net.instance[instance.Id].appName = instance.AppName;
    gdo.net.instance[instance.Id].id = instance.Id;
    gdo.net.instance[instance.Id].sectionId = instance.Section.Id;
    gdo.net.instance[instance.Id].exists = true;
    gdo.net.instance[instance.Id].configName = instance.Configuration.Name;
    gdo.net.section[instance.Section.Id].appInstanceId = instance.Id;
    if (gdo.net.app[instance.AppName].config[instance.Configuration.Name] == null) {
        gdo.net.server.requestAppConfiguration(instance.Id);
    }
    for (var i = 0; i < gdo.net.section[instance.Section.Id].cols; i++) {
        for (var j = 0; j < gdo.net.section[instance.Section.Id].rows; j++) {
            gdo.net.node[gdo.net.getNodeId(gdo.net.section[instance.Section.Id].col + i, gdo.net.section[instance.Section.Id].row + j)].p2pmode = gdo.net.app[instance.AppName].p2pMode;
            gdo.net.node[gdo.net.getNodeId(gdo.net.section[instance.Section.Id].col + i, gdo.net.section[instance.Section.Id].row + j)].appInstanceId = instance.Id;
        }
    }
    if (gdo.net.node[gdo.clientId].sectionId == instance.Section.Id && gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        gdo.net.app[instance.AppName].server.joinGroup(gdo.net.node[gdo.clientId].appInstanceId);
        gdo.consoleOut('.NET', 1, 'Joining Group: (app:' + instance.AppName + ', instanceId: ' + instance.Id + ")");
    }
}