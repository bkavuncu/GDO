using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using GDO.Core;

namespace GDO.Apps.ImageTiles
{
    public class ImageTilesApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            throw new NotImplementedException();
        } 
    }
}