using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace GDO.Apps.DD3.Domain {
    public class RemoteDataRequest
    {
        public string dataId { get; set; }
        public string server { get; set; }
        public string[] toObject { get; set; }
        public string[] toArray { get; set; }
        public string[][] toValues { get; set; }
        public string[][] useNames { get; set; }

        private Func<JToken, string, JToken> tryParseNumber = (agg, next) =>
        {
            if (agg == null || agg is JValue)
                return null;

            int num = 0;
            if (int.TryParse(next, out num))
                return num < agg.Count() ? agg[num]: null;
            else if (!(agg is JArray))
                return agg[next];
            else
                return null;
        };

        public RemoteDataRequest(string dataId, string server, string[] toArray, string[] toObject, string[][] toValues, string[][] useNames)
        {
            this.dataId = dataId;
            this.server = server;
            this.toArray = toArray;
            this.toObject = toObject;
            this.toValues = toValues;
            this.useNames = useNames;
        }

        private JToken requestToServer (out JToken output)
        {
            dynamic error = new JObject();
            error.result = "Success";
            error.error = "";

            // Create Request
            WebRequest request = WebRequest.Create(server);
            request.ContentType = "application/json; charset=utf-8";
            //request.Credentials = CredentialCache.DefaultCredentials;


            // Get the response
            WebResponse response;
            try
            {
                System.Diagnostics.Debug.WriteLine("Getting data from : " + server);
                response = request.GetResponse();
            }
            catch (WebException e)
            {
                output = null;
                error.result = "Fail";
                error.error = "Error getting data. " + e.Message;
                return error;
            }

            // Read the response
            System.Diagnostics.Debug.WriteLine("HTTP response : " + ((HttpWebResponse)response).StatusDescription);
            Stream dataStream = response.GetResponseStream();
            StreamReader reader = new StreamReader(dataStream);
            JObject responseObject = (JObject)JsonConvert.DeserializeObject(reader.ReadToEnd());

            // Clean up the streams and the response
            reader.Close();
            response.Close();

            output = responseObject;
            return error;
        }

        private JToken formatData (JToken responseObject, out JToken output)
        {
            dynamic error = new JObject();
            error.result = "Success";
            error.error = "";

            JToken array = toArray.Aggregate(responseObject, tryParseNumber);
            if (array == null  || !(array is JArray))
            {
                output = null;
                error.result = "Fail";
                error.error = "Error formatting data. " + "Incorrect path to array";
                return error;
            }

            IEnumerable<JToken> data = array.Select(obj =>
            {
                JToken anObject = toObject.Aggregate(obj, tryParseNumber);
                JObject dataPoint = new JObject();
                if (anObject == null)
                {
                    error.result = "Warning";
                    error.error = "Error formatting data. " + "Incorrect path to object";
                    return dataPoint;
                }

                foreach (var d in toValues.Select((path, i) => new { i, path }))
                {
                    string name = d.path.Count() > 0 ? d.path[d.path.Count() - 1] : "value"; // SI value est null ahhhhhh

                    if (useNames.Count() > d.i && useNames[d.i].Count() > 1 && useNames[d.i][0] != "useKey")
                    {
                        if (useNames[d.i][0] == "useString")
                        {
                            name = useNames[d.i][1];
                        }
                        else if (useNames[d.i][0] == "useObjectField")
                        {
                            name = (string)useNames[d.i].Skip(1).Aggregate(anObject, tryParseNumber) ?? name;
                        }
                    }

                    dataPoint[name] = d.path.Aggregate(anObject, tryParseNumber);
                }

                return (JToken)dataPoint;
            });

            output = new JArray(data);
            return error;
        }

        public string execute (Data data)
        {
            JToken unformattedData, formattedData;

            dynamic error = requestToServer(out unformattedData);

            if (error.result == "Success")
            {
                error = formatData(unformattedData, out formattedData);

                if (formattedData != null)
                {
                    System.Diagnostics.Debug.WriteLine(JsonConvert.SerializeObject(formattedData.ToArray()));
                    data.add(dataId, formattedData);
                }
            }

            return JsonConvert.SerializeObject(error);
        }

    }
}