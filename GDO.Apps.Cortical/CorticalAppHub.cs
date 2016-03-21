using System;
using System.Net;
using System.ComponentModel.Composition;
using System.Diagnostics;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;


namespace GDO.Apps.Cortical
{
    [Export(typeof(IAppHub))]
    public class CorticalAppHub : Hub, IBaseAppHub
    {
        public string ControllerId { get; set; }
        public static CorticalAppHub self;
        public static CorticalApp ga;

        public string Name { get; set; } = "Cortical";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new CorticalApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void Init(int instanceId)
        {
            // nothing to do here yet
        }

        public void InitCorticalWord(int instanceId)
        {
            Debug.WriteLine("Debug: Server side InitiateCorticalWord is called.");
            lock (Cave.AppLocks[instanceId])
            {
                try{ 
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // create CorticalApp project
                    ga = (CorticalApp) Cave.Apps["Cortical"].Instances[instanceId];
                    Clients.Group("" + instanceId).initWordConf_layout();
                    Clients.Caller.setMessage("Cortical app initialised.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render layout.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void InitCorticalText(int instanceId)
        {
            Debug.WriteLine("Debug: Server side InitiateCorticalText is called.");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // create CorticalApp project
                    ga = (CorticalApp)Cave.Apps["Cortical"].Instances[instanceId];
                    Clients.Group("" + instanceId).initTextConf_layout();
                    Clients.Caller.setMessage("Cortical app initialised.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render layout.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void InitCorticalCompare(int instanceId)
        {
            Debug.WriteLine("Debug: Server side InitiateCorticalCompare is called.");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // create CorticalApp project
                    ga = (CorticalApp)Cave.Apps["Cortical"].Instances[instanceId];
                    Clients.Group("" + instanceId).initCompareConf_layout();
                    Clients.Caller.setMessage("Cortical app initialised.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to render layout.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void WordQuery(int instanceId, string query)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("perfom word query");
                    Clients.Group("" + instanceId).renderWordFingerprint(query);
                    Clients.Caller.setMessage("Word query performed.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to perform word query.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void TextQuery(int instanceId, string text)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("perfom text query");
                    Clients.Group("" + instanceId).renderTextKeywords(text);
                    Clients.Caller.setMessage("Text query performed.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to perform text query.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void CompareQuery(int instanceId, string termA, string termB)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("perfom comparison query");
                    Clients.Group("" + instanceId).renderCompareFingerprints(termA, termB);
                    Clients.Caller.setMessage("Comparison query performed.");
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to perform comparison query.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void UpdateWord(int instanceId, string word) 
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //Clients.Caller.setMessage("Updating word for query.");
                    Clients.Group("" + instanceId).updateWordField(word);
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to update the word.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void UpdateText(int instanceId, string text)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //Clients.Caller.setMessage("Updating text for query.");
                    Clients.Group("" + instanceId).updateTextField(text);
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to update the text.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        public void UpdateCompare(int instanceId, string termA, string termB)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    //Clients.Caller.setMessage("Updating words for comparison.");
                    Clients.Group("" + instanceId).updateCompareWordFields(termA, termB);
                }
                catch (Exception e)
                {
                    Clients.Caller.setMessage("Error: Failed to update the comparison terms.");
                    Clients.Caller.setMessage(e.ToString());
                    Debug.WriteLine(e);
                }
            }
        }

        /*public void InitiateProcessing(int instanceId, string filename)
        {
            Debug.WriteLine("Debug: Server side InitiateProcessing is called.");
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    self = this;
                    this.ControllerId = Context.ConnectionId;

                    // create CorticalApp project and call its function to process graph
                    ga = (CorticalApp)Cave.Apps["Cortical"].Instances[instanceId];

                    Clients.Caller.setMessage("Initiating processing of graph data in file: " + filename);
                    //string folderNameDigit = ga.ProcessGraph(filename, false, null);
                    //Clients.Caller.setMessage("Processing of raw graph data is completed.");

                    // Clients.Group to broadcast and get all clients to update graph
                    //Clients.Group("" + instanceId).renderGraph(folderNameDigit, false);
                    //Clients.Caller.setMessage("Cortical is now being rendered.");


                    //Clients.Caller.setMessage("Requesting fields...");
                    //Clients.Caller.setFields(((CorticalApp)Cave.Apps["Cortical"].Instances[instanceId]).graphinfo.NodeOtherFields.ToArray());
                    //Clients.Caller.setMessage("Graph fields requested and sent successfully!");
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
        } */

    }
}