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
        [JsonProperty(PropertyName = "sectionSandbox")]
        public List<Section> SectionSandbox { get; set; } = new List<Section>();
        [JsonProperty(PropertyName = "sectionTrash")]
        public List<Section> SectionTrash { get; set; } = new List<Section>();
        [JsonIgnore]
        public List<int> SectionIds { get; set; } = new List<int>();

        public PseudoCave CloneCaveState(ConcurrentDictionary<int, GDO.Core.Node> caveNodes,
            ConcurrentDictionary<int, GDO.Core.Section> caveSections, int sectionId)
        {
            for (var i = 0; i < SectionSandbox.Count; ++i)
            {
                Section entry = SectionSandbox[i];
                if (entry.Id >= 0) continue;
                var candidateId = caveNodes[Cave.GetNodeId(entry.Col, entry.Row)].SectionId;

                Debug.WriteLine("Found a section which hasn't been assigned an id, candidate id: " + candidateId);
                if (candidateId < 0) continue;
                SectionIds.Add(candidateId);
                entry.Id = candidateId;
                Sections[candidateId] = entry;
                SectionSandbox.RemoveAt(i);
                --i;
            }

            for (var i = 0; i < SectionTrash.Count; ++i)
            {
                Section entry = SectionTrash[i];
                if (caveNodes[Cave.GetNodeId(entry.Col, entry.Row)].SectionId != entry.Id)
                {
                    Sections.Remove(entry.Id);
                    SectionIds.Remove(entry.Id);
                    SectionTrash.RemoveAt(i);
                    Debug.WriteLine("Found a section that needs to be removed: " + entry.Id);
                    --i;
                }
            }

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
                } else if (entry.Value.SectionId <= 0)
                {
                    Nodes[entry.Key].NodeContext = Node.Context.Free;
                }
                
            }

            foreach (var entry in caveSections)
            {
                if (!Sections.ContainsKey(entry.Key)) continue;
                if (Sections[entry.Key].AppInstanceId == entry.Value.AppInstanceId) continue;
                Debug.WriteLine("!!!!! Section App Id is not the same in pseudo cave: " + entry.Key);
                Sections[entry.Key].AppInstanceId = entry.Value.AppInstanceId;
            }

            return this;


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

        public List<Section> DeployApps(List<int> sectionIds)
        {
            return sectionIds.Count == 0 ? Sections.Select(x => x.Value).Where(s => s.CanDeploy()).ToList() :
                Sections.Select(x => x.Value).Where(s => s.CanDeploy() && sectionIds.Contains(s.Id)).ToList();
        }

        public int CloseApp(int sectionId)
        {
            int instanceId = Sections[sectionId].AppInstanceId;
            Sections[sectionId].AppInstanceId = -1;
            return instanceId;
        }

        public void ClearCave(out List<int> sectionIds, out List<int> appInstanceIds)
        {
            sectionIds = Sections.Select(x => x.Value.Id).ToList();
            appInstanceIds = Sections.Where(x => x.Value.AppInstanceId > 0).Select(x => x.Value.AppInstanceId).ToList();
            sectionIds.ForEach(x=>SoftRemoveSection(x));
        }


        public Section CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {
            var section = new Section(colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
            Nodes.Where(x=> section.Contains(x.Value)).ToList().ForEach(x=>x.Value.NodeContext = Node.Context.Deployed);
            SectionSandbox.Add(section);
            return section;
        }

        public int SoftRemoveSection(int sectionId)
        {
            var section = Sections[sectionId];
            Nodes.Where(x => section.Contains(x.Value)).ToList().ForEach(x =>
            {
                x.Value.NodeContext = Node.Context.Free;
                x.Value.SectionId = 0;
                Debug.WriteLine("Setting node " + x.Value.Id + " to 0 section");
            });

            SectionTrash.Add(section);
            
            return sectionId;
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
            Free,
            Deployed,
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
            Id = -1;
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