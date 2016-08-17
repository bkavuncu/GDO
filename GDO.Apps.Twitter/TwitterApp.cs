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
        public string StaticHtmlBasePath { get; set; }
        public string ImageAppBasePath { get; set; }

        public string TwitterBasePath { get; set; }
        public string TwitterRelativePath { get; set; }
        public string ChartingAppUrl { get; set; }
        public bool ReplaceExisting { get; set; }
        public void Init()
        {
            GraphAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Graph/graphmls/");
            ImageAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            StaticHtmlBasePath = HttpContext.Current.Server.MapPath("~/Web/StaticHTML/");
            TwitterBasePath = HttpContext.Current.Server.MapPath("~/Web/Twitter/data/");
            TwitterRelativePath = "/Web/Twitter/data/";

            Directory.CreateDirectory(TwitterBasePath);
            Directory.CreateDirectory(GraphAppBasePath);
            Directory.CreateDirectory(ImageAppBasePath);
            Directory.CreateDirectory(TwitterBasePath);

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

        public void CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            PseudoCave.CreateSection(colStart, rowStart, colEnd, rowEnd);
        }

        public void CreateSections(List<SectionRequest> sectionRequests)
        {
            foreach (var sR in sectionRequests)
            {
                CreateSection(sR.ColStart, sR.RowStart, sR.ColEnd, sR.RowEnd);
            }
        }

        public void QueueApps(List<SectionRequest> sectionRequests)
        {
            foreach (var sectionRequest in sectionRequests)
            {
                Debug.WriteLine("Loading visualisation " + sectionRequest.AnalyticsId + " " + sectionRequest.DataSetId);
                sectionRequest.TwitterVis = GetVisualisation(sectionRequest.AnalyticsId, sectionRequest.DataSetId);
            }
            PseudoCave.QueueApps(sectionRequests);
        }


        public void CloseSections(List<int> sectionIds)
        {
            PseudoCave.CloseSections(sectionIds);
        }
        
        public void DeployApps(List<int> sectionIds)
        {
            PseudoCave.DeployApps(sectionIds);
        }

        public void CloseApps(List<int> sectionIds)
        {
            PseudoCave.CloseApps(sectionIds);
        }

        public void ConfirmLaunch(List<int> sectionIds)
        {
            PseudoCave.ConfirmLaunch(sectionIds);
        }

        public void ClearCave()
        {
            PseudoCave.ClearCave();
        }

        public void UnLoadVisualisation(int sectionId)
        {
            PseudoCave.Sections[sectionId].TwitterVis = new TwitterVis();
        }

        public void LoadVisualisation(int sectionId, string analyticsId, string dataSetId)
        {
            PseudoCave.LoadVisualisation(sectionId);
            PseudoCave.Sections[sectionId].TwitterVis = GetVisualisation(analyticsId, dataSetId);

        }

        public TwitterVis GetVisualisation(string analyticsId, string dataSetId)
        {
            TwitterVis twitterVis = new TwitterVis();
            var analytics = RestController.GetAnalytics(dataSetId, analyticsId);

            switch (analytics.Classification)
            {
                case "Graph":
                    twitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Graph;
                    twitterVis.AppType = "Graph";

                    Download(dataSetId, analyticsId, GraphAppBasePath + analyticsId + ".graphml", "type=graph");
                    twitterVis.FilePath = analyticsId + ".graphml";
                    break;
                default:
                    twitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Analytics;
                    twitterVis.AppType = "ResponsiveHTML";
                    Download(dataSetId, analyticsId, TwitterBasePath + analyticsId + ".html", "type=chart");
                    twitterVis.FilePath = TwitterRelativePath + analyticsId + ".html";
                    break;
            }

            twitterVis.Id = analyticsId;
            twitterVis.DataSetId = dataSetId;
            twitterVis.SubType = analytics.Type;
            return twitterVis;
        }

        private string Download(string dataSetId , string analyticsId, string path, string queryParams)
        {
            if (!ReplaceExisting && File.Exists(path))
            {  // if the file already exists,don't redownload
                Debug.WriteLine("File already exists will not re download: " + path);
                return path;
            }

            var filePath  = RestController.DownloadData(dataSetId, analyticsId, path, queryParams);
            Debug.WriteLine("File downloaded to " + filePath);
            return filePath;
        }

        public string GetApiMessage()
        {
            return JsonConvert.SerializeObject(RestController.GetApiMessage());
        }

        public string GetAnalytics(List<string> dataSetIds)
        {
            return JsonConvert.SerializeObject(dataSetIds.ToDictionary(dsId => dsId, ds => RestController.GetAnalyticsList(ds)));
        }

        public string GetDataSets()
        {
            return JsonConvert.SerializeObject(RestController.GetDataSetList().ToDictionary(ds => ds.Id, ds => ds));
        }

        public string GetAnalyticsOptions()
        {
            return JsonConvert.SerializeObject(RestController.GetAnalyticsOptions());
        }

        public void GetNewAnalytics(List<AnalyticsRequest> newAnalyticsRequests)
        {
            foreach (var newAnalyticsRequest in newAnalyticsRequests)
            {
                newAnalyticsRequest.description = "GDORequest_" + DateTime.Now;
            }
            RestController.GetNewAnalytics(newAnalyticsRequests);
        }
    }
}