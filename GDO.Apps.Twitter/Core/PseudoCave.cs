using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using GDO.Core;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter.Core
{
    public class PseudoCave
    {
        [JsonProperty(PropertyName = "nodes")]
        public Dictionary<int, Node> Nodes { get; set; } = new Dictionary<int, Node>();

        [JsonProperty(PropertyName = "sections")]
        public Dictionary<int, Section> Sections { get; set; } = new Dictionary<int, Section>();

        [JsonProperty(PropertyName = "sectionsToCreate")]
        public List<Section> SectionsToCreate { get; set; } = new List<Section>();

        [JsonProperty(PropertyName = "sectionsToDispose")]
        public List<Section> SectionsToDispose { get; set; } = new List<Section>();

        [JsonProperty(PropertyName = "appsToDeploy")]
        public List<Section> AppsToDeploy { get; set; } = new List<Section>();

        [JsonProperty(PropertyName = "appsToDispose")]
        public List<Section> AppsToDispose { get; set; } = new List<Section>();

        [JsonProperty(PropertyName = "appsToLaunch")]
        public List<Section> AppsToLaunch { get; set; } = new List<Section>();

        [JsonProperty(PropertyName = "queuedApps")]
        public List<SectionRequest> QueuedApps { get; set; } = new List<SectionRequest>();

        [JsonIgnore]
        public List<int> SectionIds { get; set; } = new List<int>();

        public PseudoCave CloneCaveState(ConcurrentDictionary<int, GDO.Core.Node> caveNodes,
            ConcurrentDictionary<int, GDO.Core.Section> caveSections, int sectionId)
        {
            UpdateSectionsToCreate(caveNodes);
            UpdateSectionsToDispose(caveNodes);
            UpdateAppsToDeploy(caveSections);
            UpdateAppsToDispose(caveSections);
            UpdateAppQueue();

            foreach (var entry in caveNodes)
            {
                Nodes[entry.Key].Id = entry.Value.Id;
                Nodes[entry.Key].Col = entry.Value.Col;
                Nodes[entry.Key].Row = entry.Value.Row;
                Nodes[entry.Key].SectionId = entry.Value.SectionId;
                Nodes[entry.Key].AppInstanceId = entry.Value.AppInstanceId;
                Nodes[entry.Key].SectionCol = entry.Value.SectionCol;
                Nodes[entry.Key].SectionRow = entry.Value.SectionRow;

                if (sectionId == entry.Value.SectionId)
                {
                    Nodes[entry.Key].NodeContext = Node.Context.Root;
                }
                else if (entry.Value.SectionId > 0 && !SectionIds.Contains(entry.Value.SectionId))
                {
                    Nodes[entry.Key].NodeContext = Node.Context.Reserved;
                }
                else if (entry.Value.SectionId <= 0)
                {
                    Nodes[entry.Key].NodeContext = Node.Context.Free;
                }
            }
            return this;
        }

        public void ConfirmLaunch(List<int> sectionIds)
        {
            sectionIds.ForEach(sectionId => AppsToLaunch.RemoveAll(s => sectionIds.Contains(s.Id)));
            Debug.WriteLine("Confirming launch with " + string.Join(",", sectionIds.ToArray()));
            Debug.WriteLine("Number of apps still to launch: " + AppsToLaunch.Count);
        }

        private void UpdateAppsToDispose(ConcurrentDictionary<int, GDO.Core.Section> caveSections)
        {
            for (var i = 0; i < AppsToDispose.Count; ++i)
            {
                Section section = AppsToDispose[i];
                if (!caveSections.ContainsKey(section.Id) || !caveSections[section.Id].IsDeployed())
                {
                    Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                    {
                        x.Value.NodeContext = Node.Context.SectionCreated;
                        Debug.WriteLine("Setting node " + x.Value.Id + " to section created having undeployed app");
                    });
                    section.AppInstanceId = -1;
                    AppsToDispose.RemoveAt(i);
                    Debug.WriteLine("Found a section that has an app undeployed: " + section.Id);
                    --i;
                }
            }
        }

        private void UpdateAppsToDeploy(ConcurrentDictionary<int, GDO.Core.Section> caveSections)
        {
            for (var i = 0; i < AppsToDeploy.Count; ++i)
            {
                Section section = AppsToDeploy[i];
                if (caveSections[section.Id].IsDeployed())
                {
                    Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                    {
                        x.Value.NodeContext = Node.Context.AppDeployed;
                        Debug.WriteLine("Setting node " + x.Value.Id + " to app deployed");
                    });
                    section.AppInstanceId = caveSections[section.Id].AppInstanceId;
                    AppsToDeploy.RemoveAt(i);
                    AppsToLaunch.Add(section);
                    Debug.WriteLine("Found a section that has an app deployed: " + section.Id);
                    --i;
                }
            }
        }

        private void UpdateSectionsToDispose(ConcurrentDictionary<int, GDO.Core.Node> caveNodes)
        {
            for (var i = 0; i < SectionsToDispose.Count; ++i)
            {
                Section section = SectionsToDispose[i];
                if (caveNodes[Cave.GetNodeId(section.Col, section.Row)].SectionId != section.Id)
                {
                    Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                    {
                        x.Value.NodeContext = Node.Context.Free;
                        Debug.WriteLine("Setting node " + x.Value.Id + " to Free");
                    });

                    Sections.Remove(section.Id);
                    SectionIds.Remove(section.Id);
                    SectionsToDispose.RemoveAt(i);
                    Debug.WriteLine("Found a section that needs to be removed: " + section.Id);
                    --i;
                }
            }
        }

        private void UpdateSectionsToCreate(ConcurrentDictionary<int, GDO.Core.Node> caveNodes)
        {
            for (var i = 0; i < SectionsToCreate.Count; ++i)
            {
                Section section = SectionsToCreate[i];
                if (section.Id > 0) continue;
                var candidateId = caveNodes[Cave.GetNodeId(section.Col, section.Row)].SectionId;

                Debug.WriteLine("Found a section which hasn't been assigned an id, candidate id: " + candidateId);
                if (candidateId > 0)
                {
                    Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                    {
                        x.Value.NodeContext = Node.Context.SectionCreated;
                        Debug.WriteLine("Setting node " + x.Value.Id + " to SectionCreated");
                    });
                    SectionIds.Add(candidateId);
                    section.Id = candidateId;
                    Sections[candidateId] = section;
                    SectionsToCreate.RemoveAt(i);
                    --i;
                }
            }
        }

        public void UpdateAppQueue()
        {
            List<Section> availableSections;
            for (var i = 0; i < QueuedApps.Count; ++i)
            {
                availableSections = Sections.Where(s => s.Value.TwitterVis.Id == null).Select(kvp => kvp.Value).ToList();
                if (availableSections.Count > 0)
                {
                    availableSections[0].TwitterVis = QueuedApps[i].TwitterVis;
                    Debug.WriteLine("Found a section that can be autodeployed to: " + availableSections[0].Id + " deploying" + QueuedApps[i].TwitterVis.FilePath);
                    QueuedApps.RemoveAt(i);
                    AppsToDeploy.Add(availableSections[0]);
                    --i;
                }

            }
        }
    

