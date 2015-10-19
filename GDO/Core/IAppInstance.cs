namespace GDO.Core
{
    /// <summary>
    /// App Instance Interface
    /// </summary>
    public interface IAppInstance
    {
        int Id { get; set; }
        string AppName { get; set; }
        Section Section { get; set; }
        AppConfiguration Configuration { get; set; }
        void init(int instanceId, string appName, Section section, AppConfiguration configuration);
    }
}