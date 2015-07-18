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

namespace GDO.Apps.ImageTiles
{
    [Export(typeof(IAppHub))]
    public class ImageTilesAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "ImageTiles";
        //TODO upload Image

        public void RequestTile(int instanceId, int sectionCol, int sectionRow)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //Clients.Caller.receiveTile(((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).getTile(sectionCol, sectionRow));
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