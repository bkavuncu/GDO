using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;


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
        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

    }
}