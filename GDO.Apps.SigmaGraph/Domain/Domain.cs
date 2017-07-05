using System.Collections.Concurrent;
using System.Collections.Generic;
using GDO.Apps.SigmaGraph.QuadTree;

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

    public class PartitionPos
    {
        public int Row { get; set; }
        public int Col { get; set; }
    }

    public class RectDimension
    {
        public float Width { get; set; }
        public float Height { get; set; }
    }

    public class Scales
    {
        public float X { get; set; }
        public float Y { get; set; }
    }

    public abstract class GraphObject : IQuadable<double> {
        public abstract bool IsWithin<T>(QuadTreeNode<T> q) where T : IQuadable<double>;
    }

    public class GraphNode : GraphObject {
        public string ID { get; set; }
        public Position Pos { get; set; }
        public string Label { get; set; }
        public float Size { get; set; }
        public int R { get; set; }
        public int G { get; set; }
        public int B { get; set; }
        public Dictionary<string, string> Attrs { get; set; }
        public int NumLinks { get; set; }
        public List<string> Adj { get; set; }  // adj = list of connectedNodes
        public override bool IsWithin<T>(QuadTreeNode<T> q) {
            throw new System.NotImplementedException();
        }
    }

    public class GraphLink : GraphObject {
        public string Source { get; set; }
        public string Target { get; set; }
        public Position StartPos { get; set; }
        public Position EndPos { get; set; }
        public float Weight { get; set; }
        public int R { get; set; }
        public int G { get; set; }
        public int B { get; set; }
        public Dictionary<string, string> Attrs { get; set; }

        public override string ToString() {
            return "Link = S:"+Source+" T:"+Target+ " | "+ StartPos+" to "+EndPos;
        }

        public override bool IsWithin<T>(QuadTreeNode<T> q) {
            throw new System.NotImplementedException();
        }
    }

    public class Partition
    {// TODO there is a good argument that the parallel bersions of the lists should be used
        public PartitionPos partitionPos { get; set; }
        public ConcurrentBag<GraphNode> Nodes { get; set; }
        public ConcurrentBag<GraphLink> Links { get; set; }
    }

}