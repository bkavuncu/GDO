﻿using System;
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
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;

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

                    Clients.Caller.setMessage("Generating unique digits for presentation file...");
                    // generate unique digit name of the presentation file
                    pa.GenerateUniqueDigit(filename);

                    Clients.Caller.setMessage("Processing presentatino file...");
                    // convert ppt to png
                    String pptPath = pa.BasePath + "\\" + pa.FileNameDigit + "\\" + pa.FileName;
                    Application pptApp = new Application();
                    Microsoft.Office.Interop.PowerPoint.Presentation pptFile = pptApp.Presentations.Open(pptPath, MsoTriState.msoFalse, MsoTriState.msoFalse, MsoTriState.msoFalse);

                    pa.PageCount = pptFile.Slides.Count;
                    pa.CurrentPage = 0;
                    int width = 3072;
                    int height = Convert.ToInt32(width*pptFile.PageSetup.SlideHeight/pptFile.PageSetup.SlideWidth);
                    for (int i = 0; i < pptFile.Slides.Count; i++)
                    {
                        Clients.Caller.setMessage("Processing presentatino file: " + i.ToString() + "/" + pa.PageCount.ToString());
                        string imagepath = pa.BasePath + "\\" + pa.FileNameDigit + "\\" + "page_" + i + ".png";
                        pptFile.Slides[i + 1].Export(imagepath, "png", width, height);
                        // crop pngs
                        pa.ProcessImage(imagepath, i, 0);
                    }

                    Clients.Caller.setMessage("Updating presentation information...");
                    Clients.Group("" + instanceId).receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.receivePptInfo(pa.FileNameDigit, pa.PageCount, pa.CurrentPage);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
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
                    Clients.Caller.setMessage(e.GetType().ToString());
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
                    Clients.Caller.setMessage(e.GetType().ToString());
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
                    Clients.Caller.setMessage(e.GetType().ToString());
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
                    } 
                    else if (pa.CurrentPage < (pa.PageCount - 1))
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
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
    }
}