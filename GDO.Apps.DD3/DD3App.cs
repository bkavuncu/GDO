using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.DD3
{
    public class DD3App : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public IHubContext<dynamic> Context;

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();
        }

        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        private readonly object _locker = new Object();

        public void newClient(string cid, BrowserInfo b)
        {
            lock (_locker)
            {
                browserList.TryAdd(cid, new BrowserInfo(cid, b.browserNum, b.peerId, b.col, b.row, b.height, b.width));
                if (browserList.Count == Section.NumNodes)
                {
                    broadcastConfiguration();
                }
            }
        }

        private void broadcastConfiguration () {
            BrowserBroadcastInfo[] browserInfos = new BrowserBroadcastInfo[browserList.Count];
            int i = 0;

            foreach (var item in browserList.Values)
            {
                browserInfos[i] = new BrowserBroadcastInfo(item.browserNum, item.peerId, item.col, item.row);
                i++;
            }

            String browserInfoJson = Newtonsoft.Json.JsonConvert.SerializeObject(browserInfos);
            //Context.Clients.All.receiveConfiguration(browserInfoJson, Id);
            //Context.Clients.Group("" + Id).receiveConfiguration(browserInfoJson, Id);
            Newtonsoft.Json.Linq.JToken value;
            Configuration.Json.TryGetValue("id", out value);
            DD3AppHub.self.broadcastConfiguration(browserInfoJson, (int)value, Id);
        }

        public void synchronize(string cid)
        {
            syncList.AddOrUpdate(cid, true, (key, value) => true);
            if (syncList.Count == Section.NumNodes)
            {
                //Context.Clients.Group("" + Id).synchronize();
                DD3AppHub.self.broadcastSynchronize(Id);
                syncList.Clear();
            }
        }

        public bool removeClient(string id)
        {
            lock (_locker)
            {
                BrowserInfo b;
                return browserList.TryRemove(id, out b);
            }
        }
    }

    public class BrowserBroadcastInfo
    {
        public BrowserBroadcastInfo(string browserNum, string peerId, string col, string row)
        {
            this.browserNum = browserNum;
            this.peerId = peerId;
            this.col = col;
            this.row = row;
        }

        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
    }

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

        public string connectionId { get; set; }
        public string browserNum { get; set; }
        public string peerId { get; set; }
        public string col { get; set; }
        public string row { get; set; }
        public string height { get; set; }
        public string width { get; set; }
    }
}

//yky112358
