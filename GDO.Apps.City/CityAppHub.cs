using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Runtime.Remoting.Messaging;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Microsoft.SqlServer.Server;

namespace GDO.Apps.City
{
    [Export(typeof (IAppHub))]
    public class CityAppHub : Hub, ICompositeAppHub
    {
        public string Name { get; set; } = "City";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.None;
        public List<string> SupportedApps { get; set; } = new List<string>(new string[] {"Maps, StaticHTML"});
        public Type InstanceType { get; set; } = new CityApp().GetType();

        public void JoinGroup(string groupId)
        {
            Cave.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

    }
}