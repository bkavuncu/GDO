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
    }
}