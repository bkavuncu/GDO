using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
    public class BarDataRequest : DataRequest
    {
        //Ordering key of the bars
        public string[] orderingKey { get; set; }

        //Define if the bar must be in the request
        protected Func<JToken, bool> isIn;

        //Retrieve which data can be parsed to double
        protected Func<string[], Func<JToken, dynamic>> tryParseNumber = s =>
        {
            return d =>
            {
                double number;
                JToken val = s.Aggregate(d, tryAggregateNumber);
                return double.TryParse(val.ToString(), out number) ? number : val;
            };
        };

        //Retrieve the order of the data
        protected readonly Func<JToken, int, JToken> addOrderProperty = (d, i) => {
            d["order"] = i;
            return d;
        };

        //Constructor for the class. Define ordering and if the data must be included
        public BarDataRequest(string dataId, string dataName, dynamic limit, string[] orderingKey, string[][] _keys) : base (dataId, dataName, (object)limit, _keys)
        {
            this.orderingKey = orderingKey;
            //main differentiation with other request class
            isIn = d => (d["order"] >= limit.min && d["order"] < limit.max);
        }

        //What to do when the request is executed. Filter and order the data and send it back
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