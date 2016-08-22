﻿using System;
using System.Collections.Generic;
using GDO.Core;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
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
        
        public void Init()
        {
            GraphAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Graph/graphmls/");
            ImageAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            StaticHtmlBasePath = HttpContext.Current.Server.MapPath("~/Web/StaticHTML/");
            TwitterBasePath = HttpContext.Current.Server.MapPath("~/Web/Twitter/data/");
            FusionChartAppBasePath = HttpContext.Current.Server.MapPath("~/Web/FusionChart/data/");
            TwitterRelativePath = "/Web/Twitter/data/";

            Debug.WriteLine("Using graph path : " + GraphAppBasePath);
            Debug.WriteLine("Using graph path : " + ImageAppBasePath);
            Debug.WriteLine("Using graph path : " + StaticHtmlBasePath);
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
            Analytics analytics = RestController.Analytics[dataSetId][analyticsId];
            AnalyticsData analyticsData = RestController.GetAnalyticsData(analytics.UriData);
            string url = analyticsData.Urls[analyticsData.PreferedUrl];

            TwitterVis twitterVis = new TwitterVis(analyticsData.PreferedApp);
            switch (twitterVis.AppType) {
                case "Graph":
                    twitterVis.Config = "Default";
                    twitterVis.FilePath = Download(url, GraphAppBasePath + analyticsId + ".graphml");
                    break;
                case "FusionChart":
                    twitterVis.Config = "Default";
                    twitterVis.FilePath = Download(url, FusionChartAppBasePath + analyticsId + ".json");
                    break;
                default:
                    twitterVis.Config = "Responsive";
                    Download(url, TwitterBasePath + analyticsId + ".html");
                    twitterVis.FilePath = TwitterRelativePath + analyticsId + ".html";
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
    }
}