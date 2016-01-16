using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Spreadsheets
{
    public class SpreadsheetsApp : IAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public string Name { get; set; }

        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.AppName = appName;
            this.Section = section;
            this.Configuration = configuration;
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Spreadsheet/Sheet"));
            Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Web/Spreadsheet/Var"));
        }
        public void SetName(string name)
        {
            Name = name;
        }

        public string GetName()
        {
            return Name;
        }

    }
}