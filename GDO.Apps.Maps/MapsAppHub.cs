using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Threading;
using GDO.Apps.Maps.Core;
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
using Style = GDO.Apps.Maps.Core.Style;

namespace GDO.Apps.Maps
{
    [Export(typeof (IAppHub))]
    public class MapsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Maps";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new MapsApp().GetType();

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
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
                        Clients.Caller.receiveConfigurations(instanceId, maps.GetSerializedConfigurations());
                    }
                    else
                    {
                        Clients.Caller.receiveMap(instanceId, "", false);
                        Clients.Caller.receiveConfigurations(instanceId, maps.GetSerializedConfigurations());
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void InitMap(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.Init();
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

        //Configurations

        public void ScanConfigurations(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ExtractConfigurations();
                    string serializedConfigurations = maps.GetSerializedConfigurations();
                    foreach (KeyValuePair<int, IAppInstance> instanceKeyValue in Cave.Apps["Maps"].Instances)
                    {
                        if (instanceKeyValue.Value.AppName == "Maps")
                        {
                            Clients.Group("c" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                            Clients.Group("" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                        }
                    }
                    Clients.Caller.updateCaveConfigurations(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SaveConfiguration(int instanceId, string configName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.SaveMap(configName);
                    Cave.LoadAppConfiguration(Cave.GetAppName(instanceId), configName);
                    maps.ExtractConfigurations();
                    string serializedConfigurations = maps.GetSerializedConfigurations();
                    foreach (KeyValuePair<int,IAppInstance> instanceKeyValue in Cave.Apps["Maps"].Instances)
                    {
                        if (instanceKeyValue.Value.AppName == "Maps")
                        {
                            Clients.Group("c" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                            Clients.Group("" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                        }
                    }
                    Clients.Caller.updateCaveConfigurations(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DeleteConfiguration(int instanceId, string configName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Cave.UnloadAppConfiguration(Cave.GetAppName(instanceId), configName);
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.ExtractConfigurations();
                    string serializedConfigurations = maps.GetSerializedConfigurations();
                    foreach (KeyValuePair<int, IAppInstance> instanceKeyValue in Cave.Apps["Maps"].Instances)
                    {
                        if (instanceKeyValue.Value.AppName == "Maps")
                        {
                            Clients.Group("c" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                            Clients.Group("" + instanceKeyValue.Value.Id).receiveConfigurations(instanceKeyValue.Value.Id, serializedConfigurations);
                        }
                    }
                    Clients.Caller.updateCaveConfigurations(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateLabel(int instanceId, string label, string sublabel)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp) Cave.Apps["Maps"].Instances[instanceId]);
                    maps.UpdateLabel(label, sublabel);
                    Clients.Group("c" + instanceId).receiveLabel(instanceId, label, sublabel);
                    Clients.Group("" + instanceId).receiveLabel(instanceId, label, sublabel);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetLabelVisible(int instanceId, bool visible)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.SetLabelVisible(visible);
                    Clients.Group("c" + instanceId).receiveLabelVisibility(instanceId, visible);
                    Clients.Group("" + instanceId).receiveLabelVisibility(instanceId, visible);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //View
        public void AddView(int instanceId, string className, string serializedView)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int viewId = -1;
                    viewId = maps.AddView(JsonConvert.DeserializeObject<View>(serializedView));
                    BroadcastView(instanceId, viewId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateView(int instanceId, int viewId, string className, string serializedView)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.UpdateView(viewId, JsonConvert.DeserializeObject<View>(serializedView));
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
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetSerializedView(viewId);
                    if (serializedView != null)
                    {
                        Clients.Caller.receiveView(instanceId, viewId, serializedView, true);
                    }
                    else
                    {
                        Clients.Caller.receiveView(instanceId, viewId, "", false);
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
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                string serializedView = maps.GetSerializedView(viewId);
                if (serializedView != null)
                {
                    Clients.Group("" + instanceId).receiveView(instanceId, viewId, serializedView, true);
                    Clients.Group("c" + instanceId).receiveView(instanceId, viewId, serializedView, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveView(instanceId, viewId, "", false);
                    Clients.Group("c" + instanceId).receiveView(instanceId, viewId, "", false);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
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

        public void UpdatePosition(int instanceId, float?[] topLeft, float?[] center, float?[] bottomRight, float resolution, int width, int height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    maps.UpdatePosition(topLeft, center, bottomRight, resolution, width, height);
                    BroadcastPosition(instanceId);
                    //Clients.Caller.receivePosition(instanceId, topLeft, center, bottomRight, resolution, width, height);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Clients.Caller.receivePosition(instanceId, maps.Position.TopLeft, maps.Position.Center, maps.Position.BottomRight, maps.Position.Resolution, maps.Position.Width, maps.Position.Height);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastPosition(int instanceId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            Clients.Group("" + instanceId).receivePosition(instanceId, maps.Position.TopLeft, maps.Position.Center, maps.Position.BottomRight, maps.Position.Resolution, maps.Position.Width, maps.Position.Height);
        }

        public void UseView(int instanceId, int viewId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            maps.UseView(viewId);
            Clients.Caller.receivePosition(instanceId, maps.Position.TopLeft, maps.Position.Center, maps.Position.BottomRight, maps.Position.Resolution, maps.Position.Width, maps.Position.Height);
        }

        public void UsePosition(int instanceId, int viewId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            maps.UsePosition(viewId);
            BroadcastView(instanceId, viewId);
        }

        public void UploadMarkerPosition(int instanceId, string[] pos)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]).SetMarkerPosition(pos);
                    Clients.Caller.receiveMarkerPosition(instanceId, pos);
                    BroadcastMarkerPosition(instanceId, pos);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestMarkerPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    string[] position = ((MapsApp)Cave.Apps["BasicMaps"].Instances[instanceId]).GetMarkerPosition();
                    Clients.Caller.receiveMarkerPosition(instanceId, position);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastMarkerPosition(int instanceId, string[] pos)
        {
            Clients.Group("" + instanceId).receiveMarkerPosition(instanceId, pos);
        }

        //Layer

        public void AddLayer(int instanceId, string className, string serializedLayer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;

                    switch (className)
                    {
                        case "DynamicHeatmapLayer":
                            layerId = maps.AddLayer<DynamicHeatmapLayer>(JsonConvert.DeserializeObject<DynamicHeatmapLayer>(serializedLayer));
                            break;
                        case "StaticHeatmapLayer":
                            layerId = maps.AddLayer<StaticHeatmapLayer>(JsonConvert.DeserializeObject<StaticHeatmapLayer>(serializedLayer));
                            break;
                        case "ImageLayer":
                            layerId = maps.AddLayer<ImageLayer>(JsonConvert.DeserializeObject<ImageLayer>(serializedLayer));
                            break;
                        case "TileLayer":
                            layerId = maps.AddLayer<TileLayer>(JsonConvert.DeserializeObject<TileLayer>(serializedLayer));
                            break;
                        case "DynamicVectorLayer":
                            layerId = maps.AddLayer<DynamicVectorLayer>(JsonConvert.DeserializeObject<DynamicVectorLayer>(serializedLayer));
                            break;
                        case "StaticVectorLayer":
                            layerId = maps.AddLayer<StaticVectorLayer>(JsonConvert.DeserializeObject<StaticVectorLayer>(serializedLayer));
                            break;
                        default:
                            break;
                    }
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateLayer(int instanceId, int layerId, string className, string serializedLayer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (className)
                    {
                        case "DynamicHeatmapLayer":
                            maps.UpdateLayer<DynamicHeatmapLayer>(layerId, JsonConvert.DeserializeObject<DynamicHeatmapLayer>(serializedLayer));
                            break;
                        case "StaticHeatmapLayer":
                            maps.UpdateLayer<StaticHeatmapLayer>(layerId, JsonConvert.DeserializeObject<StaticHeatmapLayer>(serializedLayer));
                            break;
                        case "ImageLayer":
                            maps.UpdateLayer<ImageLayer>(layerId, JsonConvert.DeserializeObject<ImageLayer>(serializedLayer));
                            break;
                        case "TileLayer":
                            maps.UpdateLayer<TileLayer>(layerId, JsonConvert.DeserializeObject<TileLayer>(serializedLayer));
                            break;
                        case "DynamicVectorLayer":
                            maps.UpdateLayer<DynamicVectorLayer>(layerId, JsonConvert.DeserializeObject<DynamicVectorLayer>(serializedLayer));
                            break;
                        case "StaticVectorLayer":
                            maps.UpdateLayer<StaticVectorLayer>(layerId, JsonConvert.DeserializeObject<StaticVectorLayer>(serializedLayer));
                            break;
                        default:
                            break;
                    }
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
                        Clients.Caller.receiveLayer(instanceId, layerId, serializedLayer, true);
                    }
                    else
                    {
                        Clients.Caller.receiveLayer(instanceId, layerId, "", false);
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
                    Clients.Group("" + instanceId).receiveLayer(instanceId, layerId, serializedLayer, true);
                    Clients.Group("c" + instanceId).receiveLayer(instanceId, layerId, serializedLayer, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveLayer(instanceId, layerId, "", false);
                    Clients.Group("c" + instanceId).receiveLayer(instanceId, layerId, "", false);
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
                    DynamicLayer layer = maps.GetLayer<DynamicLayer>(layerId);
                    if (layer != null)
                    {
                        StopLayer(instanceId, layerId);
                        System.Threading.Thread.Sleep(200);
                    }
                    maps.RemoveLayer(layerId);
                    BroadcastLayer(instanceId, layerId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void PlayLayer(int instanceId, int layerId)
        {
            try
            {
                var thread = new Thread(() => AnimateLayer(instanceId,layerId));
                thread.Start();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void AnimateLayer(int instanceId, int layerId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                DynamicLayer layer = maps.GetLayer<DynamicLayer>(layerId);
                if (layer != null)
                {
                    if (!Utilities.CastToBool(layer.IsPlaying.Value, false))
                    {
                        layer.IsPlaying.Value = true;
                        BroadcastLayer(instanceId, layerId);
                        double startTime = Utilities.CalculateTimeSpan(layer.StartTime.Values, false);
                        double endTime = Utilities.CalculateTimeSpan(layer.EndTime.Values, false);
                        double currentTime = Utilities.CastToDouble(layer.CurrentTime.Value, 0);
                        double timeStep = Utilities.CalculateTimeSpan(layer.TimeStep.Values, true);
                        while (Utilities.CastToBool(layer.IsPlaying.Value, false))
                        {
                            if ((currentTime + startTime) < endTime)
                            {
                                currentTime = currentTime + timeStep;
                                layer.CurrentTime.Value = currentTime;
                                System.Threading.Thread.Sleep(Utilities.CastToInt(layer.WaitTime.Value, 1000));
                                Clients.Group("" + instanceId).receiveTimeStep(instanceId, layerId, (currentTime + startTime));
                            }
                            else
                            {
                                if (Utilities.CastToBool(layer.IsLooping.Value, false))
                                {
                                    currentTime = 0;
                                }
                                else
                                {
                                    layer.IsPlaying.Value = false;
                                    currentTime = 0;


                                }
                            }
                        }
                        Clients.Group("" + instanceId).receiveTimeStep(instanceId, layerId, 0);
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void PauseLayer(int instanceId, int layerId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                DynamicLayer layer = maps.GetLayer<DynamicLayer>(layerId);
                if (layer != null)
                {
                    layer.IsPlaying.Value = false;
                    BroadcastLayer(instanceId, layerId);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void StopLayer(int instanceId, int layerId)
        {
            try
            {
                MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                DynamicLayer layer = maps.GetLayer<DynamicLayer>(layerId);
                if (layer != null)
                {
                    layer.IsPlaying.Value = false;
                    layer.CurrentTime.Value = 0;
                    BroadcastLayer(instanceId, layerId);
                    System.Threading.Thread.Sleep(200);
                    Clients.Group("" + instanceId).receiveTimeStep(instanceId, layerId, 0);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        //Source
        public void AddSource(int instanceId, string className, string serializedSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    switch (className)
                    {
                        case "BingMapsSource":
                            sourceId = maps.AddSource<BingMapsSource>(JsonConvert.DeserializeObject<BingMapsSource>(serializedSource));
                            break;
                        case "CartoDBSource":
                            sourceId = maps.AddSource<CartoDBSource>(JsonConvert.DeserializeObject<CartoDBSource>(serializedSource));
                            break;
                        case "ImageTileSource":
                            sourceId = maps.AddSource<ImageTileSource>(JsonConvert.DeserializeObject<ImageTileSource>(serializedSource));
                            break;
                        case "MapQuestSource":
                            sourceId = maps.AddSource<MapQuestSource>(JsonConvert.DeserializeObject<MapQuestSource>(serializedSource));
                            break;
                        case "OSMSource":
                            sourceId = maps.AddSource<OSMSource>(JsonConvert.DeserializeObject<OSMSource>(serializedSource));
                            break;
                        case "StamenSource":
                            sourceId = maps.AddSource<StamenSource>(JsonConvert.DeserializeObject<StamenSource>(serializedSource));
                            break;
                        case "StaticImageSource":
                            sourceId = maps.AddSource<StaticImageSource>(JsonConvert.DeserializeObject<StaticImageSource>(serializedSource));
                            break;
                        case "TileArcGISRestSource":
                            sourceId = maps.AddSource<TileArcGISRestSource>(JsonConvert.DeserializeObject<TileArcGISRestSource>(serializedSource));
                            break;
                        case "TileWMSSource":
                            sourceId = maps.AddSource<TileWMSSource>(JsonConvert.DeserializeObject<TileWMSSource>(serializedSource));
                            break;
                        case "DynamicVectorSource":
                            sourceId = maps.AddSource<DynamicVectorSource>(JsonConvert.DeserializeObject<DynamicVectorSource>(serializedSource));
                            break;
                        case "StaticVectorSource":
                            sourceId = maps.AddSource<StaticVectorSource>(JsonConvert.DeserializeObject<StaticVectorSource>(serializedSource));
                            break;
                        case "XYZSource":
                            sourceId = maps.AddSource<XYZSource>(JsonConvert.DeserializeObject<XYZSource>(serializedSource));
                            break;
                        case "ZoomifySource":
                            sourceId = maps.AddSource<ZoomifySource>(JsonConvert.DeserializeObject<ZoomifySource>(serializedSource));
                            break;
                        default:
                            break;
                    }
                    BroadcastSource(instanceId, sourceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateSource(int instanceId, int sourceId, string className, string serializedSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (className)
                    {
                        case "BingMapsSource":
                            maps.UpdateSource<BingMapsSource>(sourceId, JsonConvert.DeserializeObject<BingMapsSource>(serializedSource));
                            break;
                        case "CartoDBSource":
                            maps.UpdateSource<CartoDBSource>(sourceId, JsonConvert.DeserializeObject<CartoDBSource>(serializedSource));
                            break;
                        case "ImageTileSource":
                            maps.UpdateSource<ImageTileSource>(sourceId, JsonConvert.DeserializeObject<ImageTileSource>(serializedSource));
                            break;
                        case "MapQuestSource":
                            maps.UpdateSource<MapQuestSource>(sourceId, JsonConvert.DeserializeObject<MapQuestSource>(serializedSource));
                            break;
                        case "OSMSource":
                            maps.UpdateSource<OSMSource>(sourceId, JsonConvert.DeserializeObject<OSMSource>(serializedSource));
                            break;
                        case "StamenSource":
                            maps.UpdateSource<StamenSource>(sourceId, JsonConvert.DeserializeObject<StamenSource>(serializedSource));
                            break;
                        case "StaticImageSource":
                            maps.UpdateSource<StaticImageSource>(sourceId, JsonConvert.DeserializeObject<StaticImageSource>(serializedSource));
                            break;
                        case "TileArcGISRestSource":
                            maps.UpdateSource<TileArcGISRestSource>(sourceId, JsonConvert.DeserializeObject<TileArcGISRestSource>(serializedSource));
                            break;
                        case "TileWMSSource":
                            maps.UpdateSource<TileWMSSource>(sourceId, JsonConvert.DeserializeObject<TileWMSSource>(serializedSource));
                            break;
                        case "DynamicVectorSource":
                            maps.UpdateSource<DynamicVectorSource>(sourceId, JsonConvert.DeserializeObject<DynamicVectorSource>(serializedSource));
                            break;
                        case "StaticVectorSource":
                            maps.UpdateSource<StaticVectorSource>(sourceId, JsonConvert.DeserializeObject<StaticVectorSource>(serializedSource));
                            break;
                        case "XYZSource":
                            maps.UpdateSource<XYZSource>(sourceId, JsonConvert.DeserializeObject<XYZSource>(serializedSource));
                            break;
                        case "ZoomifySource":
                            maps.UpdateSource<ZoomifySource>(sourceId, JsonConvert.DeserializeObject<ZoomifySource>(serializedSource));
                            break;
                        default:
                            break;
                    }
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
                        Clients.Caller.receiveSource(instanceId, sourceId, serializedSource, true);
                    }
                    else
                    {
                        Clients.Caller.receiveSource(instanceId, sourceId, "", false);
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
                    Clients.Group("" + instanceId).receiveSource(instanceId, sourceId, serializedSource, true);
                    Clients.Group("c" + instanceId).receiveSource(instanceId, sourceId, serializedSource, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveSource(instanceId, sourceId, "",  false);
                    Clients.Group("c" + instanceId).receiveSource(instanceId, sourceId, "", false);
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

        public void AddStyle(int instanceId, string className, string serializedStyle)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = -1;
                    switch (className)
                    {
                        case "CircleStyle":
                            styleId = maps.AddStyle<CircleStyle>(JsonConvert.DeserializeObject<CircleStyle>(serializedStyle));
                            break;
                        case "FillStyle":
                            styleId = maps.AddStyle<FillStyle>(JsonConvert.DeserializeObject<FillStyle>(serializedStyle));
                            break;
                        case "IconStyle":
                            styleId = maps.AddStyle<IconStyle>(JsonConvert.DeserializeObject<IconStyle>(serializedStyle));
                            break;
                        case "ImageStyle":
                            styleId = maps.AddStyle<ImageStyle>(JsonConvert.DeserializeObject<ImageStyle>(serializedStyle));
                            break;
                        case "RegularShapeStyle":
                            styleId = maps.AddStyle<RegularShapeStyle>(JsonConvert.DeserializeObject<RegularShapeStyle>(serializedStyle));
                            break;
                        case "StrokeStyle":
                            styleId = maps.AddStyle<StrokeStyle>(JsonConvert.DeserializeObject<StrokeStyle>(serializedStyle));
                            break;
                        case "TextStyle":
                            styleId = maps.AddStyle<TextStyle>(JsonConvert.DeserializeObject<TextStyle>(serializedStyle));
                            break;
                        case "Style":
                            styleId = maps.AddStyle<GDO.Apps.Maps.Core.Styles.Style>(JsonConvert.DeserializeObject<GDO.Apps.Maps.Core.Styles.Style>(serializedStyle));
                            break;
                        default:
                            break;
                    }
                    BroadcastStyle(instanceId, styleId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateStyle(int instanceId, int styleId, string className, string serializedStyle)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (className)
                    {
                        case "CircleStyle":
                            maps.UpdateStyle<CircleStyle>(styleId, JsonConvert.DeserializeObject<CircleStyle>(serializedStyle));
                            break;
                        case "FillStyle":
                            maps.UpdateStyle<FillStyle>(styleId, JsonConvert.DeserializeObject<FillStyle>(serializedStyle));
                            break;
                        case "IconStyle":
                            maps.UpdateStyle<IconStyle>(styleId, JsonConvert.DeserializeObject<IconStyle>(serializedStyle));
                            break;
                        case "ImageStyle":
                            maps.UpdateStyle<ImageStyle>(styleId, JsonConvert.DeserializeObject<ImageStyle>(serializedStyle));
                            break;
                        case "RegularShapeStyle":
                            maps.UpdateStyle<RegularShapeStyle>(styleId, JsonConvert.DeserializeObject<RegularShapeStyle>(serializedStyle));
                            break;
                        case "StrokeStyle":
                            maps.UpdateStyle<StrokeStyle>(styleId, JsonConvert.DeserializeObject<StrokeStyle>(serializedStyle));
                            break;
                        case "Style":
                            maps.UpdateStyle<GDO.Apps.Maps.Core.Styles.Style>(styleId, JsonConvert.DeserializeObject<GDO.Apps.Maps.Core.Styles.Style>(serializedStyle));
                            break;
                        case "TextStyle":
                            maps.UpdateStyle<TextStyle>(styleId, JsonConvert.DeserializeObject<TextStyle>(serializedStyle));
                            break;
                        default:
                            break;
                    }
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
                        Clients.Caller.receiveStyle(instanceId, styleId, serializedStyle, true);
                    }
                    else
                    {
                        Clients.Caller.receiveStyle(instanceId, styleId, "", false);
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
                    Clients.Group("" + instanceId).receiveStyle(instanceId, styleId, serializedStyle, true);
                    Clients.Group("c" + instanceId).receiveStyle(instanceId, styleId, serializedStyle, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveStyle(instanceId, styleId, "", false);
                    Clients.Group("c" + instanceId).receiveStyle(instanceId, styleId, "", false);
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
        public void AddFormat(int instanceId, string className, string serializedFormat)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Format deserializedFormat = JsonConvert.DeserializeObject<Format>(serializedFormat);
                    int formatId = -1;
                    switch (className)
                    {
                        case "EsriJSONFormat":
                            formatId = maps.AddFormat<EsriJSONFormat>(JsonConvert.DeserializeObject<EsriJSONFormat>(serializedFormat));
                            break;
                        case "GeoJSONFormat":
                            formatId = maps.AddFormat<GeoJSONFormat>(JsonConvert.DeserializeObject<GeoJSONFormat>(serializedFormat));
                            break;
                        case "GMLFormat":
                            formatId = maps.AddFormat<GMLFormat>(JsonConvert.DeserializeObject<GMLFormat>(serializedFormat));
                            break;
                        case "KMLFormat":
                            formatId = maps.AddFormat<KMLFormat>(JsonConvert.DeserializeObject<KMLFormat>(serializedFormat));
                            break;
                        case "OSMXMLFormat":
                            formatId = maps.AddFormat<OSMXMLFormat>(JsonConvert.DeserializeObject<OSMXMLFormat>(serializedFormat));
                            break;
                        case "TopoJSONFormat":
                            formatId = maps.AddFormat<TopoJSONFormat>(JsonConvert.DeserializeObject<TopoJSONFormat>(serializedFormat));
                            break;
                        case "WFSFormat":
                            formatId = maps.AddFormat<WFSFormat>(JsonConvert.DeserializeObject<WFSFormat>(serializedFormat));
                            break;
                        case "XMLFormat":
                            formatId = maps.AddFormat<XMLFormat>(JsonConvert.DeserializeObject<XMLFormat>(serializedFormat));
                            break;
                        default:
                            break;
                    }
                    BroadcastFormat(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateFormat(int instanceId, int formatId, string className, string serializedFormat)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (className)
                    {
                        case "EsriJSONFormat":
                            maps.UpdateFormat<EsriJSONFormat>(formatId, JsonConvert.DeserializeObject<EsriJSONFormat>(serializedFormat));
                            break;
                        case "GeoJSONFormat":
                            maps.UpdateFormat<GeoJSONFormat>(formatId, JsonConvert.DeserializeObject<GeoJSONFormat>(serializedFormat));
                            break;
                        case "GMLFormat":
                            maps.UpdateFormat<GMLFormat>(formatId, JsonConvert.DeserializeObject<GMLFormat>(serializedFormat));
                            break;
                        case "KMLFormat":
                            maps.UpdateFormat<KMLFormat>(formatId, JsonConvert.DeserializeObject<KMLFormat>(serializedFormat));
                            break;
                        case "OSMXMLFormat":
                            maps.UpdateFormat<OSMXMLFormat>(formatId, JsonConvert.DeserializeObject<OSMXMLFormat>(serializedFormat));
                            break;
                        case "TopoJSONFormat":
                            maps.UpdateFormat<TopoJSONFormat>(formatId, JsonConvert.DeserializeObject<TopoJSONFormat>(serializedFormat));
                            break;
                        case "WFSFormat":
                            maps.UpdateFormat<WFSFormat>(formatId, JsonConvert.DeserializeObject<WFSFormat>(serializedFormat));
                            break;
                        case "XMLFormat":
                            maps.UpdateFormat<XMLFormat>(formatId, JsonConvert.DeserializeObject<XMLFormat>(serializedFormat));
                            break;
                        default:
                            break;
                    }
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
                    string serializedFormat = maps.GetSerializedFormat(formatId);
                    if (serializedFormat != null)
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId,serializedFormat, true);
                    }
                    else
                    {
                        Clients.Caller.receiveFormat(instanceId, formatId, "", false);
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
                string serializedFormat = maps.GetSerializedFormat(formatId);
                if (serializedFormat != null)
                {
                    Clients.Group("" + instanceId).receiveFormat(instanceId, formatId,serializedFormat, true);
                    Clients.Group("c" + instanceId).receiveFormat(instanceId, formatId, serializedFormat, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveFormat(instanceId, formatId, "", false);
                    Clients.Group("c" + instanceId).receiveFormat(instanceId, formatId, "", false);
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