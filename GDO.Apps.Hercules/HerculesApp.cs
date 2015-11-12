using System;
using System.IO;
using System.Net;
using GDO.Core;
using Newtonsoft.Json;
using DP.src.Augment;

namespace GDO.Apps.Hercules
{
    enum Mode
    {
        CROP=1,
        FIT=0
    };
    public class HerculesApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
        }
    }
}