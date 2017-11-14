using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using GDO.Utility;

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
            Configurations = new ConcurrentDictionary<string, IAppConfiguration>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName)
        {
            if (!Configurations.ContainsKey(configName))
            {
                return -1;
            }
            int instanceId = Utilities.GetAvailableSlot(Cave.Deployment.Instances);
            ICompositeAppInstance instance = (ICompositeAppInstance) Activator.CreateInstance(AppClassType, new object[0]);
            IAppConfiguration conf;
            Configurations.TryGetValue(configName, out conf);
            instance.Id = instanceId;
            instance.App = this;
            instance.AppName = Name;
            //instance.HubContext = GlobalHost.ConnectionManager.GetHubContext(Name + "Hub");
            //instance.HubContext = (IHubContext)typeof(IConnectionManager).GetMethod("GetHubContext").GetGenericMethodDefinition().MakeGenericMethod(AppHubType).Invoke(GlobalHost.ConnectionManager, null);
            instance.SetConfiguration(conf);
            instance.Init();
            Instances.TryAdd(instanceId, instance);
            Cave.Deployment.Instances.TryAdd(instanceId, instance);
            return instanceId;
        }
    }
}
