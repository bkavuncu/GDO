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
        AppConfiguration Configuration { get; set; }
        //IHubContext HubContext { get; set; }
        void Init();
    }
}