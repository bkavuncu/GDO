using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using GDO.Apps.Twitter.Core;
using Newtonsoft.Json;

namespace GDO.Apps.Twitter
{


    public class RestController
    {
        private HttpClient HttpClient { get; }

        public RestController(Uri url)
        {
            HttpClient = new HttpClient {BaseAddress = url};
            HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic",
                "Y3BzMTVfdXNlcjpzZWNyZXQ=");
            HttpClient.DefaultRequestHeaders.Accept.Clear();
            HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/plain"));
        }

        public List<AnalyticsRequest> GetNewAnalytics(List<AnalyticsRequest> newAnalyticsList)
        {
            return newAnalyticsList.Select(r => Post("API/dataset/" + r.dataset_id + "/analytics", r)).ToList();
        }

        public DataSet[] GetDataSets()
        {
            return (Get<DataSet[]>("API/dataset") ?? new DataSet[0]).ToArray();
        }

        public Analytics[] GetAnalyticsMetas(string dataSetId)
        {
            return
                (Get<Analytics[]>("API/dataset/" + dataSetId + "/analytics") ?? new Analytics[0]).ToArray();
        }

        public AnalyticsOption[] GetAnalyticsOptions()
        {
            return Get<AnalyticsOption[]>("API/analytics_options") ?? new AnalyticsOption[0];
        }

        public StatusMsg GetApiMessage()
        {
            StatusMsg defaultStatusMsg = new StatusMsg() {Msg = "Could not connect to API", Healthy = false};
            try
            {
                Task<StatusMsg> task = HttpClient.GetAsync("/API").ContinueWith(response =>
                {
                    if (response.IsFaulted || response.IsCanceled || !response.Result.IsSuccessStatusCode)
                    {
                        return new StatusMsg() {Msg = "Bad status code", Healthy = false};
                    }
                    Task<StatusMsg> result = response.Result.Content.ReadAsAsync<StatusMsg>();
                    result.Wait();
                    return result.Result;
                });
                task.Wait();
                return task.Result;
            }
            catch (HttpRequestException rex)
            {
                Debug.WriteLine(rex.ToString());
                return defaultStatusMsg;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                return defaultStatusMsg;
            }
        }

        public DataSet GetDataSets(string id)
        {
            return Get<DataSet>("API/dataset/" + id);
        }

        public Analytics GetAnalytics(string dataSetId, string id)
        {
            return Get<Analytics>("API/dataset/" + dataSetId + "/analytics/" + id);
        }

        public string DownloadData(string dataSetId, string analyticsId, string filePath, string queryParams)
        {
            Debug.WriteLine("Attempting to dowload data for " + dataSetId + " " + analyticsId + " to " + filePath);
            try
            {
                Task dataDownloadTask =
                    HttpClient.GetAsync("/API/dataset/" + dataSetId + "/analytics/" + analyticsId + "/data/dl?" +
                                        queryParams)
                        .ContinueWith(async responseTask =>
                        {
                            responseTask.Result.EnsureSuccessStatusCode();
                            using (
                                FileStream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write,
                                    FileShare.None))
                            {
                                //copy the content from response to filestream
                                await responseTask.Result.Content.CopyToAsync(fileStream);
                            }
                            return filePath;
                        });

                dataDownloadTask.Wait();
                return filePath;
            }
            catch (HttpRequestException rex)
            {
                Debug.WriteLine(rex.ToString());
                return null;
            }
            catch (Exception ex)
            {
                // For debugging
                Debug.WriteLine(ex.ToString());
                return null;
            }
        }

        public T Post<T>(string url, T postValue) where T: class
        {
            Task <T> postTask = HttpClient.PostAsJsonAsync(url, postValue).ContinueWith(responseTask =>
            {
                HttpResponseMessage response = responseTask.Result;
                if (!response.IsSuccessStatusCode) return null;
                Task<T> dataSetResponseTask = response.Content.ReadAsAsync<T>();
                dataSetResponseTask.Wait();
                return dataSetResponseTask.Result;
            });
            postTask.Wait();
            return postTask.Result;
        }

        public T Get<T>(string url) where T : class
        {
            Task<T> dataSetTask = HttpClient.GetAsync(url).ContinueWith(resposeTask =>
            {
                if (resposeTask.IsFaulted || resposeTask.IsCanceled)
                {
                    return null;
                }
                HttpResponseMessage response = resposeTask.Result;
                if (!response.IsSuccessStatusCode) return null;
                Task<T> dataSetResponseTask = response.Content.ReadAsAsync<T>();
                dataSetResponseTask.Wait();
                return dataSetResponseTask.Result;
            });
            dataSetTask.Wait();
            return dataSetTask.Result;
        }
    }
}