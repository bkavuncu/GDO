using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Bitcoin.Scripts.Bitcointiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Bitcoin.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Bitcoin
{

    [Export(typeof(IAppHub))]
    public class BitcoinAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Bitcoin";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new BitcoinApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void RequestSectionSize(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting section information...");
                    BitcoinApp ia = (BitcoinApp) Cave.Apps["Bitcoin"].Instances[instanceId];
                    Clients.Caller.getSectionSize(ia.Section.Width, ia.Section.Height);
                    Clients.Caller.setMessage("Requested section information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
    }
}