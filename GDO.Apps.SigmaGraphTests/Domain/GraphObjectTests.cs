using Microsoft.VisualStudio.TestTools.UnitTesting;
using GDO.Apps.SigmaGraph.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GDO.Apps.SigmaGraph.QuadTree;

namespace GDO.Apps.SigmaGraph.Domain.Tests
{
    [TestClass()]
    public class GraphObjectTests
    {
        /// <summary>
        /// Testing strategy for GraphLink.IsWithin(QuadTreeNode<T> quadTreeNode)
        /// 
        /// Partition quadTreeNode:
        /// quadTreeNode.centroid.xWidth == quadTreeNode.centroid.yWidth
        /// quadTreeNode.centroid.xWidth != quadTreeNode.centroid.yWidth
        /// 
        /// Partition position of link relative to quadrant:
        /// Link is completely within the quadrant
        ///      has one node inside/outside of the quadrant
        ///      has both nodes outside of the quadrant but is in the quadrant
        ///      has both nodes outside of the quadrant and is not in the quadrant
        /// 
        /// Additionally cover cases where link lies directly on  one of the
        /// vertical or horizontal quadrant boundaries
        /// 
        /// Regression Test: Edge going from left to right that is not in the
        ///                     quadrant
        /// </summary>

        private const double EqualWidthsXCentroid = 0.3;
        private const double EqualWidthsYCentroid = 0.7;
        private const double NotEqualWidthsCentroid = 0.5;
        private const double EqualWidthsWidth = 0.314;
        private const double NotEqualWidthsXWidth = 0.1;
        private const double NotEqualWidthYWidth = 0.2;

        private readonly QuadTreeNode<GraphObject> _equalWidths = 
            new QuadTreeNode<GraphObject>(EqualWidthsXCentroid, EqualWidthsYCentroid, EqualWidthsWidth, EqualWidthsWidth);
        private readonly QuadTreeNode<GraphObject> _notEqualWidths = 
            new QuadTreeNode<GraphObject>(NotEqualWidthsCentroid, NotEqualWidthsCentroid, NotEqualWidthsXWidth, NotEqualWidthYWidth);

        // This test covers
        // quadTreeNode.centroid.xWidth == quadTreeNode.centroid.yWidth
        // Link is completely within the quadrant
        [TestMethod()]
        public void IsWithinTestCompletelyWithinQuadrant()
        {
            float xCentroid = (float)EqualWidthsXCentroid;
            float yCentroid = (float)EqualWidthsYCentroid;
            float width = (float)EqualWidthsWidth;
            Position startPos = new Position { X = xCentroid - width / 3, Y = yCentroid - width / 4 };
            Position endPos = new Position { X = xCentroid + width / 4, Y = yCentroid + width / 5};
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsTrue(link.IsWithin(_equalWidths));
        }

        // This test covers
        // quadTreeNode.centroid.xWidth != quadTreeNode.centroid.yWidth
        // Link has one node inside/outside of the quadrant
        // Link lies on vertical quadrant boundary
        [TestMethod()]
        public void IsWithinTestOneVertexInQuadrantAndLiesOnVerticalBoundary()
        {
            float centroid = (float)NotEqualWidthsCentroid;
            float xWidth = (float)NotEqualWidthsXWidth;
            float yWidth = (float)NotEqualWidthYWidth;
            Position startPos = new Position { X = centroid - xWidth / 2, Y = centroid - yWidth / 4 };
            Position endPos = new Position { X = centroid - xWidth / 2, Y = centroid + yWidth * 2 };
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsTrue(link.IsWithin(_notEqualWidths));
        }

        // This test covers
        // quadTreeNode.centroid.xWidth != quadTreeNode.centroid.yWidth
        // Link has one node inside/outside of the quadrant
        // Link lies on horizontal quadrant boundary
        [TestMethod()]
        public void IsWithinTestOneVertexInQuadrantAndLiesOnHorizontalBoundary()
        {
            float centroid = (float)NotEqualWidthsCentroid;
            float xWidth = (float)NotEqualWidthsXWidth;
            float yWidth = (float)NotEqualWidthYWidth;
            Position startPos = new Position { X = centroid + xWidth / 5, Y = centroid + yWidth / 2 };
            Position endPos = new Position { X = centroid - xWidth * 3, Y = centroid + yWidth / 2 };
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsTrue(link.IsWithin(_notEqualWidths));
        }

        // This test covers
        // quadTreeNode.centroid.xWidth != quadTreeNode.centroid.yWidth
        // Link has both nodes outside of the quadrant but is in the quadrant
        [TestMethod()]
        public void IsWithinTestNoVertexInQuadrantButLinkInQuadrant()
        {
            float centroid = (float)NotEqualWidthsCentroid;
            float xWidth = (float)NotEqualWidthsXWidth;
            float yWidth = (float)NotEqualWidthYWidth;
            Position startPos = new Position { X = centroid , Y = centroid - yWidth / (float)1.5 };
            Position endPos = new Position { X = centroid + xWidth / (float)1.5, Y = centroid };
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsTrue(link.IsWithin(_notEqualWidths));
        }

        // This test covers
        // quadTreeNode.centroid.xWidth != quadTreeNode.centroid.yWidth
        // Link has both nodes outside of the quadrant and is not in the quadrant
        [TestMethod()]
        public void IsWithinTestNoVertexInQuadrantAndLinkNotInQuadrant()
        {
            float centroid = (float)NotEqualWidthsCentroid;
            float xWidth = (float)NotEqualWidthsXWidth;
            float yWidth = (float)NotEqualWidthYWidth;
            Position startPos = new Position { X = centroid, Y = centroid - yWidth / (float)0.5 };
            Position endPos = new Position { X = centroid + xWidth / (float)0.5, Y = centroid };
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsFalse(link.IsWithin(_notEqualWidths));
        }

        // This test covers
        // Regression Test: Edge going from right to left that is not in the
        //                     quadrant
        [TestMethod()]
        public void IsWithinTestEdgeLeftToRightNotInQuadrant()
        {
            float centroid = (float)NotEqualWidthsCentroid;
            float xWidth = (float)NotEqualWidthsXWidth;
            float yWidth = (float)NotEqualWidthYWidth;
            Position startPos = new Position { X = centroid, Y = centroid - yWidth / (float)0.5 };
            Position endPos = new Position { X = centroid - xWidth / (float)0.5, Y = centroid };
            GraphLink link = new GraphLink { StartPos = startPos, EndPos = endPos };

            Assert.IsFalse(link.IsWithin(_notEqualWidths));
        }
    }
}