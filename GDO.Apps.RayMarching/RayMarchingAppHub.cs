using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using System.Threading;
using GDO.Core.Apps;

namespace GDO.Apps.RayMarching
{
    [Export(typeof(IAppHub))]
    public class RayMarchingAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "RayMarching";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new RayMarchingApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public JsonSerializerSettings JsonSettings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All};

        public void SendParams(int instanceId)
        {
            try
            {
                RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                if (!FA.Sync)
                {
                    string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);
                    Clients.Group("" + instanceId).updateParams(instanceId, Json);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void JoystickInit(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.JoystickInit(this, instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void JoystickReceiveParamsRot(int instanceId, float angle, float magnitude)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.JoystickUpdateParamsRot(angle, magnitude);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void JoystickReceiveParamsMove(int instanceId, float angle, float magnitude)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.JoystickUpdateParamsMove(angle, magnitude);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void JoystickTerminate(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.JoystickTerminate();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void HeightSliderReceiveParamsMove(int instanceId, float val)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.HeightSliderUpdateParamsMove(val);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }






        public void SyncTime(int instanceId, int val)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.SyncTime = val;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SyncToggle(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    FA.Sync = !FA.Sync;
                    string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);
                    Clients.Group("" + instanceId).updateParams(instanceId, Json);
                    Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AckFrameRendered(int instanceId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    if (FA.rendering)
                    {
                        
                        FA.Acks++;

                        if (FA.Acks >= FA.Nodes)
                        {
                            FA.rendering = false;
                            FA.swapping = true;
                            FA.CurrentFrame = (FA.CurrentFrame + 1) % 2;

                            string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);

                            Clients.Group("" + instanceId).swapFrame(instanceId, Json, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds + FA.SyncTime);
                        }
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AckSwapFrame(int instanceId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    if (FA.swapping)
                    {
                        
                        FA.SwapFrameAcks++;

                        if (FA.SwapFrameAcks >= FA.Nodes)
                        {
                            FA.swapping = false;
                            FA.rendering = true;
                            FA.Acks = 0;
                            FA.SwapFrameAcks = 0;
                            FA.Nodes += FA.NewNodes;
                            FA.NewNodes = 0;
                            Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame);
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void IncNodes(int instanceId, int clientId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    if (FA.NodesOnline[clientId] != 1) {
                        if (FA.NewNodes == 0 && FA.Nodes == 0)
                        {
                            // Start synch cycle
                            FA.Nodes = 1;
                            Clients.Caller.renderNextFrame(instanceId, FA.CurrentFrame);
                        }
                        else
                        {
                            // Add new nodes after current cycle
                            FA.NewNodes++;
                        }
                        FA.NodesOnline[clientId] = 1;
                    } else
                    {
                        FA.rendering = true;
                        FA.swapping = false;
                        FA.Acks = 0;
                        FA.SwapFrameAcks = 0;
                        // Refreshed page, render relevant frame
                        if (FA.Sync)
                        {
                            Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame);
                        } else
                        {
                            Clients.Group("" + instanceId).renderNextFrameNoSync();
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DecNodes(int instanceId, int clientId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    if (FA.NodesOnline[clientId] == 1)
                    {
                        FA.Nodes--;
                        FA.NodesOnline[clientId] = 0;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

    }
}