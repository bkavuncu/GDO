﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Scripts.Youtube.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Youtube
{
    [Export(typeof (IAppHub))]
    public class YoutubeAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Youtube";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new YoutubeApp().GetType();
        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void UpdateChannelName(int instanceId, string newChannelName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    // update channel name
                    // search channel and get channel id
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    YoutubeApp.ChannelInfo channelJson = yf.getChannelId(newChannelName);
                    if (channelJson.items.Length <= 0)
                    {
                        yf.Error = true;
                        yf.ErrorDetails = "Error! Channel Not Found!";
                        Clients.Caller.updateChannelNameResult(yf.ErrorDetails);
                        return;
                    }
                    yf.ChannelName = channelJson.items[0].snippet.title;
                    yf.ChannelId = channelJson.items[0].id.channelId;

                    // get playlist id
                    YoutubeApp.PlayInfo playlistJson = yf.getPlaylists(yf.ChannelId);
                    if (playlistJson.items.Length <= 0)
                    {
                        yf.Error = true;
                        yf.ErrorDetails = "Error! Playlist Not Found!";
                        Clients.Caller.updateChannelNameResult(yf.ErrorDetails);
                        return;
                    }

                    yf.Error = false;
                    yf.PlaylistId = playlistJson.items[0].contentDetails.relatedPlaylists.uploads;
                    yf.VideoReady = false;
                    yf.NextPageToken = "";
                    Clients.Caller.updateChannelNameResult(yf.ChannelName);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void GetNextVideos(int instanceId, int first)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);

                    if (yf.Error)
                    {
                        Clients.Caller.updateChannelNameResult(yf.ErrorDetails);
                        return;
                    }

                    yf.VideoReady = false;
                    string baseUrl = "http://www.youtube.com/embed/";
                    string tailUrl = "?autoplay=1&controls=0&loop=1&version=3&playlist=";

                    //init
                    yf.CurrentVideoUrls = (string[,]) yf.NextVideoUrls.Clone();
                    yf.NextVideoUrls = new string[yf.Section.Cols, yf.Section.Rows];
                    yf.CurrentVideoName = (string [,]) yf.NextVideoName.Clone();
                    yf.NextVideoName = new string[yf.Section.Cols, yf.Section.Rows];
                    for (int i = 0; i < yf.Section.Cols; i++)
                    {
                        for (int j = 0; j < yf.Section.Rows; j++)
                        {
                            yf.NextVideoUrls[i, j] = "";
                            yf.NextVideoName[i, j] = "";
                        }
                    }

                    //fetch video
                    int sum = yf.Section.Cols*yf.Section.Rows;
                    int remain = sum;
                    while (remain > 0)
                    {
                        int num = Math.Min(remain, 50);
                        YoutubeApp.PlayInfo videoJson = yf.getVideos(yf.PlaylistId, yf.NextPageToken, num.ToString());
                        yf.NextPageToken = videoJson.nextPageToken;
                        if (videoJson.items.Length == 0)
                        {
                            break;
                        }
                        for (int i = 0; i < videoJson.items.Length; i++)
                        {
                            int rank = sum - remain + i;
                            yf.NextVideoUrls[rank/yf.Section.Cols, rank%yf.Section.Cols] = baseUrl + videoJson.items[i].snippet.resourceId.videoId + 
                                                                                           tailUrl + videoJson.items[i].snippet.resourceId.videoId;
                            yf.NextVideoName[rank/yf.Section.Cols, rank%yf.Section.Cols] = videoJson.items[i].snippet.title;
                        }
                        remain -= num;
                    }
                    yf.VideoReady = true;
                    Clients.Group("" + instanceId).videoReady(first);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestVideoName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    if (!yf.VideoReady)
                    {
                        Clients.Caller.updateChannelNameResult("Video Not Ready!");
                        return;
                    }
                    YoutubeApp.NameInfo[] videoName = new YoutubeApp.NameInfo[yf.Section.Cols*yf.Section.Rows];
                    for (int i = 0; i < yf.Section.Cols; i++)
                    {
                        for (int j = 0; j < yf.Section.Rows; j++)
                        {
                            videoName[i*yf.Section.Cols + j].currentName = yf.CurrentVideoName[i, j];
                            videoName[i*yf.Section.Cols + j].nextName = yf.NextVideoName[i, j];
                        }
                    }
                    Clients.Caller.updateVideoList(JsonConvert.SerializeObject(videoName));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestVideoUrls(int instanceId, int cols, int rows)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    if (!yf.VideoReady)
                    {
                        Clients.Caller.updateChannelNameResult("Video Not Ready!");
                        return;
                    }
                    Clients.Caller.updateVideo(yf.CurrentVideoUrls[cols, rows]);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}