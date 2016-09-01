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
            string currentOrientation, dynamic currentCoord, dynamic markingCoords)
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
                                    currentOrientation,
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
                        var jsonString = appConfig.Json.ToString();
                        dynamic config = JObject.Parse(jsonString);

                        // control node
                        if (nodeId == 0)
                        {
                            Debug.WriteLine("Delete screen configs");
                            config.screens.Replace(
                                JObject.FromObject(new { }));

                            config.mriUrlList.Replace(((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).GetMriList());
                            config.overlayLesions = new JArray(
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultBaselineOverlays[1], 
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultFollowupOverlays[1]);
                            config.patientsList = new JArray(((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Patients);
                        }
                        // client node
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

                        var index = -1;
                        for (int i = 0; i < config.mriUrlList; i++)
                        {
                            if (config.mriUrlList[i].url == url)
                            {
                                index = i;
                                break;
                            }
                        }
                        string color = ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).mriColors[0];
                        if (index != -1)
                        {
                            color = ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).mriColors[index];
                        }

                        //index = Array.IndexOf(config.mriUrlList, JObject.FromObject(new { modality, url }));

                        foreach (var screen in config.screens)
                        {
                            if (screen.config.mode == "zoom" && screen.config.switchable != null && (bool) screen.config.switchable)
                            {
                                screen.config.url = url;
                                screen.config.modality = modality;
                                screen.config.color = color;
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


        public void SetPatient(int instanceId, string patientId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Setting new patient - server");

                    var index = 0;
                    index = Array.IndexOf(((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Patients, patientId);
                    if (index >= 0 && index < ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Patients.Length)
                    {
                        ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).PatientId = 
                                                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Patients[index];

                        ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).ExperimentName = 
                                                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Experiments[index];

                        AppConfiguration appConfig = Cave.Apps["XNATImaging"].Configurations["Default"];
                        if (appConfig != null)
                        {
                            appConfig.Json = ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).GenerateDefaultConfigurationFile(
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultTextStrings,
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultMriUrls,
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultModalityStrings,
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultZoomUrls,
                                ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).DefaultPdfUrls);

                        }
                        Clients.Group("" + instanceId).receivePatientChange(instanceId);
                        Clients.Caller.receivePatientChange(instanceId);
                    }
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e);
                }
            }
        }

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
    }
}