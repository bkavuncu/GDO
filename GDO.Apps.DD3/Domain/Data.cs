using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
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
            var newdimensions = new JObject();
            Func<JToken, JToken> tryParseNumber = d =>
            {
                double number;
                return Double.TryParse(d.ToString(), out number) ? number : d;
            };

            foreach (var p in (JObject)(dataSet[0]))
            {
                newdimensions[p.Key] = new JObject {
                    ["min"] = dataSet.ToObject<IEnumerable<JToken>>().Min(c => tryParseNumber(c[p.Key])),
                    ["max"] = dataSet.ToObject<IEnumerable<JToken>>().Max(c => tryParseNumber(c[p.Key]))
                };
            }

            newdimensions["length"] = dataSet.Count();
            this.dimensions.Add(dataId, newdimensions);
        }

    }
}