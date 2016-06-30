using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Web.Helpers;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
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

        public void Init()
        {
            Debug.WriteLine("Hub initialised!");
        }

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
                    Debug.WriteLine("Sending control over");
                    Debug.WriteLine(instanceId);
                    Debug.WriteLine(Cave.ContainsInstance(instanceId));

                    /*dynamic variableJson = Utilities.LoadJsonFile("Configurations/XNATImaging/Zoom.json");
                    ((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Configuration = new AppConfiguration("Zoom", variableJson);
                    Debug.WriteLine(((XNATImagingApp)Cave.Apps["XNATImaging"].Instances[instanceId]).Configuration.Name);

                    List<string> configurations = Cave.Apps["XNATImaging"].GetConfigurationList();
                    Debug.WriteLine(configurations.Count);
                    for (int i = 0; i < configurations.Count; i++)
                    {
                        Debug.WriteLine(i + ". " + configurations[i]);
                    }*/

                    Clients.Group("" + instanceId).receiveControl(instanceId, controlName);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestConfig(int instanceId, int nodeId, string configName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    AppConfiguration value;
                    if (Cave.Apps["XNATImaging"].Configurations.TryGetValue(configName + nodeId, out value))
                    {

                        Clients.Caller.receiveConfig(instanceId, value.Json);
                    }

                    
                    Debug.WriteLine(instanceId);
                    Debug.WriteLine(Cave.ContainsInstance(instanceId));
                    Debug.WriteLine(Cave.ContainsNode(instanceId));

                    List<int> keyList = new List<int>(Cave.Apps["XNATImaging"].Instances.Keys);
                    Debug.WriteLine(keyList);


                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}