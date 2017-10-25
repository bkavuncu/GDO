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
        public ConcurrentDictionary<string,IAppConfiguration> Configurations { get; set; }
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
            Configurations = new ConcurrentDictionary<string, IAppConfiguration>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(dynamic config, int sectionId, bool integrationMode, int parentId) {
            if (!(config is AppJsonConfiguration) && !Configurations.ContainsKey(config)) {
                return -1;
            }

            int instanceId = Utilities.GetAvailableSlot(Cave.Deployment.Instances);
            IBaseAppInstance instance = (IBaseAppInstance)Activator.CreateInstance(AppClassType, new object[0]);
            IAppConfiguration conf;
            Cave.Deployment.Sections[sectionId].CalculateDimensions();
            if (config is AppJsonConfiguration)
            {
                conf = config;
            }
            else
            {
                Configurations.TryGetValue(config, out conf);
                if (conf == null) {
                    Log.Error("Failed to find config name " + config);
                    return -1;
                }
            }

            //TODO BUG we need to copy the instances of the config rather than pass by value :-/ ...
            instance.Id = instanceId;
            instance.App = this;
            instance.AppName = Name;
            //instance.HubContext = GlobalHost.ConnectionManager.GetHubContext(Name + "Hub");
            //instance.HubContext = (IHubContext) typeof (IConnectionManager).GetMethod("GetHubContext").GetGenericMethodDefinition().MakeGenericMethod(AppHubType).Invoke(GlobalHost.ConnectionManager, null);
            instance.Section = Cave.Deployment.Sections[sectionId];
            instance.SetConfiguration(conf);
            instance.IntegrationMode = integrationMode;
            if (integrationMode)
            {
                instance.ParentApp = (ICompositeAppInstance) Cave.Deployment.Instances[parentId];
            }
            instance.Init();
            Instances.TryAdd(instanceId,instance);
            Cave.Deployment.Instances.TryAdd(instanceId,instance);
            Log.Info("created app "+Name+ " instance "+(config is string ? config : config.Name));
            return instanceId;
        }

        public bool DisposeAppInstance(int instanceId) {
            if (!Instances.ContainsKey(instanceId)) {
                return false;
            }

            IAppInstance instance;
            Instances.TryRemove(instanceId, out instance);
            Cave.Deployment.Instances.TryRemove(instanceId,out instance);
            return true;
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
