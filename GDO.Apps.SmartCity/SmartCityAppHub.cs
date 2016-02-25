using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Runtime.Remoting.Messaging;
using System.Web;
using GDO.Apps.SmartCity.Core;
using GDO.Apps.SmartCity.Core.Geometries;
using GDO.Apps.SmartCity.Core.Layers;
using GDO.Apps.SmartCity.Core.Sources;
using GDO.Apps.SmartCity.Core.Sources.Images;
using GDO.Apps.SmartCity.Core.Sources.Tiles;
using GDO.Apps.SmartCity.Core.Styles;
using GDO.Apps.SmartCity.Formats;
using GDO.Core;
using GDO.Core.Apps;

using Microsoft.AspNet.SignalR;
using Style = GDO.Apps.SmartCity.Core.Style;

namespace GDO.Apps.SmartCity
{
    [Export(typeof (IAppHub))]
    public class SmartCityAppHub : Hub, IAdvancedAppHub
    {
        public string Name { get; set; } = "SmartCity";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.None;
        public List<string> SupportedApps { get; set; } = new List<string>(new string[] { "MapLayers"});
        public Type InstanceType { get; set; } = new SmartCityApp().GetType();

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
                    ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]).Mode = mode;
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
                    Clients.Caller.receive3DMode(instanceId, ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]).Mode);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedMap = smartCity.GetSerializedMap();
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.SaveMap(configName);
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
                SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedTemplate = Newtonsoft.Json.JsonConvert.SerializeObject(smartCity.CreateEmptyMap());
                Clients.Caller.receiveTemplate(serializedTemplate);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    smartCity.ModifyView(position, projection, rotation, width, height);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedView = smartCity.GetSerializedView();
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
            SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
            string serializedView = smartCity.GetSerializedView();
            Clients.Group("" + instanceId).receiveView(instanceId,serializedView);
        }

        //Layer

        public void AddHeatmapLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation, float hue,
            float opacity, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float shadow, float weight, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int layerId = smartCity.AddHeatmapLayer(name, sourceId, brightness, contrast, saturation, hue,
                        opacity, visible, minResolution, maxResolution, gradient, radius, shadow, weight, blur);
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
            float opacity, bool visible, int minResolution, int maxResolution, string[] gradient, float radius, float blur)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyHeatmapLayer(layerId, name, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, gradient, radius, blur);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddImageLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int layerId = smartCity.AddImageLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateImageLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyImageLayer(layerId, name, brightness, contrast, saturation, hue, opacity, visible,
                        minResolution, maxResolution);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddTileLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int layerId = smartCity.AddTileLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateTileLayer(int instanceId, int layerId, string name, float brightness, float contrast, float saturation,
            float hue, float opacity, bool visible, int minResolution, int maxResolution, int preload)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyTileLayer(layerId, name, brightness, contrast, saturation, hue, opacity, visible,
                        minResolution, maxResolution, preload);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddVectorLayer(int instanceId, string name, int sourceId, float brightness, float contrast, float saturation, float hue, float opacity,
            bool visible, int minResolution, int maxResolution, int styleId, int renderBuffer, bool updateWhileAnimating, bool updateWhileInteracting)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int layerId = smartCity.AddVectorLayer(name, sourceId, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, styleId, renderBuffer, updateWhileAnimating,
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
            bool visible, int minResolution, int maxResolution, int styleId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyVectorLayer(layerId, name, brightness, contrast, saturation, hue, opacity,
                        visible, minResolution, maxResolution, styleId);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedLayer = smartCity.GetSerializedLayer(layerId);
                    if (serializedLayer != null)
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, smartCity.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, smartCity.Layers.GetValue<Layer>(layerId).Type, "", false);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    foreach()

                    string serializedLayer = smartCity.GetSerializedLayer(layerId);
                    if (serializedLayer != null)
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, smartCity.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, smartCity.Layers.GetValue<Layer>(layerId).Type, "", false);
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
                SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedLayer = smartCity.GetSerializedLayer(layerId);
                if (serializedLayer != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveLayer(instanceId, layerId, smartCity.Layers.GetValue<Layer>(layerId).Type, serializedLayer, true);
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
                SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedZIndexTable = smartCity.GetSerializedZIndexTable();
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.RemoveLayer(layerId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ZindexTable.UpLayer(layerId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ZindexTable.DownLayer(layerId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddBingMapsSource(name, culture, key, imagerySet, maxZoom);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyBingMapsSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddClusterSource(name, distance, extent, formatId, vectorSourceId);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyClusterSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddStaticImageSource(name, crossOrigin, width, height, url, extent);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyStaticImageSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddVectorImageSource(name, vectorSourceId, styleId, ratio);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyVectorImageSource(sourceId, name, styleId);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddImageTileSource(name, crossOrigin, opaque, extent, minZoom, maxZoom,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyImageTileSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddJSONTileSource(name, url, crossOrigin);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyJSONTileSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddXYZSource(name, crossOrigin, opaque, extent, minZoom, maxZoom, tileWidth,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyXYZSource(sourceId, name, url);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddStamenSource(name, crossOrigin, opaque, extent, minZoom, maxZoom, tileWidth,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyStamenSource(sourceId, name, url);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddVectorTileSource(name, projection, url, extent, formatId, minZoom, maxZoom,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyVectorTileSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int sourceId = smartCity.AddVectorSource(name, formatId, url, loadingStrategy, useSpatialIndex);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyVectorSource(sourceId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedSource = smartCity.GetSerializedSource(sourceId);
                    if (serializedSource != null)
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, smartCity.Sources.GetValue<Source>(sourceId).Type,
                            serializedSource, true);
                    }
                    else
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, smartCity.Sources.GetValue<Source>(sourceId).Type,
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
                SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedSource = smartCity.GetSerializedSource(sourceId);
                if (serializedSource != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveSource(instanceId, sourceId, smartCity.Sources.GetValue<Source>(sourceId).Type,
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.RemoveSource(sourceId);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddCircleStyle(name, fillId, opacity, rotateWithView, rotation, scale, radius,
                        snapToPixel, strokeId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyCircleStyle(styleId, name, opacity, rotation, scale);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddFillStyle(name, color);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyFillStyle(styleId, name, color);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddIconStyle(name, crossOrigin, anchor, anchorOrigin, offset, offsetOrigin,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyIconStyle(styleId, name, opacity, scale, rotation);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddStrokeStyle(name, color, lineCap, lineJoin, lineDash, miterLimit, width);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyStrokeStyle(styleId, name, color, lineCap, lineJoin, lineDash, miterLimit, width);
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddRegularShapeStyle(int instanceId, string name, int fillId, float opacity, bool rotateWithView,
            float rotation, float scale, int points, int radius, int radius1, int radius2, int angle, bool snapToPixel, int strokeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddRegularShapeStyle(name, fillId, opacity, rotateWithView, rotation, scale,
                        points, radius, radius1, radius2, angle, snapToPixel, strokeId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyRegularShapeStyle(styleId, name, opacity, rotation, scale);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int styleId = smartCity.AddTextStyle(name, font, offsetX, offsetY, scale, rotation, content, textAlign,
                        textBaseLine, fillId, strokeId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyTextStyle(styleId, name, font, scale, rotation, content, textAlign, textBaseLine, fillId,
                        strokeId);
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedStyle = smartCity.GetSerializedStyle(styleId);
                    if (serializedStyle != null)
                    {
                        Clients.Caller.receiveStyle(instanceId, styleId, smartCity.Styles.GetValue<Style>(styleId).Type,
                            serializedStyle, true);
                    }
                    else
                    {
                        Clients.Caller.receiveStyle(instanceId, styleId, smartCity.Styles.GetValue<Style>(styleId).Type, "",
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
                SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedStyle = smartCity.GetSerializedStyle(styleId);
                if (serializedStyle != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveStyle(instanceId, styleId, smartCity.Styles.GetValue<Style>(styleId).Type, serializedStyle,
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
                    SmartCityApp smartCity = ((SmartCityApp) Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.RemoveStyle(styleId);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int formatId = smartCity.AddEsriJSONFormat(name, geometryName);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyEsriJSONFormat(formatId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int formatId = smartCity.AddGeoJSONFormat(name, geometryName);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyGeoJSONFormat(formatId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int formatId = smartCity.AddGMLFormat(name, gmlVersion, featureNS, featureType, srsName, surface, curve,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyGMLFormat(formatId, name, gmlVersion);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    int formatId = smartCity.AddKMLFormat(name, extractStyles, styleIds);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.ModifyKMLFormat(formatId, name);
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    string serializedFormat = smartCity.GetFormat(formatId);
                    if (serializedFormat != null)
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId, smartCity.Formats.GetValue<Format>(formatId).Type,
                            serializedFormat, true);
                    }
                    else
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId, smartCity.Formats.GetValue<Format>(formatId).Type, "",
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
                SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                string serializedFormat = smartCity.GetFormat(formatId);
                if (serializedFormat != null)
                {
                    Clients.Group("" + instanceId)
                        .receiveFormat(instanceId, formatId, smartCity.Formats.GetValue<Format>(formatId).Type, serializedFormat,
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
                    SmartCityApp smartCity = ((SmartCityApp)Cave.Apps["SmartCity"].Instances[instanceId]);
                    smartCity.RemoveFormat(formatId);
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