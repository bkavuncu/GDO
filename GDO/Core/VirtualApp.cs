using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using GDO.Utility;
using Newtonsoft.Json;


namespace GDO.Core
{
    public class VirtualApp : App
    {
        public List<string> SupportedApps { get; set; }


        public VirtualApp()
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
            IVirtualAppInstance instance = (IVirtualAppInstance) Activator.CreateInstance(this.AppClassType, new object[0]);
            AppConfiguration conf;
            Configurations.TryGetValue(configName, out conf);
            instance.Init(instanceId, this.Name, conf);
            Instances.TryAdd(instanceId, instance);
            Cave.Instances.TryAdd(instanceId, instance);
            return instanceId;
        }
    }
}
