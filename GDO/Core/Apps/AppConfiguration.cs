using System;
using System.Reflection;

namespace GDO.Core.Apps
{
    /// <summary>
    ///  App Configuration Class
    /// </summary>
    public class AppConfiguration
    {
        public string Name { get; set; }
        public bool IntegrationMode { get; set; }

        /// <summary>
        /// The raw JSON content that would be serialised into the configuration.
        /// Some applications may prefer to use this.
        /// </summary>
        public Newtonsoft.Json.Linq.JObject Json {
            get
            {
                if (State != null)
                {
                    SerializeState();
                }
                return _json;
            }
            set
            {
                _json = value;
                if (StateType != null)
                {
                    // if the state type or state object has been set.
                    DeserializeState();
                }
            }
        }

        private Newtonsoft.Json.Linq.JObject _json;

        // The State property has a dynamic return type such that downstream
        // classes can easily extend it and use it within their respective
        // contexts. If you give this a standard return type a lot of unwanted
        // type casting will have to be done. One way to avoid this would be to
        // make AppConfiguration a generic class and update the entire codebase.
        //
        // The State property is not serialised into JSON, because we want to
        // treat it separately.

        /// <summary>
        /// Stores an object to hold state variables.
        /// </summary>
        [Newtonsoft.Json.JsonIgnore]
        public dynamic State { get; set; }

        /// <summary>
        /// Provides the type of the state object stored.
        /// </summary>
        public string StateType
        {
            get { return _stateType ?? this.State?.GetType().AssemblyQualifiedName; }
            set
            {
                _stateType = value;
                if (_json != null && State == null)
                {
                    // if the JSON was set first, but state type was not set as yet.
                    DeserializeState();
                }
            }
        }

        private string _stateType;

        public AppConfiguration(string name, dynamic json)
        {
            this.Name = name;
            this.Json = json;
            IntegrationMode = this.Name == "Integration Mode";
        }

        #region State Serialisation Helper Methods
        private void DeserializeState()
        {
            if (_json.SelectToken("stateConfig") != null)
            {
                State = typeof(AppConfiguration).GetMethod("DeserializeStateHelper", 
                    BindingFlags.NonPublic | BindingFlags.Instance).MakeGenericMethod(
                    Type.GetType(StateType)).Invoke(this, new object[] { });
            }
        }

        private T DeserializeStateHelper<T>()
        {
            // There are two methods in JsonConvert that accepts the same arguments.
            // This is to avoid that.
            return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(
                (string)_json.SelectToken("stateConfig"));
        }

        private void SerializeState()
        {
            if (_json.SelectToken("stateConfig") != null)
            {
                _json.Remove("stateConfig");
            }
            _json.Add(new Newtonsoft.Json.Linq.JProperty("stateConfig", 
                Newtonsoft.Json.JsonConvert.SerializeObject(State)));
        }
        #endregion
    }
}