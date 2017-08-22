using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Xml;
using System.Xml.Linq;

namespace GDO.Apps.SigmaGraph.Domain
{
    public static class GraphDataReader
    {
        /// <summary>
        /// Reads the graphml XML file into c# classes we can work with
        /// </summary>
        /// <param name="graphmlfile">The graphmlfile.</param>
        /// <returns></returns>
        public static GraphInfo ReadGraphMLData(string graphmlfile) {
            GraphInfo graphinfo;
            Stopwatch sw = new Stopwatch();
            sw.Start();
            using (var xreader = XmlReader.Create(graphmlfile))
            {
                XDocument doc = XDocument.Load(xreader);
                XNamespace ns = @"http://graphml.graphdrawing.org/xmlns";

                var keys = doc.Root.Elements(ns + "key").Select(k =>
                    new
                    {
                        id = k.Attribute("id").Value,
                        name = k.Attribute("attr.name").Value,
                        type = k.Attribute("attr.type").Value,
                        appliesTo = k.Attribute("for").Value,
                    }).ToList();

                var nodekeys = keys.Where(k => k.appliesTo == "node").ToList();
                bool hasLabel = nodekeys.Any(k => k.name == "label");
                bool hasSize = nodekeys.Any(k => k.name == "size");
                bool nodeHasR = nodekeys.Any(k => k.name == "r");
                bool nodeHasG = nodekeys.Any(k => k.name == "g");
                bool nodeHasB = nodekeys.Any(k => k.name == "b");
                bool hasX = nodekeys.Any(k => k.name == "x");
                bool hasY = nodekeys.Any(k => k.name == "y");

                bool nodeHascolour = nodeHasR && nodeHasG && nodeHasB;
                bool nodehasposition = hasX && hasY;    //TODO throw exception / log

                var edgekeys = keys.Where(k => k.appliesTo == "edge").ToList();
                bool edgeHasWeight = edgekeys.Any(k => k.name == "weight");
                bool edgeHasR = edgekeys.Any(k => k.name == "r");
                bool edgeHasG = edgekeys.Any(k => k.name == "g");
                bool edgeHasB = edgekeys.Any(k => k.name == "b");
                bool edgeHascolour = edgeHasR && edgeHasG && edgeHasB;


                var graphelem = doc.Root.Element(ns + "graph");

                // default sizes for nodes and links
                float DEFAULT_NODESIZE = 1;
                float DEFAULT_LINKWIDTH = 1;
                var DEFAULT_NODE_COLOR = new { r=0, g=0, b=0};
                var DEFAULT_EDGE_COLOR = new { r=0, g=0, b=0 };

                #region fill Nodes data structure

                var mandatoryNodeKeys = new[] {"x", "y", "r", "g", "b", "size"};

                graphinfo = new GraphInfo()
                {
                    NodeMandatoryFields = nodekeys.Where(f => mandatoryNodeKeys.Contains(f.name)).Select(a => a.name).ToList(),
                    NodeOtherFields = nodekeys.Where(f => !mandatoryNodeKeys.Contains(f.name)).Select(a => a.name).ToList(),
                    LinkKeys = edgekeys.Select(f => f.name).ToList()
                };

                graphinfo.Nodes = graphelem.Elements(ns + "node").Select(xn =>
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
                            Attrs = n.data.Where(a => !mandatoryNodeKeys.Contains(a.Key))
                                    .ToDictionary(a => a.Key, a => a.Value),
                            // remove attrs that have their own field (R,G,B, size)
                            Label = hasLabel && n.data.ContainsKey("label") ? n.data["label"] : "",
                            // leave labels blank
                            Pos = new Position()
                            {
                                X = float.Parse(n.data["x"]),
                                Y = float.Parse(n.data["y"]),
                            },
                            R = nodeHascolour ? int.Parse(n.data["r"]) : DEFAULT_NODE_COLOR.r,
                            G = nodeHascolour ? int.Parse(n.data["g"]) : DEFAULT_NODE_COLOR.g,
                            B = nodeHascolour ? int.Parse(n.data["b"]) : DEFAULT_NODE_COLOR.b,
                            Size = hasSize ? float.Parse(n.data["size"]) : DEFAULT_NODESIZE,
                            Adj = new List<string>(),
                            NumLinks = 0
                        })
                    .ToList();

                var nodesbyID = graphinfo.Nodes.ToDictionary(n => n.ID, n => n);

                #endregion

                #region rescale nodes

                float minX = graphinfo.Nodes.Min(n => n.Pos.X);
                float minY = graphinfo.Nodes.Min(n => n.Pos.Y);
                float maxX = graphinfo.Nodes.Max(n => n.Pos.X);
                float maxY = graphinfo.Nodes.Max(n => n.Pos.Y);

                graphinfo.RectDim = new RectDimension()
                {
                    Width = maxX - minX,
                    Height = maxY - minY
                };

                // Min-Max normalize X and Y; do not preserve aspect ratio
                //var xscale = 1 / graphinfo.RectDim.Width;
                //var yscale = 1 / graphinfo.RectDim.Height;

                //foreach (var node in graphinfo.Nodes)
                //{
                //    node.Pos.X = (node.Pos.X - minX) * xscale;
                //    node.Pos.Y = (node.Pos.Y - minY) * yscale;
                //}

                // Scale X and Y differently; preserve aspect ratio
                //float xScale;
                //float yScale;
                //var xToYRatio = graphinfo.RectDim.Width / graphinfo.RectDim.Height;
                //if (xToYRatio <= 1)
                //{
                //    xScale = xToYRatio * (1 / graphinfo.RectDim.Width);
                //    yScale = 1 / graphinfo.RectDim.Height;
                //}
                //else
                //{
                //    xScale = 1 / graphinfo.RectDim.Width;
                //    yScale = (1 / xToYRatio) * (1 / graphinfo.RectDim.Height);
                //}

                float xScale = 1 / graphinfo.RectDim.Width;
                float yScale = 1 / graphinfo.RectDim.Height;

                foreach (var node in graphinfo.Nodes)
                {
                    node.Pos.X = (node.Pos.X - minX) * xScale + (1 - xScale * graphinfo.RectDim.Width) / 2;
                    // Assuming exported from gephi with increasing Y being up
                    node.Pos.Y = 1 - ((node.Pos.Y - minY) * yScale + (1 - yScale * graphinfo.RectDim.Height) / 2);
                }

                graphinfo.RectDim = new RectDimension()
                {
                    Width = 1,
                    Height = 1
                };
                #endregion

                #region fill Links data structure 

                graphinfo.Links = graphelem.Elements(ns + "edge").Select(xn =>
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
                            Attrs = l.data,
                            Weight = edgeHasWeight ? float.Parse(l.data["weight"]) : DEFAULT_LINKWIDTH,
                            R = edgeHascolour ? int.Parse(l.data["r"]) : DEFAULT_EDGE_COLOR.r,
                            G = edgeHascolour ? int.Parse(l.data["g"]) : DEFAULT_EDGE_COLOR.g,
                            B = edgeHascolour ? int.Parse(l.data["b"]) : DEFAULT_EDGE_COLOR.b,
                            StartPos = nodesbyID[l.source].Pos,
                            EndPos = nodesbyID[l.target].Pos
                        }).ToList();

                #endregion

                Console.WriteLine(keys.Count);
            }

            sw.Stop();
            Debug.WriteLine("Time to read the Graphml file: " + sw.ElapsedMilliseconds + "ms");
            SigmaGraphAppHub.Self.LogTime("Time to read the Graphml file: " + sw.ElapsedMilliseconds + "ms");

            return graphinfo;
        }
    }
}