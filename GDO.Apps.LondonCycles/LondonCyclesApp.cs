using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.LondonCycles
{
    public class LondonCyclesApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public MapPosition Position { get; set; }
        
        public bool BingLayer { get; set; }
        public bool StamenLayer { get; set; }
        public bool OpenCycleLayer { get; set; }
        public bool StationLayer { get; set; }
        public bool HeatmapLayer { get; set; }
        public int TimeStep { get; set; } = 0;
        public bool IsAnimating { get; set; } = false;
        public int WaitTime { get; set; } = 210;

        public float Opacity { get; set; }
        public int Blur { get; set; }
        public int Radius { get; set; }
        public int StationWidth { get; set; }
        public bool Entry { get; set; }
        public bool mode { get; set; }
        public string Style { get; set; }
        public bool IsInitialized = false;

        public void Init()
        {
            this.mode = false;
            this.Position = new MapPosition();
            this.Position.Center[0] = (string)Configuration.Json.SelectToken("center[0]");
            this.Position.Center[1] = (string)Configuration.Json.SelectToken("center[1]");
            this.Position.TopLeft[0] = (string)Configuration.Json.SelectToken("topLeft[0]");
            this.Position.TopLeft[1] = (string)Configuration.Json.SelectToken("topLeft[1]");
            this.Position.BottomRight[0] = (string)Configuration.Json.SelectToken("bottomRight[0]");
            this.Position.BottomRight[1] = (string)Configuration.Json.SelectToken("bottomRight[1]");
            this.Position.Resolution = (string)Configuration.Json.SelectToken("resolution");
            this.Position.Zoom = (int)Configuration.Json.SelectToken("zoom");
            this.Position.Width = (int)Configuration.Json.SelectToken("width");
            this.Position.Height = (int)Configuration.Json.SelectToken("height");
            this.Blur = (int)Configuration.Json.SelectToken("blur");
            this.Radius = (int)Configuration.Json.SelectToken("radius");
            this.Opacity = (float) Configuration.Json.SelectToken("opacity");
            this.StationWidth = (int)Configuration.Json.SelectToken("station");
            this.Entry = (bool)Configuration.Json.SelectToken("entry");
            this.BingLayer = false;
            this.StamenLayer = false;
            this.OpenCycleLayer = true;
            this.StationLayer = true;
            this.HeatmapLayer = true;
            //TODO Read CSV into data dictionaries
        }

        public void SetMapPosition(string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height, int zoom)
        {
            IsInitialized = true;
            Position = new MapPosition();
            Position.TopLeft = topLeft;
            Position.Center = center;
            Position.BottomRight = bottomRight;
            Position.Resolution = resolution;
            Position.Width = width;
            Position.Height = height;
            Position.Zoom = zoom;
        }

        public MapPosition GetMapPosition()
        {
            return Position;
        }
    }
    public class MapPosition
    {
        public string[] TopLeft { get; set; }
        public string[] Center { get; set; }
        public string[] BottomRight { get; set; }
        public string Resolution { get; set; }
        public int Zoom { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public MapPosition()
        {
            this.TopLeft = new string[2];
            this.Center = new string[2];
            this.BottomRight = new string[2];
            this.Resolution = "";
            this.Zoom = -1;
            this.Width = -1;
            this.Height = -1;
        }
    }
}
