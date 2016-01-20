using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets.Models
{

    public class ScenarioNumeric : Scenario, IComparable
    {

        public int number { get; set; }
        public List<InputNumeric> inputs { get; set; }
        public List<Output> outputs { get; set; }

        public ScenarioNumeric(int number, List<InputNumeric> inputs, List<Output> outputs) : base()
        {
            this.number = number;
            this.inputs = inputs;
            this.outputs = outputs;
        }

        [JsonConstructor]
        public ScenarioNumeric(string id, int number, List<InputNumeric> inputs, List<Output> outputs) : base(Guid.Parse(id))
        {
            this.number = number;
            this.inputs = inputs;
            this.outputs = outputs;
        }

        public ScenarioNumeric(ScenarioNumeric copy)
        {
            this.Id = copy.Id;
            this.number = copy.number;
            this.inputs = copy.inputs;
            this.outputs = copy.outputs;
        }

        public int CompareTo(object obj)
        {
            int result = 1;
            if (obj == null)
            {
                return 1;
            }
            ScenarioNumeric scenario2 = obj as ScenarioNumeric;
            if (scenario2 != null)
            {
                for (int i = 0; i < inputs.Count; i++)
                {
                    if (inputs[i].Value < scenario2.inputs[i].Value)
                    {
                        return -1;
                    }
                    if (inputs[i].Value > scenario2.inputs[i].Value)
                    {
                        return 1;
                    }
                }
            }
            else {
                throw new ArgumentException("Object is not a ScenarioNumeric");
            }
            return result;
        }

        public override string ToString()
        {
            string str = "ScenarioNumeric " + number;
            str += "\ninputs: ";
            for (int i = 0; i < inputs.Count; i++)
            {
                str += "\n" + inputs[i].ToString();
            }
            str += "\noutputs: ";
            for (int i = 0; i < outputs.Count; i++)
            {
                str += "\n" + outputs[i].ToString();
            }
            return str;
        }

    }
}