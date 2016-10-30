// This code was written by Senaka Fernando
//

using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using GDO.Core.Modules;

namespace GDO.Modules.DataAnalysis
{
    public class DataAnalysisModule : IModule
    {
        public string Name { get; set; }

        public void Init()
        {
            Name = "DataAnalysis";
        }
    }
}