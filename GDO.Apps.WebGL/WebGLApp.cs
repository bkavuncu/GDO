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

        public ThreejsCamera ThreejsCamera { get; set; }
        public BabylonjsCamera BabylonjsCamera { get; set; }


        public void Init()
        {
            this.ThreejsCamera = new ThreejsCamera();
            this.BabylonjsCamera = new BabylonjsCamera();
        }
    }

    public class ThreejsCamera
    {
        public float[] position { get; set; }
        public float[] quaternion { get; set; }

        public ThreejsCamera()
        {
            this.position = new float[3];
            this.quaternion = new float[4];
        }
    }

    public class BabylonjsCamera
    {
        public float[] position { get; set; }
        public float[] rotation { get; set; }

        public BabylonjsCamera()
        {
            this.position = new float[3];
            this.rotation = new float[3];
        }
    }
}