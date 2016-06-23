using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
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
        protected readonly Func<JToken, int, JToken> addOrderProperty = (d, i) => {
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

            var orderedData = orderingKey != null ? data.OrderBy(tryParseNumber(orderingKey)) : data;

            IEnumerable<JToken> filteredData = orderedData.Select(addOrderProperty).Where(isIn);

            IEnumerable<JToken> responseData = createResponseObject(filteredData);

            return JsonConvert.SerializeObject(responseData.ToArray());
        }
        
    }
}