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

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, Json, FA.Sync);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, Json, FA.Sync);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AckFrameRendered(int instanceId, int clientId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);

                    // Ack frames
                    if (FA.RenderedFrameNodesAcked[clientId-1] == 0)
                    {
                        FA.RenderedFrameNodesAcked[clientId-1] = 1;
                    }

                    // Sum acks
                    int sum = 0;
                    for (int i = 0; i < 64; i++)
                    {
                        sum += FA.RenderedFrameNodesAcked[i];
                    }

                    if (sum >= FA.Section.NumNodes)
                    {

                        FA.CurrentFrame = (FA.CurrentFrame + 1) % 2;

                        string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);

                        Clients.Group("" + instanceId).swapFrame(instanceId, Json, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds + FA.SyncTime);
                    }
                    

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AckSwapFrame(int instanceId, int clientId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);

                        // Ack frames
                        if (FA.SwapFrameNodesAcked[clientId-1] == 0)
                        {
                            FA.SwapFrameNodesAcked[clientId-1] = 1;
                        }

                        // Sum acks
                        int sum = 0;
                        for (int i = 0; i < 64; i++)
                        {
                            sum += FA.SwapFrameNodesAcked[i];
                        }

                        if (sum >= FA.Section.NumNodes)
                        {
                            
                            // Reset acks
                            for (int i = 0; i < 64; i++)
                            {
                                FA.SwapFrameNodesAcked[i] = 0;
                            }

                            for (int i = 0; i < 64; i++)
                            {
                                FA.RenderedFrameNodesAcked[i] = 0;
                            }                 

                            Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame, FA.Sync);
                        }
                    
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BeginRendering(int instanceId)
        {
            if (instanceId == -1) return;
                try
                {
                    RayMarchingApp FA = ((RayMarchingApp)Cave.Apps["RayMarching"].Instances[instanceId]);
                    Clients.Caller.renderNextFrame(instanceId, FA.CurrentFrame, FA.Sync);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
        }
    }
}