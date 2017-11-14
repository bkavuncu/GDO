using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Reflection;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Animations;
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Styles;
using GDO.Apps.Maps.Core.Formats;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using Configuration = GDO.Apps.Maps.Core.Configuration;
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    public class MapsApp : IBaseAppInstance
    {
        public JsonSerializerSettings JsonSettings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        #region config
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration)config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion
        public string[] MarkerPosition { get; set; }
        public Map Map;
        public string Label { get; set; }
        public string SubLabel { get; set; }
        public bool ShowLabel { get; set; }
        public Position Position { get; set; }
        public GenericDictionary<View> Views { get; set; }
        public GenericDictionary<Animation> Animations { get; set; }
        public GenericDictionary<Layer> Layers { get; set; }
        public GenericDictionary<Source> Sources { get; set; }
        public GenericDictionary<Style> Styles { get; set; }
        public GenericDictionary<Format> Formats { get; set; }
        public GenericDictionary<Core.Configuration> Configurations { get; set; }


        public bool IsInitialized = false;

        public void Init()
        {
            Views = new GenericDictionary<View>();
            Animations = new GenericDictionary<Animation>();
            Layers = new GenericDictionary<Layer>();
            Sources = new GenericDictionary<Source>();
            Styles = new GenericDictionary<Style>();
            Formats = new GenericDictionary<Format>();
            Configurations = new GenericDictionary<Core.Configuration>();

            Views.Init();
            Animations.Init();
            Layers.Init();
            Sources.Init();
            Styles.Init();
            Formats.Init();
            Configurations.Init();

            Map = Newtonsoft.Json.JsonConvert.DeserializeObject<Map>(Configuration.Json.ToString(), JsonSettings);

            Label = Map.Label;
            SubLabel = Map.SubLabel;
            ShowLabel = Map.ShowLabel;

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
            }
            foreach (Animation animation in Map.Animations)
            {
                Animations.Add((int)animation.Id.Value, animation);
            }
            foreach (View view in Map.Views)
            {
                Views.Add((int)view.Id.Value, view);
            }
            ExtractConfigurations();

            Position = Map.Position;
        }
        public string GetSerializedTemplate()
        {
            string serializedTemplate = Newtonsoft.Json.JsonConvert.SerializeObject(CreateEmptyTemplate(), JsonSettings);
            return serializedTemplate;
        }

        //Map

        public string GetSerializedMap()
        {
            Map = new Map(Label, SubLabel, ShowLabel, Position, Views.ToArray(), Formats.ToArray(), Styles.ToArray(), Sources.ToArray(), Layers.ToArray(), Animations.ToArray());
            string serializedMap = Newtonsoft.Json.JsonConvert.SerializeObject(Map, JsonSettings);
            return serializedMap;
        }

        public void SaveMap(string configName)
        {
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Configurations/Maps/");
            String filePath = basePath + configName + ".json";
            System.IO.File.WriteAllText(filePath, GetSerializedMap());
        }

        //Configurations

        public void ExtractConfigurations()
        {
            Configurations = new GenericDictionary<Configuration>();
            Configurations.Init();

            foreach (AppJsonConfiguration config in Cave.Deployment.Apps["Maps"].Configurations.Values)
            {
                Core.Configuration configuration = new Core.Configuration();
                configuration.Name.Value = config.Name;


                Map tempMap = Newtonsoft.Json.JsonConvert.DeserializeObject<Map>(config.Json.ToString(), JsonSettings);

                configuration.Label.Value = tempMap.Label;
                configuration.SubLabel.Value = tempMap.SubLabel;
                configuration.ShowLabel.Value = tempMap.ShowLabel;

                string[] tempAnimations = new string[tempMap.Animations.Length];
                for (int i = 0; i < tempMap.Animations.Length; i++)
                {
                    tempAnimations[i] = tempMap.Animations[i].Name.Value + " (" + tempMap.Animations[i].ClassName.Value + ")";
                }
                configuration.Animations.Values = tempAnimations;
                configuration.Animations.Length = tempAnimations.Length;

                string[] tempLayers = new string[tempMap.Layers.Length];
                for (int i=0; i< tempMap.Layers.Length; i++ )
                {
                    tempLayers[i] = tempMap.Layers[i].Name.Value + " (" + tempMap.Layers[i].ClassName.Value + ")";
                }
                configuration.Layers.Values = tempLayers;
                configuration.Layers.Length = tempLayers.Length;

                string[] tempSources = new string[tempMap.Sources.Length];
                for (int i = 0; i < tempMap.Sources.Length; i++)
                {
                    tempSources[i] = tempMap.Sources[i].Name.Value + " (" + tempMap.Sources[i].ClassName.Value + ")";
                }
                configuration.Sources.Values = tempSources;
                configuration.Sources.Length = tempSources.Length;

                string[] tempStyles = new string[tempMap.Styles.Length];
                for (int i = 0; i < tempMap.Styles.Length; i++)
                {
                    tempStyles[i] = tempMap.Styles[i].Name.Value + " (" + tempMap.Styles[i].ClassName.Value + ")";
                }
                configuration.Styles.Values = tempStyles;
                configuration.Styles.Length = tempStyles.Length;

                string[] tempFormats = new string[tempMap.Formats.Length];
                for (int i = 0; i < tempMap.Formats.Length; i++)
                {
                    tempFormats[i] = tempMap.Formats[i].Name.Value + " (" + tempMap.Formats[i].ClassName.Value + ")";
                }
                configuration.Formats.Values = tempFormats;
                configuration.Formats.Length = tempFormats.Length;

                string[] tempViews = new string[tempMap.Views.Length];
                for (int i = 0; i < tempMap.Views.Length; i++)
                {
                    tempViews[i] = tempMap.Views[i].Name.Value + " (" + tempMap.Views[i].ClassName.Value + ")";
                }
                configuration.Views.Values = tempViews;
                configuration.Views.Length = tempViews.Length;

                AddConfiguration(configuration);
            }
        }

        public int AddConfiguration(Core.Configuration configuration)
        {

            try
            {
                int configurationId = Configurations.GetAvailableSlot();
                configuration.Id.Value = configurationId;
                Configurations.Add(configurationId, configuration);
                return configurationId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool RemoveConfiguration(int configurationId)
        {
            try
            {
                Configurations.Remove(configurationId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetSerializedConfigurations()
        {
            string serializedConfigurations = Newtonsoft.Json.JsonConvert.SerializeObject(Configurations.ToArray(), JsonSettings);
            return serializedConfigurations;
        }

        public void UpdateLabel(string label, string sublabel)
        {
            Label = label;
            Map.Label = label;
            SubLabel = sublabel;
            Map.SubLabel = sublabel;
        }

        public void SetLabelVisible(bool visible)
        {
            ShowLabel = visible;
            Map.ShowLabel = visible;
        }

        //View
        public int AddView(View view)
        {

            try
            {
                int viewId = Views.GetAvailableSlot();
                view.Id.Value = viewId;
                Views.Add<View>(viewId, view);
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
                Views.Update<View>(viewId, view);
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
                    Console.WriteLine(e.ToString());
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
                View view = Views.GetValue<View>(viewId);
                Position.BottomRight = view.BottomRight.Values;
                Position.Center = view.Center.Values;
                Position.TopLeft = view.TopLeft.Values;
                Position.Resolution = view.Resolution.Value;
                Position.Width = view.Width.Value;
                Position.Height = view.Height.Value;
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public bool UsePosition(int viewId)
        {
            try
            {
                View view = Views.GetValue<View>(viewId);
                view.BottomRight.Values = Position.BottomRight;
                view.Center.Values = Position.Center;
                view.TopLeft.Values = Position.TopLeft;
                view.Resolution.Value = Position.Resolution;
                view.Width.Value = Position.Width;
                view.Height.Value = Position.Height;
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public bool UpdatePosition(float?[] topLeft, float?[] center, float?[] bottomRight, float? resolution, int? width, int? height)
        {
            try
            {
                Position.TopLeft = topLeft;
                Position.Center = center;
                Position.BottomRight = bottomRight;
                Position.Resolution = resolution;
                Position.Width = width;
                Position.Height = height;
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public void SetMarkerPosition(string[] pos)
        {
            MarkerPosition = pos;
        }

        public string[] GetMarkerPosition()
        {
            return MarkerPosition;
        }

        //Layer

        public int AddLayer<T>(Layer layer) where T : Layer
        {

            try
            {
                int layerId = Layers.GetAvailableSlot();
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
                foreach (PropertyInfo property in typeof(T).GetProperties())
                {
                    property.SetValue(Layers.GetValue<T>(layerId), property.GetValue(layer, null), null);
                }
                //Layers.Update<T>(layerId, layer);
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
                    Console.WriteLine(e.ToString());
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
                Layers.Remove(layerId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public T GetLayer<T>(int layerId) where T : Layer
        {
            try
            {
                return Layers.GetValue<T>(layerId);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        //Animation

        public int AddAnimation<T>(Animation animation) where T : Animation
        {

            try
            {
                int animationId = Animations.GetAvailableSlot();
                animation.Id.Value = animationId;
                Animations.Add<T>(animationId, (T)animation);
                return animationId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void UpdateAnimation<T>(int animationId, T animation) where T : Animation
        {
            try
            {
                foreach (PropertyInfo property in typeof(T).GetProperties())
                {
                    property.SetValue(Animations.GetValue<T>(animationId), property.GetValue(animation, null), null);
                }
                //Animations.Update<T>(animationId, animation);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }


        public string GetSerializedAnimation(int animationId)
        {
            Animation animation = null;
            if (Animations.Contains(animationId))
            {
                try
                {
                    animation = Animations.GetValue<Animation>(animationId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.ToString());
                    animation = null;
                }
            }

            if (animation != null)
            {
                string serializedAnimation = Newtonsoft.Json.JsonConvert.SerializeObject(Animations.GetValue<Animation>(animationId), JsonSettings);
                return serializedAnimation;
            }
            else
            {
                return null;
            }
        }

        public bool RemoveAnimation(int animationId)
        {
            try
            {
                Animations.Remove(animationId);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public T GetAnimation<T>(int animationId) where T : Animation
        {
            try
            {
                return Animations.GetValue<T>(animationId);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
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
                foreach (PropertyInfo property in typeof(T).GetProperties())
                {
                    property.SetValue(Sources.GetValue<T>(sourceId), property.GetValue(source, null), null);
                }
                //Sources.Update<T>(sourceId, source);
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
                    Console.WriteLine(e.ToString());
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
                foreach (PropertyInfo property in typeof(T).GetProperties())
                {
                    property.SetValue(Styles.GetValue<T>(styleId), property.GetValue(style, null), null);
                }
                //Styles.Update<T>(styleId, style);
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
                    Console.WriteLine(e.ToString());
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
                foreach (PropertyInfo property in typeof(T).GetProperties())
                {
                    property.SetValue(Formats.GetValue<T>(formatId), property.GetValue(format, null), null);
                }
                //Formats.Update<T>(formatId, format);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerializedFormat(int formatId)
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
                    Console.WriteLine(e.ToString());
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
            string label = "";
            string sublabel = "";
            List<Format> formats = new List<Format>();
            List<Style> styles = new List<Style>();
            List<Source> sources = new List<Source>();
            List<Layer> layers = new List<Layer>();
            List<Animation> animations = new List<Animation>();
            List<View> views = new List<View>();

            //Add Position to Template

            float?[] topLeft = { 0, 0};
            float?[] bottomRight = { 0, 0};
            float?[] center = { 0, 0};
            Position position = new Position(topLeft, center, bottomRight, 77, 100, 100);

            //Add View to Template
            View view = new View();
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
            GeoJSONStyle dynamicStyle = new GeoJSONStyle();
            GDO.Apps.Maps.Core.Styles.Style style = new GDO.Apps.Maps.Core.Styles.Style();


            styles.Add(circleStyle);
            styles.Add(fillStyle);
            styles.Add(iconStyle);
            styles.Add(imageStyle);
            styles.Add(regularShapeStyle);
            styles.Add(strokeStyle);
            styles.Add(textStyle);
            styles.Add(dynamicStyle);
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
            StaticVectorSource staticVectorSource = new StaticVectorSource();
            DynamicVectorSource dynamicVectorSource = new DynamicVectorSource();
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
            sources.Add(dynamicVectorSource);
            sources.Add(staticVectorSource);
            sources.Add(xyzSource);
            sources.Add(zoomifySource);

            //Add Layers to Template
            DynamicHeatmapLayer dynamicHeatmapLayer = new DynamicHeatmapLayer();
            StaticHeatmapLayer staticHeatmapLayer = new StaticHeatmapLayer();
            ImageLayer imageLayer = new ImageLayer();
            TileLayer tileLayer = new TileLayer();
            DynamicVectorLayer dynamicVectorLayer = new DynamicVectorLayer();
            StaticVectorLayer staticVectorLayer = new StaticVectorLayer();


            layers.Add(dynamicHeatmapLayer);
            layers.Add(staticHeatmapLayer);
            layers.Add(imageLayer);
            layers.Add(tileLayer);
            layers.Add(dynamicVectorLayer);
            layers.Add(staticVectorLayer);

            //Add Animations to Template

            GlobalAnimation globalAnimation = new GlobalAnimation();

            animations.Add(globalAnimation);

            //Return Map

            Map map = new Map(label, sublabel, false, position, views.ToArray(), formats.ToArray(), styles.ToArray(), sources.ToArray(), layers.ToArray(), animations.ToArray());
            return map;
        }

    }
}