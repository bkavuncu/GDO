using System;
using GDO.Apps.SigmaGraph.QuadTree;
using System.Collections.Generic;

namespace GDO.Apps.SigmaGraph.Domain
{
    public class GraphInfo
    {
        public List<string> NodeMandatoryFields { get; set; }
        public List<string> NodeOtherFields { get; set; }
        public List<string> LinkKeys { get; set; }
        public List<GraphNode> Nodes = new List<GraphNode>();
        public List<GraphLink> Links = new List<GraphLink>();
        public RectDimension RectDim;
    }

    public class Position
    {
        public float X { get; set; }
        public float Y { get; set; }

        public override string ToString() {
            return X+":"+Y;
        }
    }

    public class RectDimension
    {
        public float Width { get; set; }
        public float Height { get; set; }
    }

    public abstract class GraphObject : IQuadable<double> {
        /// <summary>
        /// Checks if this graph object is contained in the region
        /// represented by the quadtree node.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="q"></param>
        /// <returns></returns>
        public abstract bool IsWithin<T>(QuadTreeNode<T> q) where T : IQuadable<double>;
    }

    public class GraphNode : GraphObject, IEquatable<GraphNode> {
        #region equality
        public bool Equals(GraphNode other) {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return string.Equals(ID, other.ID);
        }

        public override bool Equals(object obj) {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((GraphNode) obj);
        }

        public override int GetHashCode() {
            return (ID != null ? ID.GetHashCode() : 0);
        }

        public static bool operator ==(GraphNode left, GraphNode right) {
            return Equals(left, right);
        }

        public static bool operator !=(GraphNode left, GraphNode right) {
            return !Equals(left, right);
        }

        #endregion

        public string ID { get; set; }
        public Position Pos { get; set; }
        public string Label { get; set; }
        public float Size { get; set; }
        public int R { get; set; }
        public int G { get; set; }
        public int B { get; set; }
        public Dictionary<string, string> Attrs { get; set; }
        public int NumLinks { get; set; }
        public List<string> Adj { get; set; }

        public override bool IsWithin<T>(QuadTreeNode<T> quadTreeNode)
        {
            double xCentroid = quadTreeNode.Centroid.xCentroid;
            double yCentroid = quadTreeNode.Centroid.yCentroid;
            double xWidth = quadTreeNode.Centroid.xWidth/2.0;
            double yWidth = quadTreeNode.Centroid.yWidth/2.0;

            double minX = xCentroid - xWidth;
            double maxX = xCentroid + xWidth;
            double minY = yCentroid - yWidth;
            double maxY = yCentroid + yWidth;
            return Pos.X >= minX && Pos.X <= maxX 
                && Pos.Y >= minY && Pos.Y <= maxY;
        }
    }

    public class GraphLink : GraphObject, IEquatable<GraphLink> {
        #region equality

        public bool Equals(GraphLink other) {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return string.Equals(Source, other.Source) && string.Equals(Target, other.Target);
        }

        public override bool Equals(object obj) {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((GraphLink) obj);
        }

        public override int GetHashCode() {
            unchecked {
                return ((Source != null ? Source.GetHashCode() : 0) * 397) ^ (Target != null ? Target.GetHashCode() : 0);
            }
        }

        public static bool operator ==(GraphLink left, GraphLink right) {
            return Equals(left, right);
        }

        public static bool operator !=(GraphLink left, GraphLink right) {
            return !Equals(left, right);
        }

        #endregion

        public string Source { get; set; }
        public string Target { get; set; }
        public Position StartPos { get; set; }
        public Position EndPos { get; set; }
        public float Weight { get; set; }
        public int R { get; set; }
        public int G { get; set; }
        public int B { get; set; }
        public Dictionary<string, string> Attrs { get; set; }
        private const double Epsilon = 1E-6;

        public override bool IsWithin<T>(QuadTreeNode<T> quadTreeNode)
        {
            double xCentroid = quadTreeNode.Centroid.xCentroid;
            double yCentroid = quadTreeNode.Centroid.yCentroid;
            double xWidth = quadTreeNode.Centroid.xWidth/2.0;
            double yWidth = quadTreeNode.Centroid.yWidth/2.0;

            double minX = xCentroid - xWidth;
            double maxX = xCentroid + xWidth;
            double minY = yCentroid - yWidth;
            double maxY = yCentroid + yWidth;

            bool quadContainsWholeLink = StartPos.X >= minX && EndPos.X >= minX
                                      && StartPos.X <= maxX && EndPos.X <= maxX
                                      && StartPos.Y >= minY && EndPos.Y >= minY
                                      && StartPos.Y <= maxY && EndPos.Y <= maxY;

            return quadContainsWholeLink
                   || IntersectsHorizontalSegment(maxY, minX, maxX)
                   || IntersectsHorizontalSegment(minY, minX, maxX)
                   || IntersectsVerticalSegment(minX, minY, maxY)
                   || IntersectsVerticalSegment(maxX, minY, maxY);
        }

        /// <summary>
        /// Determines whether or not this link intersects the horizontal
        /// line segment between (y, minX) and (y, maxX).
        /// </summary>
        /// <param name="y"></param>
        /// <param name="minX"></param>
        /// <param name="maxX"></param>
        /// <returns></returns> true if they intersect and false otherwise
        private bool IntersectsHorizontalSegment(double y, double minX, double maxX)
        {
            if (y < Math.Min(StartPos.Y, EndPos.Y) || y > Math.Max(StartPos.Y, EndPos.Y)) {
                return false;
            }
            if (Math.Abs(EndPos.Y - StartPos.Y) <= Epsilon) {
                return Math.Abs(StartPos.Y - y) <= Epsilon || Math.Abs(EndPos.Y - y) <= Epsilon;
            }
            // The lines intersect at (x = 1/m (y-y_o) + x_0, y = y)
            double reciprocalSlope = (EndPos.X - StartPos.X) / (EndPos.Y - StartPos.Y);
            double xIntersect = reciprocalSlope * (y - StartPos.Y) + StartPos.X;
            return xIntersect >= minX && xIntersect <= maxX;
        }

        /// <summary>
        /// Determines whether or not this link intersects the vertical
        /// line segment between (x, minY) and (x, maxY).
        /// </summary>
        /// <param name="x"></param>
        /// <param name="minY"></param>
        /// <param name="maxY"></param>
        /// <returns></returns> true if they intersect or if and false otherwise
        private bool IntersectsVerticalSegment(double x, double minY, double maxY)
        {
            if (x < Math.Min(StartPos.X, EndPos.X) || x > Math.Max(StartPos.X, EndPos.X)) {
                return false;
            }
            if (Math.Abs(EndPos.X - StartPos.X) <= Epsilon) {
                return Math.Abs(StartPos.X - x) <= Epsilon || Math.Abs(EndPos.X - x) <= Epsilon;
            }
            // The lines intersect at (x = x, y = m(x-x_0) + y_0)
            double slope = (EndPos.Y - StartPos.Y) / (EndPos.X - StartPos.X);
            double yIntersect = slope * (x - StartPos.X) + StartPos.Y;
            return yIntersect >= minY && yIntersect <= maxY;
        }

        public override string ToString() {
            return "Link = S:"+Source+" T:"+Target+ " | "+ StartPos+" to "+EndPos;
        }
    }
}