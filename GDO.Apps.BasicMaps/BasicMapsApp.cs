using System.Collections.Generic;
using GDO.Core;
using GDO.Core.Apps;

namespace GDO.Apps.BasicMaps
{
    public class BasicMapsApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        

        #region config

        public AppJsonConfiguration Configuration;
        public IAppConfiguration GetConfiguration() {
            return Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                Configuration = (AppJsonConfiguration)config;
                // todo signal update of config status
                return true;
            }

            Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }

        #endregion 


        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public MapPosition Position { get; set; }
        public string[] MarkerPosition { get; set; }
        public int MaxLayers { get; set; } = 50;
        public bool[] LayerVisibility { get; set; }

        public bool IsInitialized = false;
        public void Init()
        {
            this.Position = new MapPosition {
                Center = {
                    [0] = (string) Configuration.Json.SelectToken("center[0]"),
                    [1] = (string) Configuration.Json.SelectToken("center[1]")
                },
                TopLeft = {
                    [0] = (string) Configuration.Json.SelectToken("topLeft[0]"),
                    [1] = (string) Configuration.Json.SelectToken("topLeft[1]")
                },
                BottomRight = {
                    [0] = (string) Configuration.Json.SelectToken("bottomRight[0]"),
                    [1] = (string) Configuration.Json.SelectToken("bottomRight[1]")
                },
                Resolution = (string) Configuration.Json.SelectToken("resolution"),
                Zoom = (int) Configuration.Json.SelectToken("zoom"),
                Width = (int) Configuration.Json.SelectToken("width"),
                Height = (int) Configuration.Json.SelectToken("height")
            };
            LayerVisibility = new bool[MaxLayers];
            for (int i = 0; i < MaxLayers; i++)
            {
                LayerVisibility[i] = false;
            }
            SetLayerVisible(0); // switch to the Nice Map
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
            Position = new MapPosition {
                TopLeft = topLeft,
                Center = center,
                BottomRight = bottomRight,
                Resolution = resolution,
                Width = width,
                Height = height,
                Zoom = zoom
            };
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