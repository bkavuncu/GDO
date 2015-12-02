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

//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Scripts.Youtube.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Configurations.sample.js", "application/json")]

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

        public void PorcaMadonna (int instanceId)
        {
           // lock (Cave.AppLocks[instanceId]) {
                Debug.WriteLine("fuck");
           // }
            Debug.WriteLine("DAAAAAAAAAAAAAAAAAAAAAAAAAAi");
        }
    }
}