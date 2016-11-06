// This code was written by Senaka Fernando
//

using GDO.Modules.DataAnalysis.Ext;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Dispatcher;
using System.Web.Http.SelfHost;

using GDOUtilities = GDO.Utility.Utilities;

namespace GDO.Modules.DataAnalysis.Core
{
    public static class Utilities
    {
        public static HttpSelfHostConfiguration GetProxyServerConfig(string url)
        {
            var config = new HttpSelfHostConfiguration(url) { TransferMode = TransferMode.Streamed };

            // Config for Self-Hosted APIs based on http://www.developer.com/net/asp/self-hosting-an-asp.net-web-api.html
            config.MapHttpAttributeRoutes();
            config.Routes.MapHttpRoute("ChartDataDefault", "chart/{controller}");
            config.Services.Replace(typeof(IAssembliesResolver), new ExtensionLoader());
            return config;
        }
        public static dynamic InvokeGenericMethod(object instance, Type classname, string method, 
            string datatype, object[] input = null)
        {
            return classname.GetMethod(method).MakeGenericMethod(
                TypeMapper.GetType(datatype)).Invoke(instance ?? new object(), input);
        }

        public static dynamic InvokeGenericMethod(Type classname, string method,
            string datatype, object[] input = null)
        {
            return InvokeGenericMethod(null, classname, method, datatype, input);
        }

        public static Dictionary<string, JObject> GetModuleConfigurations()
        {
            var configurations = new Dictionary<string, JObject>();
            string path = Directory.GetCurrentDirectory() + @"\Configurations\DataAnalysis";
            if (Directory.Exists(path))
            {
                string[] filePaths = Directory.GetFiles(@path, "*.json", SearchOption.AllDirectories);
                foreach (string filePath in filePaths)
                {
                    JObject json = GDOUtilities.LoadJsonFile(filePath);
                    if (json != null)
                    {
                        configurations.Add(GDOUtilities.RemoveString(
                            GDOUtilities.RemoveString(filePath, path + "\\"), ".json"), json);
                    }
                }
            }
            return configurations;
        }
    }

    public static class Extensions
    {
        public static string GetClientIp(this HttpRequestMessage request)
        {
            return request.Properties.ContainsKey("MS_HttpContext") ?
                ((dynamic)request.Properties["MS_HttpContext"]).Request.UserHostAddress as string :
                ((RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name]).Address;
        }

        public static bool IsNullOrEmpty<T>(this IEnumerable<T> source)
        {
            return source == null || !source.Any();
        }

        public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
        {
            foreach (T o in source) action(o);
        }
    }

    public static class TypeMapper
    {
        private static Dictionary<string, string> types = new Dictionary<string, string>
        {
            { "bool", "System.Boolean" },
            { "byte", "System.Byte" },
            { "sbyte", "System.SByte" },
            { "char", "System.Char" },
            { "decimal", "System.Decimal" },
            { "double", "System.Double" },
            { "float", "System.Single" },
            { "int", "System.Int32" },
            { "uint", "System.UInt32" },
            { "long", "System.Int64" },
            { "ulong", "System.UInt64" },
            { "object", "System.Object" },
            { "short", "System.Int16" },
            { "ushort", "System.UInt16" },
            { "string", "System.String" },
        };

        public static Type GetType(string name)
        {
            // If you call types[name] first, you will get a KeyNotFoundException.
            return Type.GetType(name) ?? Type.GetType(types[name]);
        }

        public static object[] ConvertArray<T>(T[] input)
        {
            return input.Select(x => (object)x).ToArray();
        }

        public static T Convert<T>(object input)
        {
            try
            {
                return (T)TypeDescriptor.GetConverter(typeof(T)).ConvertFromString(input.ToString());
            }
            catch(Exception)
            {
                // Second attempt to obtain values in whole-number formats.
                return (T)TypeDescriptor.GetConverter(typeof(T)).ConvertFromString(input.ToString().Split('.')[0]);
            }
        }
    }

    public class ExtensionLoader : DefaultAssembliesResolver
    {
        [ImportMany(typeof(IDataAnalysisController))]
        private IEnumerable<Lazy<IDataAnalysisController>> Extensions { get; set; }

        public ExtensionLoader()
        {
            // Resolution of assemblies based on http://dotnetbyexample.blogspot.co.uk/2010/04/very-basic-mef-sample-using-importmany.html
            var catalog = new AggregateCatalog();
            catalog.Catalogs.Add(new DirectoryCatalog(
                Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)));
            new CompositionContainer(catalog).ComposeParts(this);
        }

        public override ICollection<Assembly> GetAssemblies()
        {
            ICollection<Assembly> defaultAssemblies = base.GetAssemblies();
            List<Assembly> assemblies = new List<Assembly>(defaultAssemblies);
            if (!Extensions.IsNullOrEmpty())
            {
                Extensions.ForEach(x => defaultAssemblies.Add(x.GetType().Assembly));
            }
            return assemblies;
        }
    }

    /// <summary>
    /// There is no explicit error handling in this  class, therefore the consumer needs 
    /// to handle errors accordingly.
    /// </summary>
    public class RawJsonActionResult : IHttpActionResult
    {
        // Json responder based on http://stackoverflow.com/a/35161220

        public string Payload { get; set; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var content = new StringContent(Payload);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = content };
            return Task.FromResult(response);
        }
    }
}