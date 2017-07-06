/*
*   PeerJS Server
*/

var peer = require('peer').PeerServer;
var server = peer({host: 'localhost', port: 33333, allow_discovery: true});

console.log("# peerjs server is up #");

server.on('connection', function(id) {
  console.log("> " + id + " is connected");
});

server.on('disconnect', function(id) {
  console.log("> " + id + " is disconnected");
});

/*
*   Express Server
*/

var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'assets')));

http.listen(8080);

console.log("# express server is up #");
