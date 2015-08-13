using GDO.Core;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;

namespace GDO.Apps.TimeV
{
    [Export(typeof (IAppHub))]
    public class TimeVAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "TimeV";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new TimeVApp().GetType();
        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }        

        public void RequestVisulisation(int instanceId, int nodeId, string query)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((TimeVApp)Cave.Apps["TimeV"].Instances[instanceId]).MakeQuery(nodeId, query);
                    Clients.All.visualise(nodeId, query);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void DisposeVisulisation(int instanceId, int nodeId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.All.dispose(nodeId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public IEnumerable<String> Query(String query)
        {
            return new[] { "1", "2", "3", "4"};
        }
    }
}