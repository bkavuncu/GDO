using System;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Globe
{
    [Export(typeof(IAppHub))]
    public class GlobeAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Globe";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new GlobeApp().GetType();

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }

        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).SetName(name);
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
                    Clients.Caller.receiveName(instanceId, ((GlobeApp)Cave.Apps["Globe"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}