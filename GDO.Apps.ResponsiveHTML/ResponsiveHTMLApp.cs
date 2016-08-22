﻿using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using GDO.Core.Apps;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.ResponsiveHTML
{
    public class ResponsiveHTMLApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public AppConfiguration Configuration { get; set; }

        public string URL { get; set; }
        public void Init()
        {
            URL = (string)Configuration.Json.SelectToken("url"); ;
        }

        public void SetURL(string url)
        {
            URL = url;
        }

        public string GetURL()
        {
            return URL;
        }
    }
}