using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;

using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;

namespace GDO.Apps.DD3
{
    [Export(typeof(IAppHub))]
    public class DD3AppHub : Hub, IAppHub
    {

        private static ConcurrentDictionary<int, IAppInstance> instances;
        private readonly object _locker = new Object();
        public static DD3AppHub self;

        public string Name { get; set; }
        public int P2PMode { get; set; }
        public Type InstanceType { get; set; }

        public DD3AppHub () {
            self = this;
            this.Name = "DD3";
            this.P2PMode = (int) Cave.P2PModes.None;
            this.InstanceType = new DD3App().GetType();
        }

        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(Boolean b)
        {
            if (instances != null)
            {
                foreach (var i in instances)
	            {
                    if (((DD3App)i.Value).removeClient(Context.ConnectionId))
                    {
                        ExitGroup(i.Value.Id);
                    }
	            }
            }
            return base.OnDisconnected(b);
        }

        public void updateInformation (int instanceId, BrowserInfo b)
        {
            JoinGroup(instanceId);
            instances = Cave.Apps["DD3"].Instances;
            ((DD3App) instances[instanceId]).newClient(Context.ConnectionId, b);
        }

        public void synchronize(int instanceId)
        {
            ((DD3App) instances[instanceId]).synchronize(Context.ConnectionId);
        }

        public void broadcastConfiguration(string browserInfoJson, int confId, int Id)
        {
            Clients.Group("" + Id).receiveConfiguration(browserInfoJson);
            Clients.Group("" + Id).receiveGDOConfiguration(confId);
        }

        public void broadcastSynchronize(int Id)
        {
            Clients.Group("" + Id).synchronize();
        }

        public void removeClient(int instanceId)
        {
            ExitGroup(instanceId);
            if (instances != null && instances.ContainsKey(instanceId))
            {
                ((DD3App)instances[instanceId]).removeClient(Context.ConnectionId);
            }
        }
    }
}