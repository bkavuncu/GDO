using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GDO.Core
{
    public interface IAppInstance
    {
        int Id { get; set; }
        AppConfiguration Configuration { get; set; }

        void init(int instanceId, AppConfiguration Configuration);
    }
}