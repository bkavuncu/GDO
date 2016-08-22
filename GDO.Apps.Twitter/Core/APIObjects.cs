using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Security.Policy;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter.Core
{
    public class AnalyticsRequest
    {
        public string classification { get; set; }
        public string type { get; set; }
        public string dataset_id { get; set; }
        public string description { get; set; }
    }

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

        [DataMember(Name = "uri_analytics")]
        public string UriAnalytics { get; set; }

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

        [DataMember(Name = "uri_data")]
        public string UriData { get; set; }

    }

    [DataContract]
    public class AnalyticsData
    {
        
        [DataMember(Name = "prefered_app")]
        public string PreferedApp { get; set; }

        [DataMember(Name = "prefered_url")]
        public string PreferedUrl { get; set; }

        [DataMember(Name = "urls")]
        public Dictionary<string, string> Urls{get; set; }

    }

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

        [DataMember(Name = "uri_analysis_options")]
        public string AnalysisOptionsUrl { get; set; }
        [DataMember(Name = "uri_data_service")]
        public string DataServiceUrl { get; set; }
        [DataMember(Name = "uri_data_set")]
        public string DataSetUrl { get; set; }
        [DataMember(Name = "uri_twitter_consumer")]
        public string TwitterConsumerUrl { get; set; }



    }

}