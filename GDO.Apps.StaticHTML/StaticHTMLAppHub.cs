using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Apps.StaticHTML;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.StaticHTML
{
    [Export(typeof(IAppHub))]
    public class StaticHTMLAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "StaticHTML";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new StaticHTMLApp().GetType();

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void SetURL(int instanceId, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    StaticHTMLApp app = ((StaticHTMLApp) Cave.Apps["StaticHTML"].Instances[instanceId]);
                    app.SetURL(url);
                    Debug.WriteLine("Using responsive mode: " + app.IsResponsiveMode);
                    Clients.Group("" + instanceId).receiveURL(instanceId, url, app.IsResponsiveMode);
                    Clients.Caller.receiveURL(instanceId, url, app.IsResponsiveMode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void RequestURL(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    StaticHTMLApp app = ((StaticHTMLApp) Cave.Apps["StaticHTML"].Instances[instanceId]);
                    Debug.WriteLine("Using responsive mode: " + app.IsResponsiveMode);
                    Clients.Caller.receiveURL(instanceId, app.GetURL(), app.IsResponsiveMode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}