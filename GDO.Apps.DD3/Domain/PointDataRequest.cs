using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
    public class PointDataRequest : DataRequest
    {
        // list of x key that are requested
        public string[] xKey { get; set; }
        // list of y key that are requested
        public string[] yKey { get; set; }
        //Function which says whether the datapoint is in the zone or not
        protected Func<JToken, bool> isIn;

        //Initialize the pointdatarequest and the in function
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

        //What to do upon execution: retrieve the data, filter the data and send it back
        public string executeWith(JToken dataIn)
        {
            var data = dataIn.ToObject<IEnumerable<JToken>>();

            IEnumerable<JToken> filteredData = data.Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }
}