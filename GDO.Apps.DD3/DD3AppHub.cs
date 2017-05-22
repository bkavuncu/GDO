using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using System.ComponentModel.Composition;
using GDO.Core.Apps;
using System.Web;
using GDO.Apps.DD3.Domain;
using System.Diagnostics;

namespace GDO.Apps.DD3
{

    [Export(typeof(IAppHub))]
    //Synchronization, configuration, orders
    public class DD3AppHub : Hub, IBaseAppHub
    {
        //Dictionnary of the running instances of DD3 on the cluster
        private static ConcurrentDictionary<int, IAppInstance> instances;

        //Never used ...
        private readonly object _locker = new Object();

        //I guess that's a Singleton Design pattern in .Net
        public static DD3AppHub self;

        //Name of the application: "DD3"
        public string Name { get; set; }
        //P2P mode ON/Off => here off since dd3 maintains its own peerjs connection
        public int P2PMode { get; set; }
        //Type of instances: DD3App
        public Type InstanceType { get; set; }

        //Constructor
        public DD3AppHub () {
            self = this;
            this.Name = "DD3";
            this.P2PMode = (int) Cave.P2PModes.None;
            this.InstanceType = new DD3App().GetType();
        }

        // == APP ==

        //add the instance to the group
        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        //Remove the instance from the group
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        //Event Handler for a new instance connection
        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        //Event Handler for an instance disconnection
        public override System.Threading.Tasks.Task OnDisconnected(Boolean b)
        {
            if (instances != null)
            {
                foreach (var i in instances)
	            {
                    if (((DD3App)i.Value).removeClient(Context.ConnectionId))
                    {
                        ExitGroup(i.Value.Id);
                    }
	            }
            }
            return base.OnDisconnected(b);
        }

        //update information on each browser for a given instance
        public void updateInformation (int instanceId, BrowserInfo b)
        {
           // Debug.WriteLine("run updateInformation ");
            JoinGroup(instanceId);
            instances = Cave.Apps["DD3"].Instances;
            ((DD3App) instances[instanceId]).newClient(Context.ConnectionId, b);
        }

        //Send synchronize order to an instance. See DD3App synchronize.
        public void synchronize(int instanceId)
        {
            ((DD3App) instances[instanceId]).synchronize(Context.ConnectionId);
        }

        //Broadcast configuration about the browser to the browsers
        //BAI: this function will called by another "broadcastConfiguration" function defined in the DD3App.cs file. (the same name)
        public void broadcastConfiguration(string browserInfoJson, int confId, int Id)
        {
            //BAI: the following code will call the function "init.getCaveConfiguration" which is defined in the gdo.apps.dd3.js file.
            Debug.WriteLine("dd3Receive before ");
            Clients.Group("" + Id).dd3Receive("receiveConfiguration", browserInfoJson);
           // Clients.All.aaa();
            Debug.WriteLine("dd3Receive after ");
            Clients.Group("" + Id).receiveGDOConfiguration(confId);
        }

        //broadcast synchronize order to the browser node
        public void broadcastSynchronize(int Id)
        {
            Clients.Group("" + Id).dd3Receive("receiveSynchronize");
        }

        //Remove client from the instance
        public void removeClient(int instanceId)
        {
            ExitGroup(instanceId);
            if (instances != null && instances.ContainsKey(instanceId))
            {
                ((DD3App)instances[instanceId]).removeClient(Context.ConnectionId);
            }
        }

        // Data

        //Get dimensions from the data set and instance id
        public void getDimensions(int instanceId, string dataId)
        {
            System.Diagnostics.Debug.WriteLine("Dimensions were requested");
            var dimensions = ((DD3App)instances[instanceId]).getDimensions(dataId);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveDimensions", dataId, dimensions);
        }

        //call the data request from the data app and then send it back to browser nodes.
        public void getData(int instanceId, DataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        //call the point data request from the data app and then send it back to browser nodes.
        public void getPointData(int instanceId, PointDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestPointData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        //call the path data request from the data app and then send it back to browser nodes.
        public void getPathData(int instanceId, PathDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestPathData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        //call the bar data request from the data app and then send it back to browser nodes.
        public void getBarData(int instanceId, BarDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestBarData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        //call the data remote request from the data app and then send it back to browser nodes.
        public void requestFromRemote(int instanceId, RemoteDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Received request for remote server data : " + request.ToString());
            var result = ((DD3App)instances[instanceId]).requestRemoteData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveRemoteDataReady", request.dataId, result);
        }

        // Orders
        //Broadcast order from the controller to the browser nodes
        public void broadcastControllerOrder(int Id, string order)
        {
            Clients.Group("" + Id).receiveControllerOrder(order);
        }

        //Broadcast order from the controller to one browser node
        public void sendControllerOrder(string Id, string order)
        {
            Debug.WriteLine("The firstnode id is " + Id);
            Clients.Client(Id).receiveControllerOrder(order);
        }

        // == CONTROLLER ==
        //Define the controller node for this instance. See DD3App and defineController for more info
        public void defineController(int instanceId)
        {
 
            instances = Cave.Apps["DD3"].Instances;
            ((DD3App)instances[instanceId]).defineController(Context.ConnectionId);
        }

        //Send an order to browser nodes of an instance
        // if all is true, order will be sent to all browsers. Else, only to the first one
        public void sendOrder(int instanceId, string order, bool all)
        {
            if (all)
            {
                //send the order to all the clients in a cave (which means all the clients for a single application)
                broadcastControllerOrder(instanceId, order);
            }
            else
            {
                //send the order to one client in a cave (which means a single client for one application )
                //Maybe should we make more checks to ensure we always send order to the same node...
                //BAI: TODO: a strange comments above.
                instances = Cave.Apps["DD3"].Instances;
                //BAI: I guess, this command only send to order to the first connnected screen.
                var cid = ((DD3App)instances[instanceId]).getFirstNode();
                if (cid != null)
                    sendControllerOrder(cid, order);
            }
        }

        //Send a message to the controller
        //BAI: this function is called in the "DD3App.cs" file.
        public void updateController(string controllerId, string message)
        {
            Clients.Client(controllerId).updateController(message);
        }

    }
}