using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;
using GDO.Core.Apps;

namespace GDO.Apps.XNATProject
{
    [Export(typeof(IAppHub))]
    public class XNATProjectAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "XNATProject";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new XNATProjectApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((XNATProjectApp)Cave.Apps["XNATProject"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).receiveName(instanceId, name);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveName(instanceId, ((XNATProjectApp)Cave.Apps["XNATProject"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}