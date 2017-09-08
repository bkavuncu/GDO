// This code was written by Senaka Fernando
//

using GDO.Core.Apps;
using GDO.Utility;
using log4net;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace GDO.Core
{
    /// <summary>
    /// This class holds the state of the GDO - which sections, apps and instances are deployed.
    /// </summary>
    public sealed class CaveDeployment
    {
        public enum AppTypes
        {
            None = -1,
            Base = 1,
            Composite = 2
        };

        private static readonly ILog Log = LogManager.GetLogger(typeof(CaveDeployment));

        public ConcurrentDictionary<string, App> Apps { get; set; }
        public ConcurrentDictionary<int, IAppInstance> Instances { get; set; }
        public ConcurrentDictionary<int, Section> Sections { get; set; }

        public CaveDeployment()
        {
            Apps = new ConcurrentDictionary<string, App>();
            Instances = new ConcurrentDictionary<int, IAppInstance>();
            Sections = new ConcurrentDictionary<int, Section>();
        }

        /// <summary>
        /// Creates a section.
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="colEnd">The col end.</param>
        /// <param name="rowEnd">The row end.</param>
        /// <returns></returns>
        public List<Node> CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            List<Node> deployedNodes = new List<Node>();
            if (IsSectionFree(colStart, rowStart, colEnd, rowEnd))
            {
                int sectionId = Utilities.GetAvailableSlot<Section>(Sections);
                Section section = new Section(sectionId, colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
                Sections.TryAdd(sectionId, section);

                foreach (KeyValuePair<int, Node> nodeEntry in Cave.Layout.Nodes)
                {
                    Node node = nodeEntry.Value;
                    if (node.Col <= colEnd && node.Col >= colStart && node.Row <= rowEnd && node.Row >= rowStart)
                    {
                        deployedNodes.Add(Cave.Layout.DeployNode(section.Id, node.Id, node.Col - colStart, node.Row - rowStart));
                    }
                }
                section.CalculateDimensions();
            }
            return deployedNodes;
        }
        /// <summary>
        /// Closes the section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public List<Node> CloseSection(int sectionId)
        {
            List<Node> freedNodes = new List<Node>();
            if (ContainsSection(sectionId))
            {
                if (!Sections[sectionId].IsDeployed())
                {
                    foreach (Node node in Sections[sectionId].Nodes)
                    {
                        freedNodes.Add(Cave.Layout.FreeNode(node.Id));
                    }
                    Sections[sectionId].Nodes = null;
                    Section section;
                    Sections.TryRemove(sectionId, out section);
                }
            }
            return freedNodes;
        }

        /// <summary>
        /// Determines whether [is section free] [the specified col start].
        /// </summary>
        /// <param name="colStart">The col start.</param>
        /// <param name="rowStart">The row start.</param>
        /// <param name="colEnd">The col end.</param>
        /// <param name="rowEnd">The row end.</param>
        /// <returns></returns>
        public bool IsSectionFree(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            foreach (KeyValuePair<int, Node> nodeEntry in Cave.Layout.Nodes)
            {
                Node node = nodeEntry.Value;
                if (colStart > colEnd || rowStart > rowEnd)
                {
                    return false;
                }
                if (node.Col <= colEnd && node.Col >= colStart && node.Row <= rowEnd && node.Row >= rowStart)
                {
                    if (node.IsDeployed)
                    {
                        return false;
                    }
                }
            }
            return true;
        }

        /// <summary>
        /// Determines whether the specified section identifier contains section.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <returns></returns>
        public bool ContainsSection(int sectionId)
        {
            return Sections.ContainsKey(sectionId);
        }

        public bool ContainsApp(string appName)
        {
            return Apps.ContainsKey(appName);
        }

        /// <summary>
        /// Determines whether the specified instance identifier contains instance.
        /// </summary>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public bool ContainsInstance(int instanceId)
        {
            return Apps.Any(appEntry => appEntry.Value.Instances.ContainsKey(instanceId));
        }

        /// <summary>
        /// Sets the section p2p mode.
        /// </summary>
        /// <param name="sectionId">The section identifier.</param>
        /// <param name="p2pmode">The p2pmode.</param>
        /// <returns></returns>
        public List<Node> SetSectionP2PMode(int sectionId, int p2pmode)
        {
            List<Node> affectedNodes = new List<Node>();
            if (ContainsSection(sectionId))
            {
                //close app
                foreach (Node node in Sections[sectionId].Nodes)
                {
                    affectedNodes.Add(Cave.Layout.SetNodeP2PMode(node.Id, p2pmode));
                }
            }
            return affectedNodes;
        }

        public string GetAppName(int instanceId)
        {
            var app = Apps.Values.FirstOrDefault(a => a.Instances.ContainsKey(instanceId));
            if (app != null)
            {
                return app.Name;
            }
            Log.Error("unable to find app for instanceID " + instanceId);
            return "unknown";
        }

        public bool RegisterApp(string name, IAppHub appHub, Type appClassType, bool isComposite, List<string> supportedApps, int p2pmode)
        {
            if (!Apps.ContainsKey(name))
            {
                var app = isComposite
                    ? new CompositeApp(name, appClassType, (int)AppTypes.Composite, supportedApps, p2pmode)
                    : new App(name, appClassType, (int)AppTypes.Base, p2pmode);
                Apps.TryAdd(name, app);
                List<AppConfiguration> configurations = Cave.LoadAppConfigurations(name);
                foreach (var configuration in configurations)
                {
                    Log.Info("registering an app configuration for app " + name + " called " + configuration.Name);
                    Apps[name].Configurations.TryAdd(configuration.Name, configuration);
                }
                Apps[name].Hub = appHub;
                return true;
            }
            return false;
        }

        /// <summary>
        /// Gets the application list.
        /// </summary>
        /// <returns></returns>
        public List<string> GetAppList()
        {
            List<string> appList = Apps.Select(appEntry => appEntry.Value.Name).ToList();
            appList.Sort();
            return appList;
        }

        public int CreateBaseAppInstance(int sectionId, string appName, dynamic config)
        {
            string configName = config is string ? config : config.Name;

            Log.Info($"Creating App instance {appName} {configName} on section {sectionId}");
            if (!Sections[sectionId].IsDeployed() && Apps.ContainsKey(appName))
            {
                if (config is AppConfiguration || Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId = Apps[appName].CreateAppInstance(config, sectionId, false, -1);
                    if (instanceId >= 0)
                    {
                        ((IBaseAppInstance)Apps[appName].Instances[instanceId]).Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }
            return -1;
        }

        public int CreateChildAppInstance(int sectionId, string appName, string configName, bool integrationMode, int parentId)
        {
            Log.Info($"Creating App instance {appName} {configName} on section {sectionId}");
            if (!Sections[sectionId].IsDeployed() && Apps.ContainsKey(appName))
            {
                if (Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId = Apps[appName].CreateAppInstance(configName, sectionId, integrationMode, parentId);
                    if (instanceId >= 0)
                    {
                        ((IBaseAppInstance)Apps[appName].Instances[instanceId]).Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }
            return -1;
        }

        /// <summary>
        /// Creates an composite application instance.
        /// </summary>
        /// <returns></returns>
        public int CreateCompositeAppInstance(List<int> instanceIds, string appName, string configName)
        {
            //TODO
            /*if (!Sections[sectionId].IsDeployed() && Apps.ContainsKey(appName))
            {
                if (Apps[appName].Configurations.ContainsKey(configName))
                {
                    int instanceId = Apps[appName].CreateAppInstance(configName, sectionId);
                    if (instanceId >= 0)
                    {
                        Apps[appName].Instances[instanceId].Section.DeploySection(instanceId);
                    }
                    return instanceId;
                }
            }*/
            return -1;
        }

        /// <summary>
        /// Disposes an application instance.
        /// </summary>
        /// <param name="appName">Name of the application.</param>
        /// <param name="instanceId">The instance identifier.</param>
        /// <returns></returns>
        public bool DisposeAppInstance(string appName, int instanceId)
        {
            if (Apps.ContainsKey(appName))
            {
                if (Apps[appName].Instances.ContainsKey(instanceId))
                {
                    if (Apps[appName].AppType == (int)AppTypes.Base)
                    {
                        Section section = ((IBaseAppInstance)Apps[appName].Instances[instanceId]).Section;
                        if (Apps[appName].DisposeAppInstance(instanceId))
                        {
                            section.FreeSection();
                            return true;
                        }
                    }
                    else if (Apps[appName].AppType == (int)AppTypes.Composite)
                    {
                        if (Apps[appName].DisposeAppInstance(instanceId))
                        {
                            return true;
                        }
                    }
                    else
                    {
                        throw new Exception("Unknown App Type");
                    }
                }
            }
            return false;
        }

        public App GetApp(string name)
        {
            App app = Apps[name];
            if (app != null)
            {
                return app;
            }
            Log.Error("unable to find app for name " + name);
            return null;
        }
    }
}