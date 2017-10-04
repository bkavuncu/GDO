namespace GDO.Core.Apps
{
    /// <inheritdoc />
    /// <summary>
    /// Base App Instance Interface
    /// note that apps must define a Configuration property of type IAppConfiguration - this is required in the .js
    /// </summary>
    public interface IBaseAppInstance: IAppInstance {
        Section Section { get; set; }
        bool IntegrationMode { get; set; }
        ICompositeAppInstance ParentApp { get; set; }
    }
}