public PseudoCave(ConcurrentDictionary<int, GDO.Core.Node> caveNodes, 
            ConcurrentDictionary<int, GDO.Core.Section> caveSections, int sectionId)
        {
            foreach (var entry in caveNodes)
            {
                Nodes[entry.Key] = new Node();
            }
            CloneCaveState(caveNodes, caveSections, sectionId);
        }
        
        public void ClearCave()
        {
            CloseApps(Sections.Keys.ToList());
            CloseSections(Sections.Keys.ToList());
        }

        public void CloseApps(List<int> sectionIds)
        {
            sectionIds.Where(sectionId => Sections.ContainsKey(sectionId)).Select(sectionId => Sections[sectionId]).Where(section => section.IsDeployed()).ToList().ForEach(section =>
            {
                Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                {
                    x.Value.NodeContext = Node.Context.AppRemovalRequested;
                    Debug.WriteLine("Setting node " + x.Value.Id + " to AppRemovalRequested");
                });
                AppsToDispose.Add(section);
            });
        }

        public void QueueApps(List<SectionRequest> sectionRequests)
        {
            foreach (var sectionRequest in sectionRequests)
            {
                QueuedApps.Add(sectionRequest);   
            }
        }

        public void DeployApps(List<int> sectionIds) {

            if (sectionIds.Count == 0)
            {
                Sections.Values.Where(section => section.CanDeploy()).ToList().ForEach(section =>
                {
                    Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                    {
                        x.Value.NodeContext = Node.Context.AppCreationRequested;
                        Debug.WriteLine("Setting node " + x.Value.Id + " to AppCreationRequested");
                    });
                    AppsToDeploy.Add(section);
                });
            }

            sectionIds.Where(sectionId => Sections.ContainsKey(sectionId)).Select(sectionId => Sections[sectionId]).Where(section => section.CanDeploy()).ToList().ForEach(section =>
            {
                Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                {
                    x.Value.NodeContext = Node.Context.AppCreationRequested;
                    Debug.WriteLine("Setting node " + x.Value.Id + " to AppCreationRequested");
                });
                AppsToDeploy.Add(section);
            });

        }

        public void CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            var section = new Section(colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
            Nodes.Where(x=> section.Contains(x.Value)).ToList().ForEach(x =>
            {
                x.Value.NodeContext = Node.Context.SectionCreationRequested;
                Debug.WriteLine("Setting node " + x.Value.Id + " to SectionRequested");
            });
            SectionsToCreate.Add(section);
        }

        public void CloseSections(List<int> sectionIds)
        {
            sectionIds.Where(sectionId => Sections.ContainsKey(sectionId)).Select(sectionId => Sections[sectionId]).ToList().ForEach(section =>
            {
                Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
                {
                    x.Value.NodeContext = Node.Context.SectionRemovalRequested;
                    Debug.WriteLine("Setting node " + x.Value.Id + " to SectionRemovalRequested");
                });
                SectionsToDispose.Add(section);
            });
        }

        public void LoadVisualisation(int sectionId)
        {
            Nodes.Where(x => Sections[sectionId].Contains(x.Value)).ToList().ForEach(x =>
            {
                x.Value.NodeContext = Node.Context.SectionRemovalRequested;
                Debug.WriteLine("Setting node " + x.Value.Id + " to VisualisationLoaded");
            });
        }
        
        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }

    public class Node
    {
        public enum Context
        {
            Root,
            Reserved,
            SectionCreationRequested,
            SectionCreated,
            SectionRemovalRequested,
            VisualisationLoaded,
            AppCreationRequested,
            AppDeployed,
            AppRemovalRequested,
            Free,
            Default
        }

        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }

        [JsonProperty(PropertyName = "col")]
        public int Col { get; set; }

        [JsonProperty(PropertyName = "row")]
        public int Row { get; set; }

        [JsonProperty(PropertyName = "sectionId")]
        public int SectionId { get; set; }

        [JsonProperty(PropertyName = "appInstanceId")]
        public int AppInstanceId { get; set; }

        [JsonProperty(PropertyName = "nodeContext")]
        public Context NodeContext { get; set; } = Context.Free;

        [JsonProperty(PropertyName = "sectionCol")]
        public int SectionCol { get; set; }

        [JsonProperty(PropertyName = "sectionRow")]
        public int SectionRow { get; set; }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }

    public class TwitterVis
    {
        public enum TwitterVisTypes
        {
            Graph,
            Analytics,
            Unknown
        }

        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "dataSetId")]
        public string DataSetId { get; set; }

        [JsonProperty(PropertyName = "config")]
        public string Config { get; set; }

        [JsonProperty(PropertyName = "twitterVisType")]
        public TwitterVisTypes TwitterVisType { get; set; }

        [JsonProperty(PropertyName = "twitterVisSubType")]
        public string  SubType { get; set; }

        [JsonProperty(PropertyName = "appType")]
        public string AppType { get; set; }

        [JsonProperty(PropertyName = "filePath")]
        public string FilePath { get; set; }
        
        public TwitterVis()
        {
            Id = null;
            DataSetId = null;
            AppType = null;
            FilePath = null;
            TwitterVisType = TwitterVisTypes.Unknown;
        }
    }

    public class SectionRequest
    {
        public int SectionId { get; set; }
        public int ColStart { get; set; }
        public int RowStart { get; set; }
        public int ColEnd { get; set; }
        public int RowEnd { get; set; }
        public string DataSetId { get; set; }
        public string AnalyticsId { get; set; }
        public TwitterVis TwitterVis { get; set; }
    }

    public class Section
    {

        [JsonProperty(PropertyName = "id")]
        public int Id { get; set; }
        [JsonProperty(PropertyName = "col")]
        public int Col { get; set; }
        [JsonProperty(PropertyName = "row")]
        public int Row { get; set; }
        [JsonProperty(PropertyName = "cols")]
        public int Cols { get; set; }
        [JsonProperty(PropertyName = "rows")]
        public int Rows { get; set; }
        [JsonProperty(PropertyName = "twitterVis")]
        public TwitterVis TwitterVis { get; set; }
        [JsonProperty(PropertyName = "appInstanceId")]
        public int AppInstanceId { get; set; }

        public Section(int col, int row, int cols, int rows)
        {
            Col = col;
            Row = row;
            Cols = cols;
            Rows = rows;
            Id = 0;//TODO
            AppInstanceId = -1;
            TwitterVis = new TwitterVis();
        }
      
        public bool IsDeployed()
        {
            return AppInstanceId >= 0;
        }

        public bool CanDeploy()
        {
            return TwitterVis.FilePath != null && TwitterVis.AppType != null && AppInstanceId < 0;
        }

        public bool Contains(Node node)
        {
            return node.Col < Col + Cols && node.Col >= Col && node.Row < Row + Rows && node.Row >= Row;
        }

        public string SerializeJSON()
        {
            return JsonConvert.SerializeObject(this);
        }
    }
}