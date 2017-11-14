using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class JSONUtilities {
        /// <summary>
        /// Serializes a graph as JSON
        /// </summary>
        /// <param name="nodesList">the actual nodes</param>
        /// <param name="nodeDict">The nodes. (id, name)</param>
        /// <param name="edges">The arcs. id > id </param>
        /// <param name="fileName">Name of the file  to generate</param>
        public static void SaveGraph(List<string> nodesList, Dictionary<string, GraphNode> nodeDict, List<GraphLink> edges, string fileName)
        {
            Dictionary<string, IEnumerable<GraphObject>> graphObjects =
                new Dictionary<string, IEnumerable<GraphObject>> {
                    ["nodes"] = nodesList.Select(n=> nodeDict[n]),
                    ["edges"] = edges
                };

            JsonSerializerSettings settings = new JsonSerializerSettings()
            {
                ContractResolver = CustomDataContractResolver.Instance
            };
            string json = JsonConvert.SerializeObject(graphObjects, settings);
            File.WriteAllText(@fileName, json);
        }

        /// <summary>
        /// Custom serializer that serializes all attributes names in lowercase.
        /// </summary>
        private class CustomDataContractResolver : DefaultContractResolver
        {
            public static readonly CustomDataContractResolver Instance = new CustomDataContractResolver();

            protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
            {
                var property = base.CreateProperty(member, memberSerialization);
                property.PropertyName = property.PropertyName.ToLower();
                return property;
            }
        }
    }
}