using System;
using GDO.Core;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.IO;
using System.Web;
using GDO.Core.Apps;
using log4net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Globe
{
    public class GlobeApp : IBaseAppInstance
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GlobeApp));
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }

        public Dictionary<string, Marker> GlobeMarkers { get; set; } = new Dictionary<string, Marker>();
        public string GlobeBasePath { get; set; }
        public void Init()
        {
            GlobeBasePath = HttpContext.Current.Server.MapPath("~/Web/Globe/markers/");
            try
            {
                Directory.CreateDirectory(GlobeBasePath);
            }
            catch (Exception e)
            {
                Log.Error("failed to launch the Globe App", e);
                return;
            }
        }

        public string Name { get; set; }
        
        public void Pan(int x, int y)
        {
            
        }

        public void Zoom(int i)
        {
            
        }

        public void Tilt(int i)
        {
            
        }

        public void UpdateState(float lat, float lng, float zoom)
        {
            
        }

        public string ProcessMarkers(int instanceId, string fileId)
        {
//            fileId = "user_coordinates.json";
            string filePath = Path.Combine(GlobeBasePath, fileId);
            Debug.WriteLine("Using file path: " + filePath);

            if (!File.Exists(filePath))
            {
                Debug.WriteLine("Nothing there " + filePath);
                return null;
            }

            List<Marker> markers;
            using (StreamReader r = new StreamReader(filePath))
            {
                string json = r.ReadToEnd();
                markers = JsonConvert.DeserializeObject<List<Marker>>(json);
            }

            foreach (var marker in markers)
            {
                Debug.WriteLine(marker.Id);
                GlobeMarkers.Add(marker.Id, marker);
            }
            
            return JsonConvert.SerializeObject(GlobeMarkers.Select(d => d.Value).ToList());
        }

        public List<Marker> HideAll()
        {
            return GlobeMarkers.Where(d => d.Value.IsVisible).Select(d =>
            {
                d.Value.IsVisible = false;
                return d.Value;
            }).ToList();
        }

        public List<Marker> ShowAll()
        {
            return GlobeMarkers.Where(d => !d.Value.IsVisible).Select(d =>
            {
                d.Value.IsVisible = true;
                return d.Value;
            }).ToList();
        }

        public Marker SetMarkerState(string markerId, bool isVisible)
        {
            GlobeMarkers[markerId].IsVisible = isVisible;
            Debug.WriteLine(GlobeMarkers[markerId].IsVisible);
            return GlobeMarkers[markerId];
        }
    }
}