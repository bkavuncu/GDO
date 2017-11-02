using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.Reflection;
using System.Web.Http;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.SignalR;
using GDO.Areas.HelpPage;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.Owin;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Core.Modules;
using log4net;
using Owin;
using Microsoft.Owin.Cors;

[assembly: OwinStartup(typeof(GDO.Startup))]

namespace GDO
{

    public static class WebApiConfig
    {
        public static void Register(IAppBuilder app, HttpConfiguration config)
        {
            
            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            app.UseWebApi(config);

        }
    }


    public class Startup
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(Startup));
        public static HttpConfiguration HttpConfiguration { get; private set; }


        public void Configuration(IAppBuilder app)
        {
            log4net.Config.XmlConfigurator.Configure();
            Log.Info("Successfully started logging");
            try
            {
                Cave.Init();
                //http://docs.autofac.org/en/latest/integration/signalr.html
                var builder = new ContainerBuilder();
                var signalRConfig = new HubConfiguration() {
                    EnableJSONP = true,
                    EnableDetailedErrors = true,
                    EnableJavaScriptProxies = true
                };

                GlobalHost.DependencyResolver.Register(typeof(IAssemblyLocator), () => new AssemblyLocator());
                builder.RegisterType<AssemblyLocator>().As<IAssemblyLocator>().SingleInstance();
                builder.RegisterHubs(Assembly.GetExecutingAssembly());
                var container = builder.Build();
                signalRConfig.Resolver = new AutofacDependencyResolver(container);
                app.UseCors(CorsOptions.AllowAll);
                app.UseAutofacMiddleware(container);
                //app.MapSignalR("/signalr", config);
                //config.EnableCors(new EnableCorsAttribute("*", "*", "GET, POST, OPTIONS, PUT, DELETE"));
                // set up a new http configuration and then use it
                HttpConfiguration = new HttpConfiguration();
                WebApiConfig.Register(app, HttpConfiguration);
                AreaRegistration.RegisterAllAreas();// this registers the help page area
                app.UseWebApi(HttpConfiguration);

                app.Map("/signalr", map =>
                {
                    map.UseCors(CorsOptions.AllowAll);
                    map.RunSignalR(signalRConfig);
                });

                var hostname = System.Net.Dns.GetHostName();
                if (hostname.Contains( "dsigdoprod") ||
                    hostname.Contains( "dsigdopreprod") ||
                    hostname.Contains( "dsigdotesting"))
                {
                    //Change this URL for the generated slack channel
                    string slack_url = "https://hooks.slack.com/services/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";
                    //Change content if needed
                    var slack_json = "{ 'username': 'GDO - Slack bot', 'icon_emoji': ':gear:', 'text': 'Deployed new GDO instance [" + hostname + "]' }";

                    var encoding = new System.Text.UTF8Encoding();
                    var slack_payload = encoding.GetBytes(slack_json);
                    var slack = System.Net.HttpWebRequest.Create(slack_url);
                    slack.Method = "POST";
                    slack.ContentType = "application/json";
                    slack.ContentLength = slack_payload.Length;
                    var slack_stream = slack.GetRequestStream();
                    slack_stream.Write(slack_payload, 0, slack_payload.Length);
                    slack_stream.Close();
                }

            }
            catch (Exception e)
            {
                Log.Error("Failed to pass Startup ", e);
            }
            Log.Info("Successfully started GDO");
        }
    }

    public class AssemblyLocator : IAssemblyLocator
    {
        [ImportMany(typeof(IAppHub))]
        private List<IAppHub> _caveapps { get; set; }

        [ImportMany(typeof(IModuleHub))]
        private List<IModuleHub> _cavemodules { get; set; }

        [ImportMany(typeof(IAppConfiguration))]
        private List<IAppConfiguration> _configurationTypes { get; set; }

        private static readonly ILog Log = LogManager.GetLogger(typeof(Startup));

        public IList<Assembly> GetAssemblies()
        {
            IList<Assembly> assemblies = new List<Assembly>();
            var catalog = new AggregateCatalog();
            string[] appDirs = System.Configuration.ConfigurationManager.AppSettings["appDirs"].Split(',');
            foreach (String appDir in appDirs)
            {
                catalog.Catalogs.Add(new DirectoryCatalog(appDir));
            }
            var ccontainer = new CompositionContainer(catalog);
            try {
                ccontainer.ComposeParts(this);//COMPOSITION OCCURS HERE! 
            } catch (Exception e) {

                Log.Error("loader Exception ", e);

                if (e is ReflectionTypeLoadException) {
                    var loadException = (ReflectionTypeLoadException)e;
                    Log.Error("Type Load Exception ", loadException);
                    foreach (var innerexception in loadException.LoaderExceptions) {
                        Log.Error("Loader Exception ", innerexception);
                    }
                }

                throw;
            }

            assemblies.Add(typeof(CaveHub).Assembly);
            foreach (var caveapp in _caveapps)
            {
                if (caveapp is IBaseAppHub)
                {
                    Cave.RegisterApp(caveapp.Name, caveapp, caveapp.InstanceType,  false, null, caveapp.P2PMode);
                    assemblies.Add(caveapp.GetType().Assembly);
                }
                else if (caveapp is ICompositeAppHub)
                {
                    Cave.RegisterApp(caveapp.Name, caveapp,  caveapp.InstanceType, true, ((ICompositeAppHub)caveapp).SupportedApps, caveapp.P2PMode);
                    assemblies.Add(caveapp.GetType().Assembly);
                }
                else
                {
                    throw new Exception("Cave App Class not recognized");
                }

                //assemblies.Add(caveapp.InstanceType.Assembly);
            }
            foreach (var cavemodule in _cavemodules)
            {
                Cave.RegisterModule(cavemodule.Name, cavemodule.ModuleType);
                assemblies.Add(cavemodule.GetType().Assembly);
            }
            foreach (var configurationType in _configurationTypes) {
                Cave.RegisterConfigType(configurationType.GetType());

            }

            return assemblies;
        }
    }

}