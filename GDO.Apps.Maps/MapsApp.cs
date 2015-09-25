using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Sources.Tiles;
using GDO.Apps.Maps.Core.Styles;
using GDO.Apps.Maps.Formats;
using GDO.Core;
using GDO.Utility;
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    public class MapsApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public Map Map;
        public View View { get; set; }
        public GenericDictionary<Layer> Layers { get; set; }
        public GenericDictionary<Interaction> Interactions { get; set; }
        public GenericDictionary<Source> Sources { get; set; }
        public GenericDictionary<Control> Controls { get; set; }
        public GenericDictionary<Style> Styles { get; set; }
        public GenericDictionary<Format> Formats { get; set; }
        public bool IsInitialized = false;
        //public bool Mode { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            Layers.Init();
            Interactions.Init();
            Sources.Init();
            Controls.Init();
            Styles.Init();
            Formats.Init();

            Map = Newtonsoft.Json.JsonConvert.DeserializeObject<Map>(configuration.Json.ToString());

            foreach (Format format in Map.Formats)
            {
                Formats.Add(format.Id,format);
            }
            foreach (Style style in Map.Styles)
            {
                Styles.Add(style.Id, style);
            }
            foreach (Source source in Map.Sources)
            {
                Sources.Add(source.Id, source);
            }
            foreach (Layer layer in Map.Layers)
            {
                Layers.Add(layer.Id, layer);
            }
            View = Map.View;
        }

        //Map

        public string GetSerializedMap()
        {
            Map = new Map(View, Formats.ToArray(), Styles.ToArray(), Sources.ToArray(), Layers.ToArray());
            string serializedMap = Newtonsoft.Json.JsonConvert.SerializeObject(Map);
            return serializedMap;
        }

        public void SaveMap(string configName)
        {
            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Configurations\Maps\\";
            String filePath = basePath + configName + ".json";
            System.IO.File.WriteAllText(filePath, GetSerializedMap());
        }

        //Layer

        public int AddLayer<T> (string name, int type, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution) where T : Layer, new()
        {

            try
            {
                int layerId = Layers.GetAvailableSlot();
                T layer = new T();
                layer.Init(layerId, name, type, Sources.GetValue<Source>(sourceId), brightness, contrast, saturation, hue, opacity,
                    zIndex, visible, minResolution, maxResolution);
                Layers.Add<T>(layerId, layer);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyLayer(int id, string name, int type, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            try
            {
                Layers.GetValue<Core.Layer>(id).Modify(id, name, type, brightness, contrast, saturation,
                    hue, opacity, zIndex, visible, minResolution, maxResolution);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public int AddHeatmapLayer(string name, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float shadow, float weight, float blur)
        {
            try
            {
                int layerId = AddLayer<HeatmapLayer>(name, (int)LayerTypes.Heatmap, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<HeatmapLayer>(layerId).Init(gradient, radius, shadow, weight, blur);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyHeatmapLayer(int layerId, string name, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float blur)
        {
            try
            {
                ModifyLayer(layerId, name, (int)LayerTypes.Heatmap, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<HeatmapLayer>(layerId).Modify(gradient, radius, blur);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddImageLayer(string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            try
            {
                int layerId = AddLayer<ImageLayer>(name, (int)LayerTypes.Image, sourceId, brightness, contrast,
                    saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<ImageLayer>(layerId).Init();
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyImageLayer(int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            try
            {
                ModifyLayer(layerId, name, (int)LayerTypes.Image, brightness, contrast, saturation, hue, opacity,
                    zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<ImageLayer>(layerId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddTileLayer(string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            try
            {
                int layerId = AddLayer<TileLayer>(name, (int)LayerTypes.Tile, sourceId, brightness, contrast,
                    saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<TileLayer>(layerId).Init(preload);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyTileLayer(int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            try
            {
                ModifyLayer(layerId, name, (int)LayerTypes.Tile, brightness, contrast, saturation, hue, opacity,
                    zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<TileLayer>(layerId).Modify(preload);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddVectorLayer(string name, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity,
            int zIndex, bool visible, int minResolution, int maxResolution, int styleId, int renderBuffer, bool ModifyWhileAnimating, bool ModifyWhileInteracting)
        {
            try
            {
                int layerId = AddLayer<VectorLayer>(name, (int)LayerTypes.Vector, sourceId, brightness, contrast, saturation,
                    hue, opacity, zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<VectorLayer>(layerId).Init(Styles.GetValue<Style>(styleId), renderBuffer, ModifyWhileAnimating, ModifyWhileInteracting);
                return layerId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyVectorLayer(int layerId, string name, float brightness, float contrast, float saturation, float hue, float opacity,
            int zIndex, bool visible, int minResolution, int maxResolution, int styleId)
        {
            try
            {
                ModifyLayer(layerId, name, (int)LayerTypes.Vector, brightness, contrast, saturation, hue, opacity,
                    zIndex, visible, minResolution, maxResolution);
                Layers.GetValue<VectorLayer>(layerId).Modify(Styles.GetValue<Style>(styleId));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerializedLayer(int layerId)
        {
            Layer layer = Layers.GetValue<Layer>(layerId);
            if (layer != null)
            {
                string serializedLayer = Newtonsoft.Json.JsonConvert.SerializeObject(Layers.GetValue<Layer>(layerId));
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

        //View

        public bool ModifyView(Position position, float rotation, int width, int height)
        {
            try
            {
                View = new View(position, rotation, width, height);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public string GetSerializedView()
        {
            string serializedView = Newtonsoft.Json.JsonConvert.SerializeObject(View);
            return serializedView;
        }

        //Interaction

        public int AddInteraction()
        {

            return -1;
        }

        public bool ModifyInteraction(int interactionId)
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

        public int AddSource<T>(string name, int type) where T : Source, new()
        {
            try
            {
                int sourceId = Sources.GetAvailableSlot();
                T source = new T();
                source.Modify(sourceId, name, type);
                Sources.Add<T>(sourceId, source);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifySource(int id, string name, int type)
        {
            try
            {
                Sources.GetValue<Core.Source>(id).Modify(id, name, type);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        public int AddBingMapsSource(string name, string culture, string key, string imagerySet, int maxZoom)
        {
            try
            {
                int sourceId = AddSource<BingMapsSource>(name, (int)SourceTypes.BingMaps);
                Sources.GetValue<BingMapsSource>(sourceId).Init(culture, key, imagerySet, maxZoom);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyBingMapsSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.BingMaps);
                Sources.GetValue<BingMapsSource>(sourceId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddClusterSource(string name, int distance, double[] extent, int formatId, int vectorSourceId)
        {
            try
            {
                Format format = Formats.GetValue<Format>(formatId);
                int sourceId = AddSource<ClusterSource>(name, (int)SourceTypes.Cluster);
                Sources.GetValue<ClusterSource>(sourceId)
                    .Init(distance, extent, format, Sources.GetValue<VectorSource>(vectorSourceId));
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyClusterSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.Cluster);
                Sources.GetValue<ClusterSource>(sourceId)
                    .Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddStaticImageSource(string name, string crossOrigin, int width, int height, string url, double[] extent)
        {
            try
            {
                int sourceId = AddSource<StaticImageSource>(name, (int)SourceTypes.ImageStatic);
                Sources.GetValue<StaticImageSource>(sourceId).Init(crossOrigin, width, height, url, extent);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyStaticImageSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.ImageStatic);
                Sources.GetValue<StaticImageSource>(sourceId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddVectorImageSource(string name, int vectorSourceId, int styleId, double ratio)
        {
            try
            {
                VectorSource vectorSource = Sources.GetValue<VectorSource>(vectorSourceId);
                Style style = Styles.GetValue<Style>(styleId);
                int sourceId = AddSource<VectorImageSource>(name, (int)SourceTypes.ImageVector);
                Sources.GetValue<VectorImageSource>(sourceId).Init(vectorSource, style, ratio);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyVectorImageSource(int sourceId, string name, int styleId)
        {
            try
            {
                Style style = Styles.GetValue<Style>(styleId);
                ModifySource(sourceId, name, (int)SourceTypes.ImageVector);
                Sources.GetValue<VectorImageSource>(sourceId).Modify(style);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddImageTileSource(string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            try
            {
                int sourceId = AddSource<ImageTileSource>(name, (int)SourceTypes.TileImage);
                TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                Sources.GetValue<ImageTileSource>(sourceId).Init(crossOrigin, _tileGrid, opaque);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyImageTileSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.TileImage);
                Sources.GetValue<ImageTileSource>(sourceId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddJSONTileSource(string name, string url, string crossOrigin)
        {
            try
            {
                int sourceId = AddSource<JSONTileSource>(name, (int)SourceTypes.TileJSON);
                Sources.GetValue<JSONTileSource>(sourceId).Init(url, crossOrigin);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyJSONTileSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.TileJSON);
                Sources.GetValue<JSONTileSource>(sourceId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddXYZSource(string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions, string projection, string url)
        {
            try
            {
                int sourceId = AddSource<XYZSource>(name, (int)SourceTypes.XYZ);
                TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                Sources.GetValue<XYZSource>(sourceId).Init(crossOrigin, _tileGrid, opaque, projection, url);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyXYZSource(int sourceId, string name, string url)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.XYZ);
                Sources.GetValue<XYZSource>(sourceId).Modify(url);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddStamenSource(string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions, string projection, string url, string layer)
        {
            try
            {
                int sourceId = AddSource<StamenSource>(name, (int)SourceTypes.Stamen);
                TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                Sources.GetValue<StamenSource>(sourceId).Init(crossOrigin, _tileGrid, opaque, projection, url, layer);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyStamenSource(int sourceId, string name, string url)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.Stamen);
                Sources.GetValue<StamenSource>(sourceId).Modify(url);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddVectorTileSource(string name, string projection, string url, double[] extent, int formatId,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            try
            {
                TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                Format _format = Formats.GetValue<Format>(formatId);
                int sourceId = AddSource<JSONTileSource>(name, (int)SourceTypes.TileVector);
                Sources.GetValue<VectorTileSource>(sourceId).Init(_tileGrid, _format, projection, url);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyVectorTileSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.TileVector);
                Sources.GetValue<VectorTileSource>(sourceId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddVectorSource(string name, int formatId, string url, int loadingStrategy, bool useSpatialIndex)
        {
            try
            {
                Format format = Formats.GetValue<Format>(formatId);
                int sourceId = AddSource<VectorSource>(name, (int)SourceTypes.Vector);
                Sources.GetValue<VectorSource>(sourceId)
                    .Init(format, url, loadingStrategy, useSpatialIndex);
                return sourceId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyVectorSource(int sourceId, string name)
        {
            try
            {
                ModifySource(sourceId, name, (int)SourceTypes.Vector);
                Sources.GetValue<VectorSource>(sourceId)
                    .Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerializedSource(int sourceId)
        {
            Source source = Sources.GetValue<Source>(sourceId);
            if (source != null)
            {
                string serializedSource = Newtonsoft.Json.JsonConvert.SerializeObject(Sources.GetValue<Source>(sourceId));
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

        public bool ModifyControl(int controlId)
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
        public int AddStyle<T>(string name, int type) where T : Style, new()
        {
            try
            {
                int styleId = Styles.GetAvailableSlot();
                T style = new T();
                style.Modify(styleId, name, type);
                Styles.Add<T>(styleId, style);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyStyle(int id, string name, int type)
        {
            try
            {
                Styles.GetValue<Style>(id).Modify(id, name, type);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }


        public int AddCircleStyle(string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale, int radius, bool snapToPixel, int strokeId)
        {
            try
            {
                FillStyle fill = Styles.GetValue<FillStyle>(fillId);
                StrokeStyle stroke = Styles.GetValue<StrokeStyle>(strokeId);
                int styleId = AddStyle<CircleStyle>(name, (int)StyleTypes.Circle);
                Styles.GetValue<CircleStyle>(styleId)
                    .Init(fill, opacity, rotateWithView, rotation, scale, radius, snapToPixel, stroke);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyCircleStyle(int styleId, string name, float opacity, float rotation, float scale)
        {
            try
            {
                ModifyStyle(styleId, name, (int)StyleTypes.Circle);
                Styles.GetValue<CircleStyle>(styleId)
                    .Modify(opacity, rotation, scale);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddFillStyle(string name, string color)
        {
            try
            {
                int styleId = AddStyle<FillStyle>(name, (int)StyleTypes.Fill);
                Styles.GetValue<FillStyle>(styleId).Init(color);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyFillStyle(int styleId, string name, string color)
        {
            try
            {
                ModifyStyle(styleId, name, (int)StyleTypes.Fill);
                Styles.GetValue<FillStyle>(styleId).Modify(color);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddIconStyle(string name, string crossOrigin, float[] anchor, string anchorOrigin, float[] offset, string offsetOrigin,
            float opacity, float scale, bool snapToPixel, bool rotateWithView, float rotation, int width, int height, int imageWidth,
            int imageHeight, string imageSource)
        {
            try
            {
                int styleId = AddStyle<IconStyle>(name, (int)StyleTypes.Icon);
                Styles.GetValue<IconStyle>(styleId)
                        .Init(crossOrigin, anchor, anchorOrigin, offset, offsetOrigin, opacity, scale, snapToPixel,
                            rotateWithView, rotation, width, height, imageWidth, imageHeight, imageSource);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyIconStyle(int styleId, string name, float opacity, float scale, float rotation)
        {
            try
            {
                ModifyStyle(styleId, name, (int)StyleTypes.Icon);
                Styles.GetValue<IconStyle>(styleId)
                        .Modify(opacity, scale, rotation);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddStrokeStyle(string name, string color, int lineCap, int lineJoin, int[] lineDash,
            int miterLimit, int width)
        {
            try
            {
                int styleId = AddStyle<StrokeStyle>(name, (int)StyleTypes.Stroke);
                Styles.GetValue<StrokeStyle>(styleId)
                        .Init(color, lineCap, lineJoin, lineDash, miterLimit, width);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyStrokeStyle(int styleId, string name, string color, int lineCap, int lineJoin, int[] lineDash,
            int miterLimit, int width)
        {
            try
            {
                ModifyStyle(styleId, name, (int)StyleTypes.Stroke);
                Styles.GetValue<StrokeStyle>(styleId)
                        .Modify(color, lineCap, lineJoin, lineDash, miterLimit, width);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddRegularShapeStyle(string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale,
            int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeId)
        {
            try
            {
                FillStyle fill = Styles.GetValue<FillStyle>(fillId);
                StrokeStyle stroke = Styles.GetValue<StrokeStyle>(strokeId);
                int styleId = AddStyle<RegularShapeStyle>(name, (int)StyleTypes.RegularShape);
                Styles.GetValue<RegularShapeStyle>(styleId)
                    .Init(fill, opacity, rotateWithView, rotation, scale, points, radius,
                        radius1, radius2, angle, snapToPixel, stroke);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyRegularShapeStyle(int styleId, string name, float opacity, float rotation, float scale)
        {
            try
            {
                ModifyStyle(styleId, name, (int)StyleTypes.RegularShape);
                Styles.GetValue<RegularShapeStyle>(styleId)
                    .Modify(opacity, rotation, scale);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        //TODO ol.style.Style

        public int AddTextStyle(string name, string font, int offsetX, int offsetY, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillId, int strokeId)
        {
            try
            {
                FillStyle fill = Styles.GetValue<FillStyle>(fillId);
                StrokeStyle stroke = Styles.GetValue<StrokeStyle>(strokeId);
                int styleId = AddStyle<TextStyle>(name, (int)StyleTypes.Text);
                Styles.GetValue<TextStyle>(styleId)
                    .Init(font, offsetX, offsetY, scale, rotation, content, textAlign,
                        textBaseLine, fill, stroke);
                return styleId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyTextStyle(int styleId, string name, string font, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillId, int strokeId)
        {
            try
            {
                FillStyle fill = Styles.GetValue<FillStyle>(fillId);
                StrokeStyle stroke = Styles.GetValue<StrokeStyle>(strokeId);
                ModifyStyle(styleId, name, (int)StyleTypes.Text);
                Styles.GetValue<TextStyle>(styleId)
                    .Modify(font, scale, rotation, content, textAlign, textBaseLine, fill, stroke);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public string GetSerializedStyle(int styleId)
        {
            Style style = Styles.GetValue<Style>(styleId);
            if (style != null)
            {
                string serializedStyle = Newtonsoft.Json.JsonConvert.SerializeObject(Styles.GetValue<Style>(styleId));
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

        public int AddFormat<T>(string name, int type) where T : Format, new()
        {
            try
            {
                int formatId = Formats.GetAvailableSlot();
                T format = new T();
                format.Modify(formatId, name, type);
                Formats.Add<T>(formatId, format);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public bool ModifyFormat(int id, string name, int type)
        {
            try
            {
                Formats.GetValue<Format>(id).Modify(id, name, type);
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }


        public int AddEsriJSONFormat(string name, string geometryName)
        {
            try
            {
                int formatId = AddFormat<EsriJSONFormat>(name, (int)FormatTypes.EsriJSON);
                Formats.GetValue<EsriJSONFormat>(formatId).Init(geometryName);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyEsriJSONFormat(int formatId, string name)
        {
            try
            {
                ModifyFormat(formatId, name, (int)FormatTypes.EsriJSON);
                Formats.GetValue<EsriJSONFormat>(formatId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddGeoJSONFormat(string name, string geometryName)
        {
            try
            {
                int formatId = AddFormat<GeoJSONFormat>(name, (int)FormatTypes.GeoJSON);
                Formats.GetValue<GeoJSONFormat>(formatId).Init(geometryName);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyGeoJSONFormat(int formatId, string name)
        {
            try
            {
                ModifyFormat(formatId, name, (int)FormatTypes.GeoJSON);
                Formats.GetValue<GeoJSONFormat>(formatId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddGMLFormat(string name, int gmlVersion, string[] featureNS, string[] featureType, string srsName, bool surface,
            bool curve, bool multiCurve, bool multiSurface, string schemaLocation)
        {
            try
            {
                int formatId;
                switch (gmlVersion)
                {
                    case 0:
                        formatId = AddFormat<GMLFormat>(name, (int)FormatTypes.GMLBase);
                        break;
                    case 1:
                        formatId = AddFormat<GMLFormat>(name, (int)FormatTypes.GML);
                        break;
                    case 2:
                        formatId = AddFormat<GMLFormat>(name, (int)FormatTypes.GML2);
                        break;
                    case 3:
                        formatId = AddFormat<GMLFormat>(name, (int)FormatTypes.GML3);
                        break;
                    default:
                        formatId = AddFormat<GMLFormat>(name, (int)FormatTypes.GML3);
                        break;
                }
                Formats.GetValue<GMLFormat>(formatId)
                        .Init(gmlVersion, featureNS, featureType, srsName, surface, curve, multiCurve, multiSurface, schemaLocation);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyGMLFormat(int formatId, string name, int gmlVersion)
        {
            try
            {
                ModifyFormat(formatId, name, gmlVersion);
                Formats.GetValue<GMLFormat>(formatId).Modify();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public int AddKMLFormat(string name, bool extractStyles, int[] styleIds)
        {
            try
            {
                List<Style> defaultStyle = new List<Style>();
                foreach (int styleId in styleIds)
                {
                    defaultStyle.Add(Styles.GetValue<Style>(styleId));
                }
                int formatId = AddFormat<KMLFormat>(name, (int)FormatTypes.KML);
                Formats.GetValue<KMLFormat>(formatId).Init(defaultStyle, extractStyles);
                return formatId;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return -1;
            }
        }

        public void ModifyKMLFormat(int formatId, string name)
        {
                try
                {

                    ModifyFormat(formatId, name, (int)FormatTypes.KML);
                    Formats.GetValue<KMLFormat>(formatId).Modify();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
        }

        public string GetFormat(int formatId)
        {
            Format format = Formats.GetValue<Format>(formatId);
            if (format != null)
            {
                string serializedFormat = Newtonsoft.Json.JsonConvert.SerializeObject(Formats.GetValue<Format>(formatId));
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

    }
}