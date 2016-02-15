using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.GigaImages
{
    [Export(typeof(IAppHub))]
    public class GigaImagesAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "GigaImages";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new GigaImagesApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void UploadPosition(int instanceId, float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((GigaImagesApp)Cave.Apps["GigaImages"].Instances[instanceId]).SetPosition(topLeft,center,bottomRight,zoom,width,height);
                    Clients.Caller.receivePosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
                    BroadcastPosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
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
                            ((GigaImagesApp) Cave.Apps["GigaImages"].Instances[instanceId]).GetPosition();
                        Clients.Caller.receiveInitialPosition(instanceId, position.Center, position.Zoom);
                    }
                    else
                    {
                        if (((GigaImagesApp)Cave.Apps["GigaImages"].Instances[instanceId]).IsInitialized)
                        {
                            Position position =((GigaImagesApp) Cave.Apps["GigaImages"].Instances[instanceId]).GetPosition();
                            Clients.Caller.receivePosition(instanceId, position.TopLeft, position.Center,position.BottomRight, position.Zoom, position.Width, position.Height);
                        }
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }

            }
        }


        public void BroadcastPosition(int instanceId, float[] topLeft, float[] center, float[] bottomRight, float zoom, float width, float height)
        {
            Clients.Group("" + instanceId).receivePosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
        }
    }
}
