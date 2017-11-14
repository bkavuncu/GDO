using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Core.CaveState;
using log4net;
using Newtonsoft.Json;
using GDO.Apps.Twitter.Core;

namespace GDO.Apps.Twitter
{


    public class TwitterApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(TwitterApp));
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public GDO.Core.Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        #region config
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
        public string Name { get; set; }

        public RestController RestController { get; set; }
        public CaveState CaveState { get; set;}

        // for difference app configuration
        public string GraphAppBasePath { get; set; }
        public string StaticHtmlBasePath { get; set; }
        public string ImageAppBasePath { get; set; }
        public string FusionChartAppBasePath { get; set; }

        public string TwitterBasePath { get; set; }
        public string TwitterRelativePath { get; set; }
        public Dictionary<string,string> DownloadCache { get; set; } = new Dictionary<string, string>();
        public bool ReplaceExisting { get; set; }
        
        public void Init()
        {
            GraphAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Graph/graphmls/");
            ImageAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
//            StaticHtmlBasePath = HttpContext.Current.Server.MapPath("~/Web/StaticHTML/");
            TwitterBasePath = HttpContext.Current.Server.MapPath("~/Web/Twitter/data/");
            FusionChartAppBasePath = HttpContext.Current.Server.MapPath("~/Web/FusionChart/data/");
            TwitterRelativePath = "/Web/Twitter/data/";

            Debug.WriteLine("Using graph path : " + GraphAppBasePath);
            Debug.WriteLine("Using graph path : " + ImageAppBasePath);
//            Debug.WriteLine("Using graph path : " + StaticHtmlBasePath);
            Debug.WriteLine("Using graph path : " + TwitterBasePath);
            Debug.WriteLine("Using graph path : " + FusionChartAppBasePath);

            try
            {
                Directory.CreateDirectory(TwitterBasePath);
                Directory.CreateDirectory(GraphAppBasePath);
                Directory.CreateDirectory(ImageAppBasePath);
                Directory.CreateDirectory(TwitterBasePath);
                Directory.CreateDirectory(FusionChartAppBasePath);
            }
            catch (Exception e)
            {
                Log.Error("failed to launch the Twitter App", e);
                return;
            }
            var apiAddress = (string) Configuration.Json.SelectToken("api_address");
            RestController = new RestController(new Uri(apiAddress));

            Debug.WriteLine("Using the following address a root api: " + apiAddress);

            CaveState = new CaveState(Cave.Layout.Nodes, Cave.Deployment.Sections, Section.Id);

        }

        #region CaveManagement

        public string GetCaveStateStatus()
        {
            Debug.WriteLine("Getting Twitter App Cave Status");

            return CaveState.CloneCaveState(Cave.Layout.Nodes, Cave.Deployment.Sections, Section.Id).SerializeJSON();

        }

        public void CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            CaveState.CreateSection(colStart, rowStart, colEnd, rowEnd);
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
                sectionRequest.AppInfo = GetVisualisation(sectionRequest.AnalyticsId, sectionRequest.DataSetId);
            }
            CaveState.QueueApps(sectionRequests);
        }


        public void CloseSections(List<int> sectionIds)
        {
            CaveState.CloseSections(sectionIds);
        }
        
        public void DeployApps(List<int> sectionIds)
        {
            CaveState.DeployApps(sectionIds);
        }

        public void CloseApps(List<int> sectionIds)
        {
            CaveState.CloseApps(sectionIds);
        }

        public void ConfirmLaunch(List<int> sectionIds)
        {
            CaveState.ConfirmLaunch(sectionIds);
        } 

        public void ClearCave()
        {
            CaveState.ClearCave();
        }

        #endregion

        #region API

        public void UnLoadVisualisation(int sectionId)
        {
            CaveState.Sections[sectionId].AppInfo = new AppInfo();
        }

        public void LoadVisualisation(int sectionId, string analyticsId, string dataSetId)
        {
            CaveState.LoadVisualisation(sectionId);
            CaveState.Sections[sectionId].AppInfo = GetVisualisation(analyticsId, dataSetId);

        }

        public AppInfo GetVisualisation(string analyticsId, string dataSetId)
        {
            Analytics analytics;
            if (RestController.Analytics != null && RestController.Analytics.ContainsKey(dataSetId) && RestController.Analytics[dataSetId].ContainsKey(analyticsId))
            {
                analytics = RestController.Analytics[dataSetId][analyticsId];
            }
            else
            {
                Debug.WriteLine("Not cached analytics so going to get");
                analytics = RestController.GetAnalytics(dataSetId, analyticsId, false);
            }

            AnalyticsData analyticsData = RestController.GetAnalyticsData(analytics.UriData);
            string url = analyticsData.Urls[analyticsData.PreferedUrl];

            // how AppInfo used
            AppInfo appInfo = new AppInfo(analyticsData.PreferedApp);
//            string fileName;
            switch (appInfo.AppType) {
                case "Graph":
                    appInfo.Config = "Default";
                    appInfo.FilePath = Download(url, GraphAppBasePath);
                    break;
                case "FusionChart":
                    appInfo.Config = "Default";
                    appInfo.FilePath = Download(url, FusionChartAppBasePath);
                    break;
                case "Images":
                    appInfo.Config = "Default";
                    appInfo.FilePath = Download(url, ImageAppBasePath);
                    break;
                default:
                    appInfo.Config = "ResponsiveBlack";
                    appInfo.FilePath = Path.Combine(TwitterRelativePath, Download(url, TwitterBasePath));
                    break;
            }

            appInfo.Id = analyticsId;
            appInfo.DataSetId = dataSetId;
            appInfo.SubType = analytics.Type;
            return appInfo;
        }

        private string Download(string url, string path)
        {
            if (!ReplaceExisting && DownloadCache.ContainsKey(url))
            {
                string existingFile = DownloadCache[url];
                if (File.Exists(Path.Combine(path, existingFile)))
                {
                    // if the file already exists,don't redownload
                    Debug.WriteLine("File already exists and redownload set to " + ReplaceExisting +
                                    " -  will not re download: " + Path.Combine(path, existingFile));
                    return existingFile;
                }
            }

            var fileName  = RestController.DownloadData(url, path);
            DownloadCache[url] = fileName;
            Debug.WriteLine("File name " + fileName);
            return fileName;
        }

        public StatusMsg GetApiMessage()
        {
            return RestController.GetApiMessage();
        }

        public string GetSlides()
        {
            return JsonConvert.SerializeObject(RestController.GetSlides());
        }

        public string GetDataSets()
        {
            return JsonConvert.SerializeObject(RestController.GetDataSetList());
        }

        public string GetAnalyticsOptions()
        {
            return JsonConvert.SerializeObject(RestController.GetAnalyticsOptions());
        }

        public string GetAnalytics(List<string> dataSetIds)
        {
            Dictionary<string, Dictionary<string, List<Analytics>>> groupedByClass =
                RestController.GetAnalyticsList(dataSetIds).ToDictionary(a => a.Key,
                    a => a.Value.Values.GroupBy(o => o.Classification).ToDictionary(g => g.Key, g => g.ToList()));
            return JsonConvert.SerializeObject(groupedByClass);
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

        public object GetFileLists()
        {

            Dictionary<string, List<string>> fileList = new Dictionary<string, List<string>>();
            
            fileList.Add("Graphs", Directory.GetFiles(GraphAppBasePath).Select(d=> d.Split('\\').Last()).ToList());
            fileList.Add("Images", Directory.GetFiles(ImageAppBasePath).Select(d => d.Split('\\').Last()).ToList());
            fileList.Add("Twitter", Directory.GetFiles(TwitterBasePath).Select(d => d.Split('\\').Last()).ToList());
            fileList.Add("Charts", Directory.GetFiles(FusionChartAppBasePath).Select(d => d.Split('\\').Last()).ToList());

            return JsonConvert.SerializeObject(fileList);
        }
    }
}