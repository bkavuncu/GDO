using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Apps.SigmaGraph.QuadTree.Utilities;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class SigmaGraphQuadProcesor {
        public static void ProcessGraph(GraphInfo graph, string outputfolder) {

            var factory =
                new ConcurrentQuadTreeFactory<GraphObject>(new QuadCentroid(graph.RectDim.Width, graph.RectDim.Height),
                    maxbags: 1, maxobjectPerBag: 10000);
            
            //todo this hard limit is questionable and may cause issues if there exists a node with valency > limit (or nodes very close with total valency > limit) 


            // Debug var total =  graph.Nodes.BatchListCast<GraphNode, GraphObject>(500).Reverse().Aggregate(0, (acc, next) => acc + next.Count);

            List<IEnumerable<List<GraphObject>>> addData = new List<IEnumerable<List<GraphObject>>>() {
                graph.Nodes.BatchListCast<GraphNode, GraphObject>(500),
                graph.Links.BatchListCast<GraphLink, GraphObject>(1000)
            };
            factory.ConcurrentAdd(addData, workthreads: 2, reworkthreads: 2);
            // two adders, two workers, two reworkers... not sure if optimal, depends on server

            factory.QuadTree.ShedAllObjects();

            /* debug, can be disabled */
            var results = factory.PrintState();
            var tree = factory.QuadTree.PrintQuad(factory);
            File.WriteAllText(Path.Combine(outputfolder, "tree.xml"), tree);
            var baglist = factory.PrintShedBags();
            File.WriteAllText(Path.Combine(outputfolder, "baglist.csv"), baglist);


            Dictionary<string, QuadTreeNode<GraphObject>> leafs = factory.SelectLeafs();

            ExportLeafNodes(factory, leafs, graph.Nodes, outputfolder);

            //todo now export the whole quadtree so it can be reloaded again later... 

            ExportQuadTree(factory.QuadTree, Path.Combine(outputfolder,"\\quad.xml"));

            Console.WriteLine(results + Environment.NewLine + tree);

        }

        private static void ExportQuadTree(QuadTree<GraphObject> factoryQuadTree, string filename) {
            XmlSerializer xsSubmit = new XmlSerializer(typeof(QuadTreeNode<GraphObject>));

            using (var sww = new StringWriter()) {
                using (XmlWriter writer = XmlWriter.Create(sww)) {
                    xsSubmit.Serialize(writer, factoryQuadTree.Root);
                    var xml = sww.ToString();
                    File.WriteAllText(filename,xml);
                }
            }
        }

        private static void ExportLeafNodes(ConcurrentQuadTreeFactory<GraphObject> factory, Dictionary<string, QuadTreeNode<GraphObject>> leafs, List<GraphNode> graphNodes, string outputfolder) {
            Parallel.ForEach(leafs, l => ProcessLeafGraphML(l.Key, factory.GetBagsForQuad(l.Value), graphNodes, outputfolder));
        }

        private static void ProcessLeafGraphML(string key, QuadTreeBag<GraphObject>[] quadTreeBag, List<GraphNode> graphNodes, string outputfolder) {
            /*  
             * todo     
             
             * split objects into nodes & edges
             * for the edges retrive the nodes connected
             * dump it all to text file. 
             */
            Dictionary<string, GraphNode> nodes = new Dictionary<string, GraphNode>();
            List<GraphLink> edges = new List<GraphLink>();


            //split objects into nodes & edges
            foreach (var graphObject in quadTreeBag.SelectMany(b => b.Objects)) {
                if (graphObject is GraphLink) {
                    edges.Add(graphObject as GraphLink);
                } else if (graphObject is GraphNode) {
                    var graphNode = graphObject as GraphNode;
                    nodes.Add(graphNode.ID,graphNode);
                }
                else {
                    throw new ArgumentException("unknown graph object type");
                }
            }

            // for the edges retrive the nodes connected
            foreach (var edge in edges) {
                if (!nodes.ContainsKey(edge.Source)) {
                    var node = graphNodes.First(n => n.ID == edge.Source);
                    nodes.Add(node.ID, node);
                }
                if (!nodes.ContainsKey(edge.Target)) {
                    var node = graphNodes.First(n => n.ID == edge.Target);
                    nodes.Add(node.ID, node);
                }
            }

            // dump them all to a text file 
            string outputfile = Path.Combine(outputfolder, "\\graphmls\\", key + ".graphml");

            GraphMlUtilities.SaveGraph(nodes,edges,outputfile);

        }

    }

    public static class LinqBatch {

        /// <summary>
        /// Batches the list and converts it to a base type 
        /// https://stackoverflow.com/questions/13731796/create-batches-in-linq
        /// added .ToList to avoid issues with requirement for full in order enemueration of lists
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="C"></typeparam>
        /// <param name="source">The source.</param>
        /// <param name="size">The size.</param>
        /// <returns></returns>
        /// <exception cref="System.ArgumentOutOfRangeException">size;Must be greater than zero.</exception>
        public static IEnumerable<List<C>> BatchListCast<T,C>(this IEnumerable<T> source, int size) where T : C {
                if (size <= 0)
                    throw new ArgumentOutOfRangeException("size", "Must be greater than zero.");

                using (IEnumerator<T> enumerator = source.GetEnumerator())
                    while (enumerator.MoveNext())
                        yield return TakeIEnumerator<T,C>(enumerator, size).ToList();
            }

            private static IEnumerable<C> TakeIEnumerator<T,C>(IEnumerator<T> source, int size) where T :C{
                int i = 0;
                do
                    yield return source.Current;
                while (++i < size && source.MoveNext());
            }
        
    }


}