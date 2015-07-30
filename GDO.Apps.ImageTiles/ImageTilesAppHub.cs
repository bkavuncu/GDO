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
using GDO.Utility;

//[assembly: System.Web.UI.WebResource("GDO.Apps.ImageTiles.Scripts.imagetiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.ImageTiles.Configurations.sample.js", "application/json")]

namespace GDO.Apps.ImageTiles
{
    [Export(typeof (IAppHub))]
    public class ImageTilesAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "ImageTiles";
        public int P2PMode { get; set; } = (int) Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new ImageTilesApp().GetType();

        public void RequestTile(int instanceId, int sectionCol, int sectionRow)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ImageTilesApp) Cave.Apps["ImageTiles"].Instances[instanceId]).Tiles != null)
                    {
                        Clients.Caller.receiveTile(((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).GetTile(sectionCol, sectionRow));
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void UploadImage(int instanceId, string image, int mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).ProcessImage(image, mode);
                    //Clients.Group(((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).Section.Id.ToString()).receiveTile(((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).GetTile(sectionCol, sectionRow));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}