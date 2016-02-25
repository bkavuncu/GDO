using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using GDO.Utility;

namespace GDO.Core.Apps
{
    public class AdvancedApp : App
    {
        public List<string> SupportedApps { get; set; }


        public AdvancedApp()
        {

        }

        new public void Init(string name, Type appClassType, int appType, List<string> supportedApps)
        {
            this.Name = name;
            this.P2PMode = -1;
            this.AppClassType = appClassType;
            this.AppType = appType;
            this.SupportedApps = supportedApps;
            this.Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            this.Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName)
        {
            if (!Configurations.ContainsKey(configName))
            {
                return -1;
            }

            int instanceId = Utilities.GetAvailableSlot<IAppInstance>(Cave.Instances);
            IAdvancedAppInstance instance = (IAdvancedAppInstance) Activator.CreateInstance(this.AppClassType, new object[0]);
            AppConfiguration conf;
            Configurations.TryGetValue(configName, out conf);
            instance.Id = instanceId;
            instance.AppName = this.Name;
            instance.Configuration = conf;
            instance.Init();
            Instances.TryAdd(instanceId, instance);
            Cave.Instances.TryAdd(instanceId, instance);
            return instanceId;
        }
    }
}
