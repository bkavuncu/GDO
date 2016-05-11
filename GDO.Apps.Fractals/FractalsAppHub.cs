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

        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).SetName(name);
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
                    Clients.Caller.receiveName(instanceId, ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestParameters(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void LeftButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.IncXRot();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RightButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.DecXRot();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UpButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.IncYRot();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DownButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.DecYRot();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void LeftStrafeButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.StrafeLeft();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RightStrafeButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.StrafeRight();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void ForwardButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.MoveForward();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void BackButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    FractalsApp FA = ((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]);
                    FA.MoveBackward();
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
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
                    Clients.Group("" + instanceId).updateParams(instanceId, FA.XRot, FA.YRot, FA.XTrans, FA.YTrans, FA.ZTrans, FA.MaxSteps, FA.Detail, FA.Ambience, FA.Iterations, FA.Mod);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

    }
}