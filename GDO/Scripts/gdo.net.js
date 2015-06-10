var peer

var MODE = {
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
    BOTTOMRIGHT:8
};

function initNet() {
    var gdoHub;
    $.connection.hub.start().done(function () {
        gdoHub = $.connection.gdoHub;
    })
    net.peer = peer;
    net.node = [];
    net.mode = mode;
    initHub(gdoHub);
    net.apphubs = ;
    //get apphub list
    net.getConnectedNodes = function() {
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
    initPeer(MODE.NONE);
    net.listener.receiveNodeUpdate = function(serializedNode) {
        var node = JSON.parse(serializedNode);
        net.node[node.id].sectionCol = node.sectionCol;
        net.node[node.id].sectionRow = node.sectionRow;
        net.node[node.id].sectionID = node.sectionID;
        net.node[node.id].deployed = node.isDeployed;
        net.node[node.id].connectedToServer = node.isConnected;
        net.node[node.id].appID = node.appID;
        net.node[node.id].peerMode = node.peerMode;
        if (node.id == gdo.id) {
            net.self.sectionCol = node.sectionCol;
            net.self.sectionRow = node.sectionRow;
            net.self.sectionID = node.sectionID;
            net.self.deployed = node.isDeployed;
            net.self.connectedToServer = node.isConnected;
            net.self.appID = node.appID;
            net.self.peerMode = node.peerMode;
            updateSelf();
        }
    }
    return this;
}

function initHub(hub) {
    net.connection = $.connection;
    net.server = hub.server;
    net.listener = hub.client;
    consoleOut("NET", "INFO", "Connected to Hub");
}

function initPeer(peermode)
{
    peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    peer.on('open', function (peerId) {
        consoleOut("NET", "INFO", "Connected to PeerServer");
        net.server.uploadNodeInfo(gdo.id, net.connection.hub.id, JSON.parse(net.connected()));
        setTimeout(updatePeerConnections(peermode), 1000 + Math.floor((Math.random() * 1000) + 1))
    })
    peer.on('close', function (err) { consoleOut("NET", "ERROR", err) });
    peer.on('connection', initConn);
}

function initConn(conn,nodeID){
    conn.on('open', function(){
        conn.send('hi!');
        net.node[nodeID].connectedToPeer = true;
    });
    conn.on('close', function (err) { consoleOut("NET", "ERROR", err) });
    conn.on('data',receiveData(data))
    conn.on('error', function (err) { consoleOut("NET", "ERROR", err) });
}

function initNodes() {
    net.listener.receiveCaveMap = function (cols, rows, serializedCaveMap) {
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
                net.node[id].col = i;
                net.node[id].row = j;
                net.node[id].id = id;
                net.node[id].sendData = function (data) {
                    conn = peer.connections[id][0];
                    conn.send(data)
                }
            }
        }
    }
    net.server.requestCaveMap();
    net.listener.receiveNeighbourMap = function (serializedNeighbourMap) {
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                net.neighbour[k] = net.node[id];
                k++;
            }
        }
    }
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
    var conn = peer.connect(nodeID);
    initConn(c,nodeID);
}

function disconnectFromPeer(nodeID) {
    var conn = peer.connections[nodeID][0];
    conn.close();
}

function updateSelf() {
    updatePeerConnections(net.self.peerMode);
    //More
}

function updatePeerConnections(peermode) {
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (peermode == PEERMODE.CAVE) {
            if (!net.node[index].connectedToPeer) {
                connectToPeer(net.node[index].id);
            }
        } else if (peermode == PEERMODE.SECTION) {
            if (!net.node[index].connectedToPeer && net.node[index].sectionID == net.self.sectionID) {
                connectToPeer(net.node[index].id);
            } else if (net.node[index].connectedToPeer && net.node[index].sectionID != net.self.sectionID) {
                disconnectFromPeer(net.node[index].id);
            }
        } else if (peermode == PEERMODE.NEIGHBOURS) {
            if (!net.node[index].connectedToPeer && net.node[index].isNeighbour) {
                connectToPeer(net.node[index].id);
            }else if (net.node[index].connectedToPeer && !net.node[index].isNeighbour && net.node[index].id != gdo.id) {
                disconnectFromPeer(net.node[index].id);
            }
        } 
    }
}

function sendFile(conn, path, file) {
    //peerjs file send

}


function receiveFile(path,name,data){
    if(state == 'start'){
        //check if exists
        //if it exists delete and recreate
    }else if(state == 'data'){
        //add data
    }
}

function sendData(conn, data) {
    conn.send(data);
}

function receiveData(nodeID,data) {
    dataObj = JSON.parse(data);
    //get data metadata
    //file
    //msg
    //app
    //
    //parse

}