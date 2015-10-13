using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.ShanghaiMetro
{
    public class ShanghaiMetroApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public MapPosition Position { get; set; }
        
        public bool BingLayer { get; set; }
        public bool StamenLayer { get; set; }
        public bool StationLayer { get; set; }
        public bool LineLayer { get; set; }
        public bool HeatmapLayer { get; set; }


        public float Opacity { get; set; }
        public int Blur { get; set; }
        public int Radius { get; set; }
        public int StationWidth { get; set; }
        public int LineWidth { get; set; }
        public bool Entry { get; set; }
        public bool mode { get; set; }
        public string Style { get; set; }
        public bool IsInitialized = false;

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            this.mode = false;
            this.Position = new MapPosition();
            this.Position.Center[0] = (string)configuration.Json.SelectToken("center[0]");
            this.Position.Center[1] = (string)configuration.Json.SelectToken("center[1]");
            this.Position.TopLeft[0] = (string)configuration.Json.SelectToken("topLeft[0]");
            this.Position.TopLeft[1] = (string)configuration.Json.SelectToken("topLeft[1]");
            this.Position.BottomRight[0] = (string)configuration.Json.SelectToken("bottomRight[0]");
            this.Position.BottomRight[1] = (string)configuration.Json.SelectToken("bottomRight[1]");
            this.Position.Resolution = (string)configuration.Json.SelectToken("resolution");
            this.Position.Zoom = (int)configuration.Json.SelectToken("zoom");
            this.Position.Width = (int)configuration.Json.SelectToken("width");
            this.Position.Height = (int)configuration.Json.SelectToken("height");
            this.Blur = (int)configuration.Json.SelectToken("blur");
            this.Radius = (int)configuration.Json.SelectToken("radius");
            this.Opacity = (float) configuration.Json.SelectToken("opacity");
            this.StationWidth = (int)configuration.Json.SelectToken("station");
            this.LineWidth = (int)configuration.Json.SelectToken("line");
            this.Entry = (bool)configuration.Json.SelectToken("entry");
            this.BingLayer = true;
            this.StamenLayer = false;
            this.StationLayer = true;
            this.LineLayer = true;
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