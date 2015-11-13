using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.Reflection;
using Autofac;
using Autofac.Integration.SignalR;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using GDO.Core;
using log4net;
using Owin;
using Microsoft.Owin.Cors;

[assembly: OwinStartup(typeof(GDO.Startup))]

namespace GDO
{

    public class Startup
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(Startup));

        public void Configuration(IAppBuilder app)
        {
            log4net.Config.XmlConfigurator.Configure();
            Log.Info("Successfully started logging");
            try {
                Cave.Init();
                var builder = new ContainerBuilder();
                var config = new HubConfiguration();
                GlobalHost.DependencyResolver.Register(typeof (IAssemblyLocator), () => new AssemblyLocator());
                builder.RegisterType<AssemblyLocator>().As<IAssemblyLocator>().SingleInstance();
                builder.RegisterHubs(Assembly.GetExecutingAssembly());
                var container = builder.Build();
                config.Resolver = new AutofacDependencyResolver(container);
                app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
                app.UseAutofacMiddleware(container);
                //app.MapSignalR("/signalr", config);
                //config.EnableCors(new EnableCorsAttribute("*", "*", "GET, POST, OPTIONS, PUT, DELETE"));
                //WebApiConfig.Register(config);
                app.Map("/signalr", map =>
                {
                    map.UseCors(CorsOptions.AllowAll);
                    var hubConfiguration = new HubConfiguration
                    {
                        EnableJSONP = true
                    };
                    map.RunSignalR(config);
                });
            }
            catch (Exception e) {
                Log.Error("Failed to pass Startup ",e);
            }
            Log.Info("Successfully started GDO");
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
                Cave.RegisterApp(caveapp.Name, caveapp.P2PMode, caveapp.InstanceType);
                assemblies.Add(caveapp.GetType().Assembly);
                //assemblies.Add(caveapp.InstanceType.Assembly);
            }
            return assemblies;
        }
    }

}
