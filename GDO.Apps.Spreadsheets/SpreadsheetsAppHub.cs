using System;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.Spreadsheets
{
    [Export(typeof(IAppHub))]
    public class SpreadsheetsAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Spreadsheets";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new SpreadsheetsApp().GetType();

        public void JoinGroup(string groupId)
        {
            Cave.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        /// <summary>
        /// This method is called by the Javascript client side and allows the control panel to set the text to be displayed
        /// the text is saved in the correct instance
        /// this method then broadcasts the new text out to all of the displayclients 
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <param name="name">The name.</param>
        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((SpreadsheetsApp)Cave.Apps["HelloWorld"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).receiveName(instanceId, name);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        /// <summary>
        /// This method is called by the Javascript client side and allows it to request the text is should be displayed
        /// this is retried from the correct instance and returned to the caller via SignalR 
        /// this will then call the browser side Javascript method called "receiveName". 
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        public void RequestName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveName(instanceId, ((SpreadsheetsApp)Cave.Apps["HelloWorld"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}