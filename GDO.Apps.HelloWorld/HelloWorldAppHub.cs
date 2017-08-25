using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;

using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.HelloWorld {
    /// <summary>
    /// This class is the SignalR Hub
    /// The methods it exposes are the Serverside methods which can be called from the node's Javascript
    /// Note that methods must be named exactly and capitalisation patterns must be followed
    /// These methods help form an API which allows your app to be automated - so be careful
    /// First argument should always be the instance ID
    /// </summary>
    [Export(typeof(IAppHub))]
    public class HelloWorldAppHub : GDOHub, IBaseAppHub {
        public string Name { get; set; } = "HelloWorld";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new HelloWorldApp().GetType();

        public void JoinGroup(string groupId)
        {
            Cave.Deployment.Apps[Name].Hub.Clients = Clients;
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
        public void SetName(int instanceId, string name) {
            lock (Cave.AppLocks[instanceId]) {
                try {
                    ((HelloWorldApp)Cave.Deployment.Apps["HelloWorld"].Instances[instanceId]).SetName(name);
                    Clients.Group("" + instanceId).receiveName(instanceId, name);
                } catch (Exception e) {
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
        public void RequestName(int instanceId) {
            lock (Cave.AppLocks[instanceId]) {
                try {
                    Clients.Caller.receiveName(instanceId, ((HelloWorldApp)Cave.Deployment.Apps["HelloWorld"].Instances[instanceId]).GetName());
                } catch (Exception e) {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}