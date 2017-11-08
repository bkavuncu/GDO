﻿using System;
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
        public List<string> NodeAttributes { get; set; }
        public List<string> EdgeAttributes { get; set; }

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
            // deterministically convert filename to a folderid 
            this.Configuration.Filename = filename;
            this.Configuration.FolderNameDigit = CreateTemporyFolderId(filename);

            // if its already proccessed then load it 
            // if (TryLoadQuadTree()) return;

            Log.Info($"about to process quadtree '{filename}'");
            Directory.CreateDirectory(GetPathToQuadFolder);
            string graphMLfile =
                System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls/" + filename);
            var graph = GraphDataReader.ReadGraphMLData(graphMLfile);
            this.CurrentQuadTreeRoot = SigmaGraphQuadProcesor.ProcessGraph(graph, BasePath + this.Configuration.FolderNameDigit).Root;
            this.Configuration.NodeAttributes = new List<string>(graph.NodeOtherFields);
            this.Configuration.EdgeAttributes = new List<string>(graph.LinkKeys);
        }

        private static string BasePath => System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/");
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
                    System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/" +
                                                                  this.Configuration.FolderNameDigit +
                                                                  "/quad.json");
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