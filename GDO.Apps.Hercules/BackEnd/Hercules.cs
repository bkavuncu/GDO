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

    public class HerculesSection
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
        public List<JsonMiniset> Minisets;
        public string LoadedDatasetID;
        public List<HerculesSection> Sections;
        public List<Filter> Filters;
    } 
 


    public class ControlAPP
    {
        public static string UploadDSFromFile(string file)
        {
            return null;
        }

        public static string UploadDSFromURL(string url)
        {
            return null;
        }
    }

}