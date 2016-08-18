﻿using System;
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
            Debug.WriteLine("Setting URL");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).SetURL(url);
                    Clients.Group("" + instanceId).receiveURL(instanceId, url,
                        ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).ResponsiveMode);
                    Clients.Caller.receiveURL(instanceId, url,
                        ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).ResponsiveMode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void RequestURL(int instanceId)
        {
            Debug.WriteLine("URL Requested");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveURL(instanceId, ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).GetURL(),
                        ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).ResponsiveMode);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}