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

// TODO write specs for all methods
namespace GDO.Apps.SigmaGraph {

    public class SigmaGraphAppConfig : AppJsonConfiguration {
        public string FolderNameDigit;
        public string Filename { get; set; }

        public override string GetJsonForBrowsers() {
            return "{}"; // we dont need to send anything to browsers.
        }
    }

    public class SigmaGraphApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(SigmaGraphApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }

        #region config

        public SigmaGraphAppConfig Configuration;
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is SigmaGraphAppConfig) {
                Configuration = (SigmaGraphAppConfig)config;
                // todo signal update of config status

                TryLoadQuadTree();
                return true;
            }
            Log.Info(" Sigma Graph app is loading with a default configuration");
            Configuration = (SigmaGraphAppConfig)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new SigmaGraphAppConfig { Name = "Default", Json = new JObject() };
        }

        #endregion 

        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        private QuadTreeNode<GraphObject> CurrentQuadTreeRoot;

        private const String GRAPHML_DIR = "~/Web/SigmaGraph/graphmls/";
        private const String QUADTREE_DIR = "~/Web/SigmaGraph/QuadTrees/";


        public void Init() {
            try {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(GRAPHML_DIR));
            }
            catch (Exception e) {
                Log.Error("failed to launch the SigmaGraph App", e);
            }
        }

        public static string[] GraphMLFileList()
        {
            string graphfolder = System.Web.HttpContext.Current.Server.MapPath(GRAPHML_DIR);
            return Directory.GetFiles(graphfolder);
        }

        public static string PrepareGraphMLDir(string filename)
        {
            var path = System.Web.HttpContext.Current.Server.MapPath(GRAPHML_DIR);
            Directory.CreateDirectory(path);

            path += filename;
            if (File.Exists(path))
            {  // if the file already exists, delete it
                File.Delete(path);
            }
            return path;
        }

        public static void SaveGraph(string filename, System.Web.HttpPostedFileBase file)
        {
            file.SaveAs(PrepareGraphMLDir(filename));
        }

        public static void SaveGraph(string filename, string contents)
        {
            File.WriteAllText(PrepareGraphMLDir(filename), contents);
        }

        public void ProcessGraph(string filename) {
            // deterministically convert filename to a folderid 
            this.Configuration.Filename = filename;
            this.Configuration.FolderNameDigit = CreateTemporyFolderId(filename);

            // if its already proccessed then load it 
            if (TryLoadQuadTree()) return;

            Log.Info($"about to process quadtree '{filename}'");
            Directory.CreateDirectory(GetPathToQuadFolder);
            string graphMLfile =
                System.Web.HttpContext.Current.Server.MapPath(GRAPHML_DIR + filename);
            var graph = GraphDataReader.ReadGraphMLData(graphMLfile);
            this.CurrentQuadTreeRoot = SigmaGraphQuadProcesor.ProcessGraph(graph, BasePath + this.Configuration.FolderNameDigit).Root;
        }

        private static string BasePath => System.Web.HttpContext.Current.Server.MapPath(QUADTREE_DIR);
        private string GetPathToQuadFolder => BasePath + this.Configuration.FolderNameDigit;

        /// <summary>
        /// Tries the load quad tree from the Configuration.FolderNameDigit 
        /// </summary>
        /// <returns>false</returns>
        private bool TryLoadQuadTree() {
            Log.Info($"trying to load quadtree '{this.Configuration.FolderNameDigit}'");
            if (string.IsNullOrWhiteSpace(this.Configuration.FolderNameDigit)) return false;

            if (Directory.Exists(GetPathToQuadFolder)) {
                string savedQuadTree =
                    System.Web.HttpContext.Current.Server.MapPath(QUADTREE_DIR +
                                                                  this.Configuration.FolderNameDigit +
                                                                  "/quad.json");
                if (!File.Exists(savedQuadTree))
                {
                    return false;
                }
                JsonSerializerSettings settings = new JsonSerializerSettings();
                settings.Converters.Add(new QuadTreeNodeConverter());
                this.CurrentQuadTreeRoot =
                    JsonConvert.DeserializeObject<QuadTreeNode<GraphObject>>(File.ReadAllText(savedQuadTree), settings);

                Log.Info($"successfully loaded quadtree '{this.Configuration.FolderNameDigit}'");
                return true;
            }
            return false;
        }

        private static string CreateTemporyFolderId(string filename) {
            byte[] folderNameBytes = Encoding.Default.GetBytes(filename);
            return BitConverter.ToString(folderNameBytes).Replace("-", "");
        }

        public IEnumerable<string> GetFilesWithin(double x, double y, double xWidth, double yWidth) {
            return this.CurrentQuadTreeRoot.ReturnMatchingLeaves(x, y, xWidth, yWidth)
                .Select(graphNode => this.Configuration.FolderNameDigit + "/" + graphNode.Guid + ".json").ToList();
        }

        public IEnumerable<string> GetLeafBoxes(double x, double y, double xWidth, double yWidth)
        {
            return this.CurrentQuadTreeRoot.ReturnMatchingLeaves(x, y, xWidth, yWidth)
                .Select(graphNode => graphNode.Centroid.ToString()).ToList();
        }
    }
 }