using System.Collections.Generic;

namespace GDO.Core.Apps
{
    //[InheritedExport]
    /// <summary>
    /// Virtual App Hub Interface
    /// </summary>
    public interface IAdvancedAppHub : IAppHub
    {
        List<string> SupportedApps { get; set; }
    }
}
