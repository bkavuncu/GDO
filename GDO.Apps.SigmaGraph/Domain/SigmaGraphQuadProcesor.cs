using System;
using GDO.Apps.SigmaGraph.QuadTree;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class SigmaGraphQuadProcesor {
        public static void ProcessGraph(GraphInfo graph, string filename, string folderName, string indexFile, string folderNameDigit) {
            
            var factory = new ConcurrentQuadTreeFactory<GraphObject>(new QuadCentroid(graph.RectDim.Width, graph.RectDim.Height),maxbags: 5, maxobjectPerBag: 1000);


        }
    }


}