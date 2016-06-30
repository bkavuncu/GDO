using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
    /// <summary>
    /// DD3Q - why does this exist? why data and display mixed together? 
    /// Answer: this is a filtering mecanism
    /// </summary>
    /// <seealso cref="GDO.Apps.DD3.Domain.PointDataRequest" />
    public class PathDataRequest : PointDataRequest
    {
        // Approximate the filter to ease the compute. Optionnal and never used
        public int approximation { get; set; }
        //Clamp the data between min and max
        protected Func<int, int, int, int> clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
        //Function which returns whether or not the point is in the path. Should be used in priority.
        protected Func<JToken, JToken, bool> intersectLimit;
        //Function which returns whether or not the point intersect the X (xmin, ymin, ymax), (xmax, ymin, ymax)  
        protected Func<JToken, JToken, double, double, double, bool> intersectX;
        //Function which returns whether or not the point intersect the Y (ymin, xmin, xmax), (ymax, xmin, xmax)
        protected Func<JToken, JToken, double, double, double, bool> intersectY;

        //Constructor: initialize the intersection functions
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

            intersectLimit = (p1, p2) => intersectX(p1, p2, (double)limit.xmin, (double)limit.ymin, (double)limit.ymax)
                                         || intersectX(p1, p2, (double)limit.xmax, (double)limit.ymin, (double)limit.ymax)
                                         || intersectY(p1, p2, (double)limit.ymin, (double)limit.xmin, (double)limit.xmax)
                                         || intersectY(p1, p2, (double)limit.ymax, (double)limit.xmin, (double)limit.xmax);
        }

        // what to do upon this request: filter the data, approximate if necessary and send the response
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
}