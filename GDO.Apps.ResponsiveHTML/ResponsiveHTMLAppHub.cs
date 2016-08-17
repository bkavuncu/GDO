using System;
using System.ComponentModel.Composition;
using System.Diagnostics;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.ResponsiveHTML
{
    [Export(typeof(IAppHub))]
    public class ResponsiveHTMLAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "ResponsiveHTML";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new ResponsiveHTMLApp().GetType();

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
            Debug.WriteLine("Setting URL");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ResponsiveHTMLApp)Cave.Apps["ResponsiveHTML"].Instances[instanceId]).SetURL(url);
                    Clients.Group("" + instanceId).receiveURL(instanceId, url);
                    Clients.Caller.receiveURL(instanceId, url);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void RequestURL(int instanceId)
        {
            Debug.WriteLine("Requested URL");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveURL(instanceId, ((ResponsiveHTMLApp)Cave.Apps["ResponsiveHTML"].Instances[instanceId]).GetURL());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}