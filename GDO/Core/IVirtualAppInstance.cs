using System.Collections.Generic;

namespace GDO.Core
{
    /// <summary>
    /// Virtual App Instance Interface
    /// </summary>
    public interface IVirtualAppInstance : IAppInstance
    {
        List<IBaseAppInstance> IntegratedInstances { get; set; }
        List<int> GetListofIntegratedInstances();
    }
}