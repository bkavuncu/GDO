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
        public void JoinGroup(int instanceId)
        { 
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void ChangeImageName(int instanceId, string imageName, int mode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).ProcessImage(imageName,mode);
                    SendImageNames(instanceId, imageName);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SendImageNames(int instanceId, string imageName)
        {
            try
            {
                //Clients.All.receiveImageName(imageName);
                Clients.Group(""+ instanceId).receiveImageName(imageName);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        public void RequestImageName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (((ImageTilesApp) Cave.Apps["ImageTiles"].Instances[instanceId]).ImageName != null)
                    {
                        Clients.Caller.receiveImageName(((ImageTilesApp)Cave.Apps["ImageTiles"].Instances[instanceId]).ImageName);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}