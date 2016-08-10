using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Security.Policy;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter.Core
{ 
    [DataContract]
    public class DataSet
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "db_col")]
        public string Db { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "collection_size")]
        public long CollectionSize { get; set; }

        [DataMember(Name = "tags")]
        public List<string> Tags { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }

        [DataMember(Name = "start_time")]
        public string StartTime { get; set; }

        [DataMember(Name = "end_time")]
        public DateTime EndTime { get; set; }

    }

    [DataContract]
    public class Analytics
    {
        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "classification")]
        public string Classification { get; set; }

        [DataMember(Name = "type")]
        public string Type { get; set; }

        [DataMember(Name = "status")]
        public string Status { get; set; }

        [DataMember(Name = "dataset_id")]
        public string DatasetId { get; set; }
        
    }

//    public class DataSetMeta
//    {
//        public string Id { get; set; }
//        public string Description { get; set; }
//        public string Status { get; set; }
//        public List<string> Tags { get; set; }
//    }
//
//    public class AnalyticsMeta
//    {
//        public string Id { get; set; }
//        public string Description { get; set; }
//        public string Status { get; set; }
//        public string Classification { get; set; }
//        public string Type { get; set; }
//        public string DataSetId { get; set; }
//    }

    [DataContract]
    public class AnalyticsOption
    {
        [DataMember(Name = "classification")]
        public string Classification { get; set; }
        [DataMember(Name = "types")]
        public List<AnalyticsType> Types { get; set; }
    }

    [DataContract]
    public class AnalyticsType
    {
        [DataMember(Name = "type")]
        public string Type;
    }

    [DataContract]
    public class StatusMsg
    {
        [DataMember(Name="msg")]
        public string Msg { get; set; }
        [DataMember(Name="healthy")]
        public bool Healthy { get; set; }
    }

}