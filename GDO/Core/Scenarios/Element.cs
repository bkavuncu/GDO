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
        public List<string> Params { get; set; }

        public HubCall() {
            
        }

        public override string ToString() {
            return $"{nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(Params)}: {Params.Aggregate("", (acc, next) => acc + "|" + next)}";
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
                    p => {
                        if (p.StartsWith("[")) {
                            // its an array
                            p = p.Replace("[", "").Replace("]", "");// todo  does not deal with nested arrays... 
                            var arr = p.Split(new[] {","}, StringSplitOptions.RemoveEmptyEntries);
                            return ParseParams(arr);
                        }

                        if (p.Contains("\"")) {
                            // its a string
                            return p.Replace("\"", "");// yes this will remove all "'s 
                        }
                        if (p.Contains(".")) {
                            // its a float
                            try {
                                return float.Parse(p);
                            }
                            catch (Exception e) {
                                Log.Error("could not parse "+p+" e");
                                throw e;
                            }
                        }
                        // its an int
                        return int.Parse(p);
                    })
                .ToArray();
        }
    }

    public class Element : HubCall {
        public int Id { get; set; }
        public double DefaultWait { get; set; }
        public bool IsLoop = false;

        public int InstanceId { get; set; } = -1;

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
        }

        public override string ToString() {
            return $"{nameof(Element.IsLoop)}: {IsLoop}, {nameof(Element.Id)}: {Id}, {nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(Params)}: {Params.Aggregate("", (acc, next) => acc + "|" + next)}, {nameof(Element.DefaultWait)}: {DefaultWait}";
        }
    }
}