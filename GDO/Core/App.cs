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


namespace GDO.Core
{
    public class App
    {
        public string Name { get; set; }
        public int P2PMode { get; set; }
        public Type appType { get; set; }
        public ConcurrentDictionary<string,AppConfiguration> Configurations { get; set; }
        public ConcurrentDictionary<int,IAppInstance> Instances { get; set; }

        public App()
        {

        }
        public void Init(string name, int p2pmode, Type appType)
        {
            this.Name = name;
            this.P2PMode = p2pmode;
            this.appType = appType;
            this.Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            this.Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName, int sectionId)
        {
            if (Configurations.ContainsKey(configName))
            {
                int instanceId = Utilities.GetAvailableSlot<IAppInstance>(Instances);
                //IAppInstance instance = (IAppInstance) System.Reflection.Assembly.GetExecutingAssembly().CreateInstance(Name + "Instance");
                IAppInstance instance = (IAppInstance) Activator.CreateInstance(this.appType, new object[0]);
                //Dictionary<string,Type> loadedTypes = System.Reflection.Assembly.GetExecutingAssembly().DefinedTypes.ToDictionary(x => x.Name, x => x.AsType());
                //IAppInstance instance = (IAppInstance)Activator.CreateInstance(loadedTypes["GDO.Apps." + Name], new object[0]);
                //Type type = Type.GetType("GDO.Apps." + Name + ", " + System.Reflection.Assembly.GetExecutingAssembly().GetName());
                //IAppInstance instance = (IAppInstance) Activator.CreateInstance(type,new object[0]);
                AppConfiguration conf;
                Configurations.TryGetValue(configName, out conf);
                instance.init(instanceId, Cave.Sections[sectionId], conf);
                Instances.TryAdd(instanceId,instance);
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
            return configurationList;
        }
    }
}
