using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using GDO.Utility;


namespace GDO.Core
{
    public class App
    {
        public string Name { get; set; }
        public ConcurrentDictionary<string,AppConfiguration> Configurations { get; set; }
        public ConcurrentDictionary<int,IAppInstance> Instances { get; set; }

        public App()
        {

        }
        public void Init(string name)
        {
            this.Name = name;
            this.Configurations = new ConcurrentDictionary<string, AppConfiguration>();
            this.Instances = new ConcurrentDictionary<int, IAppInstance>();
        }

        public int CreateAppInstance(string configName, int sectionId)
        {
            if (Configurations.ContainsKey(configName))
            {
                int instanceId = Utilities.getAvailableSlot<IAppInstance>(Instances);
                IAppInstance instance = (IAppInstance) System.Reflection.Assembly.GetExecutingAssembly().CreateInstance(Name + "Instance");
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
    }
}
