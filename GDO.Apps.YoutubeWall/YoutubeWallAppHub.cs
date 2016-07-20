using System;
using System.ComponentModel.Composition;
using System.Linq;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;

using Newtonsoft.Json;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Scripts.Youtube.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Youtube.Configurations.sample.js", "application/json")]

namespace GDO.Apps.YoutubeWall
{
    [Export(typeof (IAppHub))]
    public class YoutubeWallAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "YoutubeWall";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new YoutubeWallApp().GetType();
        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetKeywords(int instanceId, string newKeywords)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Initializing for keywords...");

                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);

                    yf.Error = false;
                    yf.VideoReady = false;
                    yf.NextPageToken = "";
                    yf.CurrentVideoName = null;
                    yf.NextVideoName = null;
                    yf.CurrentVideoUrls = null;
                    yf.NextVideoUrls = null;
                    yf.Keywords = newKeywords;

                    Clients.Caller.updateKeywords(yf.Keywords);
                    Clients.Caller.setMessage("Initialized keywords mode Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void GetNextVideosByKeywords(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);

                    if (yf.Error)
                    {
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }

                    Clients.Caller.setMessage("Getting next group of videos...");

                    yf.VideoReady = false;
                    string baseUrl = "http://www.youtube.com/embed/";
                    string tailUrl = "?autoplay=1&controls=0&version=3&loop=1&playlist=";

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
                        YoutubeWallApp.KeywordVideoInfo videoJson = yf.getVideoByKeywords(yf.Keywords, yf.NextPageToken, num.ToString());
                        yf.NextPageToken = videoJson.nextPageToken;
                        if (videoJson.items.Length == 0)
                        {
                            break;
                        }
                        for (int i = 0; i < videoJson.items.Length; i++)
                        {
                            int rank = sum - remain + i;
                            yf.NextVideoUrls[rank/yf.Section.Cols, rank%yf.Section.Cols] = baseUrl + videoJson.items[i].id.videoId + 
                                                                                           tailUrl + videoJson.items[i].id.videoId;
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
                    Clients.Caller.setMessage("Fetched vidoes Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void SetChannelName(int instanceId, string newChannelName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    // update channel name
                    // search channel and get channel id

                    Clients.Caller.setMessage("Searching for Channel id!");

                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);
                    YoutubeWallApp.ChannelInfo channelJson = yf.getChannelId(newChannelName);
                    if (channelJson.items.Length <= 0)
                    {
                        yf.Error = true;
                        yf.ErrorDetails = "Error! Channel Not Found!";
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }
                    yf.Keywords = channelJson.items[0].snippet.title;
                    //Clients.Caller.setKeywords(yf.Keywords);  //put the channel name in the interface
                    yf.ChannelId = channelJson.items[0].id.channelId;

                    // get playlist id
                    Clients.Caller.setMessage("Searching for Playlist id!");
                    YoutubeWallApp.PlayInfo playlistJson = yf.getPlaylists(yf.ChannelId);
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
                    Clients.Caller.updateKeywords(yf.Keywords);
                    Clients.Caller.setMessage("Fetched channel information Success!");
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
                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);

                    if (yf.Error)
                    {
                        Clients.Caller.setMessage(yf.ErrorDetails);
                        return;
                    }

                    Clients.Caller.setMessage("Getting next group of videos...");

                    yf.VideoReady = false;
                    //string baseUrl = "http://www.youtube.com/embed/";
                    //string tailUrl = "?autoplay=1&controls=0&loop=1&version=3&playlist=";

                    string baseUrl = "http://www.youtube.com/v/";
                    string tailUrl = "?version=3&loop=1&playlist=";

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
                        YoutubeWallApp.PlayInfo videoJson = yf.getVideos(yf.PlaylistId, yf.NextPageToken, num.ToString());
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
                    Clients.Caller.setMessage("Fetched videos Success!");
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
                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);
                    /*if (yf.Keywords != "")
                    {
                        Clients.Caller.setKeywords(yf.Keywords);
                    } */
                    if (!yf.VideoReady || yf.CurrentVideoName == null || yf.NextVideoName == null)
                    {
                        Clients.Caller.setMessage("Video Not Ready!");
                        return;
                    }
                    YoutubeWallApp.NameInfo[] videoName = new YoutubeWallApp.NameInfo[yf.Section.Cols*yf.Section.Rows];
                    for (int i = 0; i < yf.Section.Rows; i++)
                    {
                        for (int j = 0; j < yf.Section.Cols; j++)
                        {
                            videoName[i*yf.Section.Cols + j] = new YoutubeWallApp.NameInfo {
                                currentName = yf.CurrentVideoName[i, j],
                                nextName = yf.NextVideoName[i, j]
                            };
                        }
                    }
                    Clients.Caller.updateVideoList(JsonConvert.SerializeObject(videoName), instanceId);
                    Clients.Caller.setMessage("Got video titles Success!");
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
                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);
                    if (!yf.VideoReady || yf.CurrentVideoUrls == null)
                    {
                        Clients.Caller.setMessage("Video Not Ready!");
                        return;
                    }
                    Clients.Caller.updateVideo(yf.CurrentVideoUrls[rows, cols]);
                    Clients.Caller.setMessage("Got video urls Success!");
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
                    YoutubeWallApp yf = ((YoutubeWallApp) Cave.Apps["YoutubeWall"].Instances[instanceId]);
                    if (sm == 0 || sm == 1)
                        yf.SearchMode = sm;
                    Clients.Caller.updateSearchMode(yf.SearchMode);
                    if (yf.SearchMode == 0)
                    {
                        Clients.Caller.setMessage("Set search mode to [ Channel Mode ] Success!");
                    }
                    else if (yf.SearchMode == 1)
                    {
                        Clients.Caller.setMessage("Set search mode to [ Keywords Mode ] Success!");
                    }
                    else
                    {
                        Clients.Caller.setMessage("Error! Illegal search mode!");
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void MuteAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting all nodes to mute...");
                    Clients.Group("" + instanceId).MuteAll();
                    Clients.Caller.setMessage("All nodes muted!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void UnMuteAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting all nodes to unmute...");
                    Clients.Group("" + instanceId).UnmuteAll();
                    Clients.Caller.setMessage("All nodes unmuted!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void Mute(int instanceId, int[] nodes)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    String nodesString = nodes.Aggregate("", (current, i) => current + (i + ","));
                    nodesString = nodesString.Remove(nodesString.Length - 1);
                    Clients.Caller.setMessage("Requesting nodes [" + nodesString + "] to mute...");
                    Clients.Group("" + instanceId).Mute(nodes);
                    Clients.Caller.setMessage("Nodes [" + nodesString + "] muted!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void UnMute(int instanceId, int[] nodes)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    String nodesString = nodes.Aggregate("", (current, i) => current + (i + ","));
                    nodesString = nodesString.Remove(nodesString.Length - 1);
                    Clients.Caller.setMessage("Requesting nodes [" + nodesString + "] to unmute...");
                    Clients.Group("" + instanceId).UnMute(nodes);
                    Clients.Caller.setMessage("Nodes [" + nodesString + "] unmuted!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void ToggleMute(int instanceId, int[] nodes)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    String nodesString = nodes.Aggregate("", (current, i) => current + (i + ","));
                    nodesString = nodesString.Remove(nodesString.Length - 1);
                    Clients.Caller.setMessage("Requesting toggle mute nodes [" + nodesString + "]...");
                    Clients.Group("" + instanceId).toggleMute(nodes);
                    Clients.Caller.setMessage("Nodes [" + nodesString + "]: muted/unmuted!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void PlayAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting all nodes to play...");
                    Clients.Group("" + instanceId).PlayAll();
                    Clients.Caller.setMessage("All nodes playing!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void PauseAll(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting all nodes to pause...");
                    Clients.Group("" + instanceId).PauseAll();
                    Clients.Caller.setMessage("All nodes paused!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void Play(int instanceId, int[] nodes)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    String nodesString = nodes.Aggregate("", (current, i) => current + (i + ","));
                    nodesString = nodesString.Remove(nodesString.Length - 1);
                    Clients.Caller.setMessage("Requesting nodes [" + nodesString + "] to play...");
                    Clients.Group("" + instanceId).Play(nodes);
                    Clients.Caller.setMessage("Nodes [" + nodesString + "] playing!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        public void Pause(int instanceId, int[] nodes)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    String nodesString = nodes.Aggregate("", (current, i) => current + (i + ","));
                    nodesString = nodesString.Remove(nodesString.Length - 1);
                    Clients.Caller.setMessage("Requesting nodes [" + nodesString + "] to pause...");
                    Clients.Group("" + instanceId).Pause(nodes);
                    Clients.Caller.setMessage("Nodes [" + nodesString + "] paused!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void Next(int instanceId, int[] nodes) { }
    }
}