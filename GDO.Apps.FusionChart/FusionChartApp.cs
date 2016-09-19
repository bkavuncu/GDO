﻿using System;
using GDO.Core;
using System.Diagnostics;
using System.IO;
using System.Web;
using GDO.Core.Apps;
using log4net;
using Newtonsoft.Json;

namespace GDO.Apps.FusionChart
{
    public class FusionChartApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(FusionChartApp));
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }

        public string ChartBasePath { get; set; }
        public double ControlChartX { get; set; }
        public double ControlChart { get; set; }
        public string ChartData { get; set; }
        public void Init()
        {
            ChartBasePath = HttpContext.Current.Server.MapPath("~/Web/FusionChart/data/");
            try
            {
                Directory.CreateDirectory(ChartBasePath);
            }
            catch (Exception e)
            {
                Log.Error("failed to launch the Fusion Chart App", e);
                return;
            }
        }

        public bool ProcessFile(string fileName)
        {
            Debug.WriteLine(fileName);
            string filePath = Path.Combine(ChartBasePath, fileName);
            Debug.WriteLine("Using file path: " + filePath);

            if (!File.Exists(filePath))
            {
                Debug.WriteLine("Nothing there " + filePath);
                return false;
            }

            using (StreamReader r = new StreamReader(filePath))
            {
                ChartData = r.ReadToEnd();
            }

            return true;
        }

        public string GetChartData()
        {
            return ChartData;
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