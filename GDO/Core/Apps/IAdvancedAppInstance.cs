﻿using System.Collections.Generic;

namespace GDO.Core.Apps
{
    /// <summary>
    /// Advanced App Instance Interface
    /// </summary>
    public interface IAdvancedAppInstance : IAppInstance
    {
        List<IBaseAppInstance> IntegratedInstances { get; set; }
        List<int> GetListofIntegratedInstances();
    }
}