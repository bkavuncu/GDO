using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
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
}