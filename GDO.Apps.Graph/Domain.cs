using System.Collections.Generic;

namespace GDO.Apps.Graph.Domain
{
    public class GraphInfo
    {
        public List<string> NodeMandatoryFields { get; set; }
        public List<string> NodeOtherFields { get; set; }
        public List<string> LinkKeys { get; set; }
    }
    public class Position
    {
        public float X { get; set; }
        public float Y { get; set; }
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

    public class GraphNode
    {
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
    }

    public class GraphLink
    {
        public string Source { get; set; }
        public string Target { get; set; }
        public Position StartPos { get; set; }
        public Position EndPos { get; set; }
        public float Weight { get; set; }
        public int R { get; set; }
        public int G { get; set; }
        public int B { get; set; }
        public Dictionary<string, string> Attrs { get; set; }
    }

    public class Partition
    {// TODO there is a good argument that the parallel bersions of the lists should be used
        public PartitionPos partitionPos { get; set; }
        public List<GraphNode> Nodes { get; set; }
        public List<GraphLink> Links { get; set; }
    }

}