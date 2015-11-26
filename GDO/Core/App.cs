using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using GDO.Utility;
using Newtonsoft.Json;


namespace GDO.Core
{
    public class App
    {
        public string Name { get; set; }
        public int P2PMode { get; set; }
        [JsonIgnore]
        public Type AppType { get; set; }
        [JsonIgnore]
        public ConcurrentDictionary<string,AppConfiguration> Configurations { get; set; }
        public List<string> ConfigurationList { get; set; }
        [JsonIgnore]
        public ConcurrentDictionary<int,IAppInstance> Instances { get; set; }

        public App()
        {

        }
        public void Init(string name, int p2pmode, Type appType)
        {
            this.Name = name;
            this.P2PMode = p2pmode;
            this.AppType = appType;
            this.Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            this.Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName, int sectionId) {
            if (!Configurations.ContainsKey(configName)) {
                return -1;
            }

            int instanceId = Utilities.GetAvailableSlot<IAppInstance>(Cave.Instances);
            IBaseAppInstance instance = (IBaseAppInstance) Activator.CreateInstance(this.AppType, new object[0]);
            AppConfiguration conf;
            Cave.Sections[sectionId].CalculateDimensions();
            Configurations.TryGetValue(configName, out conf);
            instance.Init(instanceId, this.Name, Cave.Sections[sectionId], conf, this.VirtualMode);
            Instances.TryAdd(instanceId,instance);
            Cave.Instances.TryAdd(instanceId,instance);
            return instanceId;
        }

        public bool DisposeAppInstance(int instanceId) {
            if (!Instances.ContainsKey(instanceId)) {
                return false;
            }

            IAppInstance instance;
            Instances.TryRemove(instanceId, out instance);
            Cave.Instances.TryRemove(instanceId,out instance);
            return true;
        }

        public bool LoadConfigurations()
        {
            return false;
        }

        public List<string> GetConfigurationList() {
            List<string> configurationList =
                Configurations.Select(configurationEntry => configurationEntry.Value.Name).ToList();
            configurationList.Sort();
            this.ConfigurationList = configurationList;
            return configurationList;
        }

        public string SerializeJSON()
        {
            GetConfigurationList();
            return JsonConvert.SerializeObject(this);
        }
    }
}
