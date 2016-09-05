using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using GDO.Core.Apps;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.SAGE2
{
    public class SAGE2App : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }

        public void Init()
        {
        }
    }
}