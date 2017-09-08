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
        public AppStateConfig State { get; set; }

        public string StateType {
            get { return _stateType ?? this.State.GetType().FullName; }
            set { _stateType = value; }
        }

        private string _stateType;

        public AppConfiguration(string name, dynamic json)
        {
            this.Name = name;
            this.Json = json;
            IntegrationMode = this.Name == "Integration Mode";
        }
    }

    public class AppStateConfig {
    }

    public class ImageAppStateConfig : AppStateConfig {

    }
}