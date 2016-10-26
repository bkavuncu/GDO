using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Xml;
using System.Xml.Linq;
using VDS.RDF;
using VDS.RDF.Query;

namespace GDO.Apps.Graph
{
    public static class GraphDataReader
    {
        public static void ReadGraphMLData(string graphmlfile, out GraphInfo graphinfo, out List<GraphLink> links,
            out List<GraphNode> nodes, out RectDimension dimension)
        {
            Stopwatch sw = new Stopwatch();
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
                var DEFAULT_EDGE_COLOR = new { r=184, g=184, b=184 };

                #region fill Nodes data structure

                var mandatoryNodeKeys = new[] {"x", "y", "r", "g", "b", "size"};

                graphinfo = new GraphInfo()
                {
                    NodeMandatoryFields = nodekeys.Where(f => mandatoryNodeKeys.Contains(f.name)).Select(a => a.name).ToList(),
                    NodeOtherFields = nodekeys.Where(f => !mandatoryNodeKeys.Contains(f.name)).Select(a => a.name).ToList(),
                    LinkKeys = edgekeys.Select(f => f.name).ToList()
                };

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

                var nodesbyID = nodes.ToDictionary(n => n.ID, n => n);

                #endregion

                #region rescale nodes

                float minX = nodes.Min(n => n.Pos.X);
                float minY = nodes.Min(n => n.Pos.Y);
                float maxX = nodes.Max(n => n.Pos.X);
                float maxY = nodes.Max(n => n.Pos.Y);

                dimension = new RectDimension()
                {
                    Width = maxX - minX,
                    Height = maxY - minY
                };

                var xscale = 1/dimension.Width;
                var yscale = 1/dimension.Height;

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

                #region fill Links data structure 

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
            GraphAppHub.self.LogTime("Time to read the Graphml file: " + sw.ElapsedMilliseconds + "ms");
        }




        public static void ReadDatabase(out GraphInfo graphinfo, out List<GraphLink> links,
            out List<GraphNode> nodes, out RectDimension dimension)
        {
            string NODE_CLASS_URI = "http://www.imperial.ac.uk/dsi/graphdl#Node";
            string EDGE_CLASS_URI = "http://www.imperial.ac.uk/dsi/graphdl#Edge";
            string RDF_TYPE_URI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
            string LABEL_PROPERTY_URI = "http://www.imperial.ac.uk/dsi/graphdl#id";
            string SOURCE_PROPERTY_URI = "http://www.imperial.ac.uk/dsi/graphdl#source";
            string TARGET_PROPERTY_URI = "http://www.imperial.ac.uk/dsi/graphdl#target";
            // default sizes for nodes and links
            float DEFAULT_NODESIZE = 5;
            float DEFAULT_LINKWIDTH = 1;
            var DEFAULT_NODE_COLOR = new { r = 0, g = 0, b = 0 };
            var DEFAULT_EDGE_COLOR = new { r = 184, g = 184, b = 184 };


            string connection = "http://ugritlab.ugr.es:9999/blazegraph/namespace/drugbank/sparql";
            string query = @"prefix graphdl: <http://www.imperial.ac.uk/dsi/graphdl#>
construct {
?d1 a graphdl:Node;
            rdfs:label ?d1_name;
            graphdl:id ?d1_label .
?d2 a graphdl:Node;
            rdfs:label ?d2_name;
            graphdl:id ?d2_label .
 
?i a graphdl:Edge;
            rdfs:label ?i_name;
            graphdl:id ?i_label;
            graphdl:source ?d1;
            graphdl:target ?d2 .
}
        where {
 ?i a <http://bio2rdf.org/drugbank_vocabulary:Drug-Drug-Interaction> .
 ?d1 <http://bio2rdf.org/drugbank_vocabulary:ddi-interactor-in> ?i ; rdfs:label ?d1_label .
 ?d2 <http://bio2rdf.org/drugbank_vocabulary:ddi-interactor-in> ?i ; rdfs:label ?d2_label .
 filter(str(?d1) != str(?d2)) ." +
 "bind(strbefore(?d1_label, \" [\") AS ?d1_name) ." +
 "bind(strbefore(?d2_label, \" [\") AS ?d2_name) ." +
 "bind(str(?i) AS ?i_label) ." +
 "bind(strafter(?i, \"drugbank:\") AS ?i_name) ." +
"}";


            SparqlRemoteEndpoint endpoint = new SparqlRemoteEndpoint(new Uri(connection));

            //Make a SELECT query against the Endpoint
            //SparqlResultSet results = endpoint.QueryWithResultSet(query);
            IGraph graph = endpoint.QueryWithResultGraph(query);

            Random random = new Random();

            nodes =
                graph.Triples.Where(
                    t => t.Predicate.ToString() == RDF_TYPE_URI && t.Object.ToString() == NODE_CLASS_URI)
                    .Select(n =>
                    new GraphNode()
                    {
                        ID = n.Subject.ToString(),
                        Attrs = null,
                        // remove attrs that have their own field (R,G,B, size)
                        Label = graph.Triples.Where(
                            r => r.Subject.ToString() == n.Subject.ToString() && r.Predicate.ToString() == LABEL_PROPERTY_URI)
                        .Select(b => b.Object).First().ToString(),
                        // leave labels blank
                        Pos = new Position()
                        {
                            X = random.Next(0, 100), // float.Parse("100"),
                            Y = random.Next(0, 100), // float.Parse("50"),
                        },
                        R = DEFAULT_NODE_COLOR.r,
                        G = DEFAULT_NODE_COLOR.g,
                        B = DEFAULT_NODE_COLOR.b,
                        Size = DEFAULT_NODESIZE,
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
                Width = maxX - minX,
                Height = maxY - minY
            };

            var xscale = 1 / dimension.Width;
            var yscale = 1 / dimension.Height;

            foreach (var node in nodes)
            {
                node.Pos.X = (node.Pos.X - minX) * xscale;
                node.Pos.Y = (node.Pos.Y - minY) * yscale;
            }

            dimension = new RectDimension()
            {
                Width = 1,
                Height = 1
            };
            #endregion

            //Nodes.ForEach(n => Debug.WriteLine(n.ID + " - " + n.Label));


            links =
                graph.Triples.Where(
                    t => t.Predicate.ToString() == RDF_TYPE_URI && t.Object.ToString() == EDGE_CLASS_URI)
                    .Select(l => new
                    {
                        source = graph.Triples.Where(
                            r => r.Subject.ToString() == l.Subject.ToString() && r.Predicate.ToString() == SOURCE_PROPERTY_URI)
                        .Select(b => b.Object).First().ToString(),
                        target = graph.Triples.Where(
                            r => r.Subject.ToString() == l.Subject.ToString() && r.Predicate.ToString() == TARGET_PROPERTY_URI)
                        .Select(b => b.Object).First().ToString()
                    }).Select(e =>
                    new GraphLink()
                    {
                        Source = e.source,
                        Target = e.target,
                        Attrs = null,
                        Weight = DEFAULT_LINKWIDTH,
                        R = DEFAULT_EDGE_COLOR.r,
                        G = DEFAULT_EDGE_COLOR.g,
                        B = DEFAULT_EDGE_COLOR.b,
                        StartPos = nodesbyID[e.source].Pos,
                        EndPos = nodesbyID[e.target].Pos
                    }).ToList();



            graphinfo = new GraphInfo()
            {
                NodeMandatoryFields = new List<string>(),
                NodeOtherFields = new List<string>(),
                LinkKeys = new List<string>()
            };

        }
    }
}