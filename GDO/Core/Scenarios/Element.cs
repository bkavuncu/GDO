using System;
using System.Collections.Generic;
using System.Linq;
using log4net;
using System.Reflection;
using System.Text.RegularExpressions;

namespace GDO.Core.Scenarios
{
    public class HubCall {
        private static readonly ILog Log = LogManager.GetLogger(typeof(HubCall));

        // Splits strings with nested arrays.
        private static Regex splitter = new Regex("(?:^|,)([\\s]*\\[(?:[^\\[]+|\\[\\])*\\]|[^,]*)", RegexOptions.Compiled);

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
        public object[] ParseParams(ParameterInfo[] info) {
            return FixArrayTypes(ParseParams(this.Params), info);
        }

        private static object[] FixArrayTypes(object[] parameters, ParameterInfo[] paramInfo)
        {
            if (parameters.Length != paramInfo.Length)
            {
                return parameters;
            }
            var fixedParams = new object[parameters.Length];
            for (int i = 0; i < parameters.Length; i++)
            {
                if (paramInfo[i].ParameterType.IsArray && parameters[i].GetType() == typeof(object[]))
                {
                    if (paramInfo[i].ParameterType.GetElementType() == typeof(float))
                    {
                        fixedParams[i] = Array.ConvertAll((object[])parameters[i], x => Convert.ToSingle(x));
                    }
                    else if (paramInfo[i].ParameterType.GetElementType() == typeof(int))
                    {
                        fixedParams[i] = Array.ConvertAll((object[])parameters[i], x => Convert.ToInt32(x));
                    }
                    else if (paramInfo[i].ParameterType.GetElementType() == typeof(string))
                    {
                        fixedParams[i] = Array.ConvertAll((object[])parameters[i], x => Convert.ToString(x));
                    }
                    else if (paramInfo[i].ParameterType.GetElementType() == typeof(bool))
                    {
                        fixedParams[i] = Array.ConvertAll((object[])parameters[i], x => Convert.ToBoolean(x));
                    }
                    else
                    {
                        fixedParams[i] = parameters[i];
                    }
                }
                else
                {
                    fixedParams[i] = parameters[i];
                }
            }
            return fixedParams;
        }

        private static object[] ParseParams(IEnumerable<string> ps) {
            return ps.SelectMany(l => splitter.Matches(l).Cast<Match>().Where(x => !string.IsNullOrEmpty(x.Value)).Select(x => x.Value.TrimStart(',').Trim()).ToArray())
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
                var arr = splitter.Matches(param).Cast<Match>().Where(x => !string.IsNullOrEmpty(x.Value)).Select(x => x.Value.TrimStart(',').Trim()).ToArray();
                return ParseParams(arr);
            }

            if (param.ToLowerInvariant() == "\"false\"" ||  param.ToLowerInvariant()=="false") {
                return false; 
            } 

            if (param.ToLowerInvariant() == "\"true\"" ||  param.ToLowerInvariant()=="true") {
                return true; 
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

            throw new FormatException(String.Format("Unable to parse parameter `{0}` try wrapping strings with ' marks", param));
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