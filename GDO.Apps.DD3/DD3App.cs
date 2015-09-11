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
using System.Net;
using System.IO;
using Newtonsoft.Json;

namespace GDO.Apps.DD3
{
    public class DD3App : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            JToken value;

            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;

            Configuration.Json.TryGetValue("data", out value);
            if (value != null)
                this.data = value;
            else
                this.data = new JObject();

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
        }

        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        private readonly object _locker = new Object();
        private IHubContext<dynamic> Context;
        private string controllerId = "";
        private int ConfigurationId;
        private JToken data;
        private Dictionary<string, JToken> dimensions = new Dictionary<string, JToken>();
        private Dictionary<string, object> _lockersDim = new Dictionary<string, object>();
        private readonly object _lockerDim = new Object();


        // Code for Data Request and Management

        public string getDimensions(string dataId)
        {

            lock (_lockerDim)
            {
                if (!this._lockersDim.ContainsKey(dataId))
                {
                    this._lockersDim.Add(dataId, new object());
                }
            }

            lock (_lockersDim[dataId])
            {
                if (this.dimensions.ContainsKey(dataId))
                {
                    return this.dimensions[dataId].ToString();
                }

                var data = this.data[dataId];

                if (data == null)
                {
                    return "{\"error\":\"incorrect_dataId\"}";
                }

                var dimensions = new JObject();
                Func<JToken, JToken> tryParseNumber = d =>
                {
                    double number;
                    return Double.TryParse(d.ToString(), out number) ? number : d;
                };

                foreach (var p in (JObject)(data[0]))
                {
                    dimensions[p.Key] = new JObject();
                    dimensions[p.Key]["min"] = data.ToObject<IEnumerable<JToken>>().Min(c => tryParseNumber(c[p.Key]));
                    dimensions[p.Key]["max"] = data.ToObject<IEnumerable<JToken>>().Max(c => tryParseNumber(c[p.Key]));
                }

                dimensions["length"] = data.Count();
                this.dimensions.Add(dataId, dimensions);

                return dimensions.ToString();
            }
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

        public string requestBarData(BarDataRequest request)
        {
            return request.executeWith(this.data);
        }

        public bool requestRemoteData(RemoteDataRequest request)
        {
            return request.execute(ref this.data);
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

    public abstract class DataRequest
    {
        public string dataId { get; set; }
        public string dataName { get; set; }
        public dynamic limit { get; set; }
        public string [] _keys { get; set; }

        public DataRequest(string dataId, string dataName, dynamic limit, string [] _keys)
        {
            this.dataId = dataId;
            this.dataName = dataName;
            this.limit = limit;
            this._keys = _keys;
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

        public string executeWith(JToken dataIn)
        {
            if (dataIn[dataId] == null)
            {
                return "{\"error\":\"incorrect_dataId\"}";
            }

            var data = dataIn[dataId].ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> filteredData = data.Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return Newtonsoft.Json.JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }

    public class BarDataRequest : DataRequest
    {
        public string orderingKey { get; set; }
        protected Func<JToken, bool> isIn;
        protected Func<string, Func<JToken, JToken>> tryParseNumber = s =>
        {
            return d =>
            {
                double number;
                return Double.TryParse(d[s].ToString(), out number) ? number : d[s];
            };
        };
        protected Func<JToken, int, JToken> addOrderProperty = (d, i) => {
            d["order"] = i;
            return d;
        };

        public BarDataRequest(string dataId, string dataName, dynamic limit, string orderingKey, string[] _keys) : base (dataId, dataName, (object)limit, _keys)
        {
            this.orderingKey = orderingKey;
            isIn = d => (d["order"] >= limit.min && d["order"] < limit.max);
        }

        public string executeWith(JToken dataIn)
        {
            if (dataIn[dataId] == null)
            {
                return "{\"error\":\"incorrect_dataId\"}";
            }

            var data = dataIn[dataId].ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> orderedData;

            if (orderingKey != null)
                orderedData = data.OrderBy(tryParseNumber(orderingKey));
            else
                orderedData = data;

            IEnumerable<JToken> filteredData = orderedData.Select(addOrderProperty).Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return Newtonsoft.Json.JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }

    public class PathDataRequest : PointDataRequest
    {
        public int approximation { get; set; }
        protected Func<int, int, int, int> clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
        protected Func<JToken, JToken, bool> intersectLimit;
        protected Func<JToken, JToken, double, double, double, bool> intersectX;
        protected Func<JToken, JToken, double, double, double, bool> intersectY;

        public PathDataRequest(string dataId, string dataName, int approximation, dynamic limit, string xKey, string yKey, string[] _keys) : base (dataId, dataName, (object)limit, xKey, yKey, _keys)
        {
            this.approximation = approximation;

            intersectX = (p1, p2, x, y1, y2) =>
            {
                double a = (double)p1[xKey], b = (double)p1[yKey], c = (double)p2[xKey], d = (double)p2[yKey];
                double yMin = Math.Min(y1, y2), yMax = Math.Max(y1, y2);
                double xPMin = Math.Min(a, c), xPMax = Math.Max(a, c);
                double yPMin = Math.Min(b, d), yPMax = Math.Max(b, d);
                double y;

                if (a == c)
                    return a == x && yPMin < yMax && yPMax > yMin;

                y = b + (x - a) * (b - d) / (a - c);

                return (y >= yMin && y <= yMax) && (xPMin <= x && xPMax >= x);
            };

            intersectY = (p1, p2, y, x1, x2) =>
            {
                double a = (double)p1[xKey], b = (double)p1[yKey], c = (double)p2[xKey], d = (double)p2[yKey];
                double xMin = Math.Min(x1, x2), xMax = Math.Max(x1, x2);
                double xPMin = Math.Min(a, c), xPMax = Math.Max(a, c);
                double yPMin = Math.Min(b, d), yPMax = Math.Max(b, d);
                double x;

                if (b == d)
                    return b == y && xPMin < xMax && xPMax > xMin;
                
                x = a + (y - b) * (a - c) / (b - d);

                return (x >= xMin && x <= xMax) && (yPMin <= y && yPMax >= y);
            };

            intersectLimit = (p1, p2) =>
            {
                return
                   intersectX(p1, p2, (double)limit.xmin, (double)limit.ymin, (double)limit.ymax)
                || intersectX(p1, p2, (double)limit.xmax, (double)limit.ymin, (double)limit.ymax)
                || intersectY(p1, p2, (double)limit.ymin, (double)limit.xmin, (double)limit.xmax)
                || intersectY(p1, p2, (double)limit.ymax, (double)limit.xmin, (double)limit.xmax);
            };
        }

        public new string executeWith(JToken dataIn)
        {
            if (dataIn[dataId] == null)
            {
                return "{\"error\":\"incorrect_dataId\"}";
            }

            var data = dataIn[dataId].ToArray();
            List<JToken> filteredData = new List<JToken>();
            int counter = approximation;

            for (int i = 0, l = data.Count(); i < l; i++)
            {
                if (isIn(data[i]) || (i > 0 && intersectLimit (data[i-1], data[i])))
                {
                    var d = clamp(approximation - counter, -approximation, 0);

                    if ((counter - 2 * approximation > 0) && (i - counter + approximation - 1 >= 0))
                        while ((d-1 >= approximation - counter) && intersectLimit(data[i - counter + approximation - 1], data[i + d]))
                            d--;

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

    public class RemoteDataRequest
    {
        public string dataId { get; set; }
        public string server { get; set; }
        public string[] toObject { get; set; }
        public string[] toArray { get; set; }
        public string[][] toValues { get; set; }
        public string[][] useNames { get; set; }

        private Func<JToken, string, JToken> tryParseNumber = (agg, next) =>
        {
            int num = 0;
            if (int.TryParse(next, out num))
                return agg[num];
            else
                return agg[next];
        };

        public RemoteDataRequest(string dataId, string server, string[] toArray, string[] toObject, string[][] toValues, string[][] useNames)
        {
            this.dataId = dataId;
            this.server = server;
            this.toArray = toArray;
            this.toObject = toObject;
            this.toValues = toValues;
            this.useNames = useNames;
        }

        private JToken requestToServer (out JToken output)
        {
            // Create Request
            WebRequest request = WebRequest.Create(server);
            request.ContentType = "application/json; charset=utf-8";
            //request.Credentials = CredentialCache.DefaultCredentials;

            // Get the response
            System.Diagnostics.Debug.WriteLine("Getting data from : " + server);
            WebResponse response = request.GetResponse();

            // Read the response
            System.Diagnostics.Debug.WriteLine("HTTP response : " + ((HttpWebResponse)response).StatusDescription);
            Stream dataStream = response.GetResponseStream();
            StreamReader reader = new StreamReader(dataStream);
            JObject responseObject = (JObject)JsonConvert.DeserializeObject(reader.ReadToEnd());

            // Clean up the streams and the response
            reader.Close();
            response.Close();

            output = responseObject;
            return true;
        }

        private JToken formatData (JToken responseObject, out JToken output)
        {
            JToken array = toArray.Aggregate(responseObject, tryParseNumber);

            IEnumerable<JToken> data = array.Select(obj =>
            {
                JToken anObject = toObject.Aggregate(obj, tryParseNumber);
                JObject dataPoint = new JObject();

                foreach (var d in toValues.Select((path, i) => new { i, path }))
                {
                    string name = d.path[d.path.Count() - 1]; // SI value est null ahhhhhh

                    if (useNames.Count() > 0 && useNames[d.i].Count() > 1 && useNames[d.i][0] != "useKey")
                    {
                        if (useNames[d.i][0] == "usestring")
                        {
                            name = useNames[d.i][1];
                        }
                        else if (useNames[d.i][0] == "useObjectField")
                        {
                            name = (string)useNames[d.i].Skip(1).Aggregate(anObject, tryParseNumber);
                        }
                    }

                    dataPoint[name] = d.path.Aggregate(anObject, tryParseNumber);
                }

                return (JToken)dataPoint;
            });

            output = new JArray(data);
            return true;
        }

        public bool execute (ref JToken data)
        {
            JToken unformattedData, formattedData;
            requestToServer(out unformattedData);
            formatData(unformattedData, out formattedData);

            // Display the new data object
            System.Diagnostics.Debug.WriteLine(JsonConvert.SerializeObject(formattedData.ToArray()));

            data[dataId] = formattedData;
            return true;
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
