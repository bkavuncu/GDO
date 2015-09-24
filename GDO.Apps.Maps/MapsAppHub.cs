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

        public void UpdateMap(int instanceId, int[] layerIds, int[] interactionIds, int[] controlIds, int viewId, int width, int height)
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
                    View view = maps.View;
                    maps.InitMap(layers.ToArray(), interactions.ToArray(), controls.ToArray(), view);
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

        //View

        public void UpdateView(int instanceId, double[] topLeft, double[] center, double[] bottomRight, float resolution,
            int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation, int width, int height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    maps.UpdateView(position, rotation, width, height);
                    BroadcastView(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestView(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetSerializedView();
                    Clients.Caller.receiveview(instanceId, serializedView);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastView(int instanceId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            string serializedView = maps.GetSerializedView();
            Clients.Group("" + instanceId).receiveView(instanceId,serializedView);
        }

        //Layer

        public void AddHeatmapLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float shadow, float weight, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddLayer<HeatmapLayer>(name, (int) LayerTypes.Heatmap, sourceId, brightness, contrast, saturation,
                            hue, opacity, zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<HeatmapLayer>(layerId).Init(gradient, radius, shadow, weight, blur);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateHeatmapLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation, float hue,
            float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, float radius,  float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Heatmap, brightness, contrast, saturation, hue, opacity,
                            zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<HeatmapLayer>(layerId).Modify(gradient, radius, blur);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddLayer<ImageLayer>(name, (int) LayerTypes.Image, sourceId, brightness, contrast,
                        saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<ImageLayer>(layerId).Init();
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Image, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<ImageLayer>(layerId).Modify();
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddTileLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddLayer<TileLayer>(name, (int)LayerTypes.Tile, sourceId, brightness, contrast,
                        saturation, hue, opacity, zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<TileLayer>(layerId).Init(preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTileLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Tile, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<TileLayer>(layerId).Modify(preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity,
            int zIndex, bool visible, int minResolution, int maxResolution, int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddLayer<VectorLayer>(name, (int) LayerTypes.Vector, sourceId, brightness, contrast ,saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<VectorLayer>(layerId).Init(maps.Styles.GetValue<Style>(styleId), renderBuffer, updateWhileAnimating, updateWhileInteracting);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation, float hue, float opacity,
            int zIndex, bool visible, int minResolution, int maxResolution, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Vector, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    maps.Layers.GetValue<VectorLayer>(layerId).Modify(maps.Styles.GetValue<Style>(styleId));
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
                        Clients.Caller.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, "", false);
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
                        .receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
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

        public void AddBingMapsSource(int instanceId, string name, string culture, string key, string imagerySet, int maxZoom)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<BingMapsSource>(name, (int)SourceTypes.BingMaps);
                    maps.Sources.GetValue<BingMapsSource>(sourceId).Init(culture, key, imagerySet, maxZoom);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateBingMapsSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int) SourceTypes.BingMaps);
                    maps.Sources.GetValue<BingMapsSource>(sourceId).Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddClusterSource(int instanceId, string name, int distance, double[] extent, int formatId, int vectorSourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Format format = maps.Formats.GetValue<Format>(formatId);
                    int sourceId = maps.AddSource<ClusterSource>(name, (int)SourceTypes.Cluster);
                    maps.Sources.GetValue<ClusterSource>(sourceId)
                        .Init(distance, extent, format, maps.Sources.GetValue<VectorSource>(vectorSourceId));
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateClusterSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Cluster);
                    maps.Sources.GetValue<ClusterSource>(sourceId)
                        .Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStaticImageSource(int instanceId, string name, string crossOrigin, int width, int height, string url, double[] extent)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<StaticImageSource>(name, (int) SourceTypes.ImageStatic);
                    maps.Sources.GetValue<StaticImageSource>(sourceId).Init(crossOrigin, width, height, url, extent);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStaticImageSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.ImageStatic);
                    maps.Sources.GetValue<StaticImageSource>(sourceId).Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorImageSource(int instanceId,string name, int vectorSourceId, int styleId, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    VectorSource vectorSource = maps.Sources.GetValue<VectorSource>(vectorSourceId);
                    Style style = maps.Styles.GetValue<Style>(styleId);
                    int sourceId = maps.AddSource<VectorImageSource>(name, (int) SourceTypes.ImageVector);
                    maps.Sources.GetValue<VectorImageSource>(sourceId).Init(vectorSource, style, ratio);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorImageSource(int instanceId, int sourceId, string name, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Style style = maps.Styles.GetValue<Style>(styleId);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.ImageVector);
                    maps.Sources.GetValue<VectorImageSource>(sourceId).Modify(style);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageTileSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<ImageTileSource>(name, (int) SourceTypes.TileImage);
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth,  tileHeight, resolutions);
                    maps.Sources.GetValue<ImageTileSource>(sourceId).Init(crossOrigin, _tileGrid, opaque);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageTileSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.TileImage);
                    maps.Sources.GetValue<ImageTileSource>(sourceId).Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddJSONTileSource(int instanceId, string name, string url, string crossOrigin)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<JSONTileSource>(name, (int) SourceTypes.TileJSON);
                    maps.Sources.GetValue<JSONTileSource>(sourceId).Init(url, crossOrigin);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateJSONTileSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.TileJSON);
                    maps.Sources.GetValue<JSONTileSource>(sourceId).Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddXYZSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions, string projection, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<XYZSource>(name, (int)SourceTypes.XYZ);
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                    maps.Sources.GetValue<XYZSource>(sourceId).Init(crossOrigin, _tileGrid, opaque, projection, url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateXYZSource(int instanceId, int sourceId, string name, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.XYZ);
                    maps.Sources.GetValue<XYZSource>(sourceId).Modify(url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStamenSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions, string projection, string url, string layer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddSource<StamenSource>(name, (int)SourceTypes.Stamen);
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                    maps.Sources.GetValue<StamenSource>(sourceId).Init(crossOrigin, _tileGrid, opaque, projection, url, layer);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStamenSource(int instanceId, int sourceId, string name, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Stamen);
                    maps.Sources.GetValue<StamenSource>(sourceId).Modify(url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorTileSource(int instanceId, string name, string projection, string url, double[] extent, int formatId,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    TileGrid _tileGrid = new TileGrid(extent, minZoom, maxZoom, tileWidth, tileHeight, resolutions);
                    Format _format = maps.Formats.GetValue<Format>(formatId);
                    int sourceId = maps.AddSource<JSONTileSource>(name, (int) SourceTypes.TileVector);
                    maps.Sources.GetValue<VectorTileSource>(sourceId).Init(_tileGrid, _format, projection, url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorTileSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.TileVector);
                    maps.Sources.GetValue<VectorTileSource>(sourceId).Modify();
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorSource(int instanceId, string name, int formatId, string url, int loadingStrategy, bool useSpatialIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    Format format = maps.Formats.GetValue<Format>(formatId);
                    int sourceId = maps.AddSource<VectorSource>(name, (int) SourceTypes.Vector);
                    maps.Sources.GetValue<VectorSource>(sourceId)
                        .Init(format, url, loadingStrategy, useSpatialIndex);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Vector);
                    maps.Sources.GetValue<VectorSource>(sourceId)
                        .Modify();
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

        public void AddCircleStyle(int instanceId, string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale, int radius, bool snapToPixel, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    int styleId = maps.AddStyle<CircleStyle>(name, (int) StyleTypes.Circle);
                    maps.Styles.GetValue<CircleStyle>(styleId)
                        .Init(fill, opacity, rotateWithView, rotation, scale, radius, snapToPixel, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateCircleStyle(int instanceId, int styleId, string name,  float opacity, float rotation, float scale)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyStyle(styleId, name, (int)StyleTypes.Circle);
                    maps.Styles.GetValue<CircleStyle>(styleId)
                        .Modify(opacity,  rotation, scale);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddFillStyle(int instanceId, string name, string color)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddStyle<FillStyle>(name, (int) StyleTypes.Fill);
                    maps.Styles.GetValue<FillStyle>(styleId).Init(color);
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyStyle(styleId, name, (int)StyleTypes.Fill);
                    maps.Styles.GetValue<FillStyle>(styleId).Modify(color);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddIconStyle(int instanceId, string name, string crossOrigin, float[] anchor, string anchorOrigin, float[] offset, string offsetOrigin,
            float opacity, float scale, bool snapToPixel, bool rotateWithView, float rotation, int width, int height, int imageWidth,
            int imageHeight, string imageSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddStyle<IconStyle>(name, (int) StyleTypes.Icon);
                    maps.Styles.GetValue<IconStyle>(styleId)
                            .Init(crossOrigin, anchor, anchorOrigin, offset, offsetOrigin, opacity, scale, snapToPixel,
                                rotateWithView, rotation, width, height, imageWidth, imageHeight, imageSource);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateIconStyle(int instanceId, int styleId, string name, float opacity, float scale, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyStyle(styleId, name, (int)StyleTypes.Icon);
                    maps.Styles.GetValue<IconStyle>(styleId)
                            .Modify(opacity, scale, rotation);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStrokeStyle(int instanceId,  string name, string color, int lineCap, int lineJoin, int[] lineDash,
            int miterLimit, int width)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddStyle<StrokeStyle>(name, (int) StyleTypes.Stroke);
                    maps.Styles.GetValue<StrokeStyle>(styleId)
                            .Init(color, lineCap, lineJoin, lineDash, miterLimit, width);
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyStyle(styleId, name, (int)StyleTypes.Stroke);
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

        public void AddRegularShapeStyle(int instanceId, string name, int fillId, float opacity, bool rotateWithView,
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
                    int styleId = maps.AddStyle<RegularShapeStyle>(name, (int) StyleTypes.RegularShape);
                    maps.Styles.GetValue<RegularShapeStyle>(styleId)
                        .Init(fill, opacity, rotateWithView, rotation, scale, points, radius,
                            radius1, radius2, angle, snapToPixel, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateRegularShapeStyle(int instanceId, int styleId, string name, float opacity, float rotation, float scale)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);

                    maps.ModifyStyle(styleId, name, (int)StyleTypes.RegularShape);
                    maps.Styles.GetValue<RegularShapeStyle>(styleId)
                        .Modify(opacity,  rotation, scale);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //TODO ol.style.Style

        public void AddTextStyle(int instanceId, string name, string font, int offsetX, int offsetY, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillId, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    int styleId = maps.AddStyle<TextStyle>(name, (int)StyleTypes.Text);
                    maps.Styles.GetValue<TextStyle>(styleId)
                        .Init(font, offsetX, offsetY, scale, rotation, content, textAlign,
                            textBaseLine, fill, stroke);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTextStyle(int instanceId, int styleId, string name, string font, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillId, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    FillStyle fill = maps.Styles.GetValue<FillStyle>(fillId);
                    StrokeStyle stroke = maps.Styles.GetValue<StrokeStyle>(strokeId);
                    maps.ModifyStyle(styleId, name, (int)StyleTypes.Text);
                    maps.Styles.GetValue<TextStyle>(styleId)
                        .Modify(font, scale, rotation, content, textAlign, textBaseLine, fill, stroke);
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

        public void AddEsriJSONFormat(int instanceId, string name, string geometryName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int formatId = maps.AddFormat<EsriJSONFormat>(name, (int) FormatTypes.EsriJSON);
                    maps.Formats.GetValue<EsriJSONFormat>(formatId).Init(geometryName);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateEsriJSONFormat(int instanceId, int formatId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyFormat(formatId, name, (int)FormatTypes.EsriJSON);
                    maps.Formats.GetValue<EsriJSONFormat>(formatId).Modify();
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddGeoJSONFormat(int instanceId, string name, string geometryName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int formatId = maps.AddFormat<GeoJSONFormat>(name, (int) FormatTypes.GeoJSON);
                    maps.Formats.GetValue<GeoJSONFormat>(formatId).Init(geometryName);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateGeoJSONFormat(int instanceId, int formatId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyFormat(formatId, name, (int)FormatTypes.GeoJSON);
                    maps.Formats.GetValue<GeoJSONFormat>(formatId).Modify();
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddGMLFormat(int instanceId, string name, int gmlVersion, string[] featureNS, string[] featureType, string srsName, bool surface,
            bool curve, bool multiCurve, bool multiSurface, string schemaLocation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int formatId;
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
                    maps.Formats.GetValue<GMLFormat>(formatId)
                            .Init(gmlVersion, featureNS, featureType, srsName, surface, curve, multiCurve, multiSurface, schemaLocation);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateGMLFormat(int instanceId, int formatId, string name, int gmlVersion)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyFormat(formatId, name, gmlVersion);
                    maps.Formats.GetValue<GMLFormat>(formatId).Modify();
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddKMLFormat(int instanceId, string name, bool extractStyles, int[] styleIds)
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
                    int formatId = maps.AddFormat<KMLFormat>(name, (int) FormatTypes.KML);
                    maps.Formats.GetValue<KMLFormat>(formatId).Init(defaultStyle, extractStyles);
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateKMLFormat(int instanceId, int formatId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyFormat(formatId, name, (int)FormatTypes.KML);
                    maps.Formats.GetValue<KMLFormat>(formatId).Modify();
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