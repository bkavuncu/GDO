using System;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    [Export(typeof(IAppHub))]
    public class WebGLAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "WebGL";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new WebGLApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }
        
        public void RequestCameraPosition(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Camera camera = ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).Camera;
                    Clients.Caller.receiveCameraPosition(instanceId, camera);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetCameraPosition(int instanceId, Camera camera)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).Camera = camera;
                    Clients.Group("" + instanceId).receiveCameraPosition(instanceId, camera);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void CollectStats(int instanceId, bool collectStats)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).collectStats(instanceId, collectStats);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}