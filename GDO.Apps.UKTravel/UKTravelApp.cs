using GDO.Core;
using GDO.Core.Apps;

namespace GDO.Apps.UKTravel
{
    public class UKTravelApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public MapPosition Position { get; set; }
        
        public bool BingLayer { get; set; }
        public bool CartoDBLayer { get; set; }
        public bool OpenCycleLayer { get; set; }
        public bool StationLayer { get; set; }
        public bool HeatmapLayer { get; set; }
        public int TimeStep { get; set; } = 0;
        public bool IsAnimating { get; set; } = false;
        public int WaitTime { get; set; } = 840;

        public float Opacity { get; set; }
        public int Blur { get; set; }
        public int Radius { get; set; }
        public int StationWidth { get; set; }
        public string Dataserie { get; set; }
        public bool mode { get; set; }
        public string Style { get; set; }
        public bool IsInitialized = false;

        public void Init()
        {
            this.mode = false;
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
            this.Blur = (int)Configuration.Json.SelectToken("blur");
            this.Radius = (int)Configuration.Json.SelectToken("radius");
            this.Opacity = (float) Configuration.Json.SelectToken("opacity");
            this.StationWidth = (int)Configuration.Json.SelectToken("station");
            this.Dataserie = (string)Configuration.Json.SelectToken("dataserie");
            this.BingLayer = false;
            this.CartoDBLayer = true;
            this.OpenCycleLayer = false;
            this.StationLayer = true;
            this.HeatmapLayer = true;
            //TODO Read CSV into data dictionaries
        }

        public void SetMapPosition(string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height, int zoom)
        {
            IsInitialized = true;
            Position = new MapPosition
            {
                TopLeft = topLeft,
                Center = center,
                BottomRight = bottomRight,
                Resolution = resolution,
                Width = width,
                Height = height,
                Zoom = zoom
            };
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
