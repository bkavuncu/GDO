﻿using System;
using System.ComponentModel.Composition;
using System.Collections.Generic;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    [Export(typeof(IAppHub))]
    public class WebGLAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "WebGL";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Section;
        public Type InstanceType { get; set; } = new WebGLApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetCameraPosition(int instanceId, Camera camera)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).Camera = camera;
                    //Clients.Group("" + instanceId).receiveCameraPosition(instanceId, camera);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestCameraPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Camera camera = ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).Camera;
                    Clients.Caller.receiveCameraPosition(instanceId, camera);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void CollectStats(int instanceId, bool collectStats)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).CollectPerformanceData = collectStats;
                    Clients.Group("" + instanceId).collectStats(instanceId, collectStats);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestPerformanceData(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Dictionary<int, List<PerformanceData>> data = ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).PerformanceData;
                    Clients.Caller.receiveNewPerformanceData(instanceId, data);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AddNewPerformanceData(int instanceId, int nodeId, PerformanceData data)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).AddNewPerformanceData(nodeId, data);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void NotifyReadyForNextFrame(int instanceId, int nodeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    WebGLApp app = (WebGLApp)Cave.Apps["WebGL"].Instances[instanceId];

                    if (app.FrameSyncActive)
                    {
                        bool allRendered = app.NotifyReadyForNextFrame(nodeId);
                        if (allRendered)
                        {
                            Clients.Group("" + instanceId).renderFrame(instanceId, app.Camera);
                        }
                    }
                    else
                    {
                        Clients.Caller.renderFrame(instanceId, app.Camera);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetFrameSync(int instanceId, bool frameSyncActive)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).FrameSyncActive = frameSyncActive;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}