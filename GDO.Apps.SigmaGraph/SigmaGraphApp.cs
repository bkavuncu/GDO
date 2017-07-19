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
        private AConcurrentQuadTreeFactory<GraphObject> currentFactory;

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
        public string ProcessGraph(string filename, bool zoomed, string folderName, int sectionWidth,
            int sectionHeight) {


            String indexFile = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph/Database.txt");

            // see if we have seen this before 
            if (File.Exists(indexFile)) {
                try {
                    var digitsdict = File.ReadAllLines(indexFile).Where(s => !string.IsNullOrWhiteSpace(s))
                        .Select(l => l.Split(new[] {"|"}, StringSplitOptions.None))
                        .Where(l => l.Length == 4)
                        .ToDictionary(l => l[0],
                            l => new {id = l[1], width = int.Parse(l[2]), height = int.Parse(l[3])});

                    if (digitsdict.ContainsKey(filename) && digitsdict[filename].width == sectionWidth
                        && digitsdict[filename].height == sectionHeight) {
                        FolderNameDigit = digitsdict[filename].id;
                        return this.FolderNameDigit;
                    }
                }
                catch (Exception e) {
                    Log.Error("graph app failed to parse its database file " + e);
                }
            }

            string graphMLfile = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graphmls/" + filename);

            var graph = GraphDataReader.ReadGraphMLData(graphMLfile);

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/QuadTrees/");
            FolderNameDigit = CreateTemporyFolderId(folderName, basePath);


            //SigmaGraphProcessor.ProcessGraph(graph, filename, zoomed, folderName,  indexFile, FolderNameDigit,Section);
            this.currentFactory = SigmaGraphQuadProcesor.ProcessGraph(graph, basePath+FolderNameDigit);

            return this.FolderNameDigit;
        }

        private static string CreateTemporyFolderId(string folderName, string basePath) {
            var folderNameDigit = "10001";
            if (folderName == null) {
                // Generate random numbers as folder name
                Random randomDigitGenerator = new Random();
                while (Directory.Exists(basePath + folderNameDigit)) {
                    folderNameDigit = randomDigitGenerator.Next(10000, 99999).ToString();
                }
                Directory.CreateDirectory(basePath + folderNameDigit);
            } else {
                folderNameDigit = folderName;
            }
            return folderNameDigit;
        }

        public IEnumerable<string> GetFilesWithin(double x, double y, double xWidth, double yWidth) {
            List<QuadTreeNode<GraphObject>> listResult = new List<QuadTreeNode<GraphObject>>();
            this.currentFactory.QuadTree.Root.ReturnLeafs(x, y, xWidth, yWidth, listResult);
            IEnumerable<string> filePaths = listResult
                .Select(quadTreeNode => this.FolderNameDigit + "/" + quadTreeNode.Guid + ".json");
            return filePaths;
        }

        public void UpdateZoomVar(bool zoomed) {
            throw new NotImplementedException();
        }
    }
}

