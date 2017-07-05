using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GDO.Core;
using Newtonsoft.Json;
using GDO.Apps.SigmaGraph.Domain;
using GDO.Core.Apps;
using log4net;

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
        public  string ProcessGraph(string filename, bool zoomed, string folderName, int sectionWidth, int sectionHeight)
        {
        

            String indexFile = System.Web.HttpContext.Current.Server.MapPath("~/Web/SigmaGraph/graph/Database.txt");
            
            // see if we have seen this before 
            if (File.Exists(indexFile)) {
                try {
                    var digitsdict = File.ReadAllLines(indexFile).Where(s => !string.IsNullOrWhiteSpace(s))
                        .Select(l => l.Split(new[] {"|"}, StringSplitOptions.None))
                        .Where(l => l.Length == 4)
                        .ToDictionary(l => l[0], l => new {id = l[1], width = int.Parse(l[2]), height = int.Parse(l[3])});

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


            SigmaGraphProcessor.ProcessGraph(graph, filename, zoomed, folderName,  indexFile, FolderNameDigit,Section);
            SigmaGraphQuadProcesor.ProcessGraph(graph, filename, folderName, indexFile, FolderNameDigit);

            return this.FolderNameDigit;
            }


        /** 
        * Auxiliar function to compute the neighbours of each node and store that information within the Node objects themselves
        */

        public void UpdateZoomVar(bool zoomed) {
            throw new NotImplementedException();
        }
    }
}

