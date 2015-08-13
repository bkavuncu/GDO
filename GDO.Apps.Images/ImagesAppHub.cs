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

//[assembly: System.Web.UI.WebResource("GDO.Apps.Images.Scripts.imagetiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Images.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Images
{
    [Export(typeof(IAppHub))]
    public class ImagesAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Images";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new ImagesApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void ChangeImageName(int instanceId, string imageName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    string imageNameDigit = ia.ProcessImage(imageName, ia.DisplayMode);
                    SendImageNames(instanceId, imageName, imageNameDigit);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SendImageNames(int instanceId, string imageName, string imageNameDigit)
        {
            try
            {
                Clients.Group("" + instanceId).receiveImageName(imageName, imageNameDigit);
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
                    if (((ImagesApp)Cave.Apps["Images"].Instances[instanceId]).ImageName != null)
                    {
                        Clients.Caller.receiveImageName(((ImagesApp)Cave.Apps["Images"].Instances[instanceId]).ImageName,
                                                        ((ImagesApp)Cave.Apps["Images"].Instances[instanceId]).ImageNameDigit);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetDisplayMode(int instanceId, int displaymode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    ia.DisplayMode = displaymode;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}