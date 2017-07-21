using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using GDO.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GDO.Apps.SigmaGraph.Domain {
    public static class JSONUtilities {
        /// <summary>
        /// Creates some JSON
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

        public class CustomDataContractResolver : DefaultContractResolver
        {
            public static readonly CustomDataContractResolver Instance = new CustomDataContractResolver();

            protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
            {
                var property = base.CreateProperty(member, memberSerialization);
                property.PropertyName = property.PropertyName.ToLower();
                return property;
            }
        }

        // TODO get the jsonconverter to parse position objects differently
        public class PositionJsonConverter : JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return true;
            }

            public override void WriteJson(JsonWriter writer,
                object value, JsonSerializer serializer)
            {
                Position position = (Position) value;

                writer.WriteStartObject();
                writer.WritePropertyName("x");
                writer.WriteValue(position.X);
                writer.WriteEndObject();

                //writer.WriteStartObject();
                //writer.WritePropertyName("y");
                //writer.WriteValue(position.Y);
                //writer.WriteEndObject();
            }

            public override object ReadJson(JsonReader reader, Type objectType,
                object existingValue, JsonSerializer serializer)
            {
                throw new NotImplementedException();
            }
        }
    }
}