using System;
using System.Threading.Tasks;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Linq;
using System.Reflection;
using System.Web.Compilation;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using GDO.Core;
using Owin;

[assembly: OwinStartup(typeof(GDO.Startup))]

namespace GDO
{
    public class Startup
    {
        [ImportMany(typeof(IApp))]
        private IEnumerable<IApp> _caveapps { get; set; }
        public void Configuration(IAppBuilder app)
        {
            Cave.InitCave();
            var catalog = new AggregateCatalog();
            string[] appDirs = System.Configuration.ConfigurationManager.AppSettings["appDirs"].Split(',');
            foreach (String appDir in appDirs)
            {
                catalog.Catalogs.Add(new DirectoryCatalog(@appDir));
            }
            var container = new CompositionContainer(catalog);
            container.ComposeParts(this);
            _caveapps.ToList().ForEach(caveapp => Cave.AddApp(caveapp.Id, caveapp));


            //var activator = new GDOHubActivator(container);
            //GlobalHost.DependencyResolver.Register(typeof(IHubActivator), () => activator);
            app.MapSignalR();
        }
    }

    /*public class GDOHubActivator : IHubActivator
    {
        private readonly Container _container;

        public GDOHubActivator(Container container)
        {
            _container = container;
        }

        public IHub Create(HubDescriptor descriptor)
        {
            return (IHub)_container.GetInstance(descriptor.HubType);
        }
    }*/
}
