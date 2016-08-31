using System;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Runtime.InteropServices;
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

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }

        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
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

        

        public void SetImageConfig(int instanceId, double windowWidth, double windowCenter, 
            string rotateView, dynamic currentCoord, dynamic markingCoords)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Updating Image Config- server");
                    
                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).SetImage(
                                    currentCoord, 
                                    windowWidth, 
                                    windowCenter
                    );

                    Clients.Group("" + instanceId).receiveImageUpdate(
                                    instanceId, 
                                    windowWidth, 
                                    windowCenter,
                                    rotateView,
                                    currentCoord,
                                    markingCoords
                    );
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
                    AppConfiguration appConfig = Cave.Apps["XNATImaging"].Configurations["Default"];
                    Debug.WriteLine(nodeId);
                    if (appConfig != null)
                    {
                        Debug.WriteLine(appConfig.Name);
                        //Debug.WriteLine(appConfig.Json);
                        
                        var jsonString = appConfig.Json.ToString();
                        dynamic config = JObject.Parse(jsonString);

                        if (nodeId == 0)
                        {
                            Debug.WriteLine("Delete screen configs");
                            config.screens.Replace(
                                JObject.FromObject(new { }));
                        }
                        else
                        {
                            foreach (var screen in config.screens)
                            {
                                int row = screen.row;
                                int col = screen.col;
                                if (row == Cave.Nodes[nodeId].Row && col == Cave.Nodes[nodeId].Col)
                                {
                                    // send config
                                    Debug.WriteLine("Replaced screen config");
                                    config.screens.Replace(
                                        JObject.FromObject(screen));
                                }
                            }
                        }

                        var jsonStr = config.ToString();
                        var jsonStri = appConfig.Json.ToString();
                        Clients.Caller.receiveConfig(instanceId, config);
                    }

                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            }
        }



        public void RequestScreenSwitch(int instanceId, string url, string modality)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    AppConfiguration appConfig = Cave.Apps["XNATImaging"].Configurations["Default"];
                    if (appConfig != null)
                    {
                        Debug.WriteLine(appConfig.Name);
                        //Debug.WriteLine(appConfig.Json);
                        var jsonString = appConfig.Json.ToString();
                        dynamic config = JObject.Parse(jsonString);

                        config.controlUrl = url;

                        foreach (var screen in config.screens)
                        {
                            if (screen.config.mode == "zoom" && screen.config.switchable != null && (bool) screen.config.switchable)
                            {
                                screen.config.url = url;
                                screen.config.modality = modality;
                            }
                        }

                        appConfig.Json = config;

                        var jsonStr = config.ToString();
                        var jsonStri = appConfig.Json.ToString();
                        Clients.Group("" + instanceId).receiveScreenSwitch(instanceId);
                    }

                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
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
    }
}