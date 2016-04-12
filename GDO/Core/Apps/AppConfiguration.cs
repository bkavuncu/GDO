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

        public AppConfiguration(string Name, dynamic Json)
        {
            this.Name = Name;
            this.Json = Json;
            if (this.Name == "Integration Mode")
            {
                IntegrationMode = true;
            }
            else
            {
                IntegrationMode = false;
            }
        }
    }
}