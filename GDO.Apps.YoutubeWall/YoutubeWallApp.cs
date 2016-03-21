using System;
using System.IO;
using System.Net;
using GDO.Core;
using GDO.Core.Apps;
using Newtonsoft.Json;

namespace GDO.Apps.YoutubeWall
{
    public class YoutubeWallApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public string Keywords { get; set; }
        public string ChannelId { get; set; }
        public string PlaylistId { get; set; }
        public bool VideoReady { get; set; }
        public string[,] CurrentVideoUrls { get; set; }
        public string[,] NextVideoUrls { get; set; }
        public string[,] CurrentVideoName { get; set; }
        public string[,] NextVideoName { get; set; }
        public string NextPageToken { get; set; }
        public bool Error { get; set; }
        public string ErrorDetails { get; set; }
        public int SearchMode { get; set; }
        // 0 channel mode
        // 1 keyword mode

        private string key { get; set; }
        private string baseURL  { get; set; }

        public class NameInfo
        {
            public string currentName { get; set; }
            public string nextName { get; set; }
        }

        public class URLInfo
        {
            public string url { get; set; }
            public int width { get; set; }
            public int height { get; set; }
        }

        public class ThumbNailsInfo
        {
            public URLInfo medium { get; set; }
            public URLInfo high { get; set; }
        }

        public class ResourceIdInfo
        {
            public string kind { get; set; }
            public string videoId { get; set; }
        }

        public class SnippetInfo
        {
            public string publishedAt { get; set; }
            public string channelId { get; set; }
            public string title { get; set; }
            public string description { get; set; }
            public ThumbNailsInfo thumbnails { get; set; }
            public string channelTitle { get; set; }
            public string liveBroadcastContent { get; set; }
            public string playlistId { get; set; }
            public int position { get; set; }
            public ResourceIdInfo resourceId { get; set; }
        }

        public class RelatedPlaylistsInfo
        {
            public string likes { get; set; }
            public string uploads { get; set; }
        }

        public class ContentDetailsInfo
        {
            public RelatedPlaylistsInfo relatedPlaylists { get; set; }
            public string googlePlusUserId { get; set; }
            public string videoId { get; set; }
        }

        public class ChannelIdInfo
        {
            public string kind { get; set; }
            public string channelId { get; set; }
        }

        public class ChannelItemInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public ChannelIdInfo id { get; set; }
            public SnippetInfo snippet { get; set; }
            public ContentDetailsInfo contentDetails { get; set; }
        }

        public class ItemInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public string id { get; set; }
            public SnippetInfo snippet { get; set; }
            public ContentDetailsInfo contentDetails { get; set; }
        }

        public class PageNumInfo
        {
            public int totalResults { get; set; }
            public int resultsPerPage { get; set; }
        }

        public class ChannelInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public string nextPageToken { get; set; }
            public PageNumInfo pageInfo { get; set; }
            public ChannelItemInfo[] items { get; set; }
        }

        public class PlayInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public string nextPageToken { get; set; }
            public PageNumInfo pageInfo { get; set; }
            public ItemInfo[] items { get; set; }
        }

        public class KeywordVideoIdInfo
        {
            public string kind { get; set; }
            public string videoId { get; set; }
        }

        public class KeywordVideoItemsInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public KeywordVideoIdInfo id { get; set; }
            public SnippetInfo snippet { get; set; }
        }

        public class KeywordVideoInfo
        {
            public string kind { get; set; }
            public string etag { get; set; }
            public string nextPageToken { get; set; }
            public PageNumInfo pageInfo { get; set; }
            public KeywordVideoItemsInfo[] items { get; set; }
        }

        public string requestYoutubeInfo(string yURL)
        {
            WebRequest yRequest = WebRequest.Create(yURL);
            yRequest.Method = "GET";
            //Console.WriteLine(yURL);

            Stream yStream;
            yStream = yRequest.GetResponse().GetResponseStream();
            StreamReader yReader = new StreamReader(yStream);
            string yResponse = "";
            string yLine = "";
            while (yLine != null)
            {
                yLine = yReader.ReadLine();
                if (yLine != null)
                    yResponse += yLine;
            }
            return yResponse;
        }

        public PlayInfo getVideos(string playlistId, string pageToken, string numVideo)
        {
            Console.WriteLine(playlistId);
            string yURL = baseURL + "playlistItems" + "?";
            yURL += "part=" + "contentDetails" + ",snippet" + "&";
            yURL += "playlistId=" + playlistId + "&";
            yURL += "maxResults=" + numVideo + "&";
            yURL += "key=" + key + "&";
            yURL += "pageToken=" + pageToken;

            string yResponse = requestYoutubeInfo(yURL);
            PlayInfo yJson = JsonConvert.DeserializeObject<PlayInfo>(yResponse);
            return yJson;
        }

        public PlayInfo getPlaylists(string channelId)
        {
            string yURL = baseURL + "channels" + "?";
            yURL += "part=" + "contentDetails" + ",snippet" + "&";
            yURL += "id=" + channelId + "&";
            yURL += "key=" + key;

            string yResponse = requestYoutubeInfo(yURL);
            PlayInfo yJson = JsonConvert.DeserializeObject<PlayInfo>(yResponse);
            //Console.WriteLine(yJson.items[0].contentDetails.relatedPlaylists.uploads);
            return yJson;
        }

        public ChannelInfo getChannelId(string channelName)
        {
            string yURL = baseURL + "search" + "?";
            yURL += "part=" + "snippet" + "&";
            yURL += "q=" + channelName.Replace(" ", "+") + "&";
            yURL += "type=" + "channel" + "&";
            yURL += "maxResults=" + "3" + "&";
            yURL += "key=" + key;

            string yResponse = requestYoutubeInfo(yURL);
            ChannelInfo yJson = JsonConvert.DeserializeObject<ChannelInfo>(yResponse);
            return yJson;
        }

        public KeywordVideoInfo getVideoByKeywords(string keywords, string pageToken, string num)
        {
            string yURL = baseURL + "search" + "?";
            yURL += "part=" + "snippet" + "&";
            yURL += "q=" + keywords.Replace(" ", "+") + "&";
            yURL += "type=" + "video" + "&";
            yURL += "maxResults=" + num + "&";
            yURL += "pageToken=" + pageToken + "&";
            yURL += "videoEmbeddable=true&";
            yURL += "safeSearch=strict&";
            yURL += "key=" + key;

            string yResponse = requestYoutubeInfo(yURL);
            KeywordVideoInfo yJson = JsonConvert.DeserializeObject<KeywordVideoInfo>(yResponse);
            return yJson;
        }

        public void Init()
        {
            this.key = "AIzaSyCVoYXZZHaRNqnJw6pINn9PG3wly3_xNYY";
            this.baseURL = "https://www.googleapis.com/youtube/v3/";
            this.Error = false;
            this.ErrorDetails = "";
            this.VideoReady = false;
            this.CurrentVideoName = null;
            this.NextVideoName = null;
            this.CurrentVideoUrls = null;
            this.NextVideoUrls = null;
            this.SearchMode = 0;

            string keywords = (string) Configuration.Json.SelectToken("channel");
            if (keywords != "")
            {
                Keywords = keywords;
            }
        }

    }
}