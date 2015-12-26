using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    public class WebGLApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }

        public MousePosition MousePosition { get; set; }

        public string mouseX = "";
        public string mouseY = "";

        public string Name { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;

            this.MousePosition = new MousePosition();
        }
    }

    public class MousePosition
    {
        public string[] Position { get; set; }

        public MousePosition()
        {
            this.Position = new string[2];
        }
    }
}