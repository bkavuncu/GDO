var net;
var peer

function initNet(hub) {
    net.peer = peer;
    net.node = [];
    initHub(hub);
    net.connected = function() {
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
    }
    initNodes();
    initPeer();
    net.listener.receiveNodeUpdate = function(serializedNode) {
        var node = JSON.parse(serializedNode);
        net.node[node.id].sectionCol = node.sectionCol;
        net.node[node.id].sectionRow = node.sectionRow;
        net.node[node.id].sectionID = node.sectionID;
        net.node[node.id].deployed = node.isDeployed;
        net.node[node.id].connectedToServer = node.isConnected;
        net.node[node.id].appID = node.appID;
    }
    return net;
}

function initHub(hub) {
    net.connection = $.connection;
    net.server = hub.server;
    net.listener = hub.client;
    consoleOut("NET", "INFO", "Connected to Hub");
    return net;
}

function initPeer()
{
    peer = new Peer({ key: 'x7fwx2kavpy6tj4i', debug: true }); //our own server will replace here
    peer.on('open', function (peerId) {
        consoleOut("NET", "INFO", "Connected to PeerServer");
        net.server.uploadNodeInfo(gdo.id, net.connection.hub.id, JSON.parse(net.connected()));
        setTimeout(connectToPeers, 1000 + Math.floor((Math.random() * 1000) + 1))
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
                if (id == gdo.id) {
                    net.node[id].connectedToPeer = true;
                } else {
                    net.node[id].connectedToPeer = false;
                }
            }
        }
    }
    net.server.requestCaveMap();
}

function connectToPeer(nodeID) {
    var conn = peer.connect(nodeID);
    initConn(c,nodeID);
}

function connectToPeers() {
    for (var index in net.node) {
        if (!net.node.hasOwnProperty((index))) {
            continue;
        }
        if (!net.node[index].connectedToPeer) {
            connectToPeer(net.node[index].id);
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