using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;

//[assembly: System.Web.UI.WebResource("GDO.Apps.ImageTiles.Scripts.imagetiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.ImageTiles.Configurations.sample.js", "application/json")]

namespace GDO.Apps.TimeV
{
    [Export(typeof(IAppHub))]
    public class TimeVAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "TimeV";

        public void RequestTile(int instanceId, int sectionCol, int sectionRow)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //(TimeVApp)Cave.Apps["ImageTiles"].Instances[instanceId]).getTile(sectionCol, sectionRow)
                    //Clients.Caller.receiveTile((tile);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        //uploadImage send File
    }
}