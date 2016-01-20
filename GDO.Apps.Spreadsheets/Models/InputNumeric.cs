using System;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets.Models
{

    public class InputNumeric : Variable
    {

        public double Original { get; set; }
        public double Min { get; set; }
        public double Max { get; set; }
        public double Increment { get; set; }
        public double Value { get; set; }

        #region constructors

        public InputNumeric(string reference, string name, string sheet, string cell,
                     double original, double min, double max, double increment)
            : base(reference, name, sheet, cell)
        {
            this.Original = original;
            this.Min = min;
            this.Max = max;
            this.Increment = increment;
            this.Value = min;
        }

        [JsonConstructor]
        public InputNumeric(string id, string reference, string name, string sheet, string cell,
                     double original, double min, double max, double increment, double value)
            : base(Guid.Parse(id), reference, name, sheet, cell)
        {
            this.Original = original;
            this.Min = min;
            this.Max = max;
            this.Increment = increment;
            this.Value = value;
        }

        public InputNumeric(InputNumeric copy) : base(copy.Id, copy.Reference, copy.Name, copy.Sheet, copy.Cell)
        {
            this.Original = copy.Original;
            this.Min = copy.Min;
            this.Max = copy.Max;
            this.Increment = copy.Increment;
            this.Value = copy.Value;
        }

        #endregion

        public void SetValueToMin()
        {
            Value = Min;
        }

        public void IncrementValue()
        {
            Value += Increment;
        }

        public bool IsMax()
        {
            return (Math.Abs(Value - Max) < 0.000001) || (Value + Increment > Max);
        }

        public override string ToString()
        {
            return "InputNumeric " + ": " + Name + " with value, min, max, increment: " + Value + " " + Min + " " + Max + " " + Increment;
        }

    }

}
