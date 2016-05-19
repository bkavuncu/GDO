﻿using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
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

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetURL(int instanceId, string url)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).SetURL(url);
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
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveURL(instanceId, ((StaticHTMLApp)Cave.Apps["StaticHTML"].Instances[instanceId]).GetURL());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}