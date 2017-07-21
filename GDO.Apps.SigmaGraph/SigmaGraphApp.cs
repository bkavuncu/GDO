using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.SigmaGraph.Domain;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Core.Apps;
using log4net;
using System.Text;
using Newtonsoft.Json.Linq;

// TODO cleanup this file
namespace GDO.Apps.SigmaGraph {

    public class SigmaGraphApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(SigmaGraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        public GraphInfo graphinfo = new GraphInfo();

        public string FolderNameDigit;
        private QuadTreeNode<GraphObject> currentQuadTreeRoot;

        public void Init() {
            try {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph"));
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls"));
            }
            catch (Exception e) {
                Log.Error("failed to launch the Graphs App", e);
            }
        }


        // @param: name of data file (TODO: change it to folder name, that stores nodes and links files)
        // return name of folder that stores processed data
        public void ProcessGraph(string filename, bool zoomed, string folderName, int sectionWidth,
            int sectionHeight) {
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/");
            FolderNameDigit = CreateTemporyFolderId(filename, basePath);
            String pathToFolder = basePath + FolderNameDigit;

            if (Directory.Exists(pathToFolder)) {
                string savedQuadTree =
                    System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/" + FolderNameDigit +
                                                                  "/quad.json");
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.Converters.Add(new QuadTreeNodeConverter());
                this.currentQuadTreeRoot =
                    JsonConvert.DeserializeObject<QuadTreeNode<GraphObject>>(File.ReadAllText(savedQuadTree), settings);
            }
            else {
                Directory.CreateDirectory(pathToFolder);
                string graphMLfile =
                    System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls/" + filename);
                var graph = GraphDataReader.ReadGraphMLData(graphMLfile);
                this.currentQuadTreeRoot = SigmaGraphQuadProcesor.ProcessGraph(graph, basePath + FolderNameDigit).Root;
            }
        }

        // TODO: this can go into JSON utilities
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
                double xCentroid = (double) quadTreeNodeToken["Centroid"]["xCentroid"];
                double yCentroid = (double) quadTreeNodeToken["Centroid"]["yCentroid"];
                double xWidth = (double) quadTreeNodeToken["Centroid"]["xWidth"];
                double yWidth = (double) quadTreeNodeToken["Centroid"]["yWidth"];
                QuadTreeNode<GraphObject> quadTreeNode =
                    new QuadTreeNode<GraphObject>(xCentroid, yCentroid, xWidth, yWidth);
                quadTreeNode.Guid = (string) quadTreeNodeToken["Guid"];
                return quadTreeNode;
            }

            public override bool CanWrite => false;

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer) {
                throw new NotImplementedException();
            }
        }

        private static string CreateTemporyFolderId(string filename, string basePath) {
            byte[] folderNameBytes = Encoding.Default.GetBytes(filename);
            return BitConverter.ToString(folderNameBytes).Replace("-", "");
        }

        public IEnumerable<string> GetFilesWithin(double x, double y, double xWidth, double yWidth) {
            List<QuadTreeNode<GraphObject>> listResult = new List<QuadTreeNode<GraphObject>>();
            this.currentQuadTreeRoot.ReturnLeafs(x, y, xWidth, yWidth, listResult);
            IEnumerable<string> filePaths = listResult
                .Select(quadTreeNode => this.FolderNameDigit + "/" + quadTreeNode.Guid + ".json");
            return filePaths;
        }

        public void UpdateZoomVar(bool zoomed) {
            throw new NotImplementedException();
        }
    }
}