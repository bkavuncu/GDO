using System;
using System.ComponentModel.Composition;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Core.Apps
{

    public interface IAppConfiguration {
        string Name { get; set; }
        bool IntegrationMode { get; set; }

        /// <summary>
        /// Gets or sets the type of the configuration
        /// this is required for deserialization where because of MEF and multiple dll's we may not know what the type actually is...
        /// please set as .GetType().FullName
        /// </summary>
        /// <value>
        /// The type of the configuration - if null then the type is base class... 
        /// </value>
        string ConfigType { get; set; }

        string GetJsonForBrowsers();
    }

    /// <summary>
    ///  App Configuration Class
    /// config can either stored in the .JSON property with no rules
    /// or can be stored directly in this class via subclassing 
    /// </summary>
    [InheritedExport(typeof(IAppConfiguration))]
    //[Export(typeof(IAppConfiguration))]
    public class AppJsonConfiguration : IAppConfiguration {
        public string Name { get; set; }
        public bool IntegrationMode { get; set; }

        /// <summary>
        /// Gets or sets the type of the configuration.
        /// </summary>
        /// <value>
        /// The type of the configuration - if null then the type is base class... 
        /// </value>
        public string ConfigType {
            get { return _configtype ?? this.GetType().FullName; }
            set { _configtype = value; } }

        private string _configtype = null;
        

        public JObject Json { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="AppJsonConfiguration"/> class.
        /// Default constructor for serialization  
        /// </summary>
        public AppJsonConfiguration() {
            
        }

        public AppJsonConfiguration(string name, JObject json )
        {
            this.Name = name;
            this.Json = json;
            IntegrationMode = this.Name == "Integration Mode";
            

        }

        /// <summary>
        /// Gets the property of the given type
        /// TODO BUG watch out this is not working with basic types like string, int ... in this case some reflection is need and probably the Convert.To method 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="key">The key.</param>
        /// <returns></returns>
        public T GetProperty<T>(string key)
        {
            if (typeof(T).IsGenericType)
            {
                return (T)Convert.ChangeType((object)Json.SelectToken(key) ?? default(T), typeof(T));
            }
            else if (string.IsNullOrEmpty((string)Json.SelectToken(key)))
            {
                return default(T);
            }
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>((string)Json.SelectToken(key));
        }

        public void SetProperty<T>(string key, T value)
        {
            if (value != null)
            {
                if (GetProperty<T>(key) != null)
                {
                    Json.Remove(key);
                }
                if (typeof(T).IsGenericType)
                {
                    Json.Add(new Newtonsoft.Json.Linq.JProperty(key, value));
                }
                else
                {
                    Json.Add(new Newtonsoft.Json.Linq.JProperty(key, Newtonsoft.Json.JsonConvert.SerializeObject(value)));
                }
            }
            else
            {
                Json.Remove(key);
            }
        }

        public virtual string GetJsonForBrowsers() {
            if (this.Json == null) {
                this.Json = new JObject();
            }
            return this.Json.ToString();
        }
    }
}