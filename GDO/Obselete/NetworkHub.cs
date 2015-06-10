using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace GDO
{
    /*public class BrowserUpdate
    {
        public string resolution { get; set; }
        public string zoom { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string width { get; set; }
        public string height { get; set; }

        public BrowserUpdate(string lat, string lon,string resolution, string zoom, string width, string height)
        {
            this.resolution = resolution;
            this.zoom = zoom;
            this.lat = lat;
            this.lon = lon;
            this.width = width;
            this.height = height;
        }
        public BrowserUpdate(string lat, string lon, string resolution)
        {
            this.resolution = resolution;
            this.lat = lat;
            this.lon = lon;
        }
    }*/

    public class BrowserInfo
    {
        public BrowserInfo(string connectionId, string browserNum, string peerId, string col, string row, string height, string width)
        {
            this.connectionId = connectionId;
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
            this.height = height;
            this.width = width;
        }

        protected bool Equals(BrowserInfo other)
        {
            return string.Equals(col, other.col) && string.Equals(row, other.row) && string.Equals(browserNum, other.browserNum);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((BrowserInfo) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = col.GetHashCode();
                hashCode = (hashCode*397) ^ row.GetHashCode();
                hashCode = (hashCode*397) ^ browserNum.GetHashCode();
                return hashCode;
            }
        }

        public string connectionId { get; set; }
        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
        public string height { get; set; }
        public string width { get; set; }
    }

    public class NetworkHub : Hub
    {
        private static ConcurrentDictionary<string, BrowserInfo> browserInfo = new ConcurrentDictionary<string,BrowserInfo>();
        private static ConcurrentDictionary<int[],string> browserMap = new ConcurrentDictionary<int[],string>();
        private static int browserRows;
        private static int browserColumns;
        private static int R = 6378137;
        public override System.Threading.Tasks.Task OnConnected()
        {
            browserInfo.TryAdd(Context.ConnectionId, new BrowserInfo(Context.ConnectionId, null, null, null, null, null, null));
            return base.OnConnected();
        }

        public override System.Threading.Tasks.Task OnDisconnected()
        {
            BrowserInfo info;
            browserInfo.TryRemove(Context.ConnectionId, out info);

            String browserInfoJson = Newtonsoft.Json.JsonConvert.SerializeObject(browserInfo);
            Clients.All.receiveBrowserInfo(browserInfoJson);

            return base.OnDisconnected();
        }
        /*public void sendBrowserUpdate(BrowserUpdate senderBrowserUpdate)
        {
            System.Diagnostics.Debug.WriteLine("CHECKPOINT");
            try
            {
                int sWidth = int.Parse(senderBrowserUpdate.width); 
                int sHeight = int.Parse(senderBrowserUpdate.height); 
                double sResolution = double.Parse(senderBrowserUpdate.resolution);
                double sZoom = double.Parse(senderBrowserUpdate.zoom);
                double sLat = double.Parse(senderBrowserUpdate.lat);
                double sLon = double.Parse(senderBrowserUpdate.lon);

                double sPixel = R * Math.Cos(sLat) / Math.Pow(2,(sZoom+8));

                int uWidth = (sWidth / browserRows);
                int uHeight = (sHeight / browserColumns);

                double rResolution = sResolution / ((sWidth * sHeight) / (uWidth * uHeight));
                for (int i = 0; i < browserRows; i++)
                {
                    for (int j = 0; j < browserColumns; j++)
                    {
                        int rWidth = (uWidth * i) + (uWidth / 2);
                        int rHeight = (uHeight * i) + (uHeight / 2);
                        double dn = sPixel * (rHeight + (sHeight / 2));
                        double de = sPixel * (rWidth - (sWidth / 2));

                        double dLat = dn / R;
                        double dLon = de / R * Math.Cos(Math.PI * (sLat / 180));

                        double rLat = sLat + dLat * 180 / Math.PI;
                        double rLon = sLon + dLon * 180 / Math.PI;

                        BrowserUpdate browserUpdate = new BrowserUpdate(rResolution.ToString(),rLat.ToString(),rLon.ToString());
                        String browserUpdateJson = Newtonsoft.Json.JsonConvert.SerializeObject(browserUpdate);
                        string connectionId;

                        browserMap.TryGetValue(new int[]{i,j},out connectionId);
                        Clients.Client(connectionId).receiveBrowserUpdate(browserUpdateJson);
                    }
                }

                BrowserUpdate thisBrowserUpdate;
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }*/
        public void sendBrowserInfo(BrowserInfo senderBrowserObj)
        {
            try
            {
                BrowserInfo thisBrowserInfo;
                if (browserInfo.TryGetValue(senderBrowserObj.connectionId, out thisBrowserInfo))
                {
                    BrowserInfo newBrowserInfo = thisBrowserInfo;
                    newBrowserInfo.connectionId = senderBrowserObj.connectionId;
                    newBrowserInfo.browserNum = senderBrowserObj.browserNum;
                    newBrowserInfo.peerId = senderBrowserObj.peerId;
                    newBrowserInfo.col = senderBrowserObj.col;
                    newBrowserInfo.row = senderBrowserObj.row;
                    newBrowserInfo.height = senderBrowserObj.height;
                    newBrowserInfo.width = senderBrowserObj.width;
                    int[] newBrowserCordinates = {int.Parse(newBrowserInfo.row),int.Parse(newBrowserInfo.col)};
                    browserInfo.TryUpdate(senderBrowserObj.connectionId, thisBrowserInfo, newBrowserInfo);
                    browserMap.TryUpdate(newBrowserCordinates, thisBrowserInfo.connectionId, newBrowserInfo.connectionId);
                }
                else
                {
                    BrowserInfo newBrowserInfo = new BrowserInfo(
                        senderBrowserObj.connectionId,
                        senderBrowserObj.browserNum,
                        senderBrowserObj.peerId,
                        senderBrowserObj.col,
                        senderBrowserObj.row,
                        senderBrowserObj.height,
                        senderBrowserObj.width);
                    int[] newBrowserCordinates = { int.Parse(senderBrowserObj.row), int.Parse(senderBrowserObj.col) };
                    browserInfo.TryAdd(senderBrowserObj.connectionId, newBrowserInfo);
                    browserMap.TryAdd(newBrowserCordinates, newBrowserInfo.connectionId);
                }

                String browserInfoJson = Newtonsoft.Json.JsonConvert.SerializeObject(browserInfo);
                Clients.All.receiveBrowserInfo(browserInfoJson);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }

        }


        //public void sendId(string targetId, string browserNum, string browserId)
        //{
        //    Clients.Client(targetId).receiveIdMsg(browserNum, browserId);
        //    Clients.All.broadcastIdMsg(senderBrowserNum, senderPeerId);
        //}
    }
}