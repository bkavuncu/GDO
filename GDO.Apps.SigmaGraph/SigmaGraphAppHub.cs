using System;
using System.Collections.Generic;
using System.Net;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;

// TODO cleanup this file
namespace GDO.Apps.SigmaGraph
{
    [Export(typeof(IAppHub))]
    public class SigmaGraphAppHub : Hub, IBaseAppHub
    {
        public string ControllerId { get; set; }
        public static SigmaGraphAppHub self;
        public static SigmaGraphApp ga;

        public string Name { get; set; } = "SigmaGraph";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new SigmaGraphApp().GetType();
        public void JoinGroup(string groupId)
        {
            Cave.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void InitiateProcessing(int instanceId, string filename)
        {
            Debug.WriteLine("Debug: Server side InitiateProcessing is called.");
            lock (Cave.AppLocks[instanceId])// todo holding this lock for so long is causing problems for Chris' twitter app - we can look at locking earlier - need to identify who else is trying to obtain the lock
            {
                try
                {
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // Tell clients to reset their field of view for a new graph
                    Clients.Group("" + instanceId).initInstanceGlobalVariables();

                    // create SigmaGraphApp project and call its function to process graph
                    ga = (SigmaGraphApp)Cave.Apps["SigmaGraph"].Instances[instanceId];
                    
                    Clients.Caller.setMessage("Initiating processing of graph data in file: " + filename);
                    ga.ProcessGraph(filename, false, null, ga.Section.Width, ga.Section.Height);
                    Clients.Caller.setMessage("Processing of raw graph data is completed.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph();
                    Clients.Caller.setMessage("SigmaGraph is now being rendered.");

                    Clients.Caller.setMessage("Requesting fields...");
                    Clients.Caller.setMessage("Graph fields requested and sent successfully!");
                }
                catch (WebException e)
                {
                    Clients.Caller.setMessage("Error: File cannot be loaded. Please check if filename is valid.");
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

        public List<string> GetFilesWithin(int instanceId, double x, double y, double xWidth, double yWidth)
        {
            lock (Cave.AppLocks[instanceId])
            {
                ga = (SigmaGraphApp)Cave.Apps["SigmaGraph"].Instances[instanceId];
                IEnumerable<string> filePaths = ga.GetFilesWithin(x, y, xWidth, yWidth)
                    .Select(filePath => "Web/SigmaGraph/QuadTrees/" + filePath);
                return filePaths.ToList();
            }
        }

        public IEnumerable<string> GetLeafBoxes(int instanceId, double x, double y, double xWidth, double yWidth)
        {
            lock (Cave.AppLocks[instanceId])
            {
                ga = (SigmaGraphApp)Cave.Apps["SigmaGraph"].Instances[instanceId];
                IEnumerable<string> boxes = ga.GetLeafBoxes(x, y, xWidth, yWidth);
                return boxes.ToList();
            }
        }

        public void setAllNodesSize(int instanceId, int nodeSize)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Changing size of nodes.");
                    Clients.Group("" + instanceId).setNodeSize(nodeSize);
                    Clients.Caller.setMessage("Nodes are changing size.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to change node size.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void setOriginalSize(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Sizing nodes to their original size.");
                    Clients.Group("" + instanceId).setNodesOriginalSize();
                    //Clients.Group("" + instanceId).hideNodes();
                    //Clients.Group("" + instanceId).renderNodes();
                    Clients.Caller.setMessage("Nodes are changing size.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to change node size.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
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
                    Clients.Group("" + instanceId).showLinks();
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

        public void ShowLabels(int instanceId, string field, string color)  //TODO add a default color
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Rendering '" + field +"' field as labels.");
                    Clients.Group("" + instanceId).renderLabels(field, color);
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

        public void Pan(int instanceId, double x, double y)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering panning action.");
                    Clients.Group("" + instanceId).pan(x,y);
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

                    Clients.Group("" + instanceId).zoom(0.5,0.5,1.25);
                    Clients.Caller.setMessage("Zoomed-in graph is now being rendered.");
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

                    Clients.Group("" + instanceId).zoom(0.5, 0.5, 1/1.25);
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

        public void Zoom(int instanceId, double x, double y, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Triggering panning action.");
                    Clients.Group("" + instanceId).zoom(x, y, ratio);
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

        public void TriggerRGB(int instanceId, string colourScheme)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Setting colour scheme to: " + colourScheme);
                    Clients.Group("" + instanceId).setRGB(colourScheme);
                    Clients.Caller.setMessage("Colour scheme has been changed.");

                    // hide nodes and render new nodes
                    // TODO call hideHighlight
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

        public void RenderMostConnectedNodes(int instanceId, int numLinks, string color)  //TODO add a default color
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Highlighting nodes with more than " + numLinks + " links.");
                    Clients.Group("" + instanceId).renderMostConnectedNodes(numLinks, color);
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

        public void RenderMostConnectedLabels(int instanceId, int numLinks, string field, string color)  //TODO add a default color
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Showing labels for nodes with more than " + numLinks + " links.");
                    Clients.Group("" + instanceId).renderMostConnectedLabels(numLinks, field, color);
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

        public void InitiateSearch(int instanceId, string keywords, string field)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Initiating processing of search query: '" + keywords + "' at " + field);

                    Clients.Group("" + instanceId).hideHighlight();
                    Clients.Group("" + instanceId).hideLabels();
                    Clients.Group("" + instanceId).hideLinks();

                    Clients.Group("" + instanceId).renderSearch(keywords, field);
                    Clients.Caller.setMessage("Search result is now being rendered.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Processing of search query failed to initiate.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void RenderSearchLabels(int instanceId, string field)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Rendering labels for selected nodes.");
                    Clients.Group("" + instanceId).renderSearchLabels(field);
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