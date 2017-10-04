using Newtonsoft.Json;

namespace GDO.Core.Apps
{
    /// <summary>
    /// App Instance Interface
    /// </summary>
    public interface IAppInstance
    {
        int Id { get; set; }
        string AppName { get; set; }
        [JsonIgnore]
        App App { get; set; }

        IAppConfiguration GetConfiguration();
        bool SetConfiguration(IAppConfiguration config);
        IAppConfiguration GetDefaultConfiguration();

        //IHubContext HubContext { get; set; }
        void Init();
    }
}