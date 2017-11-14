using System;
using GDO.Core;
using System.Diagnostics;
using System.IO;
using System.Web;
using GDO.Core.Apps;
using log4net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.FusionChart
{
    public class FusionChartAppConfig : AppJsonConfiguration {
        public string ChartBasePath { get; set; }
        public double ControlChartX { get; set; }
        public double ControlChart { get; set; }
        public string ChartData { get; set; }
    }

    public class FusionChartApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(FusionChartApp));
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        #region config

        public FusionChartAppConfig Configuration;
        public IAppConfiguration GetConfiguration() {
            return Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is FusionChartAppConfig) {
                Configuration = (FusionChartAppConfig)config;
                // todo signal update of config status
                
                return true;
            }
            Log.Info(" FusionChart app is loading with a default configuration");
            Configuration = (FusionChartAppConfig)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new FusionChartAppConfig { Name = "Default", Json = new JObject() };
        }

        #endregion

       
        public void Init()
        {
            this.Configuration.ChartBasePath = HttpContext.Current.Server.MapPath("~/Web/FusionChart/data/");
            try
            {
                Directory.CreateDirectory(this.Configuration.ChartBasePath);
            }
            catch (Exception e)
            {
                Log.Error("failed to launch the Fusion Chart App", e);
                return;
            }
        }

        public bool ProcessFile(string fileName)
        {
            string filePath = Path.Combine(this.Configuration.ChartBasePath, fileName);
            
            if (!File.Exists(filePath))
            {
                Log.Error("FusionChart - could not find file " + filePath);
                return false;
            }
            
            this.Configuration.ChartData = File.ReadAllText(filePath);
            
            return true;
        }

        public bool DeleteFile(string fileName) {
            string filePath = Path.Combine(this.Configuration.ChartBasePath, fileName);
            Log.Info("FusionChart app is about to delete file " + filePath);

            if (!File.Exists(filePath))
            {
                Log.Error("FusionChart - could not delete file " + filePath);
                return false;
            }

            File.Delete(filePath);

            return true;
        }

        public string GetChartData()
        {
            return this.Configuration.ChartData;
        }

        public string ProcessMouseEvent(string serialisedMouseEvent)
        {
            MouseEvent mouseEvent = JsonConvert.DeserializeObject<MouseEvent>(serialisedMouseEvent);
            Debug.WriteLine("Mouse event: x" + mouseEvent.x + " y:" + mouseEvent.y +
                            " SectionWidth" + Section.Width + " SectionHeight" + Section.Height + " ControlWidth: " +
                            mouseEvent.controlWidth + " ControlHeight: " + mouseEvent.controlHeight);
            mouseEvent.scaledX = mouseEvent.x*Section.Width/ mouseEvent.controlWidth;
            mouseEvent.scaledY = mouseEvent.y*Section.Height / mouseEvent.controlHeight;
            return JsonConvert.SerializeObject(mouseEvent);

        }

        public string ProcessSaveConfig(string config)
        {
            try
            {
                string path = Path.Combine(this.Configuration.ChartBasePath, DateTime.Now.ToString("ddMMMyyyy HHmmss") + ".json");
                Log.Info("FusionChart - saving config to "+path);
                File.WriteAllText(path, config);
                return path;
            }
            catch(Exception e) {
                Log.Info("FusionChart - Error saving configuration " + e);
                return "";
            }
        }
    }

    public class MouseEvent
    {
        public string eventType { get; set; }
        public double x { get; set; }
        public double y { get; set; }
        public double scaledX { get; set; }
        public double scaledY { get; set; }
        public double controlHeight { get; set; }
        public double controlWidth { get; set; }
        public string serialisedPath { get; set; }
    }
}