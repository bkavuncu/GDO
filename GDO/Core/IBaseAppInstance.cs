namespace GDO.Core
{
    /// <summary>
    /// Base App Instance Interface
    /// </summary>
    public interface IBaseAppInstance : IAppInstance
    {
        Section Section { get; set; }
        bool IntegrationMode { get; set; }
        IVirtualAppInstance ParentApp { get; set; }
        void Init(int instanceId, string appName, Section section, AppConfiguration configuration, bool integrationMode);
    }
}