using System;
using GDO.Core;
using System.Collections.Generic;
using System.Diagnostics;
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
            Debug.WriteLine("Time taken to compute adjacencies: ");
            Debug.WriteLine(Configuration.Name);

            InitConfigurations();
        }

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            Debug.WriteLine(Configuration.Name);
            
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
            Debug.WriteLine(Configuration.Name);
            Debug.WriteLine(Configuration.Json);


        }
    }
}