using GDO.Core;
using System.Diagnostics;
using Newtonsoft.Json;
using GDO.Core.Apps;

namespace GDO.Apps.XNATImaging
{
    public class XNATImagingApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public string Name { get; set; }
        public int CurrentId { get; set; }
        public double WindowWidth { get; set; }
        public double WindowCenter { get; set; }
        public double Scale { get; set; }
        public double TranslationX { get; set; }
        public double TranslationY { get; set; }

        public string[,] ZoomConfigJson;
        public static int[,] ZoomConfiguration = {
                { 52, 53, 54 },
                { 36, 37, 38 },
                { 20, 21, 22 },
                { 4, 5, 6 }
            };

        public void Init()
        {
            InitConfigurations();
            ZoomConfigurations();
        }

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

        public void SetImage(int currentId, double windowWidth, double windowCenter, 
                                double scale, double translationX, double translationY)
        {
            CurrentId = currentId;
            WindowWidth = windowWidth;
            WindowCenter = windowCenter;
            Scale = scale;
            TranslationX = translationX;
            TranslationY = translationY;
        }

        public void ZoomConfigurations()
        {
            ZoomConfigJson = new string[ZoomConfiguration.GetLength(0), ZoomConfiguration.GetLength(1)];
            for (int i = 0; i < ZoomConfiguration.GetLength(0); i++)
            {
                for (int j = 0; j < ZoomConfiguration.GetLength(1); j++)
                {
                    ZoomConfigJson[i, j] = "{" +
                                        "   'url': 'GSK131086_000001/Baseline/flair'," +
                                        "   'topLeft': [ " + j + ", " + i + " ]," +
                                        "   'bottomRight': [ " + (j + 1) + ", " + (i + 1) + " ]," +
                                        "   'zoomId': " + (i * ZoomConfiguration.GetLength(1) + (j + 1)) + "," +
                                        "   'zoomFactor': 16" +
                                        "}";
                }
            }
        }

        public AppConfiguration GetZoomConfiguration(int nodeId)
        {

            for (int i = 0; i < ZoomConfiguration.GetLength(0); i++)
            {
                for (int j = 0; j < ZoomConfiguration.GetLength(1); j++)
                {
                    if (nodeId == ZoomConfiguration[i, j])
                    {
                        dynamic json = JsonConvert.DeserializeObject(ZoomConfigJson[i, j]);
                        return new AppConfiguration("Zoom" + nodeId, json);
                    }
                }
            }
            return null;
        }
        

        // test method
        public void InitConfigurations()
        {
            Debug.WriteLine(Configuration.Name);
            Debug.WriteLine(Configuration.Json);
            dynamic json = Configuration.Json;
            //ZoomConfiguration = json.zoomConfiguration;
        }
    }
}