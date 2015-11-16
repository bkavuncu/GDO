using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.HelloWorld
{
    [Export(typeof(IAppHub))]
    public class HelloWorldAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "HelloWorld";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new HelloWorldApp().GetType();

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
                    ((HelloWorldApp)Cave.Apps["HelloWorld"].Instances[instanceId]).SetName(name);
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
                    Clients.Caller.receiveName(instanceId, ((HelloWorldApp)Cave.Apps["HelloWorld"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}