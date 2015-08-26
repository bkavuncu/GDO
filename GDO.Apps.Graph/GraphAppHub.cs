using System;
using System.Net;
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

        //TODO: Check if try, catch are implemented correctly
        public void InitiateProcessing(int instanceId, string fileName)
        {
            System.Diagnostics.Debug.WriteLine("Debug: Server side InitiateProcessing is called.");

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    // create GraphApp project and call its function to process graph
                    GraphApp ga = (GraphApp)Cave.Apps["Graph"].Instances[instanceId];
                    Clients.Caller.setMessage("Initiating processing of raw graph data: " + fileName);
                    string folderNameDigit = ga.ProcessGraph(fileName, false, null);

                    Clients.Caller.setMessage("Processing of raw graph data has completed.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph(folderNameDigit, false);
                    Clients.Caller.setMessage("Graph is now being rendered.");

                    // After rendering, start processing graph for zooming
                    Clients.Caller.setMessage("Initiating processing of graph to prepare for zooming.");
                    ga.ProcessGraph(fileName, true, folderNameDigit);
                    Clients.Caller.setMessage("Graph is now ready for zooming.");
                }
                catch (WebException e)
                {
                    Clients.Caller.setMessage("Error: File cannot be loaded. Please check if filename is valid.");

                    //Detailed error message for user is not necessary for this
                    //Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Processing of raw graph data failed to initiate.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }


        // TODO: update method to adapt to zooming
        public void RequestRendering(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    // with this if condition, node only gets painted when there is a graph; otherwise node will appear empty if it's loaded without any graph uploaded
                    if (((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit != null)
                    {
                        Clients.Caller.renderGraph(((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit, false);
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }


        public void HideLinks(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Hiding links.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).hideLinks();
                    Clients.Caller.setMessage("Links are now hidden.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to hide links.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void ShowLinks(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Rendering links.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderLinks();
                    Clients.Caller.setMessage("Links are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render links.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void HideLabels(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Hiding labels.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).hideLabels();
                    Clients.Caller.setMessage("Labels are now hidden.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to hide labels.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void ShowLabels(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Rendering labels.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderLabels();
                    Clients.Caller.setMessage("Labels are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render labels.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }



        public void TriggerPanning(int instanceId, string direction)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering panning action.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).pan(direction);
                    Clients.Caller.setMessage("Triggered panning action.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to trigger panning action.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }


        public void TriggerZooming(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering rendering of zoomed graph.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph(((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit, true);
                    Clients.Caller.setMessage("Zoomed graph is now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render zoomed graph.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }


    }
}