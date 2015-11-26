using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;
using GDO.Core;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Bitcoin.Scripts.Bitcointiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Bitcoin.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Bitcoin
{

    [Export(typeof(IAppHub))]
    public class BitcoinAppHub : Hub, IBaseAppHub
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

    }
}