using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Apps.DD3;
using GDO.Utility;
using Newtonsoft.Json;

namespace GDO.Apps.Hercules
{
    [Export(typeof(IAppHub))]
    public class HerculesAppHub : DD3AppHub, IAppHub
    {
        
        new public string Name { get; set; } = "Hercules";

        new public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;

        new public Type InstanceType { get; set; } = new HerculesApp().GetType();

        new public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        new public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void TestSignalR (int instanceId)
        {
           Debug.WriteLine("please show");
        }

        public override System.Threading.Tasks.Task OnConnected()
        {
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected(Boolean b)
        {
            return base.OnDisconnected(b);
        }
    }
}