using System;
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

    }
}