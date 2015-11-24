using System;
using System.Net;
using System.ComponentModel.Composition;
using System.Diagnostics;
using Microsoft.AspNet.SignalR;
using GDO.Core;

namespace GDO.Apps.Graph
{
    [Export(typeof(IAppHub))]
    public class GraphAppHub : Hub, IAppHub
    {
        public string ControllerId { get; set; }
        public static GraphAppHub self;
        public static GraphApp ga = null;

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

 
        public void InitiateProcessing(int instanceId, string inputFolder)
        {
            Debug.WriteLine("Debug: Server side InitiateProcessing is called.");

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // create GraphApp project and call its function to process graph
                    ga = (GraphApp)Cave.Apps["Graph"].Instances[instanceId];
                    Clients.Caller.setMessage("Initiating processing of raw graph data in folder: " + inputFolder);
                    string folderNameDigit = ga.ProcessGraph(inputFolder, false, null);
                    Clients.Caller.setMessage("Processing of raw graph data is completed.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph(folderNameDigit, false);
                    Clients.Caller.setMessage("Graph is now being rendered.");

                    // set up label dictionary to prepare for search
                    Clients.Caller.setMessage("Setting up label dictionary.");
                    ga.SetupLabelDictionary();

                    // set up nodes dictionary to prepare for search
                    Clients.Caller.setMessage("Setting up nodes dictionary.");
                    ga.SetupNodeDictionary();

                    // After rendering, start processing graph for zooming
                    Clients.Caller.setMessage("Initiating processing of graph to prepare for zooming.");
                    ga.ProcessGraph(inputFolder, true, folderNameDigit);
                    Clients.Caller.setMessage("Graph is now ready for zooming.");

                    // compute the adjacencies of each node
                    ga.ComputeNodeAdjacencies();
                    Clients.Caller.setMessage("Computing adjacencies for search function.");

                }
                catch (WebException e)
                {
                    Clients.Caller.setMessage("Error: Files cannot be loaded. Please check if folder name is valid.");

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

        public void TriggerZoomIn(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering rendering of zoomed-in graph.");

                    // updated zoomedIn variable within ga object
                    ga.UpdateZoomVar(true);

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph(((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit, true);
                    Clients.Caller.setMessage("Zoomed-in graph is now being rendered.");

                    Clients.Group("" + instanceId).renderBuffer(((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit);
                    Clients.Caller.setMessage("Buffer for zoomed-in graph is now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render zoomed-in graph.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void TriggerZoomOut(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering rendering of zoomed-out graph.");

                    // updated zoomedIn variable within ga object
                    ga.UpdateZoomVar(false);

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph(((GraphApp)Cave.Apps["Graph"].Instances[instanceId]).FolderNameDigit, false);
                    Clients.Caller.setMessage("Zoomed-out graph is now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render zoomed-out graph.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }


        public void TriggerRGB(int instanceId, string colourScheme)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Setting colour scheme to: " + colourScheme);

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).setRGB(colourScheme);
                    Clients.Caller.setMessage("Colour scheme has been changed.");

                    // hide nodes and render new nodes
                    Clients.Group("" + instanceId).hideNodes();
                    Clients.Group("" + instanceId).renderNodes();
                    Clients.Caller.setMessage("Nodes are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render new colour scheme.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }



        public void RenderMostConnectedNodes(int instanceId, int numLinks)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Highlighting nodes with more than " + numLinks + " links.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderMostConnectedNodes(numLinks);
                    Clients.Caller.setMessage("Nodes with more than " + numLinks + " links are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to highlight nodes.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void RenderMostConnectedLabels(int instanceId, int numLinks)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Showing labels for nodes with more than " + numLinks + " links.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderMostConnectedLabels(numLinks);
                    Clients.Caller.setMessage("Labels for nodes with more than " + numLinks + " links are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to show labels.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void HideMostConnected(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Removing highlight for most connected nodes and labels.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).hideHighlight();
                    Clients.Caller.setMessage("Highlights for most connected nodes and labels are now hidden.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to remove highlights.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }


        public void LogTime(string message)
        {

            try
            {
                Clients.Client(ControllerId).logTime(message);
            }
            catch (Exception e)
            {
                Clients.Client(ControllerId).logTime("Error: Failed to log time.");
                Clients.Client(ControllerId).logTime(e.ToString());
                Debug.WriteLine(e);
            }
        }



        public void InitiateSearch(int instanceId, string keywords)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Initiating processing of search query: " + keywords);
                    string folderName = ga.ProcessSearch(keywords);

                    if (folderName == null)
                    {
                        Clients.Caller.setMessage("Search query is not valid. Please input a valid keyword(s).");
                    }
                    else
                    {
                        Clients.Caller.setMessage("Processing of search query has completed.");

                        // Clients.Group to broadcast and get all clients to update graph

                        // hide all highlight
                        Clients.Group("" + instanceId).hideHighlight();
                        Clients.Group("" + instanceId).hideLabels();
                        Clients.Group("" + instanceId).hideLinks();

                        Clients.Group("" + instanceId).renderSearch(folderName);
                        Clients.Caller.setMessage("Search result is now being rendered.");
                    }
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Processing of search query failed to initiate.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void RenderSearchLabels(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Rendering labels for selected nodes.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderSearchLabels();
                    Clients.Caller.setMessage("Labels for selected nodes are now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to show labels.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void HideSearch(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Removing highlight for selected nodes.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).hideHighlight();
                    Clients.Caller.setMessage("Highlights for selected nodes are now hidden.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to remove highlights.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void HideSublinks(int instanceId)
        {

            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Hiding sublinks.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).hideSublinks();
                    Clients.Caller.setMessage("Sublinks are now hidden.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to remove sublinks.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

    }
}