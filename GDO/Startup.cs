using System;
using System.Threading.Tasks;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(GDO.Startup))]

namespace GDO
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var directoryPath = "Dll folder path"; //fill in
            var directoryCatalog = new DirectoryCatalog(directoryPath, "*.dll");
            var aggregateCatalog = new AggregateCatalog();
            aggregateCatalog.Catalogs.Add(directoryCatalog);
            var container = new CompositionContainer(aggregateCatalog);
            container.ComposeParts(this);
            app.MapSignalR();
        }
    }
}
