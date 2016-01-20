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
        public string FileAdded(int instanceId , List<string> files)
        {
            SpreadsheetFile = files[0];
            ConfigFile = files[1];
            var paths = MoveFiles();
            List<string> names;
            //returns two paths, one for each file.
            using (var app = new ExcelApp(paths[0]))
            {
                names = app.GetSheetnames();
            }
            var inputs = ScenarioManager.CreateInputs2(paths[1]);
            var outputs = ScenarioManager.CreateOutputs2(paths[1]);
            var inputString = inputs.Select(i => i.Name.ToString() + "|" + i.Cell + "|" + i.State).ToList();
            return string.Join(",",names) + "\n\n" + string.Join("\n", inputString);
        }

        private List<string> MoveFiles()
        {
            String basePath = HttpContext.Current.Server.MapPath("~/Web/Spreadsheets/Sheet/");
            String confBasePath = HttpContext.Current.Server.MapPath("~/Web/Spreadsheets/Config/");
            String path1 = basePath + SpreadsheetFile;
            String confPath1 = confBasePath + ConfigFile;
            Random imgDigitGenerator = new Random();
            while (Directory.Exists(basePath + FileNumber))
            {
                FileNumber = imgDigitGenerator.Next(10000, 99999).ToString();
            }
            while (Directory.Exists(confBasePath + ConfFileNumber))
            {
                ConfFileNumber = imgDigitGenerator.Next(10000, 99999).ToString();
            }
            String path2 = basePath + FileNumber + "\\" + SpreadsheetFile;
            String confPath2 = confBasePath + ConfFileNumber + "\\" + ConfigFile;
            Directory.CreateDirectory(basePath + FileNumber);
            Directory.CreateDirectory(confBasePath + ConfFileNumber);
            File.Copy(path1, path2);
            File.Copy(confPath1, confPath2);
            File.Delete(path1);
            File.Delete(confPath1);
            return new List<string> {path2, confPath2};
        }
    }
}