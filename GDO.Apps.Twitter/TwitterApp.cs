using System;
using System.Collections.Generic;
using GDO.Core;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Apps.Twitter.Core;
using GDO.Core.Apps;
using log4net;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter
{


    public class TwitterApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(TwitterApp));
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
        public string FusionChartAppBasePath { get; set; }

        public string TwitterBasePath { get; set; }
        public string TwitterRelativePath { get; set; }
        
        public bool ReplaceExisting { get; set; }
        public Dictionary<string, DataSet> DataSets { get; set; }
        public Dictionary<string, Dictionary<string,Analytics>> Analytics { get; set; }

        public void Init()
        {
            GraphAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Graph/graphmls/");
            ImageAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            StaticHtmlBasePath = HttpContext.Current.Server.MapPath("~/Web/StaticHTML/");
            TwitterBasePath = HttpContext.Current.Server.MapPath("~/Web/Twitter/data/");
            TwitterRelativePath = "/Web/Twitter/data/";

            try
            {
                Directory.CreateDirectory(TwitterBasePath);
                Directory.CreateDirectory(GraphAppBasePath);
                Directory.CreateDirectory(ImageAppBasePath);
                Directory.CreateDirectory(TwitterBasePath);
            }
            catch (Exception e)
            {
                Log.Error("failed to launch the Twitter App", e);
                return;
            }
            var apiAddress = (string) Configuration.Json.SelectToken("api_address");
            RestController = new RestController(new Uri(apiAddress));

            Debug.WriteLine("Using the following address a root api: " + apiAddress);
            PseudoCave = new PseudoCave(Cave.Nodes, Cave.Sections, Section.Id);
        }

        #region CaveManagement

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

        #endregion

        #region API

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
            Analytics analytics = Analytics[dataSetId][dataSetId];
            AnalyticsData analyticsData = RestController.GetAnalyticsMetaData(analytics.UriData);
            string url = analyticsData.Urls[analyticsData.PreferedUrl];

            TwitterVis twitterVis = new TwitterVis(analyticsData.PreferedApp;);
            switch (twitterVis.AppType) {
                case "Graph":
                    twitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Graph;
                    twitterVis.Config = "Default";
                    twitterVis.FilePath = Download(url, GraphAppBasePath + analyticsId + ".graphml");
                    break;
                case "FusionChart":
                    twitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.Chart;
                    twitterVis.Config = "Default";
                    twitterVis.FilePath = Download(url, ChartAppBasePath + analyticsId + ".json");
                    break;
                default:
                    twitterVis.TwitterVisType = TwitterVis.TwitterVisTypes.HTML;
                    twitterVis.Config = "Responsive";
                    twitterVis.FilePath = Download(url, TwitterRelativePath + analyticsId + ".html");
                    break;
            }

            twitterVis.Id = analyticsId;
            twitterVis.DataSetId = dataSetId;
            twitterVis.SubType = analytics.Type;
            return twitterVis;
        }

        private string Download(string url, string path)
        {
            if (!ReplaceExisting && File.Exists(path))
            {  // if the file already exists,don't redownload
                Debug.WriteLine("File already exists and redownload set to "  + ReplaceExisting + " -  will not re download: " + path);
                return path;
            }

            var filePath  = RestController.DownloadData(url, path);
            Debug.WriteLine("File downloaded to " + filePath);
            return filePath;
        }

        public string GetApiMessage()
        {
            return JsonConvert.SerializeObject(RestController.GetApiMessage());
        }

        public string GetAnalytics(List<string> dataSetIds)
        {
            Dictionary<string, List<Analytics>> analytics = dataSetIds.ToDictionary(dsId => dsId, ds => RestController.GetAnalyticsList(ds));
            Analytics = analytics.ToDictionary(a => a.Key, a => a.Value.ToDictionary(b => b.Id, b => b));
            return JsonConvert.SerializeObject(analytics.ToDictionary(a => a.Key,
                    a => a.Value.GroupBy(o => o.Classification).ToDictionary(g => g.Key, g => g.ToList())));
        }

        public string GetDataSets()
        {
            DataSets = RestController.GetDataSetList().ToDictionary(ds => ds.Id, ds => ds);
            return JsonConvert.SerializeObject(DataSets);
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

        #endregion
    }
}