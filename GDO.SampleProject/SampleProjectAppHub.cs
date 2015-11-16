using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.tranSMART
{
    [Export(typeof(IAppHub))]
    public class SampleProjectAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "SampleProject";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new SampleProjectApp().GetType();

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