using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Spreadsheets
{
    [Export(typeof(IAppHub))]
    public class SpreadsheetsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Spreadsheets";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Section;
        public Type InstanceType { get; set; } = new SpreadsheetsApp().GetType();
        public ScenarioHub ScenarioHub { get; set; } = new ScenarioHub();   
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
                    ((SpreadsheetsApp)Cave.Apps["Spreadsheets"].Instances[instanceId]).SetName(name);
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
                    Clients.Caller.receiveName(instanceId, ((SpreadsheetsApp)Cave.Apps["Spreadsheets"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}