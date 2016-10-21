using System;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.FusionChart
{
    [Export(typeof(IAppHub))]
    public class FusionChartAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "FusionChart";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new FusionChartApp().GetType();
        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void BroadcastChartType(int instanceId, string chartType)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).receiveChartType(instanceId, chartType);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastChartConfig(int instanceId, string configKey, string configValue)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).receiveChartConfig(instanceId, configKey, configValue);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SaveConfig(int instanceId, string config)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    bool success = ((FusionChartApp)Cave.Apps["FusionChart"].Instances[instanceId]).ProcessSaveConfig(config);
                    Clients.Caller.saveConfigFinished(instanceId, success);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        } 

        //        public void PrintState(int instanceId)
        //        {
        //            lock (Cave.AppLocks[instanceId])
        //            {
        //                try
        //                {
        //                    Clients.Group("" + instanceId).printState(instanceId);
        //                }
        //                catch (Exception e)
        //                {
        //                    Console.WriteLine(e);
        //                }
        //            }
        //        }

        public void ReRender(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).reRender(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetDebugMode(int instanceId, bool showDebug)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).setDebugMode(instanceId, showDebug);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SendMouseEvent(int instanceId, string serialisedMouseEvent)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Broadcasting mouse event: " + serialisedMouseEvent);
                    string me =
                        ((FusionChartApp) Cave.Apps["FusionChart"].Instances[instanceId]).ProcessMouseEvent(
                            serialisedMouseEvent);
                    Clients.Group("" + instanceId).receiveMouseEvent(instanceId, me);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ProcessFile(int instanceId, string fileName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Process file: " + fileName);
                    if(((FusionChartApp)Cave.Apps["FusionChart"].Instances[instanceId]).ProcessFile(fileName))
                    {
                        BroadcastChartData(instanceId, true);
                    }      
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DeleteFile(int instanceId, string fileName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Debug.WriteLine("Delete file: " + fileName);
                    if (((FusionChartApp)Cave.Apps["FusionChart"].Instances[instanceId]).DeleteFile(fileName))
                    {
                        Clients.Caller.deleteFileFinished(instanceId, fileName);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void GetChartData(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    BroadcastChartData(instanceId, false);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BroadcastChartData(int instanceId, bool toAll)
        {
            string serialisedChartData =
                ((FusionChartApp) Cave.Apps["FusionChart"].Instances[instanceId]).GetChartData();
            Clients.Caller.receiveChartData(instanceId, serialisedChartData);
            if (toAll)
            {
                Debug.WriteLine("Broadcasting");
                Clients.Group("" + instanceId).receiveChartData(instanceId, serialisedChartData);
            }
        }
        
    }
}