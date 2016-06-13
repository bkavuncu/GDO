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
using GDO.Apps.Maps.Core.Layers;
using GDO.Apps.Maps.Core.Sources;
using GDO.Apps.Maps.Core.Sources.Images;
using GDO.Apps.Maps.Core.Styles;
using GDO.Apps.Maps.Core.Formats;
using GDO.Core;
using GDO.Core.Apps;

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
        public void AddView(int instanceId, string serializedView)
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

        public void UpdateView(int instanceId, int viewId, string serializedView)
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
                    Clients.Caller.receiveView(instanceId, viewId, serializedView, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveView(instanceId, viewId, "", false);
                    Clients.Caller.receiveSource(instanceId, viewId, "", false);
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

        public void UpdateCurrentView(int instanceId, double[] topLeft, double[] center, double[] bottomRight, float resolution,
            int zoom, string projection, float rotation, int width, int height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Position position = new Position(topLeft, center, bottomRight, resolution, zoom);
                    maps.UpdateCurrentView(position, projection, rotation, width, height);
                    BroadcastCurrentView(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestCurrentView(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    string serializedView = maps.GetSerializedCurrentView();
                    Clients.Caller.receiveView(instanceId, serializedView);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastCurrentView(int instanceId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            string serializedView = maps.GetSerializedCurrentView();
            Clients.Group("" + instanceId).receiveCurrentView(instanceId,serializedView);
        }

        public void SetCurrentView(int instanceId, int viewId)
        {
            MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
            maps.UseView(viewId);
            BroadcastCurrentView(instanceId);
        }

        //Layer

        public void AddLayer(int instanceId, int type, string serializedLayer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int layerId = -1;
                    switch (type)
                    {
                        case (int)LayerTypes.Heatmap:
                            layerId = maps.AddLayer<HeatmapLayer>(JsonConvert.DeserializeObject<HeatmapLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Image:
                            layerId = maps.AddLayer<ImageLayer>(JsonConvert.DeserializeObject<ImageLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Tile:
                            layerId = maps.AddLayer<TileLayer>(JsonConvert.DeserializeObject<TileLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Vector:
                            layerId = maps.AddLayer<VectorLayer>(JsonConvert.DeserializeObject<VectorLayer>(serializedLayer));
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

        public void UpdateLayer(int instanceId, int layerId, int type, string serializedLayer)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (type)
                    {
                        case (int)LayerTypes.Heatmap:
                            maps.UpdateLayer<HeatmapLayer>(layerId, JsonConvert.DeserializeObject<HeatmapLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Image:
                            maps.UpdateLayer<ImageLayer>(layerId, JsonConvert.DeserializeObject<ImageLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Tile:
                            maps.UpdateLayer<TileLayer>(layerId, JsonConvert.DeserializeObject<TileLayer>(serializedLayer));
                            break;
                        case (int)LayerTypes.Vector:
                            maps.UpdateLayer<VectorLayer>(layerId, JsonConvert.DeserializeObject<VectorLayer>(serializedLayer));
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
                    Clients.Group("" + instanceId).receiveLayer(instanceId, layerId, serializedLayer, true);
                    Clients.Caller.receiveLayer(instanceId, layerId, serializedLayer, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveLayer(instanceId, layerId, "", false);
                    Clients.Caller.receiveLayer(instanceId, layerId, "", false);
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
        public void AddSource(int instanceId, int type, string serializedSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int sourceId = -1;
                    switch (type)
                    {
                        case (int)SourceTypes.BingMaps:
                            sourceId = maps.AddSource<BingMapsSource>(JsonConvert.DeserializeObject<Source>(serializedSource));
                            break;
                        case (int)SourceTypes.ImageCanvas:
                            sourceId = maps.AddSource<CanvasImageSource>(JsonConvert.DeserializeObject<CanvasImageSource>(serializedSource));
                            break;
                        case (int)SourceTypes.CartoDB:
                            sourceId = maps.AddSource<CartoDBSource>(JsonConvert.DeserializeObject<CartoDBSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileImage:
                            sourceId = maps.AddSource<ImageTileSource>(JsonConvert.DeserializeObject<ImageTileSource>(serializedSource));
                            break;
                        case (int)SourceTypes.MapQuest:
                            sourceId = maps.AddSource<MapQuestSource>(JsonConvert.DeserializeObject<MapQuestSource>(serializedSource));
                            break;
                        case (int)SourceTypes.OSM:
                            sourceId = maps.AddSource<OSMSource>(JsonConvert.DeserializeObject<OSMSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Stamen:
                            sourceId = maps.AddSource<StamenSource>(JsonConvert.DeserializeObject<StamenSource>(serializedSource));
                            break;
                        case (int)SourceTypes.ImageStatic:
                            sourceId = maps.AddSource<StaticImageSource>(JsonConvert.DeserializeObject<StaticImageSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileArcGISRest:
                            sourceId = maps.AddSource<TileArcGISRestSource>(JsonConvert.DeserializeObject<TileArcGISRestSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileWMS:
                            sourceId = maps.AddSource<TileWMSSource>(JsonConvert.DeserializeObject<TileWMSSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Vector:
                            sourceId = maps.AddSource<VectorSource>(JsonConvert.DeserializeObject<VectorSource>(serializedSource));
                            break;
                        case (int)SourceTypes.XYZ:
                            sourceId = maps.AddSource<XYZSource>(JsonConvert.DeserializeObject<XYZSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Zoomify:
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

        public void UpdateSource(int instanceId, int sourceId, int type, string serializedSource)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (type)
                    {
                        case (int)SourceTypes.BingMaps:
                            maps.UpdateSource<BingMapsSource>(sourceId, JsonConvert.DeserializeObject<BingMapsSource>(serializedSource));
                            break;
                        case (int)SourceTypes.ImageCanvas:
                            maps.UpdateSource<CanvasImageSource>(sourceId, JsonConvert.DeserializeObject<CanvasImageSource>(serializedSource));
                            break;
                        case (int)SourceTypes.CartoDB:
                            maps.UpdateSource<CartoDBSource>(sourceId, JsonConvert.DeserializeObject<CartoDBSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileImage:
                            maps.UpdateSource<ImageTileSource>(sourceId, JsonConvert.DeserializeObject<ImageTileSource>(serializedSource));
                            break;
                        case (int)SourceTypes.MapQuest:
                            maps.UpdateSource<MapQuestSource>(sourceId, JsonConvert.DeserializeObject<MapQuestSource>(serializedSource));
                            break;
                        case (int)SourceTypes.OSM:
                            maps.UpdateSource<OSMSource>(sourceId, JsonConvert.DeserializeObject<OSMSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Stamen:
                            maps.UpdateSource<StamenSource>(sourceId, JsonConvert.DeserializeObject<StamenSource>(serializedSource));
                            break;
                        case (int)SourceTypes.ImageStatic:
                            maps.UpdateSource<StaticImageSource>(sourceId, JsonConvert.DeserializeObject<StaticImageSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileArcGISRest:
                            maps.UpdateSource<TileArcGISRestSource>(sourceId, JsonConvert.DeserializeObject<TileArcGISRestSource>(serializedSource));
                            break;
                        case (int)SourceTypes.TileWMS:
                            maps.UpdateSource<TileWMSSource>(sourceId, JsonConvert.DeserializeObject<TileWMSSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Vector:
                            maps.UpdateSource<VectorSource>(sourceId, JsonConvert.DeserializeObject<VectorSource>(serializedSource));
                            break;
                        case (int)SourceTypes.XYZ:
                            maps.UpdateSource<XYZSource>(sourceId, JsonConvert.DeserializeObject<XYZSource>(serializedSource));
                            break;
                        case (int)SourceTypes.Zoomify:
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
                    Clients.Caller.receiveSource(instanceId, sourceId, serializedSource, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveSource(instanceId, sourceId, "",  false);
                    Clients.Caller.receiveSource(instanceId, sourceId, "", false);
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

        public void AddStyle(int instanceId, int type, string serializedStyle)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    int styleId = -1;
                    switch (type)
                    {
                        case (int)StyleTypes.Circle:
                            styleId = maps.AddStyle<CircleStyle>(JsonConvert.DeserializeObject<CircleStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Fill:
                            styleId = maps.AddStyle<FillStyle>(JsonConvert.DeserializeObject<FillStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Icon:
                            styleId = maps.AddStyle<IconStyle>(JsonConvert.DeserializeObject<IconStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Image:
                            styleId = maps.AddStyle<ImageStyle>(JsonConvert.DeserializeObject<ImageStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.RegularShape:
                            styleId = maps.AddStyle<RegularShapeStyle>(JsonConvert.DeserializeObject<RegularShapeStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Stroke:
                            styleId = maps.AddStyle<StrokeStyle>(JsonConvert.DeserializeObject<StrokeStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Text:
                            styleId = maps.AddStyle<TextStyle>(JsonConvert.DeserializeObject<TextStyle>(serializedStyle));
                            break;
                        case (int)GDO.Apps.Maps.Core.StyleTypes.Style:
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

        public void UpdateStyle(int instanceId, int styleId, int type, string serializedStyle)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (type)
                    {
                        case (int)StyleTypes.Circle:
                            maps.UpdateStyle<CircleStyle>(styleId, JsonConvert.DeserializeObject<CircleStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Fill:
                            maps.UpdateStyle<FillStyle>(styleId, JsonConvert.DeserializeObject<FillStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Icon:
                            maps.UpdateStyle<IconStyle>(styleId, JsonConvert.DeserializeObject<IconStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Image:
                            maps.UpdateStyle<ImageStyle>(styleId, JsonConvert.DeserializeObject<ImageStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.RegularShape:
                            maps.UpdateStyle<RegularShapeStyle>(styleId, JsonConvert.DeserializeObject<RegularShapeStyle>(serializedStyle));
                            break;
                        case (int)StyleTypes.Stroke:
                            maps.UpdateStyle<StrokeStyle>(styleId, JsonConvert.DeserializeObject<StrokeStyle>(serializedStyle));
                            break;
                        case (int)GDO.Apps.Maps.Core.StyleTypes.Style:
                            maps.UpdateStyle<GDO.Apps.Maps.Core.Styles.Style>(styleId, JsonConvert.DeserializeObject<GDO.Apps.Maps.Core.Styles.Style>(serializedStyle));
                            break;
                        case (int)StyleTypes.Text:
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
                    Clients.Caller.receiveStyle(instanceId, styleId, serializedStyle, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveStyle(instanceId, styleId, "", false);
                    Clients.Caller.receiveStyle(instanceId, styleId, "", false);
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
        public void AddFormat(int instanceId, int type, string serializedFormat)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    Format deserializedFormat = JsonConvert.DeserializeObject<Format>(serializedFormat);
                    int formatId = -1;
                    switch (type)
                    {
                        case (int)FormatTypes.EsriJSON:
                            formatId = maps.AddFormat<EsriJSONFormat>(JsonConvert.DeserializeObject<EsriJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.GeoJSON:
                            formatId = maps.AddFormat<GeoJSONFormat>(JsonConvert.DeserializeObject<GeoJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.GML:
                            formatId = maps.AddFormat<GMLFormat>(JsonConvert.DeserializeObject<GMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.KML:
                            formatId = maps.AddFormat<KMLFormat>(JsonConvert.DeserializeObject<KMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.OSMXML:
                            formatId = maps.AddFormat<OSMXMLFormat>(JsonConvert.DeserializeObject<OSMXMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.TopoJSON:
                            formatId = maps.AddFormat<TopoJSONFormat>(JsonConvert.DeserializeObject<TopoJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.WFS:
                            formatId = maps.AddFormat<WFSFormat>(JsonConvert.DeserializeObject<WFSFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.XML:
                            formatId = maps.AddFormat<XMLFormat>(JsonConvert.DeserializeObject<XMLFormat>(serializedFormat));
                            break;
                        default:
                            break;
                    }
                    BroadcastStyle(instanceId, formatId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpdateFormat(int instanceId, int formatId, int type, string serializedFormat)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    MapsApp maps = ((MapsApp)Cave.Apps["Maps"].Instances[instanceId]);
                    switch (type)
                    {
                        case (int)FormatTypes.EsriJSON:
                            maps.UpdateFormat<EsriJSONFormat>(formatId, JsonConvert.DeserializeObject<EsriJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.GeoJSON:
                            maps.UpdateFormat<GeoJSONFormat>(formatId, JsonConvert.DeserializeObject<GeoJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.GML:
                            maps.UpdateFormat<GMLFormat>(formatId, JsonConvert.DeserializeObject<GMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.KML:
                            maps.UpdateFormat<KMLFormat>(formatId, JsonConvert.DeserializeObject<KMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.OSMXML:
                            maps.UpdateFormat<OSMXMLFormat>(formatId, JsonConvert.DeserializeObject<OSMXMLFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.TopoJSON:
                            maps.UpdateFormat<TopoJSONFormat>(formatId, JsonConvert.DeserializeObject<TopoJSONFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.WFS:
                            maps.UpdateFormat<WFSFormat>(formatId, JsonConvert.DeserializeObject<WFSFormat>(serializedFormat));
                            break;
                        case (int)FormatTypes.XML:
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
                    string serializedFormat = maps.GetFormat(formatId);
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
                string serializedFormat = maps.GetFormat(formatId);
                if (serializedFormat != null)
                {
                    Clients.Group("" + instanceId).receiveFormat(instanceId, formatId,serializedFormat, true);
                    Clients.Caller.receiveFormat(instanceId, formatId, serializedFormat, true);
                }
                else
                {
                    Clients.Group("" + instanceId).receiveFormat(instanceId, formatId, "", false);
                    Clients.Caller.receiveFormat(instanceId, formatId, "", false);
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