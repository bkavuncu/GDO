using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class GraphMlUtilities {
        /// <summary>
        /// Creates some GraphML
        /// </summary>
        /// <param name="nodes">The nodes. (id, name)</param>
        /// <param name="edges">The arcs. id > id </param>
        /// <param name="fileName">Name of the file  to generate</param>
        public static void SaveGraph(Dictionary<string, GraphNode> nodes, List<GraphLink> edges, string fileName) {
            XNamespace xn = "http://graphml.graphdrawing.org/xmlns";
            XDocument xDoc = new XDocument(new XDeclaration("1.0", "utf-8", "yes"));

            // create gml file           
            XElement graphfile = new XElement(xn + "graphml");
            xDoc.Add(graphfile);

            #region write the metadata 

            //<key attr.name="weight" attr.type="double" for="edge" id="weight" />
            var key = new XElement(xn + "key");
            key.Add(new XAttribute("attr.name", "weight"));
            key.Add(new XAttribute("attr.type", "double"));
            key.Add(new XAttribute("for", "edge"));
            key.Add(new XAttribute("id", "weight"));
            graphfile.Add(key);

            //nodes
            var firstNodeMetaFields = nodes.First().Value.Attrs.Keys;
            foreach (var field in firstNodeMetaFields) {
                var akey = new XElement(xn + "key");
                akey.Add(new XAttribute("attr.name", field));
                akey.Add(new XAttribute("attr.type", "string")); // todo could reflect
                akey.Add(new XAttribute("for", "node"));
                akey.Add(new XAttribute("id", field));
                graphfile.Add(akey);
            }

            // edges 
            var firstEdgeMetaFields = edges.First().Attrs.Keys;
            foreach (var field in firstEdgeMetaFields) {
                var akey = new XElement(xn + "key");
                akey.Add(new XAttribute("attr.name", field));
                akey.Add(new XAttribute("attr.type", "string")); // todo could reflect
                akey.Add(new XAttribute("for", "edge"));
                akey.Add(new XAttribute("id", field));
                graphfile.Add(akey);
            }

            #endregion

            // add graph meta data
            XElement graph = new XElement(xn + "graph");

            graph.Add(new XAttribute("id", "G"));
            graph.Add(new XAttribute("edgedefault", "directed"));
            graph.Add(new XAttribute("parse.nodes", nodes.Count));
            graph.Add(new XAttribute("parse.edges", edges.Count));
            graph.Add(new XAttribute("parse.order", "nodesfirst"));
            graph.Add(new XAttribute("parse.nodeids", "free"));
            graph.Add(new XAttribute("parse.edgeids", "free"));
            graphfile.Add(graph);

            // add nodes
            foreach (var node in nodes) {
                string name = node.Key;
                var nodeElem = new XElement(xn + "node", new XAttribute("id", name));
                foreach (var field in firstNodeMetaFields) {
                    var dataelem = new XElement(xn + "data", node.Value.Attrs[field]);
                    dataelem.Add(new XAttribute("key", field));
                    nodeElem.Add(dataelem);
                }

                graph.Add(nodeElem);
            }

            // add edges
            foreach (var edge in edges) {
                string source = edge.Source;
                string target = edge.Target;

                var edgeElem = new XElement(xn + "edge", new XAttribute("id", source + "to" + target),
                    new XAttribute("source", source),
                    new XAttribute("target", target));

                // < data key = "username" > _Paul_Tobin_ </ data >
                foreach (var field in firstEdgeMetaFields) {
                    var dataelem = new XElement(xn + "data", edge.Attrs[field]);
                    dataelem.Add(new XAttribute("key", field));
                    edgeElem.Add(dataelem);
                }

                var weightElem = new XElement(xn + "data", edge.Weight);
                weightElem.Add(new XAttribute("key", "weight"));
                edgeElem.Add(weightElem);
                graph.Add(edgeElem);
            }

            xDoc.Save(fileName);
        }
        
    }
}