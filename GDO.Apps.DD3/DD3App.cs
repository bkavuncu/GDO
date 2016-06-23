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
    public class DD3App : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public void Init()
        {
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            JToken value;

            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;

            data = new Data(this.Configuration.Name);
            /*
            // Test For data request

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

            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Images/images/dd3"));
        }

        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        private readonly object _locker = new Object();
        private IHubContext<dynamic> Context;
        private string controllerId = "";
        private int ConfigurationId;
        private Data data;


        // Code for Data Request and Management

        public string getDimensions(string dataId)
        {
            return data.getDimensions(dataId).ToString();
        }

        public string requestData(DataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : JsonConvert.SerializeObject(request.createResponseObject(dataIn));
        }

        public string requestPointData(PointDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        public string requestPathData(PathDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        public string requestBarData(BarDataRequest request)
        {
            var dataIn = this.data.getById(request.dataId);
            return dataIn == null ? "{\"error\":\"incorrect_dataId\"}" : request.executeWith(dataIn);
        }

        public string requestRemoteData(RemoteDataRequest request)
        {
            return request.execute(this.data);
        }

        // Code for Connection and Control

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

        public void defineController (string id)
        {
            controllerId = id;
            if (browserList.Count == Section.NumNodes)
            {
                // 1 = Launched
                DD3AppHub.self.updateController(controllerId, new ControllerMessage(ConfigurationId, 1, Section.NumNodes).toString());
            }
        }

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

        public void synchronize(string cid)
        {
            syncList.AddOrUpdate(cid, true, (key, value) => true);
            if (syncList.Count == Section.NumNodes)
            {
                DD3AppHub.self.broadcastSynchronize(Id);
                syncList.Clear();
            }
        }

        public string getFirstNode()
        {
            var e = browserList.GetEnumerator();
            e.MoveNext();
            return e.Current.Key;
        }

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
