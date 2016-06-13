namespace GDO.Core.Apps
{
    /// <summary>
    /// App Instance Interface
    /// </summary>
    public interface IAppInstance
    {
        int Id { get; set; }
        string AppName { get; set; }
        AppConfiguration Configuration { get; set; }
        void Init();
    }
}