using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

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

        public void JoystickSendParams(int instanceId, float XRot, float YRot, float XTrans, float YTrans, float ZTrans)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    Clients.Group("" + instanceId).updateParams(instanceId, XRot, YRot, XTrans, YTrans, ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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

        public void MaxSteps(int instanceId, int maxSteps)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.MaxSteps = maxSteps;
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Power, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

    }
}