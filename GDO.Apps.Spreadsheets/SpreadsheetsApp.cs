using System;
using GDO.Core;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using GDO.Apps.Spreadsheets.Excel;
using GDO.Apps.Spreadsheets.Models;
using Microsoft.AspNet.SignalR;
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
        public string SpreadsheetFile { get; set; }
        public string ConfigFile { get; set; }
        public string FileNumber { get; set; } = "";
        public string ConfFileNumber { get; set; } = "";
        public void init(int instanceId, string appName, Section section, AppConfiguration configuration)
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

    }
}