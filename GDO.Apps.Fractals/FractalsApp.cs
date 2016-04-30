using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Fractals
{
    public class FractalsApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }

        public float XRot;
        public float YRot;
        public int Mod;

        public string Name { get; set; }
        public void Init()
        {
            XRot = 0.0f;
            YRot = 0.0f;
            Mod = 0;
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

        public void IncXRot()
        {
            XRot += 0.01f;
        }
        public void DecXRot()
        {
            XRot -= 0.01f;
        }

        public void IncYRot()
        {
            YRot -= 0.01f;
        }
        public void DecYRot()
        {
            YRot += 0.01f;
        }

        public void ToggleMod()
        {
            Mod *= -1;
            Mod++;
        }

    }
}