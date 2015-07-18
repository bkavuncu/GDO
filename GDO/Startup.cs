using System;
using System.Threading.Tasks;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Compilation;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.Mef;
using Autofac.Integration.SignalR;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using GDO.Core;
using Microsoft.AspNet.SignalR.Infrastructure;
using Owin;

[assembly: OwinStartup(typeof(GDO.Startup))]

namespace GDO
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            Cave.Init();
            var builder = new ContainerBuilder();
            var config = new HubConfiguration();
            GlobalHost.DependencyResolver.Register(typeof(IAssemblyLocator), () => new AssemblyLocator());
            builder.RegisterType<AssemblyLocator>().As<IAssemblyLocator>().SingleInstance();
            builder.RegisterHubs(Assembly.GetExecutingAssembly());
            var container = builder.Build();
            config.Resolver = new AutofacDependencyResolver(container);
            app.UseAutofacMiddleware(container);
            app.MapSignalR("/signalr", config);
        }
    }

    public class AssemblyLocator : IAssemblyLocator
    {
        [ImportMany(typeof(IAppHub))]
        private List<IAppHub> _caveapps { get; set; }
        public IList<Assembly> GetAssemblies()
        {
        IList<Assembly> assemblies = new List<Assembly>();
            var catalog = new AggregateCatalog();
            string[] appDirs = System.Configuration.ConfigurationManager.AppSettings["appDirs"].Split(',');
            foreach (String appDir in appDirs)
            {
                catalog.Catalogs.Add(new DirectoryCatalog(@appDir));
            }
            var ccontainer = new CompositionContainer(catalog);
            ccontainer.ComposeParts(this);
            assemblies.Add(typeof(CaveHub).Assembly);
            foreach (var caveapp in _caveapps)
            {
                Cave.RegisterApp(caveapp.Name);
                assemblies.Add(caveapp.GetType().Assembly);
            }
            return assemblies;
        }
    }

}
