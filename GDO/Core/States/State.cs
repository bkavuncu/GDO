using System.Collections.Generic;
using Newtonsoft.Json;

namespace GDO.Core.States
{
    public class State
    {
        public int Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public List<AppState> States { get; set; }

        public State(int id, string name)
        {
            this.Id = id;
            this.Name = name;
            States = new List<AppState>();
        }
    }
}