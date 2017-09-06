using System;
using System.Collections.Generic;
using System.Linq;

namespace GDO.Core.Scenarios
{
    public class Element
    {
        public int Id { get; set; }
        public string Mod { get; set; }
        public string Func { get; set; }
        public List<string> Params { get; set; }
        public double DefaultWait { get; set; }
        public bool IsLoop = false;

        public Element(int index, string function, int timeout)
        {
            Params = new List<string>();
        }

        public override string ToString() {
            return $"{nameof(IsLoop)}: {IsLoop}, {nameof(Id)}: {Id}, {nameof(Mod)}: {Mod}, {nameof(Func)}: {Func}, {nameof(Params)}: {Params.Aggregate("", (acc, next) => acc + "|" + next)}, {nameof(DefaultWait)}: {DefaultWait}";
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
}