using System;
using System.Collections.Concurrent;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Apps.Hercules.BackEnd;
using Newtonsoft.Json;

namespace GDO.Apps.Hercules
{
    [Export(typeof(IAppHub))]
    public class HerculesAppHub : Hub, IAppHub
    {

        private static ConcurrentDictionary<int, IAppInstance> instances;
        private readonly object _locker = new Object();
        public static HerculesAppHub self;

        public string Name { get; set; }
        public int P2PMode { get; set; }
        public Type InstanceType { get; set; }

        public HerculesAppHub ()
        {
            self = this;
            this.Name = "Hercules";
            this.P2PMode = (int) Cave.P2PModes.None;
            this.InstanceType = new HerculesApp().GetType();
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
                    if (((HerculesApp)i.Value).removeClient(Context.ConnectionId))
                    {
                        ExitGroup(i.Value.Id);
                    }
                }
            }
            return base.OnDisconnected(b);
        }

        public void updateInformation(int instanceId, BrowserInfo b)
        {

            JoinGroup(instanceId);
            instances = Cave.Apps["Hercules"].Instances;
            Console.WriteLine("Getting there............................");
            ((HerculesApp)instances[instanceId]).newClient(Context.ConnectionId, b);
            Console.WriteLine("Getting there............................more so....");
        }

        public void synchronize(int instanceId)
        {
            ((HerculesApp)instances[instanceId]).synchronize(Context.ConnectionId);
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
                ((HerculesApp)instances[instanceId]).removeClient(Context.ConnectionId);
            }
        }

        // Data

        public void getDimensions(int instanceId, string dataId)
        {
            System.Diagnostics.Debug.WriteLine("Dimensions were requested");
            var dimensions = ((HerculesApp)instances[instanceId]).getDimensions(dataId);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveDimensions", dataId, dimensions);
        }

        public void getData(int instanceId, DataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((HerculesApp)instances[instanceId]).requestData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void getPointData(int instanceId, PointDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((HerculesApp)instances[instanceId]).requestPointData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void getPathData(int instanceId, PathDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((HerculesApp)instances[instanceId]).requestPathData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void getBarData(int instanceId, BarDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Data was requested : " + request.ToString());
            var data = ((HerculesApp)instances[instanceId]).requestBarData(request);
            Clients.Client(Context.ConnectionId).dd3Receive("receiveData", request.dataName, request.dataId, data);
        }

        public void requestFromRemote(int instanceId, RemoteDataRequest request)
        {
            System.Diagnostics.Debug.WriteLine("Received request for remote server data : " + request.ToString());
            var result = ((HerculesApp)instances[instanceId]).requestRemoteData(request);
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
            instances = Cave.Apps["Hercules"].Instances;
            ((HerculesApp)instances[instanceId]).defineController(Context.ConnectionId);
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
                System.Diagnostics.Debug.WriteLine(order);
                instances = Cave.Apps["Hercules"].Instances;
                var cid = ((HerculesApp)instances[instanceId]).getFirstNode();
                if (cid != null)
                    sendControllerOrder(cid, order);
            }
        }

        public void updateController(string controllerId, string message)
        {
            Clients.Client(controllerId).updateController(message);
        }

        public void updateMinisets(string controllerId, string JSONMinisets)
        {
            dynamic cli = Clients.Client(controllerId);
            cli.receiveMinisets(JSONMinisets);
            
        }

        public void getDatasets(int instanceId)
        {
            HerculesApp app = (HerculesApp) Cave.Apps["Hercules"].Instances[instanceId];

            app.BroadcastData();
        }

        public void setAxesMap(int instanceId, string map, string id)
        {
            string path = "../GDO.Apps.Hercules.Tests/TestFiles/WellFormed/falcon.csv";
            JsonDS dataset = Database.QueryJsonDS(id);
   
            string data = Utils.AxesMapToPlotOrder(map, dataset);
            string order = "{ \"name\": \"plotdatascatter\", \"args\": [" + data + "]}";

            instances = Cave.Apps["Hercules"].Instances;
            HerculesApp app = ((HerculesApp)instances[instanceId]);
            app.setAxesMap(data);

            sendOrder(instanceId, order, true);
        }

    }


}