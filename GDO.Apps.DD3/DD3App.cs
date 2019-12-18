using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Net;
using System.IO;
using System.Web;
using GDO.Core.Apps;
using Newtonsoft.Json;

namespace GDO.Apps.DD3
{
    public class DD3App : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        #region config
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration)config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        public void Init()
        {
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            JToken value;

            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;

            data = new Data(this.Configuration.Name);

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

    public class Data
    {
        private Dictionary <string, JToken> data = new Dictionary<string, JToken>();
        private Dictionary<string, JToken> dimensions = new Dictionary<string, JToken>();
        private Dictionary<string, object> _lockersDim = new Dictionary<string, object>();
        private readonly object _lockerDim = new Object();

        public Data (string confName)
        {
            try
            {
                using (StreamReader sr = new StreamReader("Configurations/DD3/Data/File" + confName + ".txt"))
                {
                    System.Diagnostics.Debug.WriteLine("Reading the data file");
                    string line = sr.ReadToEnd();
                    JObject json = JObject.Parse(line);
                    foreach (var p in json)
                    {
                        data.Add(p.Key, p.Value);
                    }
                    System.Diagnostics.Debug.WriteLine("Data were loaded");
                }
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine("The data file could not be read:");
                System.Diagnostics.Debug.WriteLine(e.Message);
            }
        }

        public JToken getById(string dataId)
        {
            return data.ContainsKey(dataId) ? data[dataId] : null;
        }

        public void add(string dataId, JToken dataSet)
        {
            data.Add(dataId, dataSet);
        }

        public JToken getDimensions(string dataId)
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

                if (!this.data.ContainsKey(dataId))
                {
                    return "{\"error\":\"incorrect_dataId\"}";
                }

                calculateDimensions(dataId);

                return this.dimensions[dataId].ToString();
            }
        }

        private void calculateDimensions (string dataId)
        {
            var dataSet = this.data[dataId];
            var dimensions = new JObject();//TODO this is hiding a class field - rename local variable XOR use class variable
            Func<JToken, JToken> tryParseNumber = d =>
            {
                double number;
                return Double.TryParse(d.ToString(), out number) ? number : d;
            };

            foreach (var p in (JObject)(dataSet[0]))
            {
                dimensions[p.Key] = new JObject();
                dimensions[p.Key]["min"] = dataSet.ToObject<IEnumerable<JToken>>().Min(c => tryParseNumber(c[p.Key]));
                dimensions[p.Key]["max"] = dataSet.ToObject<IEnumerable<JToken>>().Max(c => tryParseNumber(c[p.Key]));
            }

            dimensions["length"] = dataSet.Count();
            this.dimensions.Add(dataId, dimensions);
        }

    }

    public class DataRequest
    {
        public string dataId { get; set; }
        public string dataName { get; set; }
        public dynamic limit { get; set; }
        public string [][] _keys { get; set; }

        protected static Func<JToken, string, JToken> tryAggregateNumber = (agg, next) =>
        {
            if (agg == null || agg is JValue)
                return null;

            int num = 0;
            if (int.TryParse(next, out num))
                return num < agg.Count() ? agg[num] : null;
            else if (!(agg is JArray))
                return agg[next];
            else
                return null;
        };

        public DataRequest(string dataId, string dataName, dynamic limit, string [][] _keys)
        {
            this.dataId = dataId;
            this.dataName = dataName;
            this.limit = limit;
            this._keys = _keys;
        }

        public IEnumerable<JToken> createResponseObject(IEnumerable<JToken> data)
        {
            Func<JToken, JToken> mapFunction = d => {
                dynamic obj = new JObject();

                if (_keys != null)
                {
                    foreach (string[] k in _keys)
                    {
                        JToken objTemp = obj;
                        obj[k.Last()] = k.Aggregate(d, (o, s) => {
                            objTemp[s] = objTemp[s] ?? new JObject();
                            objTemp = objTemp[s];
                            return o[s];
                        });
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

            return data.Count() == 0 ? data : data.First() is JProperty ? data.First().Parent : data.Select(mapFunction);
        }
    }

    public class PointDataRequest : DataRequest
    {
        public string[] xKey { get; set; }
        public string[] yKey { get; set; }
        protected Func<JToken, bool> isIn;

        public PointDataRequest(string dataId, string dataName, dynamic limit, string[] xKey, string[] yKey, string[][] _keys) : base (dataId, dataName, (object)limit, _keys)
        {
            this.xKey = xKey;
            this.yKey = yKey;
            isIn = d => {
                var x = xKey.Aggregate(d, tryAggregateNumber);
                var y = yKey.Aggregate(d, tryAggregateNumber);
                return x >= limit.xmin && x < limit.xmax && y >= limit.ymin && y < limit.ymax;
            };
        }

        public string executeWith(JToken dataIn)
        {
            var data = dataIn.ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> filteredData = data.Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }

    public class BarDataRequest : DataRequest
    {
        public string[] orderingKey { get; set; }
        protected Func<JToken, bool> isIn;
        protected Func<string[], Func<JToken, dynamic>> tryParseNumber = s =>
        {
            return d =>
            {
                double number;
                JToken val = s.Aggregate(d, tryAggregateNumber);
                return double.TryParse(val.ToString(), out number) ? number : val;
            };
        };
        protected Func<JToken, int, JToken> addOrderProperty = (d, i) => {
            d["order"] = i;
            return d;
        };

        public BarDataRequest(string dataId, string dataName, dynamic limit, string[] orderingKey, string[][] _keys) : base (dataId, dataName, (object)limit, _keys)
        {
            this.orderingKey = orderingKey;
            isIn = d => (d["order"] >= limit.min && d["order"] < limit.max);
        }

        public string executeWith(JToken dataIn)
        {
            var data = dataIn.ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> orderedData;

            if (orderingKey != null)
                orderedData = data.OrderBy(tryParseNumber(orderingKey));
            else
                orderedData = data;

            IEnumerable<JToken> filteredData = orderedData.Select(addOrderProperty).Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }

    public class PathDataRequest : PointDataRequest
    {
        public int approximation { get; set; }
        protected Func<int, int, int, int> clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
        protected Func<JToken, JToken, bool> intersectLimit;
        protected Func<JToken, JToken, double, double, double, bool> intersectX;
        protected Func<JToken, JToken, double, double, double, bool> intersectY;

        public PathDataRequest(string dataId, string dataName, int approximation, dynamic limit, string[] xKey, string[] yKey, string[][] _keys) : base (dataId, dataName, (object)limit, xKey, yKey, _keys)
        {
            this.approximation = approximation;

            intersectX = (p1, p2, x, y1, y2) =>
            {
                double a = (double)xKey.Aggregate(p1, tryAggregateNumber), b = (double)yKey.Aggregate(p1, tryAggregateNumber),
                       c = (double)xKey.Aggregate(p2, tryAggregateNumber), d = (double)yKey.Aggregate(p2, tryAggregateNumber);
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
                double a = (double)xKey.Aggregate(p1, tryAggregateNumber), b = (double)yKey.Aggregate(p1, tryAggregateNumber),
                       c = (double)xKey.Aggregate(p2, tryAggregateNumber), d = (double)yKey.Aggregate(p2, tryAggregateNumber);
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
            var data = dataIn.ToArray();
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
            if (agg == null || agg is JValue)
                return null;

            int num = 0;
            if (int.TryParse(next, out num))
                return num < agg.Count() ? agg[num]: null;
            else if (!(agg is JArray))
                return agg[next];
            else
                return null;
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
            dynamic error = new JObject();
            error.result = "Success";
            error.error = "";

            // Create Request
            WebRequest request = WebRequest.Create(server);
            request.ContentType = "application/json; charset=utf-8";
            //request.Credentials = CredentialCache.DefaultCredentials;


            // Get the response
            WebResponse response;
            try
            {
                System.Diagnostics.Debug.WriteLine("Getting data from : " + server);
                response = request.GetResponse();
            }
            catch (WebException e)
            {
                output = null;
                error.result = "Fail";
                error.error = "Error getting data. " + e.Message;
                return error;
            }

            // Read the response
            System.Diagnostics.Debug.WriteLine("HTTP response : " + ((HttpWebResponse)response).StatusDescription);
            Stream dataStream = response.GetResponseStream();
            StreamReader reader = new StreamReader(dataStream);
            JObject responseObject = (JObject)JsonConvert.DeserializeObject(reader.ReadToEnd());

            // Clean up the streams and the response
            reader.Close();
            response.Close();

            output = responseObject;
            return error;
        }

        private JToken formatData (JToken responseObject, out JToken output)
        {
            dynamic error = new JObject();
            error.result = "Success";
            error.error = "";

            JToken array = toArray.Aggregate(responseObject, tryParseNumber);
            if (array == null  || !(array is JArray))
            {
                output = null;
                error.result = "Fail";
                error.error = "Error formatting data. " + "Incorrect path to array";
                return error;
            }

            IEnumerable<JToken> data = array.Select(obj =>
            {
                JToken anObject = toObject.Aggregate(obj, tryParseNumber);
                JObject dataPoint = new JObject();
                if (anObject == null)
                {
                    error.result = "Warning";
                    error.error = "Error formatting data. " + "Incorrect path to object";
                    return dataPoint;
                }

                foreach (var d in toValues.Select((path, i) => new { i, path }))
                {
                    string name = d.path.Count() > 0 ? d.path[d.path.Count() - 1] : "value"; // SI value est null ahhhhhh

                    if (useNames.Count() > d.i && useNames[d.i].Count() > 1 && useNames[d.i][0] != "useKey")
                    {
                        if (useNames[d.i][0] == "useString")
                        {
                            name = useNames[d.i][1];
                        }
                        else if (useNames[d.i][0] == "useObjectField")
                        {
                            name = (string)useNames[d.i].Skip(1).Aggregate(anObject, tryParseNumber) ?? name;
                        }
                    }

                    dataPoint[name] = d.path.Aggregate(anObject, tryParseNumber);
                }

                return (JToken)dataPoint;
            });

            output = new JArray(data);
            return error;
        }

        public string execute (Data data)
        {
            JToken unformattedData, formattedData;

            dynamic error = requestToServer(out unformattedData);

            if (error.result == "Success")
            {
                error = formatData(unformattedData, out formattedData);

                if (formattedData != null)
                {
                    System.Diagnostics.Debug.WriteLine(JsonConvert.SerializeObject(formattedData.ToArray()));
                    data.add(dataId, formattedData);
                }
            }

            return JsonConvert.SerializeObject(error);
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
            return JsonConvert.SerializeObject(this);
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
