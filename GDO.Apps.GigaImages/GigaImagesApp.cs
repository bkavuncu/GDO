using GDO.Core;
using GDO.Core.Apps;
using log4net;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.GigaImages
{
    public class GigaImagesAppConfig : AppJsonConfiguration {
        public Position Position { get; set; }
        public bool IsInitialized = false;
    }

    public class GigaImagesApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GigaImagesApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }

        #region config

        public GigaImagesAppConfig Configuration;
        public IAppConfiguration GetConfiguration() {
            return Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is GigaImagesAppConfig) {
                Configuration = (GigaImagesAppConfig)config;
                // todo signal update of config status
               
                return true;
            }
            Log.Info(" Giga Image app is loading with a default configuration");
            Configuration = (GigaImagesAppConfig)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new GigaImagesAppConfig { Name = "Default", Json = new JObject() };
        }

        #endregion 

        public Section Section { get; set; }
        
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        
        public void Init()
        {
            this.Configuration.Position = new Position {
                TopLeft = {
                    [0] = (float) Configuration.Json.SelectToken("topLeft[0]"),
                    [1] = (float) Configuration.Json.SelectToken("topLeft[1]")
                },
                Center = {
                    [0] = (float) Configuration.Json.SelectToken("center[0]"),
                    [1] = (float) Configuration.Json.SelectToken("center[1]")
                },
                BottomRight = {
                    [0] = (float) Configuration.Json.SelectToken("bottomRight[0]"),
                    [1] = (float) Configuration.Json.SelectToken("bottomRight[1]")
                },
                Zoom = (float) Configuration.Json.SelectToken("zoom"),
                Width = (float) Configuration.Json.SelectToken("width"),
                Height = (float) Configuration.Json.SelectToken("height")
            };
        }



        public void SetPosition(float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            this.Configuration.IsInitialized = true;
            this.Configuration.Position.TopLeft = topLeft;
            this.Configuration.Position.Center = center;
            this.Configuration.Position.BottomRight = bottomRight;
            this.Configuration.Position.Zoom = zoom;
            this.Configuration.Position.Width = width;
            this.Configuration.Position.Height = height;
        }

        public Position GetPosition()
        {
            return this.Configuration.Position;
        }

    }
    public class Position
    {
        public float[] TopLeft { get; set; }
        public float[] Center { get; set; }
        public float[] BottomRight { get; set; }
        public float Zoom { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
        public Position()
        {
            this.TopLeft = new float[2];
            this.Center = new float[2];
            this.BottomRight = new float[2];
            this.Zoom = 1;
            this.Width = 1;
            this.Height = 1;
        }
    }
}