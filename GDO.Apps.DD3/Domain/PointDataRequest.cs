using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
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
}