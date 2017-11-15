using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Apps.SigmaGraph.QuadTree.Utilities;
using Newtonsoft.Json;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class SigmaGraphQuadProcesor {
        /// <summary>
        /// Indexes graph into a quadtree datastructure and saves the quadtree to disk to JSON.
        /// </summary>
        /// <param name="graph">the graph to index</param>
        /// <param name="outputfolder">the path to save the quadtree to</param>
        /// <returns>the quadtree representing the graph</returns>
        public static QuadTree<GraphObject> ProcessGraph(GraphInfo graph, string outputfolder) {
            // Create the quadtree factory
            // TODO this hard limit onmaxobjectPerBag  is questionable and may cause issues if there exists a node with valency > limit 
            //      (or nodes very close spatially with total valency > limit) 
            int maxobjsPerBag = graph.Nodes.Count + graph.Links.Count / 64;

            if (maxobjsPerBag < 1000) {
                maxobjsPerBag = 1000;
            }

            if (maxobjsPerBag > 10000) {
                maxobjsPerBag = 10000;
            }

            var factory =
                new ConcurrentQuadTreeFactory<GraphObject>(new QuadCentroid(graph.RectDim.Width, graph.RectDim.Height),
                    maxbags: 1, maxobjectPerBag: maxobjsPerBag);

            // Add the graph objects to the quadtree factory
            List<IEnumerable<List<GraphObject>>> addData = new List<IEnumerable<List<GraphObject>>>() {
                graph.Nodes.BatchListCast<GraphNode, GraphObject>(500),
                graph.Links.BatchListCast<GraphLink, GraphObject>(1000)
            };
            // TODO not sure if these numbers of threads is optimal - will depend upon server
            factory.ConcurrentAdd(addData, workthreads: 4, reworkthreads: 4);
            factory.QuadTree.ShedAllObjects();

            // Write quadtree metadata to disk for debugging
            var results = factory.PrintState();
            var tree = factory.QuadTree.PrintQuad(factory);
            File.WriteAllText(Path.Combine(outputfolder, "tree.xml"), tree);
            var baglist = factory.PrintShedBags();
            File.WriteAllText(Path.Combine(outputfolder, "baglist.csv"), baglist);

            // Get leaves and serialize their contents
            Dictionary<string, QuadTreeNode<GraphObject>> leafs = factory.SelectLeafs();
            ExportLeafNodes(factory, leafs, graph.Nodes.ToDictionary(n => n.ID, n => n), outputfolder);

            // Serialize the quadtree
            ExportQuadTree(factory.QuadTree.Root, Path.Combine(outputfolder, "quad.json"));

            return factory.QuadTree;
        }

        /// <summary>
        /// Serialize a quadtree as JSON and write it to disk.
        /// </summary>
        /// <param name="factoryQuadTree">the root node of the quadtree to serialize</param>
        /// <param name="filename">the path and name of the file to save the quadtree as</param>
        private static void ExportQuadTree(QuadTreeNode<GraphObject> factoryQuadTree, string filename) {
            string json = JsonConvert.SerializeObject(factoryQuadTree);
            System.IO.File.WriteAllText(@filename, json);
        }

        /// <summary>
        /// Serialize the leaves of a quadtree as JSON and write them to disk.
        /// </summary>
        /// <param name="factory">the quadtree factory</param>
        /// <param name="leafs">the leaves to serialize</param>
        /// <param name="graphNodes">all of the nodes of the graph represented by the quadtree factory</param>
        /// <param name="outputfolder">the path to save the leaf JSONs to</param>
        private static void ExportLeafNodes(ConcurrentQuadTreeFactory<GraphObject> factory, 
            Dictionary<string, QuadTreeNode<GraphObject>> leafs, Dictionary<string, GraphNode> graphNodes, 
            string outputfolder) {
            Parallel.ForEach(leafs, l => ProcessLeafJSON(l.Key, factory.GetBagsForQuad(l.Value), graphNodes, outputfolder));
        }

        /// <summary>
        /// Serialize a single leaf of a quadtree to JSON.
        /// </summary>
        /// <param name="key">the name of the JSON file</param>
        /// <param name="quadTreeBag">the bag containing the graph objects associated with the leaf</param>
        /// <param name="graphNodes">all of the nodes of the graph represented by the quadtree factory</param>
        /// <param name="outputfolder">the path to save the leaf JSONs to</param>
        private static void ProcessLeafJSON(string key, QuadTreeBag<GraphObject>[] quadTreeBag, Dictionary<string, GraphNode> graphNodes, string outputfolder) {
            // Split objects into nodes & edges
            HashSet<string> leafNodes = new HashSet<string>();
            List<GraphLink> edges = new List<GraphLink>();
            foreach (var graphObject in quadTreeBag.SelectMany(b => b.Objects)) {
                if (graphObject is GraphLink) {
                    edges.Add(graphObject as GraphLink);
                } else if (graphObject is GraphNode) {
                    GraphNode node = graphObject as GraphNode;
                    leafNodes.Add(node.ID);
                } else {
                    throw new ArgumentException("unknown graph object type");
                }
            }
            
            // Include the nodes of the edges in this bag
            List<string> nodes = edges.Select(e => e.Source).Union(edges.Select(e => e.Target))
                .Union(leafNodes).ToList();
            Debug.WriteLine("Node Count: " + leafNodes.Count 
                          + " New Node Count: " + nodes.Count 
                          + " Edge Count: " + edges.Count);

            // Convert the graph objects to JSON and write to disk
            string outputfile = Path.Combine(outputfolder, key + ".json");
            JSONUtilities.SaveGraph(nodes,graphNodes,edges,outputfile);
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

        private static IEnumerable<C> TakeIEnumerator<T,C>(IEnumerator<T> source, int size) where T :C {
            int i = 0;
            do
                yield return source.Current;
            while (++i < size && source.MoveNext());
        }
    }
}