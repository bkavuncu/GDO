using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Xml;
using System.Xml.Linq;
using GDO.Apps.Graph.Domain;
using Newtonsoft.Json;

namespace GDO.Apps.Graph
{
    public static class GraphDataReader
    {
        public static void  ReadGraphMLData(Stopwatch sw, string graphmlfile, out List<GraphLink> links, out List<GraphNode> nodes, out RectDimension dimension)
        {
            XDocument doc = XDocument.Load(XmlReader.Create(graphmlfile));
            XNamespace ns = @"http://graphml.graphdrawing.org/xmlns";

            var keys = doc.Root.Elements(ns + "key").Select(k =>
                new
                {
                    id = k.Attribute("id").Value,
                    name = k.Attribute("attr.name").Value,
                    type = k.Attribute("attr.type").Value,
                    node = k.Attribute("for").Value =="node",
                }).ToList();

            var nodekeys = keys.Where(k => k.node).ToList();
            bool hasLabel = nodekeys.Any(k => k.name == "label");
            bool hasSize = nodekeys.Any(k => k.name == "size");
            bool hasR = nodekeys.Any(k => k.name == "r");
            bool hasG = nodekeys.Any(k => k.name == "g");
            bool hasB = nodekeys.Any(k => k.name == "b");
            bool hasX = nodekeys.Any(k => k.name == "x");
            bool hasY = nodekeys.Any(k => k.name == "y");
            
            
            bool hascolour = hasR && hasG && hasB;
            bool hasposition = hasX && hasY; // throw exception / log


            var edgekeys = keys.Where(k => !k.node).ToList();
            bool hasEdgeLabel = edgekeys.Any(k => k.name == "Edge Label");
            bool hasWeight = edgekeys.Any(k => k.name == "weight");
            bool hasEdgeId = edgekeys.Any(k => k.name == "Edge Id");


            var graphelem = doc.Root.Element(ns + "graph");

            nodes = graphelem.Elements(ns + "node").Select(xn =>
                new
                {
                    id = xn.Attribute("id").Value,
                    data = xn.Elements(ns + "data").ToDictionary(
                        xdata => xdata.Attribute("key").Value,
                        xdata => xdata.Value)
                }).Select(n =>
                    new GraphNode()
                    {
                        ID = n.id,
                        Label = hasLabel? n.data["label"] : n.id,
                        Pos = new Position()
                        {
                            X = float.Parse(n.data["x"]),
                            Y = float.Parse(n.data["y"]),
                        },
                        R = hascolour ? int.Parse(n.data["r"]) : 0,
                        G = hascolour ? int.Parse(n.data["g"]) : 0,
                        B = hascolour ? int.Parse(n.data["b"]) : 0,
                        Size = hasSize ? float.Parse(n.data["size"]) : 1,
                        Adj = new List<string>(),
                        NumLinks = 0
                    })
                .ToList();

            var nodesbyID = nodes.ToDictionary(n => n.ID, n => n);

            #region rescale nodes

            float minX = nodes.Min(n => n.Pos.X);
            float minY = nodes.Min(n => n.Pos.Y);
            float maxX = nodes.Max(n => n.Pos.X);
            float maxY = nodes.Max(n => n.Pos.Y);

            dimension = new RectDimension()
            {
                Width = maxX-minX,
                Height = maxY-minY
            };


            var xscale = 1/ dimension.Width;
            var yscale = 1 / dimension.Height;

            foreach (var node in nodes)
            {
                node.Pos.X = (node.Pos.X - minX)*xscale;
                node.Pos.Y = (node.Pos.Y - minY)*yscale;
            }

            dimension = new RectDimension()
            {
                Width = 1,
                Height = 1
            };
            

            #endregion 

            links = graphelem.Elements(ns + "edge").Select(xn =>
            new
            {
                source = xn.Attribute("source").Value,
                target = xn.Attribute("target").Value,
                data = xn.Elements(ns + "data").ToDictionary(
                        xdata => xdata.Attribute("key").Value,
                        xdata => xdata.Value)
            }).Select(l =>
            new GraphLink()
            {
                Source = l.source,
                Target = l.target,
                Weight = hasWeight ? float.Parse( l.data["weight"]) :1,
                StartPos = nodesbyID[l.source].Pos,
                EndPos = nodesbyID[l.target].Pos
            }).ToList();

            Console.WriteLine(keys.Count());
        }

    }
}