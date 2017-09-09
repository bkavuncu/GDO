using System;

namespace GDO.Core.Apps
{
    /// <summary>
    ///  App Configuration Class
    /// </summary>
    public class AppConfiguration
    {
        public string Name { get; set; }
        public bool IntegrationMode { get; set; }

        public Newtonsoft.Json.Linq.JObject Json { get; set; }

        public AppConfiguration(string name, dynamic json)
        {
            this.Name = name;
            this.Json = json;
            IntegrationMode = this.Name == "Integration Mode";
        }

        public T GetProperty<T>(string key)
        {
            if (typeof(T).IsGenericType)
            {
                return (T)Convert.ChangeType((object)Json.SelectToken(key) ?? default(T), typeof(T));
            }
            else if (string.IsNullOrEmpty((string)Json.SelectToken(key)))
            {
                return default(T);
            }
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>((string)Json.SelectToken(key));
        }

        public void SetProperty<T>(string key, T value)
        {
            if (value != null)
            {
                if (GetProperty<T>(key) != null)
                {
                    Json.Remove(key);
                }
                if (typeof(T).IsGenericType)
                {
                    Json.Add(new Newtonsoft.Json.Linq.JProperty(key, value));
                }
                else
                {
                    Json.Add(new Newtonsoft.Json.Linq.JProperty(key, Newtonsoft.Json.JsonConvert.SerializeObject(value)));
                }
            }
            else
            {
                Json.Remove(key);
            }
        }
    }
}