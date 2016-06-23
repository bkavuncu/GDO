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


namespace GDO.Apps.DD3
{

    [Export(typeof(IAppHub))]
    public class DD3AppHub : Hub, IBaseAppHub
    {

        private static ConcurrentDictionary<int, IAppInstance> instances;
        private readonly object _locker = new Object();
        public static DD3AppHub self;

        public string Name { get; set; }
        public int P2PMode { get; set; }
        public Type InstanceType { get; set; }

        public DD3AppHub () {
            self = this;
            this.Name = "DD3";
            this.P2PMode = (int) Cave.P2PModes.None;
            this.InstanceType = new DD3App().GetType();
        }

        // == APP ==

        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

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

        public void updateInformation (int instanceId, BrowserInfo b)
        {
            JoinGroup(instanceId);
            instances = Cave.Apps["DD3"].Instances;
            ((DD3App) instances[instanceId]).newClient(Context.ConnectionId, b);
        }

        public void synchronize(int instanceId)
        {
            ((DD3App) instances[instanceId]).synchronize(Context.ConnectionId);
        }

        public void broadcastConfiguration(string browserInfoJson, int confId, int Id)
        {
            Clients.Group("" + Id).dd3Receive("receiveConfiguration", browserInfoJson);
            Clients.Group("" + Id).receiveGDOConfiguration(confId);
        }

        public void broadcastSynchronize(int Id)
        {
            Clients.Group("" + Id).dd3Receive("receiveSynchronize");
        }

        public void removeClient(int instanceId)
        {
            ExitGroup(instanceId);
            if (instances != null && instances.ContainsKey(instanceId))
            {
                ((DD3App)instances[instanceId]).removeClient(Context.ConnectionId);
            }
        }

        // Data

        public void getDimensions(int instanceId, string dataId)
        {
            System.Diagnostics.Debug.WriteLine("Dimensions were requested");
            var dimensions = ((DD3App)instances[instanceId]).getDimensions(dataId);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveDimensions", dataId, dimensions);
        }
        
        public void getData(int instanceId, DataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }
    
        public void getPointData(int instanceId, PointDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestPointData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void getPathData(int instanceId, PathDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestPathData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void getBarData(int instanceId, BarDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((DD3App)instances[instanceId]).requestBarData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void requestFromRemote(int instanceId, RemoteDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Received request for remote server data : " + request.ToString());
            var result = ((DD3App)instances[instanceId]).requestRemoteData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveRemoteDataReady", request.dataId, result);
        }

        // Orders

        public void broadcastControllerOrder(int Id, string order)
        {
            Clients.Group("" + Id).receiveControllerOrder(order);
        }

        public void sendControllerOrder(string Id, string order)
        {
            Clients.Client(Id).receiveControllerOrder(order);
        }

        // == CONTROLLER ==

        public void defineController(int instanceId)
        {
            instances = Cave.Apps["DD3"].Instances;
            ((DD3App)instances[instanceId]).defineController(Context.ConnectionId);
        }

        public void sendOrder(int instanceId, string order, bool all)
        {
            if (all)
            {
                broadcastControllerOrder(instanceId, order);
            }
            else
            {
                //Maybe should we make more checks to ensure we always send order to the same node...
                instances = Cave.Apps["DD3"].Instances;
                var cid = ((DD3App)instances[instanceId]).getFirstNode();
                if (cid != null)
                    sendControllerOrder(cid, order);
            }
        }

        public void updateController(string controllerId, string message)
        {
            Clients.Client(controllerId).updateController(message);
        }

    }
}