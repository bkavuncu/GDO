using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using GDO.Utility;
using log4net;
using Newtonsoft.Json;

namespace GDO.Core.Apps
{
    public class App
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(App));
        public string Name { get; set; }
        //[JsonIgnore]
        //public Type AppHubType { get; set; }
        [JsonIgnore]
        public Type AppClassType { get; set; }
        public int AppType { get; set; }
        public int P2PMode { get; set; }
        [JsonIgnore]
        public ConcurrentDictionary<string,AppConfiguration> Configurations { get; set; }
        public List<string> ConfigurationList { get; set; }
        [JsonIgnore]
        public ConcurrentDictionary<int,IAppInstance> Instances { get; set; }
        [JsonIgnore]
        public IAppHub Hub { get; set; }

        public App()
        {

        }
        public App(string name, Type appClassType,  int appType, int p2pmode)
        {
            Name = name;
            AppClassType = appClassType;
            AppType = appType;
            P2PMode = p2pmode;
            Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName, int sectionId, bool integrationMode, int parentId) {
            if (!Configurations.ContainsKey(configName)) {
                return -1;
            }

            int instanceId = Utilities.GetAvailableSlot(Cave.Instances);
            IBaseAppInstance instance = (IBaseAppInstance) Activator.CreateInstance(AppClassType, new object[0]);
            AppConfiguration conf;
            Cave.Sections[sectionId].CalculateDimensions();
            Configurations.TryGetValue(configName, out conf);
            if (conf==null) {
                Log.Error("Failed to find config name "+configName);
                return -1;
            }
            instance.Id = instanceId;
            instance.App = this;
            instance.AppName = Name;
            //instance.HubContext = GlobalHost.ConnectionManager.GetHubContext(Name + "Hub");
            //instance.HubContext = (IHubContext) typeof (IConnectionManager).GetMethod("GetHubContext").GetGenericMethodDefinition().MakeGenericMethod(AppHubType).Invoke(GlobalHost.ConnectionManager, null);
            instance.Section = Cave.Sections[sectionId];
            instance.Configuration = conf;
            instance.IntegrationMode = integrationMode;
            if (integrationMode)
            {
                instance.ParentApp = (ICompositeAppInstance) Cave.Instances[parentId];
            }
            instance.Init();
            Instances.TryAdd(instanceId,instance);
            Cave.Instances.TryAdd(instanceId,instance);
            Log.Info("created app "+Name+ " instance "+configName);
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
            ConfigurationList = configurationList;
            return configurationList;
        }

        public string SerializeJSON()
        {
            GetConfigurationList();
            return JsonConvert.SerializeObject(this);
        }
    }
}
