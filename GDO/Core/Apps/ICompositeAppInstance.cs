using System.Collections.Generic;

namespace GDO.Core.Apps
{
    /// <inheritdoc />
    /// <summary>
    /// Advanced App Instance Interface
    /// </summary>
    public interface ICompositeAppInstance : IAppInstance {
        List<IBaseAppInstance> IntegratedInstances { get; set; }
        List<int> GetListofIntegratedInstances();
    }
}