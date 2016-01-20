using System;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets.Models
{

    public class InputBool : Variable
    {

        public bool State;

        public InputBool(string reference, string name, string sheet, string cell)
            : base(reference, name, sheet, cell)
        {
            this.State = false;
        }

        public InputBool(InputBool copy)
            : base(copy.Id, copy.Reference, copy.Name, copy.Sheet, copy.Cell)
        {
            this.State = copy.State;
        }

        [JsonConstructor]
        public InputBool(string id, string reference, string name, string sheet, string cell)
            : base(Guid.Parse(id), reference, name, sheet, cell)
        {
            this.State = false;
        }

        public override string ToString()
        {
            return "InputBool " + ": " + Name + " with state " + State;
        }

    }
}
