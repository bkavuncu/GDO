using System;
using System.Collections.Generic;
using System.Linq;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Apps.SigmaGraph.QuadTree.Utilities;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class SigmaGraphQuadProcesor {
        public static void ProcessGraph(GraphInfo graph, string filename, string folderName, string indexFile, string folderNameDigit) {

       //     graph.RescaleTo(0, 1, 0, 1);
            
            var factory = new ConcurrentQuadTreeFactory<GraphObject>(new QuadCentroid(graph.RectDim.Width, graph.RectDim.Height),maxbags: 1, maxobjectPerBag: 5000);


           var total =  graph.Nodes.BatchListCast<GraphNode, GraphObject>(500).Reverse().Aggregate(0, (acc, next) => acc + next.Count);

            List<IEnumerable<List<GraphObject>>> addData = new List<IEnumerable<List<GraphObject>>>() {
                graph.Nodes.BatchListCast<GraphNode, GraphObject>(500),
          //    graph.Links.Take(100).BatchListCast<GraphLink, GraphObject>(50)

            };
            factory.ConcurrentAdd(addData, workthreads: 2, reworkthreads: 2);

           // factory.QuadTree.ShedAllObjects();

            var results = factory.PrintState();

            var tree = factory.QuadTree.PrintQuad(factory);
            var fred = factory.PrintShedBags();


            Console.WriteLine(tree);


            addData = new List<IEnumerable<List<GraphObject>>>() {
                graph.Links.Take(25000).BatchListCast<GraphLink, GraphObject>(1000)

            };

            factory.ConcurrentAdd(addData, workthreads: 1, reworkthreads: 2);

            factory.QuadTree.ShedAllObjects();

            var tree2 = factory.QuadTree.PrintQuad(factory);
            var fred2 = factory.PrintShedBags();

            Console.WriteLine(results+Environment.NewLine+tree);

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