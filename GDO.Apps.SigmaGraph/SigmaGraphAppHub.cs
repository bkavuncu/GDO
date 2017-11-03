using System;
using System.Collections.Generic;
using System.Net;
using System.ComponentModel.Composition;
using System.Linq;
using GDO.Core;
using GDO.Core.Apps;
using log4net;

// TODO specs for all method
namespace GDO.Apps.SigmaGraph
{
    [Export(typeof(IAppHub))]
    public class SigmaGraphAppHub : GDOHub, IBaseAppHub
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(SigmaGraphAppHub));

        /// <summary>
        /// Gets or sets the controller identifier connection string
        /// used for loggin time 
        /// </summary>
        /// <value>
        /// The controller identifier.
        /// </value>
        private string ControllerId { get; set; }
        
        public string Name { get; set; } = "SigmaGraph";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new SigmaGraphApp().GetType();
        public void JoinGroup(string groupId)
        {
            Cave.Deployment.Apps[Name].Hub.Clients = Clients;
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void InitiateProcessing(int instanceId, string filename)
        {
            Log.Info($"SigmaGraph: Server side InitiateProcessing is called {instanceId} {filename}.");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    this.ControllerId = Context.ConnectionId;

                    // Indicate to clients that a graph is loading
                    Clients.Group("" + instanceId).showSpinner();

                    // Tell clients to reset their field of view for a new graph
                    Clients.Group("" + instanceId).initInstanceGlobalVariables();

                    // Create SigmaGraphApp project and call its function to process graph
                    var ga = (SigmaGraphApp) Cave.Deployment.Apps["SigmaGraph"].Instances[instanceId];
                   
                    Clients.Caller.setMessage("Initiating processing of graph data in file: " + filename);
                    ga.ProcessGraph(filename);
                    Clients.Caller.setMessage("Processing of raw graph data is completed.");

                    // Clients.Group to broadcast and get all clients to update graph
                    Clients.Group("" + instanceId).renderGraph();
                    Clients.Caller.setMessage("SigmaGraph is now being rendered.");

                    Log.Info("SigmaGraph: Finished Initiate PRocessing. {instanceId} {filename}.");
                }
                catch (WebException e)
                {
                    Clients.Caller.setMessage("Error: File cannot be loaded. Please check if filename is valid.");
                    Log.Error($"SigmaGraph: Error in sigma processing {e} {instanceId} {filename}.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Processing of raw graph data failed to initiate.");
                    Clients.Caller.setMessage(e.ToString());
                    Log.Error("SigmaGraph: Error in sigma processing " + e);
                }
            }
        }

        public List<string> GetFilesWithin(int instanceId, double x, double y, double xWidth, double yWidth)
        {
            lock (Cave.AppLocks[instanceId])
            {
                var ga = (SigmaGraphApp)Cave.Deployment.Apps["SigmaGraph"].Instances[instanceId];
                IEnumerable<string> filePaths = ga.GetFilesWithin(x, y, xWidth, yWidth)
                    .Select(filePath => "Web/SigmaGraph/QuadTrees/" + filePath);
                return filePaths.ToList();
            }
        }

        public IEnumerable<string> GetLeafBoxes(int instanceId, double x, double y, double xWidth, double yWidth)
        {
            lock (Cave.AppLocks[instanceId])
            {
                var ga = (SigmaGraphApp)Cave.Deployment.Apps["SigmaGraph"].Instances[instanceId];
                IEnumerable<string> boxes = ga.GetLeafBoxes(x, y, xWidth, yWidth);
                return boxes.ToList();
            }
        }

        public void DoneRendering(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.hideSpinner();
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed finish rendering.");
                    Clients.Caller.setMessage(e.ToString());
                    Log.Error("SigmaGraph: Error in DoneRendering " + e);
                }
            }
        }

        public void Pan(int instanceId, double x, double y)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).showSpinner();
                    Clients.Caller.setMessage("Triggering panning action.");
                    Clients.Group("" + instanceId).pan(x, y);
                    Clients.Caller.setMessage("Triggered panning action.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to trigger panning action.");
                    Clients.Caller.setMessage(e.ToString());
                    Log.Error("SigmaGraph: Error in Pan " + e);
                }
            }
        }

        public void Zoom(int instanceId, double x, double y, double ratio)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).showSpinner();
                    Clients.Caller.setMessage("Triggering zooming action.");
                    Clients.Group("" + instanceId).zoom(x, y, ratio);
                    Clients.Caller.setMessage("Triggered zooming action.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to trigger zooming action.");
                    Clients.Caller.setMessage(e.ToString());
                    Log.Error("SigmaGraph: Error in Zoom " + e);
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
                    Log.Error("SigmaGraph: Error in TriggerPanning " + e);
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
                    Log.Error("SigmaGraph: Error in TriggerZoomIn " + e);
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
                    Log.Error("SigmaGraph: Error in TriggerZoomOut " + e);
                }
            }
        }

        public void ShowGraphInControlUI(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Group("" + instanceId).savePartialGraphImageToServer();
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed finish rendering.");
                    Clients.Caller.setMessage(e.ToString());
                    Log.Error("SigmaGraph: Error in ShowGraphInControlUI " + e);
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
                Log.Info("SigmaGraph: Error: Failed to log time. " + e);
            }
        }
    }
}