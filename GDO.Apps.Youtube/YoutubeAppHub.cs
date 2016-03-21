using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Apps.Youtube;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Youtube
{
    [Export(typeof(IAppHub))]
    public class YoutubeAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Youtube";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new YoutubeApp().GetType();

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
                    ((YoutubeApp)Cave.Apps["Youtube"].Instances[instanceId]).SetURL(url);
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
                    Clients.Caller.receiveURL(instanceId, ((YoutubeApp)Cave.Apps["Youtube"].Instances[instanceId]).GetURL());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
    }
}