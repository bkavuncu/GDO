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
    this.peer = peer;
    this.node = [];
    this.mode = mode;
    initHub(gdoHub);
    this.listener.getAppHubList = function(serializedAppList) {
        this.apps = JSON.parse(serializedAppList);
    }
    this.server.requestAppList();
    this.nodes.getConnected = function() {
        var i = 0;
        var connectedNodes = [];
        for (var index in this.node) {
            if (!this.node.hasOwnProperty((index))) {
                continue;
            }
            if (!this.node[index].connectedToPeer) {
                connectedNodes[i] = this.node[index].id;
                i++;
            }
        }
        return connectedNodes;
    }
    initNodes();
    initPeer(MODE.NONE);
    this.listener.receiveNodeUpdate = function(serializedNode) {
        var node = JSON.parse(serializedNode);
        this.node[node.id].sectionCol = node.sectionCol;
        this.node[node.id].sectionRow = node.sectionRow;
        this.node[node.id].sectionID = node.sectionID;
        this.node[node.id].deployed = node.isDeployed;
        this.node[node.id].connectedToServer = node.isConnected;
        this.node[node.id].appID = node.appID;
        this.node[node.id].peerMode = node.peerMode;
        if (node.id == gdo.id) {
            this.self.sectionCol = node.sectionCol;
            this.self.sectionRow = node.sectionRow;
            this.self.sectionID = node.sectionID;
            this.self.deployed = node.isDeployed;
            this.self.connectedToServer = node.isConnected;
            this.self.appID = node.appID;
            this.self.peerMode = node.peerMode;
            updateSelf();
        }
    }
    return this;
}

function initHub(hub) {
    this.connection = $.connection;
    this.server = hub.server;
    this.listener = hub.client;
    consoleOut("NET", "INFO", "Connected to Hub");
}

function initPeer(peermode)
{
    peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    peer.on('open', function (peerId) {
        consoleOut("NET", "INFO", "Connected to PeerServer");
        this.server.uploadNodeInfo(gdo.id, this.connection.hub.id, JSON.parse(this.connected()));
        setTimeout(updatePeerConnections(peermode), 1000 + Math.floor((Math.random() * 1000) + 1))
    })
    peer.on('close', function (err) { consoleOut("NET", "ERROR", err) });
    peer.on('connection', initConn);
}

function initConn(conn,nodeID){
    conn.on('open', function(){
        conn.send('hi!');
        this.node[nodeID].connectedToPeer = true;
    });
    conn.on('close', function (err) { consoleOut("NET", "ERROR", err) });
    conn.on('data',receiveData(data))
    conn.on('error', function (err) { consoleOut("NET", "ERROR", err) });
}

function initNodes() {
    this.listener.receiveCaveMap = function (cols, rows, serializedCaveMap) {
        deserializedCaveMap = JSON.parse(serializedCaveMap);
        for (i = 0; i < cols; i++) {
            for (j = 0; j < rows; j++) {
                var id = deserializedCaveMap[i][j];
                this.node[id].col = i;
                this.node[id].row = j;
                this.node[id].id = id;
                this.node[id].sendData = function (data) {
                    conn = peer.connections[id][0];
                    conn.send(data)
                }
            }
        }
    }
    this.server.requestCaveMap();
    this.listener.receiveNeighbourMap = function (cols, rows, serializedNeighbourMap) {
        this.cols = cols;
        this.rows = rows;
        deserializedNeighbourMap = JSON.parse(serializedNeighbourMap);
        var k = 0;
        for (j = 0; j < 3; j++) {
            for (i = 0; i < 3; i++) {
                var id = deserializedNeighbourMap[i][j];
                this.neighbour[k] = this.node[id];
                k++;
            }
        }
    }
    this.server.requestNeighbourMap();
    for (var index in this.node) {
        if (!this.node.hasOwnProperty((index))) {
            continue;
        }
        if (this.node[index].id == gdo.id) {
            this.node[index].connectedToPeer = true;         
        } else {
            this.node[index].connectedToPeer = false;
        }
        this.node[index].isNeighbour = false;
    }
    for (var index in this.neighbours) {
        if (!this.neighbours.hasOwnProperty((index))) {
            continue;
        }
        if (this.neighbours[index].id != gdo.id) {
            this.neighbours[index].isNeighbour = true;
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
    updatePeerConnections(this.self.peerMode);
    //More
}

function updatePeerConnections(peermode) {
    for (var index in this.node) {
        if (!this.node.hasOwnProperty((index))) {
            continue;
        }
        if (peermode == PEERMODE.CAVE) {
            if (!this.node[index].connectedToPeer) {
                connectToPeer(this.node[index].id);
            }
        } else if (peermode == PEERMODE.SECTION) {
            if (!this.node[index].connectedToPeer && this.node[index].sectionID == this.self.sectionID) {
                connectToPeer(this.node[index].id);
            } else if (this.node[index].connectedToPeer && this.node[index].sectionID != this.self.sectionID) {
                disconnectFromPeer(this.node[index].id);
            }
        } else if (peermode == PEERMODE.NEIGHBOURS) {
            if (!this.node[index].connectedToPeer && this.node[index].isNeighbour) {
                connectToPeer(this.node[index].id);
            }else if (this.node[index].connectedToPeer && !this.node[index].isNeighbour && this.node[index].id != gdo.id) {
                disconnectFromPeer(this.node[index].id);
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

var test = function() {

};