using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3
{
    public class DD3App : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.Context = (IHubContext<dynamic>) GlobalHost.ConnectionManager.GetHubContext<DD3AppHub>();

            Newtonsoft.Json.Linq.JToken value;
            Configuration.Json.TryGetValue("id", out value);
            this.ConfigurationId = (int)value;
        }

        private ConcurrentDictionary<string, BrowserInfo> browserList = new ConcurrentDictionary<string, BrowserInfo>();
        private ConcurrentDictionary<string, bool> syncList = new ConcurrentDictionary<string, bool>();
        private readonly object _locker = new Object();
        private IHubContext<dynamic> Context;
        private string controllerId = "";
        private int ConfigurationId;

        /*
        public enum MessageType
        {
          UPDATE  = -1,
        };
        */

        public void newClient(string cid, BrowserInfo b)
        {
            lock (_locker)
            {
                browserList.TryAdd(cid, new BrowserInfo(cid, b.browserNum, b.peerId, b.col, b.row, b.height, b.width));
                if (browserList.Count == Section.NumNodes)
                {
                    broadcastConfiguration();
                    if (controllerId != "")
                    {
                        DD3AppHub.self.updateController(controllerId, new ControllerMessage(Id, 1).toString());
                    }
                }
            }
        }

        public void defineController (string id)
        {
            controllerId = id;
            if (browserList.Count == Section.NumNodes)
            {
                // 1 = Launched
                DD3AppHub.self.updateController(controllerId, new ControllerMessage(ConfigurationId, 1).toString());
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
            DD3AppHub.self.broadcastConfiguration(browserInfoJson, ConfigurationId, Id);
        }

        public void synchronize(string cid)
        {
            syncList.AddOrUpdate(cid, true, (key, value) => true);
            if (syncList.Count == Section.NumNodes)
            {
                DD3AppHub.self.broadcastSynchronize(Id);
                syncList.Clear();
            }
        }

        public string getFirstNode()
        {
            var e = browserList.GetEnumerator();
            e.MoveNext();
            return e.Current.Key;
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

    public class ControllerMessage
    {
        public ControllerMessage(int configurationId, int state)
        {
            this.configurationId = configurationId;
            this.state = state;
        }

        public string toString ()
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }

        public int configurationId { get; set; }
        public int state { get; set; }
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
