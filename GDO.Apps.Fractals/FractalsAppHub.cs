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

        public void LeftButton(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).leftButton(instanceId);
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
                    //((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).rightButton(instanceId);
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
                    //((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).upButton(instanceId);
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
                    //((FractalsApp)Cave.Apps["Fractals"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).downButton(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

    }
}