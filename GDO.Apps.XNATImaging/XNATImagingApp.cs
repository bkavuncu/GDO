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
        public int CurrentId { get; set; }
        public double WindowWidth { get; set; }
        public double WindowCenter { get; set; }
        public double Scale { get; set; }
        public double TranslationX { get; set; }
        public double TranslationY { get; set; }

        public void Init()
        {
            InitConfigurations();
        }

        public void Init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
        }

        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

        public void SetImage(int currentId, double windowWidth, double windowCenter, 
                                double scale, double translationX, double translationY)
        {
            CurrentId = currentId;
            WindowWidth = windowWidth;
            WindowCenter = windowCenter;
            Scale = scale;
            TranslationX = translationX;
            TranslationY = translationY;
        }

        // test method
        public void InitConfigurations()
        {
            Debug.WriteLine(Configuration.Name);
            Debug.WriteLine(Configuration.Json);


        }
    }
}