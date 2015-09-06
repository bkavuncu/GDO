using System;
using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Reflection;
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

        public int CreateAppInstance(string configName, int sectionId)
        {
            if (Configurations.ContainsKey(configName))
            {
                int instanceId = Utilities.GetAvailableSlot<IAppInstance>(Cave.Instances);
                IAppInstance instance = (IAppInstance) Activator.CreateInstance(this.AppType, new object[0]);
                AppConfiguration conf;
                Cave.Sections[sectionId].CalculateDimensions();
                Configurations.TryGetValue(configName, out conf);
                instance.init(instanceId, this.Name, Cave.Sections[sectionId], conf);
                Instances.TryAdd(instanceId,instance);
                Cave.Instances.TryAdd(instanceId,instance);
                return instanceId;
            }
            else
            {
                return -1;
            }
        }

        public bool DisposeAppInstance(int instanceId)
        {
            if (Instances.ContainsKey(instanceId))
            {
                IAppInstance instance;
                Instances.TryRemove(instanceId, out instance);
                Cave.Instances.TryRemove(instanceId,out instance);
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool LoadConfigurations()
        {
            return false;
        }

        public List<string> GetConfigurationList()
        {
            List<string> configurationList = new List<string>();
            foreach (KeyValuePair<string, AppConfiguration> configurationEntry in Configurations)
            {
                configurationList.Add(configurationEntry.Value.Name);
            }
            configurationList.Sort();
            this.ConfigurationList = configurationList;
            return configurationList;
        }

        public string SerializeJSON()
        {
            GetConfigurationList();
            return Newtonsoft.Json.JsonConvert.SerializeObject(this);
        }
    }
}
