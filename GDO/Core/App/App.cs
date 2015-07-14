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
using GDO.Core;
using GDO.Utility;


namespace GDO.Core
{
    [InheritedExport]
    public class App
    {
        //public int Id { get; set; }
        public string Name { get; set; }
        public ConcurrentDictionary<int,AppConfiguration> Configurations { get; set; }
        public ConcurrentDictionary<int,IAppInstance> Instances { get; set; }

        public App()
        {

        }
        public void Init(string name)
        {
            this.Name = name;
            //load configs
        }

        public int CreateAppInstance(int confId)
        {
            if (Configurations.ContainsKey(confId))
            {
                int instanceId = Utilities.getAvailableSlot<IAppInstance>(Instances);
                IAppInstance instance = (IAppInstance) System.Reflection.Assembly.GetExecutingAssembly().CreateInstance(Name + "Instance");
                AppConfiguration conf;
                Configurations.TryGetValue(confId, out conf);
                instance.init(instanceId, conf);
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
