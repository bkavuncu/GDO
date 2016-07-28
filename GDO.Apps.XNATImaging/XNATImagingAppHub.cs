using System;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.XNATImaging
{
    [Export(typeof(IAppHub))]
    public class XNATImagingAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "XNATImaging";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new XNATImagingApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).receiveName(instanceId, name);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveName(instanceId, ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetControl(int instanceId, string controlName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Setting new control - server");

                    /*dynamic variableJson = Utilities.LoadJsonFile("Configurations/XNATImaging/Zoom.json");
                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Configuration = new AppConfiguration("Zoom", variableJson);
                    Debug.WriteLine(((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Configuration.Name);

                    List<string> configurations = Cave.Apps["XNATImaging"].GetConfigurationList();
                    Debug.WriteLine(configurations.Count);
                    for (int i = 0; i < configurations.Count; i++)
                    {
                        Debug.WriteLine(i + ". " + configurations[i]);
                    }
                    */
                   Clients.Group("" + instanceId).receiveControl(instanceId, controlName);
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            }
        }

        public void RequestConfig(int instanceId, int nodeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    AppConfiguration zoomConfig = ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).GetZoomConfiguration(nodeId);
                    if (zoomConfig != null)
                    {
                        Debug.WriteLine(zoomConfig.Name);
                        Debug.WriteLine(zoomConfig.Json);
                        Clients.Caller.receiveConfig(instanceId, zoomConfig.Json);
                    }
                    /*Debug.WriteLine(Cave.Apps["XNATImaging"].Instances[Id].Configuration);
                    List<string> configurations = Cave.Apps["XNATImaging"].GetConfigurationList();
                    Debug.WriteLine(configurations.Count);*/

                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            }
        }

        public void SetImageConfig(int instanceId, int currentImageId, double windowWidth, double windowCenter, double scale, double translationX, double translationY, bool rotateView)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Updating Image Config- server");
                    
                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).SetImage(
                                    currentImageId, 
                                    windowWidth, 
                                    windowCenter,
                                    scale, 
                                    translationX, 
                                    translationY
                    );

                    Clients.Group("" + instanceId).receiveImageUpdate(
                                    instanceId, 
                                    currentImageId, 
                                    windowWidth, 
                                    windowCenter, 
                                    scale, 
                                    translationX, 
                                    translationY,
                                    rotateView
                    );
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            }
        }
    }
}