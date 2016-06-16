using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Styles;
using GDO.Apps.Maps.Core.Formats;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Newtonsoft.Json;
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    public class MapsApp : IBaseAppInstance
    {
        public JsonSerializerSettings JsonSettings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }

        public Map Map;
        public int CurrentView { get; set; }
        public GenericDictionary<View> Views { get; set; }
        public GenericDictionary<Layer> Layers { get; set; }
        public GenericDictionary<Source> Sources { get; set; }
        public GenericDictionary<Style> Styles { get; set; }
        public GenericDictionary<Format> Formats { get; set; }
        public bool IsInitialized = false;

        public void Init()
        {
            Views = new GenericDictionary<View>();
            Layers = new GenericDictionary<Layer>();
            Sources = new GenericDictionary<Source>();
            Styles = new GenericDictionary<Style>();
            Formats = new GenericDictionary<Format>();
            Views.Init();
            Layers.Init();
            Sources.Init();
            Styles.Init();
            Formats.Init();

            Map = Newtonsoft.Json.JsonConvert.DeserializeObject<Map>(Configuration.Json.ToString(), JsonSettings);

            foreach (Format format in Map.Formats)
            {
                Formats.Add((int)format.Id.Value,format);
            }
            foreach (Style style in Map.Styles)
            {
                Styles.Add((int)style.Id.Value, style);
            }
            foreach (Source source in Map.Sources)
            {
                Sources.Add((int)source.Id.Value, source);
            }
            foreach (Layer layer in Map.Layers)
            {
                Layers.Add((int)layer.Id.Value, layer);
                //TODO update zindex
            }
            foreach (View view in Map.Views)
            {
                Views.Add(view.Id, view);
                //TODO update zindex
            }
            CurrentView = Map.CurrentView;
            SaveEmptyTemplate();
        }
        public string GetSerializedTemplate()
        {
            string serializedTemplate = Newtonsoft.Json.JsonConvert.SerializeObject(CreateEmptyTemplate(), JsonSettings);
            return serializedTemplate;
        }

        //Map

        public string GetSerializedMap()
        {
            Map = new Map(CurrentView, Views.ToArray(), Formats.ToArray(), Styles.ToArray(), Sources.ToArray(), Layers.ToArray());
            string serializedMap = Newtonsoft.Json.JsonConvert.SerializeObject(Map, JsonSettings);
            return serializedMap;
        }

        public void SaveMap(string configName)
        {
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Configurations/Maps/");
            String filePath = basePath + configName + ".json";
            System.IO.File.WriteAllText(filePath, GetSerializedMap());
        }

        //Feature / Animation

        //TODO Functions 



        //Layer

        public int AddLayer<T>(Layer layer) where T : Layer
        {

            try
            {
                int layerId = Layers.GetAvailableSlot();
                /*if (layer.ZIndex == -1)
                {
                    ZindexTable.AddLayer(layerId);
                }
                else
                {
                    ZindexTable.AddLayer(layerId, layer.ZIndex);
                }
                */
                layer.Id.Value = layerId;
                Layers.Add<T>(layerId, (T)layer);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }
        

        public void UpdateLayer<T>(int layerId, T layer) where T : Layer
        {
            try
            {
                Layers.Update<T>(layerId, layer);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
        

        public string GetSerializedLayer(int layerId)
        {
            Layer layer = null;
            if (Layers.Contains(layerId))
            {
                try
                {
                    layer = Layers.GetValue<Layer>(layerId);
                }
                catch (Exception e)
                {
                    layer = null;
                }
            }
            if (layer != null)
            {
                string serializedLayer = Newtonsoft.Json.JsonConvert.SerializeObject(Layers.GetValue<Layer>(layerId), JsonSettings);
                return serializedLayer;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveLayer(int layerId)
        {
            try
            {
                //ZindexTable.RemoveLayer(layerId);
                Layers.Remove(layerId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //View
        public int AddView(View view)
        {

            try
            {
                int viewId = Views.GetAvailableSlot();
                view.Id = viewId;
                Views.Add(viewId, view);
                return viewId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void UpdateView(int viewId, View view)
        {
            try
            {
                Views.Update(viewId, view);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }


        public string GetSerializedView(int viewId)
        {
            View view = null;
            if (Views.Contains(viewId))
            {
                try
                {
                    view = Views.GetValue<View>(viewId);
                }
                catch (Exception e)
                {
                    view = null;
                }
            }
            if (view != null)
            {
                string serializedView = Newtonsoft.Json.JsonConvert.SerializeObject(Views.GetValue<View>(viewId), JsonSettings);
                return serializedView;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveView(int viewId)
        {
            try
            {
                Views.Remove(viewId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }
        public bool UseView(int viewId)
        {
            try
            {
                CurrentView = viewId;
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public bool UpdateCurrentView(Position position, string projection, float rotation, int width, int height)
        {
            try
            {
                Views.GetValue<View>(CurrentView).Position = position;
                Views.GetValue<View>(CurrentView).Projection = projection;
                //Views.GetValue<View>(CurrentView).Rotation = rotation;
                Views.GetValue<View>(CurrentView).Width = width;
                Views.GetValue<View>(CurrentView).Height = height;
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetSerializedCurrentView()
        {
            string serializedView = Newtonsoft.Json.JsonConvert.SerializeObject(Views.GetValue<View>(CurrentView), JsonSettings);
            return serializedView;
        }

        //Interaction

        public int AddInteraction()
        {

            return -1;
        }

        public bool UpdateInteraction(int interactionId)
        {

            return false;
        }

        public string GetSerializedInteraction(int interactionId)
        {
            return "";
        }

        public bool RemoveInteraction(int interactionId)
        {

            return false;
        }

        //Source

        public int AddSource<T>(Source source) where T : Source
        {

            try
            {
                int sourceId = Sources.GetAvailableSlot();
                source.Id.Value = sourceId;
                Sources.Add<T>(sourceId, (T)source);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void UpdateSource<T>(int sourceId, T source) where T : Source
        {
            try
            {
                Sources.Update<T>(sourceId, source);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }


        public string GetSerializedSource(int sourceId)
        {
            Source source = null;
            if (Sources.Contains(sourceId))
            {
                try
                {
                    source = Sources.GetValue<Source>(sourceId);
                }
                catch (Exception e)
                {
                    source = null;
                }
            }

            if (source != null)
            {
                string serializedSource = Newtonsoft.Json.JsonConvert.SerializeObject(Sources.GetValue<Source>(sourceId), JsonSettings);
                return serializedSource;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveSource(int sourceId)
        {
            try
            {
                Sources.Remove(sourceId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //Control

        public int AddControl()
        {

            return -1;
        }

        public bool UpdateControl(int controlId)
        {

            return false;
        }

        public string GetSerializedControl(int controlId)
        {
            return "";
        }

        public bool RemoveControl(int controlId)
        {

            return false;
        }

        //Style
        public int AddStyle<T>(Style style) where T : Style
        {

            try
            {
                int styleId = Styles.GetAvailableSlot();
                style.Id.Value = styleId;
                Styles.Add<T>(styleId, (T)style);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void UpdateStyle<T>(int styleId, T style) where T : Style
        {
            try
            {
                Styles.Update<T>(styleId, style);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerializedStyle(int styleId)
        {
            Style style = null;
            if (Styles.Contains(styleId))
            {
                try
                {
                    style = Styles.GetValue<Style>(styleId);
                }
                catch (Exception e)
                {
                    style = null;
                }
            }
            if (style != null)
            {
                string serializedStyle = Newtonsoft.Json.JsonConvert.SerializeObject(Styles.GetValue<Style>(styleId), JsonSettings);
                return serializedStyle;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveStyle(int styleId)
        {
            try
            {
                Styles.Remove(styleId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //Format

        public int AddFormat<T>(Format format) where T : Format
        {

            try
            {
                int formatId = Formats.GetAvailableSlot();
                format.Id.Value = formatId;
                Formats.Add<T>(formatId, (T)format);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }


        public void UpdateFormat<T>(int formatId, T format) where T : Format
        {
            try
            {
                Formats.Update<T>(formatId, format);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerialezFormat(int formatId)
        {
            Format format = null;
            if (Formats.Contains(formatId))
            {
                try
                {
                    format = Formats.GetValue<Format>(formatId);
                }
                catch (Exception e)
                {
                    format = null;
                }
            }
            if (format != null)
            {
                string serializedFormat = Newtonsoft.Json.JsonConvert.SerializeObject(Formats.GetValue<Format>(formatId), JsonSettings);
                return serializedFormat;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveFormat(int formatId)
        {
            try
            {
                Formats.Remove(formatId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        //Utilities

        public void SaveEmptyTemplate()
        {
            String basePath = HttpContext.Current.Server.MapPath("~/Configurations/Maps/");
            String filePath = basePath + "template.json";
            string serializedMap = Newtonsoft.Json.JsonConvert.SerializeObject(CreateEmptyTemplate(), JsonSettings);
            System.IO.File.WriteAllText(filePath, serializedMap);
        }

        public Map CreateEmptyTemplate()
        {
            List<Format> formats = new List<Format>();
            List<Style> styles = new List<Style>();
            List<Source> sources = new List<Source>();
            List<Layer> layers = new List<Layer>();
            List<View> views = new List<View>();

            double[] topLeft = { 0, 0, 0, 0 };
            double[] bottomRight = { 0, 0, 0, 0 };
            double[] center = { 0, 0, 0, 0 };
            Position position = new Position(topLeft, center, bottomRight, 0, 0);
            View view = new View(position, "EPSG:4326",0, 100, 100);

            views.Add(view);

            //Add Formats to Template
            EsriJSONFormat esriJsonFormat = new EsriJSONFormat();
            GeoJSONFormat geoJsonFormat = new GeoJSONFormat();
            GMLFormat gmlFormat = new GMLFormat();
            KMLFormat kmlFormat = new KMLFormat();
            OSMXMLFormat osmXmlFormat = new OSMXMLFormat();
            TopoJSONFormat topoJsonFormat = new TopoJSONFormat();
            WFSFormat wfsFormat = new WFSFormat();
            XMLFormat xmlFormat = new XMLFormat();


            formats.Add(esriJsonFormat);
            formats.Add(geoJsonFormat);
            formats.Add(gmlFormat);
            formats.Add(kmlFormat);
            formats.Add(osmXmlFormat);
            formats.Add(topoJsonFormat);
            formats.Add(wfsFormat);
            formats.Add(xmlFormat);

            //Add Styles to Template
            CircleStyle circleStyle = new CircleStyle();
            FillStyle fillStyle = new FillStyle();
            IconStyle iconStyle = new IconStyle();
            ImageStyle imageStyle = new ImageStyle();
            RegularShapeStyle regularShapeStyle = new RegularShapeStyle();
            StrokeStyle strokeStyle = new StrokeStyle();
            TextStyle textStyle = new TextStyle();
            GDO.Apps.Maps.Core.Styles.Style style = new GDO.Apps.Maps.Core.Styles.Style();


            styles.Add(circleStyle);
            styles.Add(fillStyle);
            styles.Add(iconStyle);
            styles.Add(imageStyle);
            styles.Add(regularShapeStyle);
            styles.Add(strokeStyle);
            styles.Add(textStyle);
            styles.Add(style);

            //Add Sources to Template
            BingMapsSource bingMapsSource = new BingMapsSource();
            CartoDBSource cartoDBSource = new CartoDBSource();
            ImageTileSource imageTileSource = new ImageTileSource();
            MapQuestSource mapQuestSource = new MapQuestSource();
            OSMSource osmSource = new OSMSource();
            StamenSource stamenSource = new StamenSource();
            StaticImageSource staticImageSource = new StaticImageSource();
            TileArcGISRestSource tileArcGisRestSource = new TileArcGISRestSource();
            TileWMSSource tileWmsSource = new TileWMSSource();
            VectorSource vectorSource = new VectorSource();
            XYZSource xyzSource = new XYZSource();
            ZoomifySource zoomifySource = new ZoomifySource();

            sources.Add(bingMapsSource);
            sources.Add(cartoDBSource);
            sources.Add(imageTileSource);
            sources.Add(mapQuestSource);
            sources.Add(osmSource);
            sources.Add(stamenSource);
            sources.Add(staticImageSource);
            sources.Add(tileArcGisRestSource);
            sources.Add(tileWmsSource);
            sources.Add(vectorSource);
            sources.Add(xyzSource);
            sources.Add(zoomifySource);

            //Add Layers to Template
            HeatmapLayer heatmapLayer = new HeatmapLayer();
            ImageLayer imageLayer = new ImageLayer();
            TileLayer tileLayer = new TileLayer();
            VectorLayer vectorLayer = new VectorLayer();


            layers.Add(heatmapLayer);
            layers.Add(imageLayer);
            layers.Add(tileLayer);
            layers.Add(vectorLayer);

            Map map = new Map(0, views.ToArray(), formats.ToArray(), styles.ToArray(), sources.ToArray(), layers.ToArray());
            return map;
        }

    }
}