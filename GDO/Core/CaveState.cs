using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace GDO.Core
{
    public class CaveState
    {
        public int Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public List<AppState> States { get; set; }

        public CaveState(int id, string name)
        {
            this.Id = id;
            this.Name = name;
            States = new List<AppState>();
        }
    }
}