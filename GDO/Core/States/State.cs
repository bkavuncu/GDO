using System.Collections.Generic;

namespace GDO.Core.States
{
    /// <summary>
    /// Stores the state of the deployment on the GDO 
    ///  </summary>
    public class State
    {
        public string Name { get; set; }
        public List<AppState> States { get; set; }

        public State() {
            
        }

        public State( string name)
        {
            this.Name = name;
            States = new List<AppState>();
        }
    }
}