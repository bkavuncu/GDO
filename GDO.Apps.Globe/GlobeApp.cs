using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using GDO.Core.Apps;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Globe
{
    public class GlobeApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }
        public void Init()
        {
            
        }

        public string Name { get; set; }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }
    }
}