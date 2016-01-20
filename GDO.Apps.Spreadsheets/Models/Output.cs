using System;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets.Models
{

    public class Output : Variable
    {

        public double Original { get; set; }
        public double Value { get; set; }

        #region constructors

        public Output(string reference, string name, string sheet, string cell, double original)
            : base(reference, name, sheet, cell)
        {
            this.Original = original;
            this.Value = original;
        }

        [JsonConstructor]
        public Output(string id, string reference, string name, string sheet, string cell, double original)
            : base(Guid.Parse(id), reference, name, sheet, cell)
        {
            this.Original = original;
            this.Value = original;
        }

        public Output(Output copy) : base(copy.Id, copy.Reference, copy.Name, copy.Sheet, copy.Cell)
        {
            this.Original = copy.Original;
            this.Value = copy.Value;
        }

        #endregion

        public override string ToString()
        {
            return "Output " + ": " + Name + " with value " + Value;
        }

    }

}
