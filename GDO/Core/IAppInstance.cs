namespace GDO.Core
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