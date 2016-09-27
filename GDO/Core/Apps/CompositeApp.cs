using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using GDO.Utility;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Infrastructure;

namespace GDO.Core.Apps
{
    public class CompositeApp : App
    {
        public List<string> SupportedApps { get; set; }


        public CompositeApp()
        {

        }

        public CompositeApp(string name, Type appClassType, int appType, List<string> supportedApps, int p2pMode)
        {
            Name = name;
            P2PMode = p2pMode;
            AppClassType = appClassType;
            AppType = appType;
            SupportedApps = supportedApps;
            Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName)
        {
            if (!Configurations.ContainsKey(configName))
            {
                return -1;
            }
            int instanceId = Utilities.GetAvailableSlot(Cave.Instances);
            ICompositeAppInstance instance = (ICompositeAppInstance) Activator.CreateInstance(AppClassType, new object[0]);
            AppConfiguration conf;
            Configurations.TryGetValue(configName, out conf);
            instance.Id = instanceId;
            instance.App = this;
            instance.AppName = Name;
            //instance.HubContext = GlobalHost.ConnectionManager.GetHubContext(Name + "Hub");
            //instance.HubContext = (IHubContext)typeof(IConnectionManager).GetMethod("GetHubContext").GetGenericMethodDefinition().MakeGenericMethod(AppHubType).Invoke(GlobalHost.ConnectionManager, null);
            instance.Configuration = conf;
            instance.Init();
            Instances.TryAdd(instanceId, instance);
            Cave.Instances.TryAdd(instanceId, instance);
            return instanceId;
        }
    }
}
