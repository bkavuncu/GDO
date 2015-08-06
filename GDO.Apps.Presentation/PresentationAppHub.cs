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

//[assembly: System.Web.UI.WebResource("GDO.Apps.Presentation.Scripts.imagetiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Presentation.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Presentation
{
    [Export(typeof(IAppHub))]
    public class PresentationAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Presentation";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new PresentationApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void UploadPPT(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationApp pa = ((PresentationApp) Cave.Apps["Presentation"].Instances[instanceId]);
                    pa.ProcessPpt(filename);
                    Clients.Group("" + instanceId).receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestPptInfo(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationApp pa = ((PresentationApp) Cave.Apps["Presentation"].Instances[instanceId]);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestRefresh(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationApp pa = ((PresentationApp) Cave.Apps["Presentation"].Instances[instanceId]);
                    Clients.Group("" + instanceId).receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }   
        }

        public void RequestPreviousPage(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationApp pa = ((PresentationApp) Cave.Apps["Presentation"].Instances[instanceId]);
                    if (pa.CurrentPage <= 0)
                    {
                        pa.CurrentPage = 0;
                    }
                    else if (pa.CurrentPage < pa.PageCount)
                    {
                        pa.CurrentPage -= 1;
                    } 
                    else
                    {
                        pa.CurrentPage = pa.PageCount - 1;
                    }
                    Clients.Group("" + instanceId).receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        public void RequestNextPage(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationApp pa = ((PresentationApp) Cave.Apps["Presentation"].Instances[instanceId]);
                    if (pa.CurrentPage < 0)
                    {
                        pa.CurrentPage = 0;
                    } else if (pa.CurrentPage < (pa.PageCount - 1))
                    {
                        pa.CurrentPage += 1;
                    }
                    else
                    {
                        pa.CurrentPage = pa.PageCount - 1;
                    }
                    Clients.Group("" + instanceId).receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }
}