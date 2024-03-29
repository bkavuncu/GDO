﻿using System;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using log4net;

namespace GDO.Apps.GigaImages
{
    [Export(typeof(IAppHub))]
    public class GigaImagesAppHub : GDOHub, IBaseAppHub
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(GigaImagesAppHub));
        public string Name { get; set; } = "GigaImages";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new GigaImagesApp().GetType();
        public void JoinGroup(string groupId)
        {
            Cave.Deployment.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void UploadPosition(int instanceId, float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GigaImagesApp)Cave.Deployment.Apps["GigaImages"].Instances[instanceId]).SetPosition(topLeft,center,bottomRight,zoom,width,height);
                    Clients.Caller.receivePosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
                    BroadcastPosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
                }
                catch (Exception e) {
                    Log.Error("error in giga image upload " + e);
                }
            }
        }
        
        public void RequestPosition(int instanceId, bool control)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    if (control)
                    {
                        Position position =
                            ((GigaImagesApp) Cave.Deployment.Apps["GigaImages"].Instances[instanceId]).GetPosition();
                        Clients.Caller.receiveInitialPosition(instanceId, position.Center, position.Zoom);
                    }
                    else
                    {
                        if (((GigaImagesApp)Cave.Deployment.Apps["GigaImages"].Instances[instanceId]).Configuration.IsInitialized)
                        {
                            Position position =((GigaImagesApp) Cave.Deployment.Apps["GigaImages"].Instances[instanceId]).GetPosition();
                            Clients.Caller.receivePosition(instanceId, position.TopLeft, position.Center,position.BottomRight, position.Zoom, position.Width, position.Height);
                        }
                    }
                }
                catch (Exception e)
                {
                    Log.Error("error in giga image upload " + e);
                }

            }
        }


        public void BroadcastPosition(int instanceId, float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            Clients.Group("" + instanceId).receivePosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
        }

        public override void SignalConfigUpdated(int instanceId) {
            Position position =
                ((GigaImagesApp)Cave.Deployment.Apps["GigaImages"].Instances[instanceId]).GetPosition();
            UploadPosition(instanceId, position.TopLeft, position.Center, position.BottomRight, position.Zoom,
                position.Width, position.Height);
        }
    }
}
