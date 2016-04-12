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

        public void SetThreejsCameraPosition(int instanceId, ThreejsCamera camera)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).ThreejsCamera = camera;
                    Clients.Group("" + instanceId).receiveThreejsCameraPosition(instanceId, camera);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void SetBabylonjsCameraPosition(int instanceId, BabylonjsCamera camera)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ((WebGLApp)Cave.Apps["WebGL"].Instances[instanceId]).BabylonjsCamera = camera;
                    Clients.Group("" + instanceId).receiveBabylonjsCameraPosition(instanceId, camera);
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