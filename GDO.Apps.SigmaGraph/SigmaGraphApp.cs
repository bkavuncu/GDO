using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.SigmaGraph.Domain;
using GDO.Apps.SigmaGraph.QuadTree;
using GDO.Core.Apps;
using log4net;
using System.Text;

// TODO cleanup this file
// TODO inconsistent style: first method curly brace on same or next line
namespace GDO.Apps.SigmaGraph
{

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
        // TODO change to support multiple factories
        private QuadTree<GraphObject> currentQuadTree;

        public void Init()
        {
            try {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph"));
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls"));
            }
            catch (Exception e) {
                Log.Error("failed to launch the Graphs App",e);
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
                string savedQuadTree = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/"+FolderNameDigit+"/quad.json");
                this.currentQuadTree = JsonConvert.DeserializeObject<QuadTree<GraphObject>>(File.ReadAllText(savedQuadTree));
            } else {
                Directory.CreateDirectory(pathToFolder);
                string graphMLfile = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls/" + filename);
                var graph = GraphDataReader.ReadGraphMLData(graphMLfile);
                this.currentQuadTree = SigmaGraphQuadProcesor.ProcessGraph(graph, basePath + FolderNameDigit);
            }
        }

        private static string CreateTemporyFolderId(string filename, string basePath) {
            byte[] folderNameBytes = Encoding.Default.GetBytes(filename);
            return BitConverter.ToString(folderNameBytes).Replace("-", "");
        }

        public IEnumerable<string> GetFilesWithin(double x, double y, double xWidth, double yWidth) {
            List<QuadTreeNode<GraphObject>> listResult = new List<QuadTreeNode<GraphObject>>();
            this.currentQuadTree.Root.ReturnLeafs(x, y, xWidth, yWidth, listResult);
            IEnumerable<string> filePaths = listResult
                .Select(quadTreeNode => this.FolderNameDigit + "/" + quadTreeNode.Guid + ".json");
            return filePaths;
        }

        public void UpdateZoomVar(bool zoomed) {
            throw new NotImplementedException();
        }
    }
}

