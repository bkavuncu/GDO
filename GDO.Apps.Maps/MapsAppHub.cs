using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Web;
using GDO.Apps.Maps.Core;
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Sources.Tiles;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Maps
{
    [Export(typeof(IAppHub))]
    public class MapsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Maps";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
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
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).Mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).Mode);
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

        public void RequestMap(int instanceId)
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

        public void ModifyMap(int instanceId)
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

        //Layer

        public void AddLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;
                    layerId = maps.AddLayer<Layer>(name, (int)LayerTypes.Base, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    if (layerId >= 0)
                    {
                        BroadcastLayer(instanceId, layerId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddHeatmapLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, int radius, int shadow, int weight)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;
                    layerId = maps.AddLayer<HeatmapLayer>(name, (int)LayerTypes.Heatmap, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    if (layerId >= 0)
                    {
                        maps.Layers.GetValue<HeatmapLayer>(layerId).Modify(gradient, radius, shadow, weight);
                        BroadcastLayer(instanceId, layerId);
                    }
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;
                    layerId = maps.AddLayer<ImageLayer>(name, (int)LayerTypes.Image, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    if (layerId >= 0)
                    {
                        maps.Layers.GetValue<ImageLayer>(layerId).Modify();
                        BroadcastLayer(instanceId, layerId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;
                    layerId = maps.AddLayer<VectorLayer>(name, (int)LayerTypes.Vector, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    if (layerId >= 0)
                    {
                        maps.Layers.GetValue<VectorLayer>(layerId).Modify(maps.Styles.GetValue<Style>(styleId));
                        BroadcastLayer(instanceId, layerId);
                    }
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
                    int layerId = -1;
                    layerId = maps.AddLayer<TileLayer>(name, (int)LayerTypes.Tile, sourceId, brightness, contrast, saturation,
                        hue, opacity, zIndex, visible, minResolution, maxResolution);
                    if (layerId >= 0)
                    {
                        maps.Layers.GetValue<TileLayer>(layerId).Modify(preload);
                        BroadcastLayer(instanceId, layerId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Base, sourceId, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyHeatmapLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, string[] gradient, int radius, int shadow,
            int weight)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Heatmap, sourceId, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);                   
                    maps.Layers.GetValue<HeatmapLayer>(layerId).Modify(gradient, radius, shadow, weight);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyImageLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Image, sourceId, brightness, contrast, saturation, hue, opacity,
                        zIndex, visible, minResolution, maxResolution);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyVectorLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Vector, sourceId, brightness, contrast, saturation, hue, opacity,
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

        public void ModifyTileLayer(int instanceId, int layerId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, int zIndex, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyLayer(layerId, name, (int)LayerTypes.Tile, sourceId, brightness, contrast, saturation, hue, opacity,
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

        public void RequestLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedLayer = maps.GetLayer(layerId);
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
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedLayer = maps.GetLayer(layerId);
                if (serializedLayer != null)
                {
                    Clients.All.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
                }
                else
                {
                    Clients.All.receiveLayer(instanceId, layerId, maps.Layers.GetValue<Layer>(layerId).Type, "", false);
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
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

        public void AddView(int instanceId, double[] topLeft, double[] center, double[] bottomRight, float resolution, int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                int viewId = -1;
                try
                {
                    Position position = new Position(topLeft,center,bottomRight,resolution,zoom);
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    viewId = maps.AddView(position, minResolution, maxResolution, minZoom, maxZoom, projection, rotation);
                    if (viewId >= 0)
                    {
                        BroadcastView(instanceId, viewId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyView(int instanceId, int viewId, double[] topLeft, double[] center, double[] bottomRight, float resolution, int zoom, int minResolution, int maxResolution, int minZoom, int maxZoom, string projection, float rotation)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    View view = maps.Views.GetValue<View>(viewId);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    bool result = maps.ModifyView(viewId, position, minResolution, maxResolution, minZoom, maxZoom, projection, rotation);
                    if (result)
                    {
                        BroadcastView(instanceId, viewId);
                    }
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetView(viewId);
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
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            string serializedView = maps.GetView(viewId);
            if (serializedView != null)
            {
                Clients.All.receiveView(instanceId, viewId, serializedView, true);
            }
            else
            {
                Clients.All.receiveLayer(instanceId, viewId, "", false);
            }
        }

        public void RemoveView(int instanceId, int viewId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
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

        public void AddInteraction(int instanceId)
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

        public void ModifyInteraction(int instanceId, int interactionId)
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

        public void AddSource(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<Source>(name, (int)SourceTypes.Base);
                    if (sourceId >= 0)
                    {
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddBingMapsSource(int instanceId, string name, string culture, string key, string imagerySet)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<BingMapsSource>(name, (int)SourceTypes.Base);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<BingMapsSource>(sourceId).Modify(culture, key, imagerySet);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddClusterSource(int instanceId, string name, int distance, int[] extent, int vectorSourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<ClusterSource>(name, (int) SourceTypes.Cluster);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<ClusterSource>(sourceId)
                            .Modify(distance, new Extent(extent[0], extent[1], extent[2], extent[3]),
                                maps.Sources.GetValue<VectorSource>(vectorSourceId));
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageSource(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<ImageSource>(name, (int)SourceTypes.Image);
                    if (sourceId >= 0)
                    {
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddCanvasImageSource(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<CanvasImageSource>(name, (int)SourceTypes.ImageCanvas);
                    if (sourceId >= 0)
                    {
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStaticImageSource(int instanceId, string name, int width, int height, string url, int[] extent)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<StaticImageSource>(name, (int)SourceTypes.ImageStatic);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<StaticImageSource>(sourceId).Modify(width, height,url, 
                            new Extent(extent[0],extent[1],extent[2],extent[3]));
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        public void AddVectorImageSource(int instanceId, string name, int vectorSourceId, int styleId, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<VectorImageSource>(name, (int)SourceTypes.ImageVector);
                    if (sourceId >= 0)
                    {
                        VectorSource vectorSource = maps.Sources.GetValue<VectorSource>(vectorSourceId);
                        Style style = maps.Styles.GetValue<Style>(styleId);
                        maps.Sources.GetValue<VectorImageSource>(sourceId).Modify(vectorSource,style,ratio);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddTileSource(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<TileSource>(name, (int)SourceTypes.Tile);
                    if (sourceId >= 0)
                    {
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageTileSource(int instanceId, string name, bool opaque)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<ImageTileSource>(name, (int)SourceTypes.TileImage);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<ImageTileSource>(sourceId).Modify(opaque);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddJSONTileSource(int instanceId, string name, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<JSONTileSource>(name, (int)SourceTypes.TileJSON);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<JSONTileSource>(sourceId).Modify(url);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorTileSource(int instanceId, string name, string url, string[] urls, double[] extent, int minZoom, int maxZoom, int tileWidth,
            int[] tileWidths, int tileHeight, int[] tileHeights, double[] origin, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<JSONTileSource>(name, (int)SourceTypes.TileJSON);
                    if (sourceId >= 0)
                    {
                        Extent _extent = new Extent(extent[0],extent[1],extent[2],extent[3]);
                        Coordinate _origin = new Coordinate(origin[0],origin[1],origin[2],origin[3]);
                        TileGrid _tileGrid = new TileGrid(_extent,minZoom,maxZoom,tileWidth,tileWidths,tileHeight,tileHeights,_origin,resolutions);
                        maps.Sources.GetValue<VectorTileSource>(sourceId).Modify(_tileGrid,url,urls);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorSource(int instanceId, string name, string url, int loadingStrategy, bool useSpatialIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    sourceId = maps.AddSource<VectorSource>(name, (int)SourceTypes.Vector);
                    if (sourceId >= 0)
                    {
                        maps.Sources.GetValue<VectorSource>(sourceId)
                            .Modify(url, loadingStrategy, useSpatialIndex);
                        BroadcastSource(instanceId, sourceId);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifySource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Base);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyBingMapsSource(int instanceId, int sourceId, string name, string culture, string key, string imagerySet)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.BingMaps);
                    maps.Sources.GetValue<BingMapsSource>(sourceId).Modify(culture, key, imagerySet);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyClusterSource(int instanceId, int sourceId, string name, int distance, int[] extent, int vectorSourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Cluster);
                    maps.Sources.GetValue<ClusterSource>(sourceId)
                        .Modify(distance, new Extent(extent[0], extent[1], extent[2], extent[3]),
                        maps.Sources.GetValue<VectorSource>(vectorSourceId));
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyImageSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Image);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyCanvasImageSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.ImageCanvas);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyVectorImageSource(int instanceId, int sourceId, string name, int vectorSourceId, int styleId, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.ImageVector);
                    VectorSource vectorSource = maps.Sources.GetValue<VectorSource>(vectorSourceId);
                    Style style = maps.Styles.GetValue<Style>(styleId);
                    maps.Sources.GetValue<VectorImageSource>(sourceId).Modify(vectorSource, style, ratio);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyTileSource(int instanceId, int sourceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Tile);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyImageTileSource(int instanceId, int sourceId, string name, bool opaque)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.TileImage);
                    maps.Sources.GetValue<ImageTileSource>(sourceId).Modify(opaque);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyJSONTileSource(int instanceId, int sourceId, string name, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.TileJSON);
                    maps.Sources.GetValue<JSONTileSource>(sourceId).Modify(url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyVectorTileSource(int instanceId, int sourceId, string name, string url, string[] urls, double[] extent, int minZoom,
            int maxZoom, int tileWidth, int[] tileWidths, int tileHeight, int[] tileHeights, double[] origin, float[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Extent _extent = new Extent(extent[0], extent[1], extent[2], extent[3]);
                    Coordinate _origin = new Coordinate(origin[0], origin[1], origin[2], origin[3]);
                    TileGrid _tileGrid = new TileGrid(_extent, minZoom, maxZoom, tileWidth, tileWidths, tileHeight, tileHeights, _origin, resolutions);
                    maps.Sources.GetValue<VectorTileSource>(sourceId).Modify(_tileGrid, url, urls);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ModifyVectorSource(int instanceId, int sourceId, string name, string url, int loadingStrategy, bool useSpatialIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifySource(sourceId, name, (int)SourceTypes.Cluster);
                    maps.Sources.GetValue<VectorSource>(sourceId)
                        .Modify(url, loadingStrategy, useSpatialIndex);
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedSource = maps.GetSource(sourceId);
                    if (serializedSource != null)
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type, serializedSource, true);
                    }
                    else
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type, "", false);
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
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedSource = maps.GetSource(sourceId);
                if (serializedSource != null)
                {
                    Clients.All.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type, serializedSource, true);
                }
                else
                {
                    Clients.All.receiveSource(instanceId, sourceId, maps.Sources.GetValue<Source>(sourceId).Type, "", false);
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.RemoveSource(sourceId);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //Feature

            //TODO AddFeature to Vector
            //TODO Modify Feature
            //Remove Feature
            //


        //Control

        public void AddControl(int instanceId)
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

        public void ModifyControl(int instanceId, int controlId)
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

        public void AddStyle(int instanceId)
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

        public void AddStyle(int instanceId)
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

        public void ModifyStyle(int instanceId, int styleId)
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

        public void RequestStyle(int instanceId, int styleId)
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

        public void BroadcastStyle(int instanceId, int styleId)
        {

        }

        public void RemoveStyle(int instanceId, int styleId)
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
    }
}