using System;
using System.Collections.Generic;
using System.Net;
using System.ComponentModel.Composition;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;
using Z.Expressions;
using GDO.Apps.SigmaGraph.Domain;
using MathNet.Numerics.Statistics;
using MathNet.Numerics;

// TODO specs for all method
namespace GDO.Apps.SigmaGraph
{
    [Export(typeof(IAppHub))]
    public class SigmaGraphAppHub : Hub, IBaseAppHub
    {
        private string ControllerId { get; set; }
        public static SigmaGraphAppHub Self;
        private static SigmaGraphApp ga;

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
                    Self = this;
                    this.ControllerId = Context.ConnectionId;

                    // Indicate to clients that a graph is loading
                    Clients.Group("" + instanceId).showSpinner();

                    // Tell clients to reset their field of view for a new graph
                    Clients.Group("" + instanceId).initInstanceGlobalVariables();

                    // Create SigmaGraphApp project and call its function to process graph
                    ga = (SigmaGraphApp) Cave.Apps["SigmaGraph"].Instances[instanceId];
                    ga.ControllerId = Context.ConnectionId;

                    Clients.Caller.setMessage("Initiating processing of graph data in file: " + filename);
                    ga.ProcessGraph(filename);
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
                    Clients.Group("" + instanceId).showSpinner();
                    Clients.Caller.setMessage("Triggering panning action.");
                    Clients.Group("" + instanceId).pan(x, y);
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

        public void ShowControlGraph(int instanceId)
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
                    Debug.WriteLine(e);
                }
            }
        }

        public void Evaluate(int instanceId, string code)
        {
            Clients.Caller.logTime("Beginning to eval code...");
            ga = (SigmaGraphApp)Cave.Apps["SigmaGraph"].Instances[instanceId];
            // Test code
            // First Attempt: Get mean and stdev of all edges of the same arr to arr
            Clients.Caller.logTime("Getting links...");
            GraphInfo graph;
            List<GraphLink> edges;
            try
            {
                graph = ga.GetCurrentGraph();
                edges = graph.Links;
            } catch (Exception e)
            {
                Clients.Caller.setMessage(e.ToString());
                Debug.WriteLine(e);
                return;
            }
            
            Clients.Caller.logTime("Getting weights...");
            char[] delims = { 'N', ' ', ',' };
            Dictionary<string, List<double>> weightsAcrossTime = new Dictionary<string, List<double>>();
            foreach (GraphLink edge in edges)
            {
                string sourceArr = edge.Source.Split(delims)[1];
                string targetArr = edge.Target.Split(delims)[1];
                string edgeId = "S" + sourceArr + "T" + targetArr;
                //var x = edge.Source.Split(delims);
                //DateTime date = DateTime.Parse(edge.Source.Split(delims)[2]);
                //if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                //{
                //    continue;
                //}

                if (!weightsAcrossTime.ContainsKey(edgeId))
                {
                    weightsAcrossTime.Add(edgeId, new List<double>());
                }

                weightsAcrossTime[edgeId].Add(Double.Parse(edge.Attrs["weight2"]));
            }

            Clients.Caller.logTime("Calculating per edge stats...");
            Dictionary<string, DescriptiveStatistics> stats = weightsAcrossTime
                .ToDictionary(elt => elt.Key, elt => new DescriptiveStatistics(elt.Value));

            Clients.Caller.logTime("Calculating per edge zscores...");
            Dictionary<string, List<double>> zscores = weightsAcrossTime
                .ToDictionary(elt => elt.Key, elt =>
                {
                    var mean = elt.Value.Mean();
                    var stdev = elt.Value.StandardDeviation();
                    return elt.Value.Select(w=> (w - mean) / stdev).ToList();
                });

            Clients.Caller.logTime("Calculating per edge eicdfs...");
            Dictionary<string, double[]> eicdfs = weightsAcrossTime
                .ToDictionary(elt => elt.Key, elt =>
                {
                    Func<double,double> eicdf = Statistics.EmpiricalInvCDFFunc(elt.Value);
                    return Generate.LinearSpacedMap(101, start: 0.0, stop: 1.0, map: eicdf);
                });

            Clients.Caller.logTime("Calculating global stats...");
            IEnumerable<double> weights = edges.Select(e => Double.Parse(e.Attrs["weight2"]));
            DescriptiveStatistics globalStats = new DescriptiveStatistics(weights);
            double[] globalEicdf = Generate.LinearSpacedMap(101, 
                start: 0.0, stop: 1.0, map: Statistics.EmpiricalInvCDFFunc(weights));

            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "stats", stats },
                { "zscores", zscores },
                { "eicdfs", eicdfs },
                { "globalStats", globalStats},
                { "globalEicdf", globalEicdf}
            };
            Clients.Caller.logTime("Sending code to clients...");
            Clients.Group("" + instanceId).eval(code, parameters);
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
    }
}