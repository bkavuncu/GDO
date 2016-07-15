using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using GDO.Core.Apps;

namespace GDO.Apps.XNATImaging
{
    public class XNATImagingApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public string Name { get; set; }
        public void Init()
        {
        }

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;

            InitConfigurations();
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

        public void InitConfigurations()
        {
            Console.WriteLine(Configuration.Name);
            Console.WriteLine(Configuration.Json);

            Console.WriteLine(Cave.Apps["XNATImaging"].Instances[Id].Configuration);
            List<string> configurations = Cave.Apps["XNATImaging"].GetConfigurationList();
            Console.WriteLine(configurations.Count);

        }
    }
}