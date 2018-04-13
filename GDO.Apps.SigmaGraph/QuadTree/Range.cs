// This code was written by Senaka Fernando
//

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Apps.SigmaGraph.QuadTree
{
    /// <summary>
    /// A class to keep track of the global min/max of a data range.
    /// </summary>
    public class Range
    {
        private struct Node
        {
            public double min;
            public double max;
        }

        private const int MINIMUM_NODE_COUNT = 10;

        // find out whether this really needs to be static and if not, simply make it
        // non-static as well.
        private static Dictionary<int, Node> MinMax = new Dictionary<int, Node>();

        public void SetNodeMinMax(int nodeId, double min, double max)
        {
            MinMax[nodeId] = new Node() { min = min, max = max };
        }

        public double GetGlobalMin()
        {
            if (MinMax.Keys.Count < MINIMUM_NODE_COUNT)
            {
                return double.NaN;
            }
            return MinMax.Aggregate((x, y) => x.Value.min < y.Value.min ? x : y).Value.min;
        }

        public double GetGlobalMax()
        {
            if (MinMax.Keys.Count < MINIMUM_NODE_COUNT)
            {
                return double.NaN;
            }
            return MinMax.Aggregate((x, y) => x.Value.max > y.Value.max ? x : y).Value.max;
        }

        public void ResetMinMax()
        {
            MinMax.Clear();
        }
    }
}