namespace GDO.Core
{
    /// <summary>
    /// Base App Instance Interface
    /// </summary>
    public interface IBaseAppInstance : IAppInstance
    {
        Section Section { get; set; }
        bool IntegrationMode { get; set; }
        IAdvancedAppInstance ParentApp { get; set; }
    }
}