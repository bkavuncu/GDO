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

namespace GDO.Apps.Graph
{
    [Export(typeof(IAppHub))]
    public class GraphAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Graph";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new GraphApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void RequestRendering (int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {    // create the GraphApp object later on
                    //GraphApp ga = (ImagesApp)Cave.Apps["Graph"].Instances[instanceId];
                    //string imageNameDigit = ia.ProcessImage(imageName, ia.DisplayMode);
                    try // the 'try' 'catch' here seems redundant
                    {   // Clients.Group to let all clients within the group receive image name
                        Clients.Group("" + instanceId).RenderGraph(); // pass in parameters later
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine(e);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        /*

        // this function is used to initialise ImagesApp object and imageNameDigit (obtained thru processImage function)
        public void ChangeImageName(int instanceId, string imageName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ImagesApp ia = (ImagesApp)Cave.Apps["Images"].Instances[instanceId];
                    string imageNameDigit = ia.ProcessImage(imageName, ia.DisplayMode);
                    SendImageNames(instanceId, imageName, imageNameDigit);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }

        // called by ChangeImageName above to let all clients receive image name (when new photo is uploaded after nodes have been initiated probably)
        public void SendImageNames(int instanceId, string imageName, string imageNameDigit)
        {
            try
            {   // Clients.Group to let all clients within the group receive image name
                Clients.Group("" + instanceId).receiveImageName(imageName, imageNameDigit);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

        // called by clients (App or Control) to get image name from server, which will in turn call Client's receiveImageName function that will render the image
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

        */
    }
}