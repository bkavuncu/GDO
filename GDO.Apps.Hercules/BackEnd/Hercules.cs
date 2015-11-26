using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Apps.Hercules.BackEnd
{


    ///////////////////////////////////////////////////////////////////////////////////
     
    public class Dimension
    {
        public string Name;
        public List<string> Fields;
    }

    public class Graph
    {
        public dynamic GraphType; // GraphType GraphType;
        public Dimension[] Dimensions;   
    }

    public class Section
    {
        public int Id;
        public List<int> NodeList;
        public Graph Deployed;
    }


    public class FilterType
    {
        public string Type;
        public dynamic Min;
        public dynamic Max;
        public List<dynamic> SelectedValues;
    }

    public class Filter
    {
        public string Field;
        public FilterType FilterType;
    }

    public class Hercules
    {
        public int DatasetID;
        public List<Section> Sections;
        public List<Filter> Filters;
    }


    public class HeculesDIFF
    {
        public static int diff(int h, int l)
        {
            var me = new Hercules();
            var you = JsonConvert.DeserializeObject<Hercules>("");

            // Datasets are dif
            return -1;
        }   

        public static void DiffSections(SortedSet<Section> me, SortedSet<Section> you)
        {
            foreach (Section mine in me) 
            { 
                // O(n^2) yeyyy
            }
        }

        public static void DiffSection(Section old, Section cur)
        {
            // IDs are equal, let's see if something has changed.
            if (old.Id == cur.Id) { 
                // If nodes have changed, the section has to be redeployed with the new
                // nodes. Can this happen? 
                if (!ListEquals(old.NodeList, cur.NodeList)) {
                    // TODO destroy previous nodes?
                    ControlAPP.DeploySection(cur.Id, cur.NodeList);
                }

            }
        }

        public static void DiffGraph(Graph old, Graph cur)
        {
        }

        // Are the two lists equal? Order doesn't matter so long as they have the same elements
        public static bool ListEquals<T>(List<T> fst, List<T> snd)
        {
            return fst.All(snd.Contains) && fst.Count == snd.Count;
        }
    }


    public class ControlAPP
    {
        public static bool DeploySection(int sectionID, List<int> nodeIDs)
        {
            return false;
        }
    }

}