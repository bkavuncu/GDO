using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using System.Threading;
using GDO.Core.Apps;

namespace GDO.Apps.Fractals
{
    [Export(typeof(IAppHub))]
    public class FractalsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Fractals";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new FractalsApp().GetType();

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
                FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.HeightSliderUpdateParamsMove(val);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void StartAudio(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).startAudio(instanceId, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void MaxSteps(int instanceId, int maxSteps)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.MaxSteps = maxSteps;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Detail(int instanceId, float detail)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Detail = detail;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Fog(int instanceId, float fog)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Fog = fog;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public class Params
        {
                public double xRot;
                public double yRot;
                public double yHeight;
                public double xTrans;
                public double yTrans;
                public double zTrans;
                public int maxSteps;
                public double detail;
                public double fog;
                public double ambience;
                public double lightIntensity;
                public double lightSize;
                public double lightX;
                public double lightY;
                public double lightZ;
                public int iterations;
                public double power;
                public double red;
                public double green;
                public double blue;
                public double scale;
                public double cx;
                public double cy;
                public double cz;
                public double cw;
                public double threshold;
                public int modToggle;
                public int fractal;
        }

        public void FractalSelect(int instanceId, string json, string fractal)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Params p = Newtonsoft.Json.JsonConvert.DeserializeObject<Params>(json, JsonSettings);
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.XRot = (float) p.xRot;
                    FA.YRot = (float) p.yRot;
                    FA.XTrans = (float) p.xTrans;
                    FA.YTrans = (float) p.yTrans;
                    FA.ZTrans = (float) p.zTrans;
                    FA.MaxSteps = p.maxSteps;
                    FA.Detail = (float) p.detail;
                    FA.Fog = (float) p.fog;
                    FA.Ambience = (float) p.ambience;
                    FA.LightIntensity = (float) p.lightIntensity;
                    FA.LightSize = (float) p.lightSize;
                    FA.LightX = (float) p.lightX;
                    FA.LightY = (float) p.lightY;
                    FA.LightZ = (float) p.lightZ;
                    FA.Iterations = p.iterations;
                    FA.Power = (float)p.power;
                    FA.R = (float) p.red;
                    FA.G = (float) p.green;
                    FA.B = (float) p.blue;
                    FA.Scale = (float) p.scale;
                    FA.Cx = (float) p.cx;
                    FA.Cy = (float) p.cy;
                    FA.Cz = (float) p.cz;
                    FA.Cw = (float) p.cw;
                    FA.Threshold = (float) p.threshold;
                    FA.Mod = p.modToggle;
                    FA.Fractal = p.fractal;
                    

                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Iterations(int instanceId, int iterations)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Iterations = iterations;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
        
        public void Power(int instanceId, float power)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Power = power;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Scale(int instanceId, float scale)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Scale = scale;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void JuliaConstant(int instanceId, float cx, float cy, float cz, float cw)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Cx = cx;
                    FA.Cy = cy;
                    FA.Cz = cz;
                    FA.Cw = cw;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Threshold(int instanceId, float thresh)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Threshold = thresh;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Colour(int instanceId, float r, float g, float b)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.R = r/255.0f;
                    FA.G = g/255.0f;
                    FA.B = b/255.0f;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void Ambience(int instanceId, float ambience)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Ambience = ambience;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void LightIntensity(int instanceId, float li)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.LightIntensity = li;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void LightSize(int instanceId, float size)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.LightSize = size;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void JoystickReceiveParamsLight(int instanceId, float angle, float magnitude)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.JoystickUpdateParamsLight(angle, magnitude);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void HeightSliderReceiveParamsLight(int instanceId, float val)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.HeightSliderUpdateParamsLight(val);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.SyncTime = val;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }


        public void ModToggle(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.ToggleMod();
                    SendParams(instanceId);
                    
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.Sync = !FA.Sync;
                    string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);
                    Clients.Group("" + instanceId).updateParams(instanceId, Json);
                    //Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void AckFrameRendered(int instanceId, int clientId, byte f0, byte f1, byte f2, byte f3, byte f4, byte f5, byte f6, byte f7, byte f8, byte f9, byte f10, byte f11, byte f12, byte f13, byte f14, byte f15)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);

                    byte[] frequencyData = new byte[16];
                    frequencyData[0] = f0;
                    frequencyData[1] = f1;
                    frequencyData[2] = f2;
                    frequencyData[3] = f3;
                    frequencyData[4] = f4;
                    frequencyData[5] = f5;
                    frequencyData[6] = f6;
                    frequencyData[7] = f7;
                    frequencyData[8] = f8;
                    frequencyData[9] = f9;
                    frequencyData[10] = f10;
                    frequencyData[11] = f11;
                    frequencyData[12] = f12;
                    frequencyData[13] = f13;
                    frequencyData[14] = f14;
                    frequencyData[15] = f15;

                    FA.Freqs[clientId - 1] = frequencyData;

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

                        byte[] avgFreqs = new byte[frequencyData.Length];
                        for (int i = 0; i < 64; i++)
                        {
                            if (FA.Freqs[i] != null)
                            {
                                for (int j = 0; j < frequencyData.Length; j++)
                                {

                                    avgFreqs[j] += FA.Freqs[i][j];
                                }
                            }
                            
                        }

                        for (int i = 0; i < avgFreqs.Length; i++)
                        {
                            avgFreqs[i] /= (byte) FA.Section.NumNodes;
                        }

                        FA.CurrentFrame = (FA.CurrentFrame + 1) % 2;

                        string Json = Newtonsoft.Json.JsonConvert.SerializeObject(FA, JsonSettings);

                        Clients.Group("" + instanceId).swapFrame(instanceId, Json, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds + FA.SyncTime, avgFreqs[0], avgFreqs[1], avgFreqs[2], avgFreqs[3], avgFreqs[4], avgFreqs[5], avgFreqs[6], avgFreqs[7], avgFreqs[8], avgFreqs[9], avgFreqs[10], avgFreqs[11], avgFreqs[12], avgFreqs[13], avgFreqs[14], avgFreqs[15]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);

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

                            Clients.Group("" + instanceId).renderNextFrame(instanceId, FA.CurrentFrame);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    Clients.Caller.renderFirstFrame(instanceId, FA.CurrentFrame, FA.Sync);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
        }

        public void IncNodes(int instanceId, int clientId)
        {
            if (instanceId == -1) return;
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
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