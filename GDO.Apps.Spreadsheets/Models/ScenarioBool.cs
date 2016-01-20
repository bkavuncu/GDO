using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets.Models
{

    public class ScenarioBool : Scenario
    {

        public List<InputBool> Inputs { get; set; }
        public List<Output> Outputs { get; set; }

        public ScenarioBool(List<InputBool> inputs, List<Output> outputs)
            : base()
        {
            this.Inputs = inputs;
            this.Outputs = outputs;
        }

        [JsonConstructor]
        public ScenarioBool(string id, List<InputBool> inputs, List<Output> outputs)
            : base(Guid.Parse(id))
        {
            this.Inputs = inputs;
            this.Outputs = outputs;
        }

        public ScenarioBool(ScenarioBool copy)
            : base()
        {
            this.Id = copy.Id;
            this.Inputs = copy.Inputs;
            this.Outputs = copy.Outputs;
        }

        public override string ToString()
        {
            string str = "Scenario ";
            str += "\ninputs: ";
            str = Inputs.Aggregate(str, (current, t) => current + ("\n" + t.ToString()));
            str += "\noutputs: ";
            return Outputs.Aggregate(str, (current, t) => current + ("\n" + t.ToString()));
        }

    }

}