using System;
using System.Collections.Generic;
using System.Linq;

namespace GDO.Core.Scenarios
{
    public class HubCall {
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
        /// </summary>
        /// <returns></returns>
        public object[] ParseParams() {
            return
                this.Params.SelectMany(l => l.Split(new[] { "," }, StringSplitOptions.RemoveEmptyEntries))
                    .Select<string, object>(
                        p => {
                            if (p.Contains("\"")) {
                                // its a string
                                return p.Replace("\"", "");// yes this will remove all "'s 
                            }
                            if (p.Contains(".")) {
                                // its a float
                                return float.Parse(p);
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