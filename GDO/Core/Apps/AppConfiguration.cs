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

        [Newtonsoft.Json.JsonIgnore]
        public dynamic State { get; set; }

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
    }
}