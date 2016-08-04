using System;
using System.Collections.Generic;
using GDO.Core;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Apps.Twitter.Core;
using GDO.Core.Apps;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter
{


    public class TwitterApp : IBaseAppInstance
    {
        
        public int Id { get; set; }
        public string AppName { get; set; }
        public GDO.Core.Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }
        public string Name { get; set; }

        public RestController RestController { get; set; }
        public PseudoCave PseudoCave { get; set;}

        public string GraphAppBasePath { get; set; }
        public string RelativePath { get; set; }
        public string StaticHtmlBasePath { get; set; }
        public string ImageAppBasePath { get; set; }
        public string BasePath { get; set; }
        
        public string ChartingAppUrl { get; set; }

        public void Init()
        {
            GraphAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Graph/graphmls/");
            ImageAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            StaticHtmlBasePath = HttpContext.Current.Server.MapPath("~/Web/StaticHTML/");
            BasePath = HttpContext.Current.Server.MapPath("~/Web/Twitter/data/");
            RelativePath = "/Web/Twitter/data/";
            Directory.CreateDirectory(BasePath);
            Directory.CreateDirectory(GraphAppBasePath);
            Directory.CreateDirectory(ImageAppBasePath);
            Directory.CreateDirectory(BasePath);

            var apiAddress = (string) Configuration.Json.SelectToken("api_address");
            RestController = new RestController(new Uri(apiAddress));

            Debug.WriteLine("Using the following address a root api: " + apiAddress);
            PseudoCave = new PseudoCave(Cave.Nodes, Cave.Sections, Section.Id);
        }
        
        public string GetPseudoCaveStatus()
        {
            Debug.WriteLine("Getting Twitter App Cave Status");
            return PseudoCave.CloneCaveState(Cave.Nodes, Cave.Sections, Section.Id).SerializeJSON();
        }

        public string CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            return PseudoCave.CreateSection(colStart, rowStart, colEnd, rowEnd).SerializeJSON();
        }

        public int RemoveSection(int sectionId)
        {
            return PseudoCave.SoftRemoveSection(sectionId);
        }
        

        public string DeployApps(List<int> sectionIds)
        {
            return JsonConvert.SerializeObject(PseudoCave.DeployApps(sectionIds));
        }

        public int CloseApp(int sectionId)
        {
            return PseudoCave.CloseApp(sectionId);
        }

        public void ClearCave(out List<int> sectionIds, out List<int> appInstanceIds)
        {
            PseudoCave.ClearCave(out sectionIds, out appInstanceIds);
        }

        public void UnLoadVisualisation(int sectionId)
        {
            PseudoCave.Sections[sectionId].TwitterVis = new TwitterVis();
        }

        public void LoadVisualisation(int sectionId, string analyticsId, string dataSetId)
        {
            var analytics = RestController.GetAnalytics(dataSetId, analyticsId);

            switch (analytics.Classification)
            {
                case "Graph":
                    PseudoCave.Sections[sectionId].TwitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Graph;
                    PseudoCave.Sections[sectionId].TwitterVis.AppType = "Graph";
                    
                    Download(dataSetId, analyticsId, GraphAppBasePath + analyticsId + ".graphml", "type=graph");
                    PseudoCave.Sections[sectionId].TwitterVis.FilePath = analyticsId + ".graphml";
                    break;
                case "Analytics":
                    PseudoCave.Sections[sectionId].TwitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Analytics;
                    PseudoCave.Sections[sectionId].TwitterVis.AppType = "StaticHTML";
                    Download(dataSetId, analyticsId, BasePath + analyticsId + ".html", "type=chart");
                    PseudoCave.Sections[sectionId].TwitterVis.FilePath = RelativePath + analyticsId + ".html";
                    break;
                default:
                    PseudoCave.Sections[sectionId].TwitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Unknown;
                    break;
            }

            PseudoCave.Sections[sectionId].TwitterVis.Id = analyticsId;
            PseudoCave.Sections[sectionId].TwitterVis.DataSetId = dataSetId;
            PseudoCave.Sections[sectionId].TwitterVis.SubType = analytics.Type;

        }

        private string Download(string dataSetId , string analyticsId, string path, string queryParams)
        {
            if (File.Exists(path))
            {  // if the file already exists, delete it
                Debug.WriteLine("File already exists will not re download: " + path);
                return path;
            }

            var filePath  = RestController.DownloadData(dataSetId, analyticsId, path, queryParams);
            Debug.WriteLine("File downloaded to " + filePath);
            return filePath;
        }

        public string GetAnalytics(List<string> dataSetIds)
        {
            return JsonConvert.SerializeObject(dataSetIds.ToDictionary(dsId => dsId, ds => RestController.GetAnalyticsMetas(ds).ToArray()));
        }

        public string GetDataSets()
        {
            return JsonConvert.SerializeObject(RestController.GetDataSetMetas().ToDictionary(ds => ds.Id, ds => ds));
        }

    }
}