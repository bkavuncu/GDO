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
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((YoutubeApp)Cave.Apps["Youtube"].Instances[instanceId]).SetURL(url);
                    Clients.Group("" + instanceId).receiveURL(instanceId, url);
                    //Clients.Caller.receiveURL(instanceId, url);
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

        public void PlayVideo(int instanceId, double time)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).playVideo(instanceId, time);
                    //Clients.Caller.playVideo(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void PauseVideo(int instanceId, double time)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).pauseVideo(instanceId, time);
                    //Clients.Caller.pauseVideo(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
        public void StopVideo(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).stopVideo(instanceId);
                    //Clients.Caller.stopVideo(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void SeekTo(int instanceId, double seconds, bool allowSeekAhead,double time)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).seekTo(instanceId, seconds, allowSeekAhead, time);
                    //Clients.Caller.seekTo(instanceId, seconds, allowSeekAhead);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }
        public void SetPlaybackQuality(int instanceId, string quality)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).setPlaybackQuality(instanceId, quality);
                    //Clients.Caller.setPlaybackQuality(instanceId, quality);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

        public void RegisterBufferStatus(int instanceId, int status, int col, int row)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]).BufferStatus[col, row] = status;
                    if (((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]).CheckBufferComplete() && !((YoutubeApp)Cave.Apps["Youtube"].Instances[instanceId]).VideoReady)
                    {
                        Clients.Group("" + instanceId).bufferComplete(instanceId);
                        ((YoutubeApp)Cave.Apps["Youtube"].Instances[instanceId]).VideoReady = true;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);// TODO show how log4net can be used
                }
            }
        }

    }
}