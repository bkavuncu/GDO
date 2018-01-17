using System;
using System.Collections.Generic;
using System.Linq;
using log4net;

namespace GDO.Core.Scenarios
{
    public class HubCall {
        private static readonly ILog Log = LogManager.GetLogger(typeof(HubCall));


        public string Mod { get; set; }
        public string Func { get; set; }
        public int InstanceId { get; set; } = -1;
        public List<string> Params { get; set; }

        public HubCall() {
            
        }
        

        /// <summary>
        /// Parses the parameters. e.g. 4,\"Imperial RTSC\"
        /// // todo this needs to be able to deal with more complex  parameter strings e.g.  0,[-74373.2285214765,6719770.2491205567] in the LondonMap scenario 
        /// </summary>
        /// <returns></returns>
        public object[] ParseParams() {
            return ParseParams(this.Params);
        }

        private static object[] ParseParams(IEnumerable<string> ps) {
            return ps.SelectMany(l => l.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries))
                .Select<string, object>(
                    p => ParseParam(p))
                .ToArray();
        }

        /// <summary>
        /// Parse a single parameter.
        /// </summary>
        /// <param name="param">parameter to parse</param>
        /// <returns></returns>
        private static object ParseParam(string param)
        {
            // Array of the form [a0,a1,...]
            // Note: spaces not permitted
            if (param.StartsWith("[") && param.EndsWith("]"))
            {
                param = param.Substring(1, param.Length - 2);
                var arr = param.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries);
                return ParseParams(arr);
            }

            // Strings of the form "abc" or 'abc'
            if ((param.StartsWith("\"") && param.EndsWith("\"")) ||
                (param.StartsWith("'") && param.EndsWith("'")))
            {
                return param.Substring(1, param.Length - 2);
            }

            int i;
            if (int.TryParse(param, out i))
            {
                return i;
            }

            float f;
            if (float.TryParse(param, out f))
            {
                return f;
            }

            throw new FormatException(String.Format("Unable to parse parameter `{0}`", param));
        }

        public override string ToString() {
            return $"{nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(InstanceId)}: {InstanceId}, {nameof(Params)}: {Params}";
        }
    }

    public class Element : HubCall {
        public int Id { get; set; }
        public double DefaultWait { get; set; }
        public bool IsLoop = false;

        

        public Element() {
            
        }

        public Element(int index, string function, int timeout)
        {
            Params = new List<string>();
        }

        public Element(HubCall scriptElement) {
            this.Id = 0;
            this.DefaultWait = 0.0;
            this.Func = scriptElement.Func;
            this.Mod = scriptElement.Mod;
            this.Params = scriptElement.Params;
            this.InstanceId = scriptElement.InstanceId;
        }

        public override string ToString() {
            return $"{nameof(Element.IsLoop)}: {IsLoop}, {nameof(Element.Id)}: {Id}, {nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(Params)}: {Params.Aggregate("", (acc, next) => acc + "|" + next)}, {nameof(Element.DefaultWait)}: {DefaultWait}";
        }
    }
}