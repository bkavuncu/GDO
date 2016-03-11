using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Runtime.Remoting.Messaging;
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
using GDO.Core.Apps;

using Microsoft.AspNet.SignalR;
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    [Export(typeof (IAppHub))]
    public class MapsAppHub : Hub, IBaseAppHub
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

        /*public void Set3DMode(int instanceId, bool mode)
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
        }*/

        //Map

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

        public void SaveMap(int instanceId, string configName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.SaveMap(configName);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestTemplate(int instanceId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedTemplate = maps.GetSerializedTemplate();
                Clients.Caller.receiveTemplate(instanceId, serializedTemplate);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        //View

        public void UpdateView(int instanceId, double[] topLeft, double[] center, double[] bottomRight, float resolution,
            int zoom, string projection, float rotation, int width, int height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    maps.ModifyView(position, projection, rotation, width, height);
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
                    //Clients.Caller.receiveView(instanceId, serializedView);
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
            float opacity, bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating, string[] gradient, float radius, float shadow, float weight, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddHeatmapLayer(name, sourceId, brightness, contrast, saturation, hue,
                        opacity, visible, minResolution, maxResolution, zIndex, canAnimate, isAnimating, gradient, radius, shadow, weight, blur);
                    ;
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateHeatmapLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation, float hue,
            float opacity, bool visible, int minResolution, int maxResolution, bool isAnimating, string[] gradient, float radius, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyHeatmapLayer(layerId, name, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, isAnimating, gradient, radius, blur);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddImageLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, zIndex, canAnimate, isAnimating);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, bool isAnimating)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyImageLayer(layerId, name, brightness, contrast, saturation, hue, opacity, visible,
                        minResolution, maxResolution, isAnimating);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddTileLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddTileLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, zIndex, canAnimate, isAnimating, preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTileLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, bool isAnimating, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyTileLayer(layerId, name, brightness, contrast, saturation, hue, opacity, visible,
                        minResolution, maxResolution, isAnimating, preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity,
            bool visible, int minResolution, int maxResolution, int zIndex, bool canAnimate, bool isAnimating, int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = maps.AddVectorLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, zIndex, canAnimate, isAnimating, styleId, renderBuffer, updateWhileAnimating,
                        updateWhileInteracting);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateVectorLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation, float hue, float opacity,
            bool visible, int minResolution, int maxResolution, bool isAnimating, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyVectorLayer(layerId, name, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, isAnimating, styleId);
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

        //TODO
        /*public void RequestLayers(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    foreach()

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
        }*/

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
                        .receiveLayer(instanceId, layerId, "", "", false);
                }
                BroadcastZIndexTable(instanceId);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void BroadcastZIndexTable(int instanceId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedZIndexTable = maps.GetSerializedZIndexTable();
                Clients.Group("" + instanceId)
                    .receiveZIndexTable(instanceId, serializedZIndexTable);
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

        public void MoveLayerUp(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ZindexTable.UpLayer(layerId);
                    BroadcastZIndexTable(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void MoveLayerDown(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ZindexTable.DownLayer(layerId);
                    BroadcastZIndexTable(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AnimateLayer(int instanceId, int layerId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    //TODO
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetLayerVisible(int instanceId, int layerId, bool visible)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    //TODO
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
                    int sourceId = maps.AddBingMapsSource(name, culture, key, imagerySet, maxZoom);
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
                    maps.ModifyBingMapsSource(sourceId, name);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddClusterSource(int instanceId, string name, int distance, double?[] extent, int formatId, int vectorSourceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddClusterSource(name, distance, extent, formatId, vectorSourceId);
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
                    maps.ModifyClusterSource(sourceId, name);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStaticImageSource(int instanceId, string name, string crossOrigin, int width, int height, string url, double?[] extent)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddStaticImageSource(name, crossOrigin, width, height, url, extent);
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
                    maps.ModifyStaticImageSource(sourceId, name);
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
                    int sourceId = maps.AddVectorImageSource(name, vectorSourceId, styleId, ratio);
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
                    maps.ModifyVectorImageSource(sourceId, name, styleId);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageTileSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float?[] resolutions, string projection)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddImageTileSource(name, crossOrigin, opaque, extent, minZoom, maxZoom,
                        tileWidth, tileHeight, resolutions, projection);
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
                    maps.ModifyImageTileSource(sourceId, name);
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
                    int sourceId = maps.AddJSONTileSource(name, url, crossOrigin);
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
                    maps.ModifyJSONTileSource(sourceId, name);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddXYZSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float?[] resolutions, string projection, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddXYZSource(name, crossOrigin, opaque, extent, minZoom, maxZoom, tileWidth,
                        tileHeight, resolutions, projection, url);
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
                    maps.ModifyXYZSource(sourceId, name, url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStamenSource(int instanceId, string name, string crossOrigin, bool opaque, double[] extent,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float?[] resolutions, string projection, string url, string layer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddStamenSource(name, crossOrigin, opaque, extent, minZoom, maxZoom, tileWidth,
                        tileHeight, resolutions, projection, url, layer);
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
                    maps.ModifyStamenSource(sourceId, name, url);
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorTileSource(int instanceId, string name, string projection, string url, double[] extent, int formatId,
            int minZoom, int maxZoom, int tileWidth, int tileHeight, float?[] resolutions)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = maps.AddVectorTileSource(name, projection, url, extent, formatId, minZoom, maxZoom,
                        tileWidth, tileHeight, resolutions);
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
                    maps.ModifyVectorTileSource(sourceId, name);
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
                    int sourceId = maps.AddVectorSource(name, formatId, url, loadingStrategy, useSpatialIndex);
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
                    maps.ModifyVectorSource(sourceId, name);
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
                        .receiveSource(instanceId, sourceId, "", "", false);
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

        public void AddCircleStyle(int instanceId, string name, int fillStyleId, float opacity, bool rotateWithView,
            float rotation, float scale, int radius, bool snapToPixel, int strokeStyleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddCircleStyle(name, fillStyleId, opacity, rotateWithView, rotation, scale, radius,
                        snapToPixel, strokeStyleId);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateCircleStyle(int instanceId, int styleId, string name, float opacity, float rotation, float scale)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyCircleStyle(styleId, name, opacity, rotation, scale);
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
                    int styleId = maps.AddFillStyle(name, color);
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
                    maps.ModifyFillStyle(styleId, name, color);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddIconStyle(int instanceId, string name, string crossOrigin, float?[] anchor, string anchorOrigin, float?[] offset, string offsetOrigin,
            float opacity, float scale, bool snapToPixel, bool rotateWithView, float rotation, int width, int height, int imageWidth,
            int imageHeight, string imageSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddIconStyle(name, crossOrigin, anchor, anchorOrigin, offset, offsetOrigin,
                        opacity, scale, snapToPixel, rotateWithView, rotation, width, height, imageWidth, imageHeight,
                        imageSource);
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
                    maps.ModifyIconStyle(styleId, name, opacity, scale, rotation);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddStrokeStyle(int instanceId, string name, string color, int lineCap, int lineJoin, int?[] lineDash,
            int miterLimit, int width)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddStrokeStyle(name, color, lineCap, lineJoin, lineDash, miterLimit, width);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStrokeStyle(int instanceId, int styleId, string name, string color, int lineCap, int lineJoin, int?[] lineDash,
            int miterLimit, int width)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyStrokeStyle(styleId, name, color, lineCap, lineJoin, lineDash, miterLimit, width);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddRegularShapeStyle(int instanceId, string name, int fillStyleId, float opacity, bool rotateWithView,
            float rotation, float scale, int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeStyleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddRegularShapeStyle(name, fillStyleId, opacity, rotateWithView, rotation, scale,
                        points, radius, radius1, radius2, angle, snapToPixel, strokeStyleId);
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
                    maps.ModifyRegularShapeStyle(styleId, name, opacity, rotation, scale);
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
            string content, string textAlign, string textBaseLine, int fillStyleId, int strokeStyleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = maps.AddTextStyle(name, font, offsetX, offsetY, scale, rotation, content, textAlign,
                        textBaseLine, fillStyleId, strokeStyleId);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTextStyle(int instanceId, int styleId, string name, string font, float scale, float rotation,
            string content, string textAlign, string textBaseLine, int fillStyleId, int strokeStyleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ModifyTextStyle(styleId, name, font, scale, rotation, content, textAlign, textBaseLine, fillStyleId,
                        strokeStyleId);
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
                        .receiveStyle(instanceId, styleId, "", "", false);
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
                    int formatId = maps.AddEsriJSONFormat(name, geometryName);
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
                    maps.ModifyEsriJSONFormat(formatId, name);
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
                    int formatId = maps.AddGeoJSONFormat(name, geometryName);
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
                    maps.ModifyGeoJSONFormat(formatId, name);
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
                    int formatId = maps.AddGMLFormat(name, gmlVersion, featureNS, featureType, srsName, surface, curve,
                        multiCurve, multiSurface, schemaLocation);
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
                    maps.ModifyGMLFormat(formatId, name, gmlVersion);
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
                    int formatId = maps.AddKMLFormat(name, extractStyles, styleIds);
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
                    maps.ModifyKMLFormat(formatId, name);
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
                        .receiveFormat(instanceId, formatId, "", "", false);
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