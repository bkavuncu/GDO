using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace GDO.Apps.DD3
{
    public class DD3App : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            JToken value;

            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;

            Configuration.Json.TryGetValue("data", out value);
            this.data = value;
        }

        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        private readonly object _locker = new Object();
        private IHubContext<dynamic> Context;
        private string controllerId = "";
        private int ConfigurationId;
        private JToken data;


        // Code for Data Request and Management
        

        public string getDimensions(string dataId)
        {
            var data = (JArray)(this.data[dataId]);

            var dimensions = new JObject();
            List<string> prop = new List<string>();

            // 1 - list all properties

            var first_reading = (JObject)(data[0]);
            foreach (var p in first_reading)
            {
                prop.Add(p.Key);

                dimensions[p.Key] = new JObject();
                dimensions[p.Key]["min"] = p.Value;
                dimensions[p.Key]["max"] = p.Value;
            }

            // 2 - find max and min for all properties

            foreach (var reading in data)
            {
                foreach(var p in prop)
                {
                    if((double)reading[p] > (double)dimensions[p]["max"])
                    {
                        dimensions[p]["max"] = reading[p];
                    }
                    else if((double)reading[p] < (double)dimensions[p]["min"])
                    {
                        dimensions[p]["min"] = reading[p];
                    }
                }
            }

            dimensions["length"] = data.Count;

            System.Diagnostics.Debug.WriteLine(dimensions);

            return dimensions.ToString();
        }

        public string requestData(DataRequest request)
        {
            return this.data[request.dataId].ToString();
        }

        public string requestPointData(PointDataRequest request)
        {
            return request.executeWith(this.data);
        }

        public string requestPathData(PathDataRequest request)
        {
            return request.executeWith(this.data);
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

    public enum DataType
    {
        ALL = 0,
        POINT = 1,
        PATH = 2,
        BAR = 3
    };

    public abstract class DataRequest
    {
        public DataRequest(string dataId, string dataName, dynamic limit, string [] _keys)
        {
            this.dataId = dataId;
            this.dataName = dataName;
            this.limit = limit;
            this._keys = _keys;
   //         this.dataType = dataType;
        }

        public string dataId { get; set; }
        public string dataName { get; set; }
        public dynamic limit { get; set; }
        public string [] _keys { get; set; }
    }

    public class PointDataRequest : DataRequest
    {
        public string xKey { get; set; }
        public string yKey { get; set; }
        protected Func<JToken, bool> isIn;

        public PointDataRequest(string dataId, string dataName, dynamic limit, string xKey, string yKey, string[] _keys) : base (dataId, dataName, (object)limit, _keys)
        {
            this.xKey = xKey;
            this.yKey = yKey;
            isIn = d => (d[xKey] >= limit.xmin && d[xKey] < limit.xmax && d[yKey] >= limit.ymin && d[yKey] < limit.ymax);
        }

        protected IEnumerable<JToken> createResponseObject(IEnumerable<JToken> data)
        {
            Func<JToken, JToken> mapFunction = d => {
                dynamic obj = new JObject();

                if (_keys != null)
                {
                    foreach (string k in _keys)
                    {
                        obj[k] = d[k];
                    }
                }
                else
                {
                    foreach (var k in (JObject)d)
                    {
                        obj[k.Key] = d[k.Key];
                    }
                }

                return obj;
            };

            return data.Select(mapFunction);
        }

        public string executeWith(JToken dataIn)
        {
            var data = dataIn[dataId].ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> filteredData = data.Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return Newtonsoft.Json.JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }

    public class PathDataRequest : PointDataRequest
    {
        public int approximation { get; set; }

        public PathDataRequest(string dataId, string dataName, int approximation, dynamic limit, string xKey, string yKey, string[] _keys) : base (dataId, dataName, (object)limit, xKey, yKey, _keys)
        {
            this.approximation = approximation;
        }

        public new string executeWith(JToken dataIn)
        {
            var data = dataIn[dataId].ToArray();
            List<JToken> filteredData = new List<JToken>();
            int counter = approximation;

            for (int i = 0, l = data.Count(); i < l; i++)
            {
                if (isIn(data[i]))
                {
                    var d =  .clamp(approximation - counter, -approximation, 0);
                    for (var j = Math.Max(i + d, 0); j <= i; j++)
                    {
                        filteredData.Add(data[j]);
                    }
                    counter = 0;
                }
                else
                {
                    if (counter < approximation)
                    {
                        filteredData.Add(data[i]);
                    }
                    counter++;
                }
            }

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return Newtonsoft.Json.JsonConvert.SerializeObject(responseData.ToArray());
        }

    }

    public class ControllerMessage
    {
        public ControllerMessage(int configurationId, int state, int numClient)
        {
            this.configurationId = configurationId;
            this.numClient = numClient;
            this.state = state;
        }

        public string toString ()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }

        public int configurationId { get; set; }
        public int state { get; set; }
        public int numClient { get; set; }
    }

    public class BrowserBroadcastInfo
    {
        public BrowserBroadcastInfo(string browserNum, string peerId, string col, string row)
        {
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
        }

        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
    }

    public class BrowserInfo
    {
        public BrowserInfo(string connectionId, string browserNum, string peerId, string col, string row, string height, string width)
        {
            this.connectionId = connectionId;
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
            this.height = height;
            this.width = width;
        }

        public string connectionId { get; set; }
        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
        public string height { get; set; }
        public string width { get; set; }
    }
}
