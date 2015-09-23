using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Geometries;
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Sources.Tiles;
using GDO.Apps.Maps.Core.Styles;
using GDO.Apps.Maps.Formats;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    [Export(typeof (IAppHub))]
    public class MapsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Maps";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new MapsApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void Set3DMode(int instanceId, bool mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]).Mode = mode;
                    Clients.Group("" + instanceId).receive3DMode(instanceId, mode);
                    Clients.Caller.receive3DMode(instanceId, mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }

            }
        }

        public void Request3DMode(int instanceId, bool control)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receive3DMode(instanceId, ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]).Mode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateResolution(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.updateResolution(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Map

        public void InitMap(int instanceId, int[] layerIds, int[] interactionIds, int[] controlIds, int viewId, int width, int height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    List<Layer> layers = new List<Layer>();
                    List<Interaction> interactions = new List<Interaction>();
                    List<Control> controls = new List<Control>();
                    foreach (int layerId in layerIds)
                    {
                        layers.Add(maps.Layers.GetValue<Layer>(layerId));
                    }
                    foreach (int interactionId in interactionIds)
                    {
                        interactions.Add(maps.Interactions.GetValue<Interaction>(interactionId));
                    }
                    foreach (int controlId in controlIds)
                    {
                        controls.Add(maps.Controls.GetValue<Control>(controlId));
                    }
                    View view = maps.Views.GetValue<View>(viewId);
                    maps.InitMap(layers.ToArray(), interactions.ToArray(), controls.ToArray(), view, width, height);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestMap(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedMap = maps.GetSerializedMap();
                    if (serializedMap != null)
                    {
                        Clients.Caller.receiveMap(instanceId, serializedMap, true);
                    }
                    else
                    {
                        Clients.Caller.receiveMap(instanceId, "", false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastMap(int instanceId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedMap = maps.GetSerializedMap();
                if (serializedMap != null)
                {
                    Clients.Group("" + instanceId).receiveMap(instanceId, serializedMap, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveMap(instanceId, serializedMap, false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        //Layer

        public void UpdateHeatmapLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float shadow, float weight, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    if (layerId == -1)
                    {
                        layerId = maps.AddLayer<HeatmapLayer>(name, (int) LayerTypes.Heatmap, sourceId, brightness, contrast, saturation,
                            hue, opacity, zIndex, visible, minResolution, maxResolution);
                    }
                    else
                    {
                        maps.ModifyLayer(layerId, name, (int)LayerTypes.Base, sourceId, brightness, contrast, saturation, hue, opacity,
                             zIndex, visible, minResolution, maxResolution);
                    }
                        maps.Layers.GetValue<HeatmapLayer>(layerId).Modify(gradient, radius, shadow, weight, blur);
                        BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (layerId == -1)
                    {
                        layerId = maps.AddLayer<ImageLayer>(name, (int) LayerTypes.Image, sourceId, brightness, contrast,
                            saturation,
                            hue, opacity, zIndex, visible, minResolution, maxResolution);
                    }
                    else
                    {
                        maps.ModifyLayer(layerId, name, (int)LayerTypes.Image, sourceId, brightness, contrast, saturation, hue, opacity,
                            zIndex, visible, minResolution, maxResolution);
                    }
                    maps.Layers.GetValue<ImageLayer>(layerId).Modify();
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTileLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    if (layerId == -1)
                    {
                        layerId = maps.AddLayer<TileLayer>(name, (int)LayerTypes.Tile, sourceId, brightness, contrast,
                            saturation,
                            hue, opacity, zIndex, visible, minResolution, maxResolution);
                    }
                    else
                    {
                        maps.ModifyLayer(layerId, name, (int)LayerTypes.Tile, sourceId, brightness, contrast, saturation, hue, opacity,
                            zIndex, visible, minResolution, maxResolution);
                    }
                    maps.Layers.GetValue<TileLayer>(layerId).Modify(preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity,
            int zIndex, bool visible, int minResolution, int maxResolution, int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (layerId == -1)
                    {
                        layerId = maps.AddLayer<VectorLayer>(name, (int) LayerTypes.Vector, sourceId, brightness, contrast ,saturation,
                            hue, opacity, zIndex, visible, minResolution, maxResolution);
                    }
                    else
                    {
                        maps.ModifyLayer(layerId, name, (int)LayerTypes.Vector, sourceId, brightness, contrast, saturation, hue, opacity,
                            zIndex, visible, minResolution, maxResolution);
                    }
                    maps.Layers.GetValue<VectorLayer>(layerId).Modify(maps.Styles.GetValue<Style>(styleId), renderBuffer, updateWhileAnimating, updateWhileInteracting);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }



        public void RequestLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedLayer = maps.GetSerializedLayer(layerId);
                    if (serializedLayer != null)
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type,
                            serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, "",
                            false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastLayer(int instanceId, int layerId)
        {
            try
            {
                MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                string serializedLayer = maps.GetSerializedLayer(layerId);
                if (serializedLayer != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, serializedLayer,
                            true);
                }
                else
                {
                    Clients.Group("" + instanceId)
                        .receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RemoveLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveLayer(layerId);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //View

        public void UpdateView(int instanceId, int viewId, double[] topLeft, double[] center, double[] bottomRight, float resolution,
            int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    if (viewId == -1)
                    {
                        viewId = maps.AddView(position, minResolution, maxResolution, minZoom, maxZoom, projection,
                            rotation);
                    }
                    else
                    {
                        maps.ModifyView(viewId, position, minResolution, maxResolution, minZoom, maxZoom,projection, rotation);
                    }
                    BroadcastView(instanceId, viewId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestView(int instanceId, int viewId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetSerializedView(viewId);
                    if (serializedView != null)
                    {
                        Clients.Caller.receiveview(instanceId, viewId, serializedView, true);
                    }
                    else
                    {
                        Clients.Caller.receiveview(instanceId, viewId, "", false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastView(int instanceId, int viewId)
        {
            MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
            string serializedView = maps.GetSerializedView(viewId);
            if (serializedView != null)
            {
                Clients.Group("" + instanceId).receiveView(instanceId, viewId, serializedView, true);
            }
            else
            {
                Clients.Group("" + instanceId).receiveLayer(instanceId, viewId, "", false);
            }
        }

        public void RemoveView(int instanceId, int viewId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveView(viewId);
                    BroadcastView(instanceId, viewId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Interaction

        public void UpdateInteraction(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestInteraction(int instanceId, int interactionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RemoveInteraction(int instanceId, int interactionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Source

        public void UpdateBingMapsSource(int instanceId, int sourceId, string name, string culture, string key, string imagerySet, int maxZoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<BingMapsSource>(name, (int) SourceTypes.BingMaps);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int) SourceTypes.BingMaps);
                    }
                    maps.Sources.GetValue<BingMapsSource>(sourceId).Modify(culture, key, imagerySet, maxZoom);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateClusterSource(int instanceId, int sourceId, string name, int distance, double[] extent, int formatId, int vectorSourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    Format format = maps.Formats.GetValue<Format>(formatId);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<ClusterSource>(name, (int) SourceTypes.Cluster);

                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.Cluster);
                    }
                    maps.Sources.GetValue<ClusterSource>(sourceId)
                        .Modify(distance, extent, format, maps.Sources.GetValue<VectorSource>(vectorSourceId));
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStaticImageSource(int instanceId, int sourceId, string name, int width, int height, string url, double[] extent)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<StaticImageSource>(name, (int) SourceTypes.ImageStatic);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.ImageStatic);
                    }
                    maps.Sources.GetValue<StaticImageSource>(sourceId).Modify(width, height, url, extent);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorImageSource(int instanceId, int sourceId, string name, int vectorSourceId, int styleId, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    VectorSource vectorSource = maps.Sources.GetValue<VectorSource>(vectorSourceId);
                    Style style = maps.Styles.GetValue<Style>(styleId);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<VectorImageSource>(name, (int) SourceTypes.ImageVector);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.ImageVector);
                    }
                    maps.Sources.GetValue<VectorImageSource>(sourceId).Modify(vectorSource, style, ratio);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageTileSource(int instanceId, int sourceId, string name, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<ImageTileSource>(name, (int) SourceTypes.TileImage);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.TileImage);
                    }
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth,  tileHeight, resolutions);
                    maps.Sources.GetValue<ImageTileSource>(sourceId).Modify(_tileGrid, opaque);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateJSONTileSource(int instanceId, int sourceId, string name, string url, string crossOrigin)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<JSONTileSource>(name, (int) SourceTypes.TileJSON);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.TileJSON);
                    }
                    maps.Sources.GetValue<JSONTileSource>(sourceId).Modify(url, crossOrigin);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorTileSource(int instanceId, int sourceId, string name, string projection, string url, double[] extent, int formatId,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                    Format _format = maps.Formats.GetValue<Format>(formatId);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<JSONTileSource>(name, (int) SourceTypes.TileVector);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.TileVector);
                    }
                    maps.Sources.GetValue<VectorTileSource>(sourceId).Modify(_tileGrid, _format, projection, url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorSource(int instanceId, int sourceId, string name, int formatId, string url, int loadingStrategy, bool useSpatialIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    Format format = maps.Formats.GetValue<Format>(formatId);
                    if (sourceId == -1)
                    {
                        sourceId = maps.AddSource<VectorSource>(name, (int) SourceTypes.Vector);
                    }
                    else
                    {
                        maps.ModifySource(sourceId, name, (int)SourceTypes.Vector);
                    }
                    maps.Sources.GetValue<VectorSource>(sourceId)
                        .Modify(format, url, loadingStrategy, useSpatialIndex);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestSource(int instanceId, int sourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedSource = maps.GetSerializedSource(sourceId);
                    if (serializedSource != null)
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type,
                            serializedSource, true);
                    }
                    else
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type,
                            "", false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastSource(int instanceId, int sourceId)
        {
            try
            {
                MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                string serializedSource = maps.GetSerializedSource(sourceId);
                if (serializedSource != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type,
                            serializedSource, true);
                }
                else
                {
                    Clients.Group("" + instanceId)
                        .receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RemoveSource(int instanceId, int sourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveSource(sourceId);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Control

        public void UpdateControl(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestControl(int instanceId, int controlId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RemoveControl(int instanceId, int controlId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Style

        public void UpdateCircleStyle(int instanceId, int styleId, string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale, int radius, bool snapToPixel, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<CircleStyle>(name, (int) StyleTypes.Circle);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.Circle);
                    }
                    maps.Styles.GetValue<CircleStyle>(styleId)
                        .Modify(fill, opacity, rotateWithView, rotation, scale, radius, snapToPixel, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateFillStyle(int instanceId, int styleId, string name, string color)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<FillStyle>(name, (int) StyleTypes.Fill);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.Fill);
                    }
                    maps.Styles.GetValue<FillStyle>(styleId).Modify(color);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateIconStyle(int instanceId, int styleId, string name, float[] anchor, int anchorOrigin, float[] offset,int offsetOrigin,
            float opacity, float scale, bool snapToPixel, bool rotateWithView, float rotation, int width, int height, int imageWidth,
            int imageHeight, string imageSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<IconStyle>(name, (int) StyleTypes.Icon);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.Icon);
                    }
                    maps.Styles.GetValue<IconStyle>(styleId)
                            .Modify(anchor, anchorOrigin, offset, offsetOrigin, opacity, scale, snapToPixel,
                                rotateWithView, rotation, width, height, imageWidth, imageHeight, imageSource);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStrokeStyle(int instanceId, int styleId, string name, string color, int lineCap, int lineJoin, int[] lineDash,
            int miterLimit, int width)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<StrokeStyle>(name, (int) StyleTypes.Stroke);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.Stroke);
                    }
                    maps.Styles.GetValue<StrokeStyle>(styleId)
                            .Modify(color, lineCap, lineJoin, lineDash, miterLimit, width);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTextStyle(int instanceId, int styleId, string name, string font, int offsetX, int offsetY, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillId, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<TextStyle>(name, (int) StyleTypes.Text);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.Text);
                    }
                    maps.Styles.GetValue<TextStyle>(styleId)
                        .Modify(font, offsetX, offsetY, scale, rotation, content, textAlign,
                            textBaseLine, fill, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateRegularShapeStyle(int instanceId, int styleId, string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale,
            int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    if (styleId == -1)
                    {
                        styleId = maps.AddStyle<RegularShapeStyle>(name, (int) StyleTypes.RegularShape);
                    }
                    else
                    {
                        maps.ModifyStyle(styleId, name, (int)StyleTypes.RegularShape);
                    }
                    maps.Styles.GetValue<RegularShapeStyle>(styleId)
                        .Modify(fill, opacity, rotateWithView, rotation, scale, points, radius,
                            radius1, radius2, angle, snapToPixel, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        
        public void RequestStyle(int instanceId, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedStyle = maps.GetSerializedStyle(styleId);
                    if (serializedStyle != null)
                    {
                        Clients.Caller.receiveStyle(instanceId, styleId, maps.Styles.GetValue<Style>(styleId).Type,
                            serializedStyle, true);
                    }
                    else
                    {
                        Clients.Caller.receiveStyle(instanceId, styleId, maps.Styles.GetValue<Style>(styleId).Type, "",
                            false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastStyle(int instanceId, int styleId)
        {
            try
            {
                MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                string serializedStyle = maps.GetSerializedStyle(styleId);
                if (serializedStyle != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveStyle(instanceId, styleId, maps.Styles.GetValue<Style>(styleId).Type, serializedStyle,
                            true);
                }
                else
                {
                    Clients.Group("" + instanceId)
                        .receiveStyle(instanceId, styleId, maps.Styles.GetValue<Style>(styleId).Type, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RemoveStyle(int instanceId, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveStyle(styleId);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Format

        public void UpdateEsriJSONFormat(int instanceId, int formatId, string name, string geometryName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    if (formatId == -1)
                    {
                        formatId = maps.AddFormat<EsriJSONFormat>(name, (int) FormatTypes.EsriJSON);
                    }
                    else
                    {
                        maps.ModifyFormat(formatId, name, (int)FormatTypes.EsriJSON);
                    }
                    maps.Formats.GetValue<EsriJSONFormat>(formatId).Modify(geometryName);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateGeoJSONFormat(int instanceId, int formatId, string name, string geometryName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    if (formatId == -1)
                    {
                        formatId = maps.AddFormat<GeoJSONFormat>(name, (int) FormatTypes.GeoJSON);
                    }
                    else
                    {
                        maps.ModifyFormat(formatId, name, (int)FormatTypes.GeoJSON);
                    }
                    maps.Formats.GetValue<GeoJSONFormat>(formatId).Modify(geometryName);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateGMLFormat(int instanceId, int formatId, string name, int gmlVersion, string[] featureNS, string[] featureType, string srsName, bool surface,
            bool curve, bool multiCurve, bool multiSurface, string schemaLocation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    if (formatId == -1)
                    {
                        switch (gmlVersion)
                        {
                            case 0:
                                formatId = maps.AddFormat<GMLFormat>(name, (int) FormatTypes.GMLBase);
                                break;
                            case 1:
                                formatId = maps.AddFormat<GMLFormat>(name, (int) FormatTypes.GML);
                                break;
                            case 2:
                                formatId = maps.AddFormat<GMLFormat>(name, (int) FormatTypes.GML2);
                                break;
                            case 3:
                                formatId = maps.AddFormat<GMLFormat>(name, (int) FormatTypes.GML3);
                                break;
                            default:
                                formatId = maps.AddFormat<GMLFormat>(name, (int) FormatTypes.GML3);
                                break;
                        }
                    }
                    else
                    {
                        maps.ModifyFormat(formatId, name, gmlVersion);

                    }
                    maps.Formats.GetValue<GMLFormat>(formatId)
                            .Modify(gmlVersion, featureNS, featureType, srsName, surface, curve, multiCurve, multiSurface, schemaLocation);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateKMLFormat(int instanceId, int formatId, string name, bool extractStyles, int[] styleIds)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    List<Style> defaultStyle = new List<Style>();
                    foreach (int styleId in styleIds)
                    {
                        defaultStyle.Add(maps.Styles.GetValue<Style>(styleId));
                    }
                    if (formatId == -1)
                    {
                        formatId = maps.AddFormat<KMLFormat>(name, (int) FormatTypes.KML);
                    }
                    else
                    {
                        maps.ModifyFormat(formatId, name, (int)FormatTypes.KML);
                    }
                    maps.Formats.GetValue<KMLFormat>(formatId).Modify(defaultStyle, extractStyles);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestFormat(int instanceId, int formatId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedFormat = maps.GetFormat(formatId);
                    if (serializedFormat != null)
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId, maps.Formats.GetValue<Format>(formatId).Type,
                            serializedFormat, true);
                    }
                    else
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId, maps.Formats.GetValue<Format>(formatId).Type, "",
                            false);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastFormat(int instanceId, int formatId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedFormat = maps.GetFormat(formatId);
                if (serializedFormat != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveFormat(instanceId, formatId, maps.Formats.GetValue<Format>(formatId).Type, serializedFormat,
                            true);
                }
                else
                {
                    Clients.Group("" + instanceId)
                        .receiveFormat(instanceId, formatId, maps.Formats.GetValue<Format>(formatId).Type, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RemoveFormat(int instanceId, int formatId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveFormat(formatId);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}