using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using GDO.Core.Apps;
// ReSharper disable UnassignedField.Global
// ReSharper disable UnusedMember.Global - this is due to SignalR 

namespace GDO.Apps.Fractals
{
    [Export(typeof(IAppHub))]
    public class FractalsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Fractals";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new FractalsApp().GetType();

        public void JoinGroup(string groupId)
        {
            Cave.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        private readonly JsonSerializerSettings _jsonSettings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All};

        public void SendParams(int instanceId)
        {
            try
            {
                FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                if (!fa.Sync)
                {
                    string json = JsonConvert.SerializeObject(fa, _jsonSettings);
                    Clients.Group("" + instanceId).updateParams(instanceId, json, fa.Sync);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.JoystickInit(this, instanceId);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.JoystickUpdateParamsRot(angle, magnitude);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.JoystickUpdateParamsMove(angle, magnitude);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.JoystickTerminate();
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.HeightSliderUpdateParamsMove(val);
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
                    Clients.Group("" + instanceId).startAudio(instanceId, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds + 500);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void StopAudio(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).stopAudio(instanceId);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.MaxSteps = maxSteps;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Detail = detail;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Fog = fog;
                    SendParams(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        /// <summary>
        /// This is the parameters object sent from the javascript to the server via the control panel 
        /// </summary>
        // ReSharper disable once ClassNeverInstantiated.Global
        // ReSharper disable once MemberCanBePrivate.Global
        public class Params
        {
            // ReSharper disable InconsistentNaming
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
            // ReSharper restore InconsistentNaming
        }

        public void FractalSelect(int instanceId, string json, string fractal)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Params p = JsonConvert.DeserializeObject<Params>(json, _jsonSettings);
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.XRot = (float) p.xRot;
                    fa.YRot = (float) p.yRot;
                    fa.XTrans = (float) p.xTrans;
                    fa.YTrans = (float) p.yTrans;
                    fa.ZTrans = (float) p.zTrans;
                    fa.MaxSteps = p.maxSteps;
                    fa.Detail = (float) p.detail;
                    fa.Fog = (float) p.fog;
                    fa.Ambience = (float) p.ambience;
                    fa.LightIntensity = (float) p.lightIntensity;
                    fa.LightSize = (float) p.lightSize;
                    fa.LightX = (float) p.lightX;
                    fa.LightY = (float) p.lightY;
                    fa.LightZ = (float) p.lightZ;
                    fa.Iterations = p.iterations;
                    fa.Power = (float)p.power;
                    fa.R = (float) p.red;
                    fa.G = (float) p.green;
                    fa.B = (float) p.blue;
                    fa.Scale = (float) p.scale;
                    fa.Cx = (float) p.cx;
                    fa.Cy = (float) p.cy;
                    fa.Cz = (float) p.cz;
                    fa.Cw = (float) p.cw;
                    fa.Threshold = (float) p.threshold;
                    fa.Mod = p.modToggle;
                    fa.Fractal = p.fractal;
                    

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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Iterations = iterations;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Power = power;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Scale = scale;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Cx = cx;
                    fa.Cy = cy;
                    fa.Cz = cz;
                    fa.Cw = cw;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Threshold = thresh;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.R = r/255.0f;
                    fa.G = g/255.0f;
                    fa.B = b/255.0f;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Ambience = ambience;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.LightIntensity = li;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.LightSize = size;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.JoystickUpdateParamsLight(angle, magnitude);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.HeightSliderUpdateParamsLight(val);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.SyncTime = val;
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.ToggleMod();
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    fa.Sync = !fa.Sync;
                    string json = JsonConvert.SerializeObject(fa, _jsonSettings);
                    Clients.Group("" + instanceId).updateParams(instanceId, json, fa.Sync);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);

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

                    fa.Freqs[clientId - 1] = frequencyData;

                    // Ack frames
                    if (fa.RenderedFrameNodesAcked[clientId-1] == 0)
                    {
                        fa.RenderedFrameNodesAcked[clientId-1] = 1;
                    }

                    // Sum acks
                    int sum = 0;
                    for (int i = 0; i < 64; i++)
                    {
                        sum += fa.RenderedFrameNodesAcked[i];
                    }

                    if (sum >= fa.Section.NumNodes)
                    {

                        int[] avgFreqs = new int[frequencyData.Length];
                        for (int i = 0; i < 64; i++)
                        {
                            if (fa.Freqs[i] != null)
                            {
                                for (int j = 0; j < frequencyData.Length; j++)
                                {

                                    avgFreqs[j] += fa.Freqs[i][j];
                                }
                            }
                            
                        }

                        for (int i = 0; i < avgFreqs.Length; i++)
                        {
                            avgFreqs[i] /= (byte) fa.Section.NumNodes;
                        }

                        fa.CurrentFrame = (fa.CurrentFrame + 1) % 2;

                        string json = JsonConvert.SerializeObject(fa, _jsonSettings);

                        Clients.Group("" + instanceId).swapFrame(instanceId, json, (long)(DateTime.Now - new DateTime(1970, 1, 1)).TotalMilliseconds + fa.SyncTime, avgFreqs[0], avgFreqs[1], avgFreqs[2], avgFreqs[3], avgFreqs[4], avgFreqs[5], avgFreqs[6], avgFreqs[7], avgFreqs[8], avgFreqs[9], avgFreqs[10], avgFreqs[11], avgFreqs[12], avgFreqs[13], avgFreqs[14], avgFreqs[15]);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);

                        // Ack frames
                        if (fa.SwapFrameNodesAcked[clientId-1] == 0)
                        {
                            fa.SwapFrameNodesAcked[clientId-1] = 1;
                        }

                        // Sum acks
                        int sum = 0;
                        for (int i = 0; i < 64; i++)
                        {
                            sum += fa.SwapFrameNodesAcked[i];
                        }

                        if (sum >= fa.Section.NumNodes)
                        {
                            
                            // Reset acks
                            for (int i = 0; i < 64; i++)
                            {
                                fa.SwapFrameNodesAcked[i] = 0;
                            }

                            for (int i = 0; i < 64; i++)
                            {
                                fa.RenderedFrameNodesAcked[i] = 0;
                            }                 

                            Clients.Group("" + instanceId).renderNextFrame(instanceId, fa.CurrentFrame, fa.Sync);
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
                    FractalsApp fa = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    Clients.Caller.renderNextFrame(instanceId, fa.CurrentFrame, fa.Sync);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
        }
    }
}