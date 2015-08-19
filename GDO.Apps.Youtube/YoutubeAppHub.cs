using System;
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

                    Clients.Caller.setMessage("Searching for Channel id!");

                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    YoutubeApp.ChannelInfo channelJson = yf.getChannelId(newChannelName);
                    if (channelJson.items.Length <= 0)
                    {
                        yf.Error = true;
                        yf.ErrorDetails = "Error! Channel Not Found!";
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }
                    yf.ChannelName = channelJson.items[0].snippet.title;
                    yf.ChannelId = channelJson.items[0].id.channelId;

                    // get playlist id
                    Clients.Caller.setMessage("Searching for Playlist id!");
                    YoutubeApp.PlayInfo playlistJson = yf.getPlaylists(yf.ChannelId);
                    if (playlistJson.items.Length <= 0)
                    {
                        yf.Error = true;
                        yf.ErrorDetails = "Error! Playlist Not Found!";
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }

                    yf.Error = false;
                    yf.PlaylistId = playlistJson.items[0].contentDetails.relatedPlaylists.uploads;
                    yf.VideoReady = false;
                    yf.NextPageToken = "";
                    yf.CurrentVideoName = null;
                    yf.NextVideoName = null;
                    yf.CurrentVideoUrls = null;
                    yf.NextVideoUrls = null;
                    Clients.Caller.updateChannelNameResult(yf.ChannelName);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void GetNextVideos(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);

                    if (yf.Error)
                    {
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }

                    Clients.Caller.setMessage("Getting next group of videos!");

                    yf.VideoReady = false;
                    string baseUrl = "http://www.youtube.com/embed/";
                    string tailUrl = "?autoplay=1&controls=0&loop=1&version=3&playlist=";

                    //init
                    if (yf.NextVideoUrls != null)
                        yf.CurrentVideoUrls = (string[,]) yf.NextVideoUrls.Clone();
                    yf.NextVideoUrls = new string[yf.Section.Rows, yf.Section.Cols];
                    if (yf.NextVideoName != null)
                        yf.CurrentVideoName = (string [,]) yf.NextVideoName.Clone();
                    yf.NextVideoName = new string[yf.Section.Rows, yf.Section.Cols];
                    for (int i = 0; i < yf.Section.Rows; i++)
                    {
                        for (int j = 0; j < yf.Section.Cols; j++)
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
                        Clients.Caller.setMessage("Fetching from Youtube: " + (sum-remain).ToString() + "/" + sum.ToString());
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
                    if (yf.CurrentVideoName == null || yf.CurrentVideoUrls == null)
                    {
                        yf.VideoReady = false;
                        Clients.Group("" + instanceId).videoReady(1);
                        Clients.Caller.videoReady(1);
                    }
                    else
                    {
                        yf.VideoReady = true;
                        Clients.Group("" + instanceId).videoReady(0);
                        Clients.Caller.videoReady(0);
                    }
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestVideoName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting latest video information!");
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    if (yf.ChannelName != "")
                    {
                        Clients.Caller.setChannelName(yf.ChannelName);
                    }
                    if (!yf.VideoReady || yf.CurrentVideoName == null || yf.NextVideoName == null)
                    {
                        Clients.Caller.setMessage("Video Not Ready!");
                        return;
                    }
                    YoutubeApp.NameInfo[] videoName = new YoutubeApp.NameInfo[yf.Section.Cols*yf.Section.Rows];
                    for (int i = 0; i < yf.Section.Rows; i++)
                    {
                        for (int j = 0; j < yf.Section.Cols; j++)
                        {
                            videoName[i*yf.Section.Cols + j] = new YoutubeApp.NameInfo();
                            videoName[i*yf.Section.Cols + j].currentName = yf.CurrentVideoName[i, j];
                            videoName[i*yf.Section.Cols + j].nextName = yf.NextVideoName[i, j];
                        }
                    }
                    Clients.Caller.updateVideoList(JsonConvert.SerializeObject(videoName));
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
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
                    if (!yf.VideoReady || yf.CurrentVideoUrls == null)
                    {
                        Clients.Caller.setMessage("Video Not Ready!");
                        return;
                    }
                    Clients.Caller.updateVideo(yf.CurrentVideoUrls[rows, cols]);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestSearchMode(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting search mode...");
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    Clients.Caller.updateSearchMode(yf.SearchMode);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void SetSearchMode(int instanceId, int sm)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Updating search mode...");
                    YoutubeApp yf = ((YoutubeApp) Cave.Apps["Youtube"].Instances[instanceId]);
                    if (sm == 0 || sm == 1)
                        yf.SearchMode = sm;
                    Clients.Caller.updateSearchMode(yf.SearchMode);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
    }
}