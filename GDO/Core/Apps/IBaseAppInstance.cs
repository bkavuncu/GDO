namespace GDO.Core.Apps
{
    /// <summary>
    /// Base App Instance Interface
    /// </summary>
    public interface IBaseAppInstance : IAppInstance
    {
        Section Section { get; set; }
        bool IntegrationMode { get; set; }
        ICompositeAppInstance ParentApp { get; set; }
    }
}