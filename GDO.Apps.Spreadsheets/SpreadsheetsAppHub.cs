using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing.Imaging;
using System.IO;
using System.Web;
using System.Web.Routing;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.Spreadsheets
{
    [Export(typeof(IAppHub))]
    public class SpreadsheetsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Spreadsheets";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Section;
        public Type InstanceType { get; set; } = new SpreadsheetsApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void SetName(int instanceId, string name)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Section section = Cave.Apps["Spreadsheets"].Instances[instanceId].Section;
                    var nodes = section.Nodes;
                    var strings = name.Split(new[] {" <br /> "}, StringSplitOptions.None);
                    ((SpreadsheetsApp)Cave.Apps["Spreadsheets"].Instances[instanceId]).SetName(strings[0]);
                    Random random = new Random();
                    foreach (var node in nodes)
                    {
                        Clients.Client(node.ConnectionId).receiveName(instanceId, strings[node.SectionRow % 2]);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void FileAdded(int instanceId, List<string> files)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    SpreadsheetsApp app = ((SpreadsheetsApp) Cave.Apps["Spreadsheets"].Instances[instanceId]);
                    app.SpreadsheetFile = files[0];
                    app.ConfigFile = files[1];
                    String basePath = HttpContext.Current.Server.MapPath("~/Web/Spreadsheets/Sheet/");
                    String path1 = basePath + app.SpreadsheetFile;
                    Random imgDigitGenerator = new Random();
                    while (Directory.Exists(basePath + app.FileNumber))
                    {
                        app.FileNumber = imgDigitGenerator.Next(10000, 99999).ToString();
                    }
                    String path2 = basePath + app.FileNumber + "\\" + app.SpreadsheetFile;
                    Directory.CreateDirectory(basePath + app.FileNumber);
                    File.Copy(path1,path2);
                    File.Delete(path1);
                    Clients.Caller.ServerToConsole(instanceId,LogLevel.INFO, "file path for model : " + path2);
                    Clients.Caller.ServerToConsole(instanceId,LogLevel.INFO, "sending model : " + app.SpreadsheetFile + " with fileID: " + app.FileNumber);
                    var context = GlobalHost.ConnectionManager.GetHubContext<ScenarioHub>();
                    context.Clients.All.FileAdded(new List<string>() { app.FileNumber, app.SpreadsheetFile });
                    Clients.Caller.ServerToConsole(instanceId,LogLevel.INFO, "sent file description to excel component.");
                }
                catch (Exception e)
                {
                    Clients.Caller.ServerToConsole(instanceId,LogLevel.ERROR, "Exception[SpreadSheetsAppHub]: " + e);
                }
            }
        }

        public void RequestName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.receiveName(instanceId, ((SpreadsheetsApp)Cave.Apps["Spreadsheets"].Instances[instanceId]).GetName());
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}