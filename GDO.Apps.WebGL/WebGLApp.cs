using System;
using GDO.Core;
using GDO.Core.Apps;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    public class WebGLApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public Camera Camera { get; set; }
        
        public void Init()
        {
            this.Camera = new Camera();
        }
    }

    public class Camera
    {
        public float[] position { get; set; }
        public float[] rotation { get; set; }

        public Camera()
        {
            this.position = new float[3];
            this.rotation = new float[3];
        }
    }
}