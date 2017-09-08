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
            return (T)Convert.ChangeType((object)Json.SelectToken(key) ?? default(T), typeof(T));
        }

        public void SetProperty<T>(string key, T value)
        {
            if (value != null)
            {
                if (GetProperty<T>(key) != null)
                {
                    Json.Remove(key);
                }
                Json.Add(new Newtonsoft.Json.Linq.JProperty(key, value));
            }
            else
            {
                Json.Remove(key);
            }
        }
    }
}