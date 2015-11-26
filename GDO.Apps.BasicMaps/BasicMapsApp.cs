using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.BasicMaps
{
    public class BasicMapsApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IVirtualAppInstance ParentApp { get; set; }
        public MapPosition Position { get; set; }
        public string[] MarkerPosition { get; set; }
        public int MaxLayers { get; set; } = 35;
        public bool[] LayerVisibility { get; set; }

        public bool IsInitialized = false;
        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration, bool integrationMode)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            this.IntegrationMode = integrationMode;
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
            LayerVisibility = new bool[MaxLayers];
            for (int i = 0; i < MaxLayers; i++)
            {
                LayerVisibility[i] = false;
            }
            SetLayerVisible(1);
        }

        public void SetLayerVisible(int id)
        {
            if (LayerVisibility[id])
            {
                LayerVisibility[id] = false;
            }
            else
            {
                LayerVisibility[id] = true;
            }
        }

        public List<int> GetLayersVisible()
        {
            List<int> list = new List<int>();
            for (int i = 0; i < MaxLayers; i++)
            {
                if (LayerVisibility[i])
                {
                    list.Add(i);
                }
            }
            return list;
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

        public void SetMarkerPosition(string[] pos)
        {
            MarkerPosition = pos;
        }

        public MapPosition GetMapPosition()
        {
            return Position;
        }
        public string[] GetMarkerPosition()
        {
            return MarkerPosition;
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