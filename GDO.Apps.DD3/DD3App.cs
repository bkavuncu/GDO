using System;
using System.Collections.Concurrent;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Web;
using System.Drawing;
using GDO.Apps.DD3.Domain;
using GDO.Core.Apps;
using Newtonsoft.Json;

namespace GDO.Apps.DD3
{
    //Class which represents the application instance in the GDO framework
    public class DD3App : IBaseAppInstance
    {
        //Id of the application instance
        public int Id { get; set; }
        //Name of the application instance
        public string AppName { get; set; }

        //Section which contains the application instance
        public Section Section { get; set; }

        //Configuration (i.e. visualization) launched in this instance
        public AppConfiguration Configuration { get; set; }

        //Unknown and unused in DD3
        public bool IntegrationMode { get; set; }

        //Advanced App instance if launched by another advanced app => unused, see wiki if you want to create that
        public ICompositeAppInstance ParentApp { get; set; }

        public App App { get; set; }

        /*
         * Initialisation function
         * Initialise data, configuration and directory
         * In particular, retrieve the json configuration object
         */
        public void Init()
        {
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            JToken value;

            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;

            data = new Data(this.Configuration.Name);
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Images/images/dd3"));

            /*
            // Test For data request - unused, but can be leveraged if connection to database needs to be developped

            var server = "http://wikisensing.org/WikiSensingServiceAPI/DCEWilliamPenneyUpperFloorzYyYFkLwEygj7B0vvQWQ/Node_1/5";
            String[] toArray = { "sensorRecords" };
            String[] toObject = { "sensorObject" };
            String[][] toValues = { new string[] { "12", "value" } };
            String[][] useNames1 = { new string[] { "useKey"} };
            String[][] useNames2 = { new string[] { "useString", "Temp" } };
            String[][] useNames3 = { new string[] { "useObjectField", "12", "fieldName" } };

            System.Diagnostics.Debug.WriteLine(" -- Request of data 0 -- ");
            webRequest("id", server, toArray, toObject, toValues, null);
            System.Diagnostics.Debug.WriteLine(" -- Request of data 1 -- ");
            webRequest("id", server, toArray, toObject, toValues, useNames1);
            System.Diagnostics.Debug.WriteLine(" -- Request of data 2 -- ");
            webRequest("id", server, toArray, toObject, toValues, useNames2);
            System.Diagnostics.Debug.WriteLine(" -- Request of data 3 -- ");
            webRequest("id", server, toArray, toObject, toValues, useNames3);
            */


        }

        //Dictionnary of browser nodes browser info by id
        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        //Dictionnary of browsrer nodes  sync state (true: synchronised, false: not synchronized) by id
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        //Locker used for making sure we are not creating and removing a client at the same time
        private readonly object _locker = new Object();
        //Object where information about the DD3AppHub is stored
        private IHubContext<dynamic> Context;

        //Id of the controller node (i.e. tablet in the observatory)
        private string controllerId = "";
        //Id of the configuration (could be retrieved from the configuration ?)
        private int ConfigurationId;
        //Data object
        private Data data;


        // Code for Data Request and Management

        //return dimensions of the Data object for a given dataid
        public string getDimensions(string dataId)
        {
            return data.getDimensions(dataId).ToString();
        }

        //Request data from the data object based on a DataRequest
        public string requestData(DataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : JsonConvert.SerializeObject(request.createResponseObject(dataIn));
        }

        //Request data from the data object based on a PointDataRequest
        public string requestPointData(PointDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        //Request data from the data object based on a PathDataRequest
        public string requestPathData(PathDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        //Request data from the data object based on a Path Data Request
        public string requestBarData(BarDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        //Request data from the data object based on a Remote Data Request
        public string requestRemoteData(RemoteDataRequest request)
        {
            return request.execute(this.data);
        }

        // Code for Connection and Control
        //Initialise a new application node
        public void newClient(string cid, BrowserInfo b)
        {
            lock (_locker)
            {
                browserList.TryAdd(cid, new BrowserInfo(cid, b.browserNum, b.peerId, b.col, b.row, b.height, b.width));
                if (browserList.Count == Section.NumNodes)
                {
                    broadcastConfiguration();
                    if (controllerId != "")
                    {
                        DD3AppHub.self.updateController(controllerId, new ControllerMessage(ConfigurationId, 1, Section.NumNodes).toString());
                    }
                }
            }
        }

        // Define which node is the controller and send the cluster's configuration
        public void defineController (string id)
        {
            controllerId = id;
            if (browserList.Count == Section.NumNodes)
            {
                // 1 = Launched
                DD3AppHub.self.updateController(controllerId, new ControllerMessage(ConfigurationId, 1, Section.NumNodes).toString());
            }
        }

        //Broadcast configurations to all the Browser nodes
        private void broadcastConfiguration () {
            BrowserBroadcastInfo[] browserInfos = new BrowserBroadcastInfo[browserList.Count];
            int i = 0;

            foreach (var item in browserList.Values)
            {
                browserInfos[i] = new BrowserBroadcastInfo(item.browserNum, item.peerId, item.col, item.row);
                i++;
            }

            String browserInfoJson = Newtonsoft.Json.JsonConvert.SerializeObject(browserInfos);
            DD3AppHub.self.broadcastConfiguration(browserInfoJson, ConfigurationId, Id);
        }

        // Request the App hub to send a synchronize order to the browser nodes (this will synchronize the signalR connection)
        public void synchronize(string cid)
        {
            syncList.AddOrUpdate(cid, true, (key, value) => true);
            if (syncList.Count == Section.NumNodes)
            {
                DD3AppHub.self.broadcastSynchronize(Id);
                syncList.Clear();
            }
        }

        //Get the first Browser node of this instance.
        public string getFirstNode()
        {
            var e = browserList.GetEnumerator();
            e.MoveNext();
            return e.Current.Key;
        }

        //Remove a browser node from the instance
        public bool removeClient(string id)
        {
            lock (_locker)
            {
                BrowserInfo b;
                return browserList.TryRemove(id, out b);
            }
        }
    }
}
