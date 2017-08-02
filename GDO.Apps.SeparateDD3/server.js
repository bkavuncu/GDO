var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs=require('fs'); 






app.use(express.static('assets' + '/'));

/*
app.use('/',function(req, res, next){
  console.log(req.query);
  var clientNum = req.query.numClients;
  console.log('clientNum',clientNum);
});
*/

server.listen(8000);
//app.listen(12332);

console.log('Server running at http://127.0.0.1:8080/');


var rooms ={};
var members = {};

var roomInfo = [];



io.on('connection',function(socket){
  members[socket.id] = socket;
  socket.emit('connected');
  socket.on('disconnect', function(){
    api.removeMember(socket);
    console.log('after remove',rooms);
  });


  socket.on('joinroom',function(data){
    var roomId =  ''+data.applicationId + data.instanceId; 
    var memberId  = data.clientId ? 'client'+data.clientId : 'control' + data.instanceId;
    var browserInfo = data.browserInfo || null;
    socket.memberId =  memberId;
    socket.browserInfo =  browserInfo;
    socket.roomId = roomId;
    var memberLength = data.numClients;   
    api.joinRoom(socket, roomId, memberLength);
  });


  socket.on('updateInformation', function (data) {
    var roomId = ''+ data.gdo_appInstanceId.applicationId + data.gdo_appInstanceId.instanceId;
    //console.log('data.browserInfo',data.browserInfo);
 
    

    if(rooms[roomId].ready == false && rooms[roomId] && rooms[roomId].clientLength == rooms[roomId].currentLength){
        var browserInfoArray = [];
        for(i in rooms[roomId].browserInfo){
            browserInfoArray.push(rooms[roomId].browserInfo[i]);
        }
        console.log('broadcasting to room ', roomId);
        browserInfoArray = JSON.stringify(browserInfoArray);
        //console.log('after stringify',browserInfoArray);
        io.to(roomId).emit('dd3Receive',{functionName:'receiveConfiguration',data:[browserInfoArray]});
        io.to(roomId).emit('receiveGDOConfiguration',{id:data.gdo_appInstanceId.applicationId});
        if(rooms[roomId].controllerId && members[rooms[roomId].controllerId])
          members[rooms[roomId].controllerId].emit('updateController', {show:true});

        rooms[roomId].ready = true;
    }

    else
      console.log('Not all clients joined, it will not do the configuration');
  });


  socket.on('getDimensions', function (data) {
    var roomId = ''+ data.gdo_appInstanceId.applicationId + data.gdo_appInstanceId.instanceId;
    //console.log('data.browserInfo',data.browserInfo);
    var dataId = data.dataId;
    var returnData;
    fs.readFile('./db/Scatterplot.json',function(err,data){  
        if(err)  
          throw err;
        var jsonObj=JSON.parse(data);
        returnData = jsonObj[dataId];
        //jsonObj[dataId].error = false;
        returnData = JSON.stringify(jsonObj[dataId]);
        console.log('[after stringify]',returnData);
        //io.to(roomId).emit('dd3Receive',{functionName:'receiveDimensions',data:[dataId,returnData]});
    });
  });


  socket.on('getPointData', function (data) {
    var roomId = ''+ data.gdo_appInstanceId.applicationId + data.gdo_appInstanceId.instanceId;
    //console.log('data.browserInfo',data.browserInfo);
    var request = data.request;

    var returnData;
    fs.readFile('./db/FileMapTubeShanghai.json',function(err,data){  
        if(err)  
          throw err;
        var jsonObj=JSON.parse(data);
        returnData = jsonObj[dataId];
        //jsonObj[dataId].error = false;
        returnData = JSON.stringify(jsonObj[dataId]);
        console.log('[after stringify]',returnData);
        //io.to(roomId).emit('dd3Receive',{functionName:'receiveData',data:[request.dataName, request.dataId, returnData]});
    });
  });


  socket.on('sendOrder', function (data) {
    console.log('sendOrder',data);

    var roomId = ''+ data.applicationId + data.instanceId;  
    if(data.all){
  
      io.to(roomId).emit('receiveControllerOrder',data.order);
    }
    else{
        console.log('receiveControllerOrder send', data.order);
      //这个地方要知道在这个room里的那一个socket的id。但是出发的事件和传递的参数仍然是一样的。
      members[rooms[roomId].firstNode].emit('receiveControllerOrder',data.order);
      //socket.broadcast.to(id).emit('receiveControllerOrder',data.order);
      //var cid = ((DD3App)instances[instanceId]).getFirstNode();
    }
  });
});


var api = {
  joinRoom(socket, roomId, memberLength){
   
      if(!rooms[roomId]){
           rooms[roomId] = {currentLength:0, clientLength: memberLength, browserInfo: {}, controllerId: null, ready: false, firstNode: null}
      }
      if(socket.memberId.indexOf('control') != 0){
         rooms[roomId].currentLength++;
         rooms[roomId].browserInfo[socket.memberId] = socket.browserInfo;
         if(!rooms[roomId].firstNode){
            console.log('[firstNode joined]', socket.id);
            rooms[roomId].firstNode = socket.id;
         }
          
      }
      else{
        rooms[roomId].controllerId = socket.id;
        if(rooms[roomId].clientLength == rooms[roomId].currentLength)
          socket.emit('updateController', {show:true});
      }
      console.log("[joinRoom]");
      socket.join(roomId);
      console.log("[emit joined]");
      socket.emit('joined');
  },
  removeMember(socket){
    if(socket.roomId && rooms[socket.roomId]){
        if(socket.memberId.indexOf('control') != 0){
            rooms[socket.roomId].currentLength--;
            delete rooms[socket.roomId].browserInfo[socket.memberId];
        }
        else{
            rooms[socket.roomId].controllerId = null;
        }
        socket.leave(socket.roomId);

        if(rooms[socket.roomId].currentLength == 0 && rooms[socket.roomId].controllerId == null)
            delete rooms[socket.roomId];
    }
    delete members[socket.id];
/*
    if(rooms[socket.roomId] && rooms[socket.roomId].firstNode == socket.id){
        console.log('[firstNode changed from]',socket.id , ' [to ]', Object.keys(members)[0]);
        rooms[socket.roomId].firstNode = Object.keys(members)[0];
    }
*/
    if(rooms[socket.roomId]&&rooms[socket.roomId].ready){
        //delete rooms[socket.roomId];
        rooms[socket.roomId].ready = false;
        io.to(socket.roomId).emit('refresh');
        //io.sockets.emit('refresh');
        return;
    }
  }
}

process.on('uncaughtException',function(err){
  console.log("[uncaughtException]",err);
});
