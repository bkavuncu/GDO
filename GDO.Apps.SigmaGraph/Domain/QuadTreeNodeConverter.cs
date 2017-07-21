using System;
using System.Collections.Generic;
using System.Linq;
using GDO.Apps.SigmaGraph.QuadTree;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.SigmaGraph.Domain {
    class QuadTreeNodeConverter : JsonConverter {
        public override bool CanConvert(Type objectType) {
            return (objectType == typeof(QuadTreeNode<GraphObject>));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue,
            JsonSerializer serializer) {
            JObject quadTreeRoot = JObject.Load(reader);
            QuadTreeNode<GraphObject> quadTreeRootNode = ConvertToQuadTreeNode(quadTreeRoot);

            Stack<Tuple<QuadTreeNode<GraphObject>, JToken>> worklist =
                new Stack<Tuple<QuadTreeNode<GraphObject>, JToken>>();
            worklist.Push(new Tuple<QuadTreeNode<GraphObject>, JToken>(quadTreeRootNode, quadTreeRoot["SubQuads"]));
            while (worklist.Any()) {
                var workItem = worklist.Pop();
                var parentNode = workItem.Item1;
                var subQuads = workItem.Item2;

                List<QuadTreeNode<GraphObject>> allSubQuads = new List<QuadTreeNode<GraphObject>>();
                foreach (JToken subQuad in subQuads) {
                    QuadTreeNode<GraphObject> subQuadNode = ConvertToQuadTreeNode(subQuad);
                    allSubQuads.Add(subQuadNode);

                    worklist.Push(new Tuple<QuadTreeNode<GraphObject>, JToken>(subQuadNode, subQuad["SubQuads"]));
                }
                if (allSubQuads.Any()) {
                    parentNode.SubQuads = allSubQuads.ToArray();
                }
            }
            return quadTreeRootNode;
        }

        private static QuadTreeNode<GraphObject> ConvertToQuadTreeNode(JToken quadTreeNodeToken) {
            double xCentroid = (double)quadTreeNodeToken["Centroid"]["xCentroid"];
            double yCentroid = (double)quadTreeNodeToken["Centroid"]["yCentroid"];
            double xWidth = (double)quadTreeNodeToken["Centroid"]["xWidth"];
            double yWidth = (double)quadTreeNodeToken["Centroid"]["yWidth"];
            QuadTreeNode<GraphObject> quadTreeNode =
                new QuadTreeNode<GraphObject>(xCentroid, yCentroid, xWidth, yWidth);
            quadTreeNode.Guid = (string)quadTreeNodeToken["Guid"];
            return quadTreeNode;
        }

        public override bool CanWrite => false;

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) {
            throw new NotImplementedException();
        }
    }
}