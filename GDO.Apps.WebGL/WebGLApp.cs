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

        public Camera Camera { get; set; }

        public string Name { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;

            this.Camera = new Camera();
        }
    }

    public class Camera
    {
        public string[] Position { get; set; }
        public string[] Quaternion { get; set; }

        public Camera()
        {
            this.Position = new string[3];
            this.Quaternion = new string[4];
        }
    }
}