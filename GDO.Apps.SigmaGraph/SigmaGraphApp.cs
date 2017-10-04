using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.AccessControl;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.SigmaGraph.Domain;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Core.Apps;
using log4net;
using System.Text;

// TODO write specs for all methods
namespace GDO.Apps.SigmaGraph {
    public class SigmaGraphApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(SigmaGraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        #region config //todo change this for a SigmaGraphConfiguration 
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration)config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public string ControllerId { get; set; }

        private string _folderNameDigit;
        private QuadTreeNode<GraphObject> _currentQuadTreeRoot;

        public void Init() {
            try {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph"));
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls"));
            }
            catch (Exception e) {
                Log.Error("failed to launch the Graphs App", e);
            }
        }

        public void ProcessGraph(string filename) {
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/");
            _folderNameDigit = CreateTemporyFolderId(filename, basePath);
            String pathToFolder = basePath + _folderNameDigit;

            if (Directory.Exists(pathToFolder)) {
                string savedQuadTree =
                    System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/" + _folderNameDigit +
                                                                  "/quad.json");
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.Converters.Add(new QuadTreeNodeConverter());
                this._currentQuadTreeRoot =
                    JsonConvert.DeserializeObject<QuadTreeNode<GraphObject>>(File.ReadAllText(savedQuadTree), settings);
            }
            else {
                Directory.CreateDirectory(pathToFolder);
                string graphMLfile =
                    System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls/" + filename);
                var graph = GraphDataReader.ReadGraphMLData(graphMLfile);
                this._currentQuadTreeRoot = SigmaGraphQuadProcesor.ProcessGraph(graph, basePath + _folderNameDigit).Root;
            }
        }

        private static string CreateTemporyFolderId(string filename, string basePath) {
            byte[] folderNameBytes = Encoding.Default.GetBytes(filename);
            return BitConverter.ToString(folderNameBytes).Replace("-", "");
        }

        public IEnumerable<string> GetFilesWithin(double x, double y, double xWidth, double yWidth) {
            return this._currentQuadTreeRoot.ReturnMatchingLeaves(x, y, xWidth, yWidth)
                .Select(graphNode => this._folderNameDigit + "/" + graphNode.Guid + ".json").ToList();
        }

        public IEnumerable<string> GetLeafBoxes(double x, double y, double xWidth, double yWidth)
        {
            return this._currentQuadTreeRoot.ReturnMatchingLeaves(x, y, xWidth, yWidth)
                .Select(graphNode => graphNode.Centroid.ToString()).ToList();
        }
    }
 }