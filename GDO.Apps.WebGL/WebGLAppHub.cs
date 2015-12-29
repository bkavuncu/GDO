using System;
using System.ComponentModel.Composition;
using GDO.Core;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.WebGL
{
    [Export(typeof(IAppHub))]
    public class WebGLAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "WebGL";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new WebGLApp().GetType();

        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }

        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
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
    }
}