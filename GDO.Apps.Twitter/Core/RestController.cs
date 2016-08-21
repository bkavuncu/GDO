using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace GDO.Apps.Twitter.Core
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

        public StatusMsg GetApiMessage()
        {
            return Get<StatusMsg>("/API") ?? new StatusMsg() { Msg = "Could not connect to API", Healthy = false };
        }

        public List<AnalyticsRequest> GetNewAnalytics(List<AnalyticsRequest> newAnalyticsList)
        {
            return newAnalyticsList.Select(r => Post("API/dataset/" + r.dataset_id + "/analytics", r)).ToList();
        }

        public DataSet GetDataSet(string id)
        {
            return Get<DataSet>("API/dataset/" + id) ?? new DataSet();
        }

        public DataSet[] GetDataSetList()
        {
            return (Get<DataSet[]>("API/dataset") ?? new DataSet[0]).ToArray();
        }

        public List<Analytics> GetAnalyticsList(string dataSetId)
        {
            return (Get<Analytics[]>("API/dataset/" + dataSetId + "/analytics") ?? new Analytics[0]).ToList(); 
        }

        public Analytics GetAnalytics(string dataSetId, string id)
        {
            return Get<Analytics>("API/dataset/" + dataSetId + "/analytics/" + id) ?? new Analytics();
        }

        public AnalyticsOption[] GetAnalyticsOptions()
        {
            return Get<AnalyticsOption[]>("API/analytics_options") ?? new AnalyticsOption[0].ToArray();
        }

        public AnalyticsData GetAnalyticsMetaData(string url)
        {
            return Get<AnalyticsData>(url) ?? new AnalyticsData();
        }

        public string DownloadData(string url, string filePath)
        {
            Debug.WriteLine("Attempting to dowload data from " + url);
            try
            {
                Task dataDownloadTask =
                    HttpClient.GetAsync(url)
                        .ContinueWith(async responseTask =>
                        {
                            responseTask.Result.EnsureSuccessStatusCode();
                            using (
                                FileStream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write,
                                    FileShare.None))
                            {
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
                Debug.WriteLine(ex.ToString());
                return null;
            }
        }


        public T Post<T>(string url, T postValue) where T : class
        {
            try
            {
                Task<T> postTask = HttpClient.PostAsJsonAsync(url, postValue).ContinueWith(responseTask =>
                {
                    if (responseTask.IsCanceled || responseTask.IsCanceled)
                    {
                        return null;
                    }
                    HttpResponseMessage response = responseTask.Result;
                    if (!response.IsSuccessStatusCode) return null;
                    Task<T> dataSetResponseTask = response.Content.ReadAsAsync<T>();
                    dataSetResponseTask.Wait();
                    return dataSetResponseTask.Result;
                });
                postTask.Wait();
                return postTask.Result;
            }
            catch (HttpRequestException rex)
            {
                Debug.WriteLine(rex.ToString());
                return null;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                return null;
            }
        }

        public T Get<T>(string url) where T : class
        {
            try
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
            catch (HttpRequestException rex)
            {
                Debug.WriteLine(rex.ToString());
                return null;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                return null;
            }
        }
    }
}