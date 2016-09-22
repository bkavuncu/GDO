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
        private StatusMsg StatusMsg { get; set; }
        public Dictionary<string, DataSet> DataSets { get; set; }
        public Dictionary<string, Dictionary<string, Analytics>> Analytics { get; set; }
        public string CurrentDataSet { get; set; }
        public RestController(Uri url, string authentication = "Y3BzMTVfdXNlcjpzZWNyZXQ=")
        {
            HttpClient = new HttpClient {BaseAddress = url};
            HttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authentication);
            HttpClient.DefaultRequestHeaders.Accept.Clear();
            HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/plain"));
        }

        public StatusMsg GetApiMessage()
        {
            StatusMsg =  Get<StatusMsg>("/API") ?? new StatusMsg() { Msg = "Could not connect to API", Healthy = false };
            Debug.WriteLine("Using base paths: " + StatusMsg.DataSetUrl + " " + StatusMsg.AnalysisOptionsUrl);
            return StatusMsg;
        }

        public List<AnalyticsRequest> GetNewAnalytics(List<AnalyticsRequest> newAnalyticsList)
        {
            return newAnalyticsList.Select(r => Post(DataSets[r.dataset_id].UriAnalytics, r)).ToList();
        }

        public List<Slide> GetSlides()
        {
            return (Get<Slide[]>(StatusMsg.SlideUrl) ?? new Slide[0]).ToList();
        }

        public DataSet GetDataSet(string id)
        {
            return Get<DataSet>(StatusMsg.DataSetUrl +"/" + id) ?? new DataSet();
        }

        public Dictionary<string, DataSet> GetDataSetList()
        {
            DataSets = (Get<DataSet[]>(StatusMsg.DataSetUrl) ?? new DataSet[0]).ToDictionary(ds => ds.Id, ds => ds);
            return DataSets;
        }

        public Analytics GetAnalytics(string dataSetId, string id, bool useCache = true)
        {
            if (useCache)
            {
                return Get<Analytics>(DataSets[dataSetId].UriAnalytics + "/" + id) ?? new Analytics();
            }
            else
            {
                return Get<Analytics>(GetDataSet(dataSetId).UriAnalytics + "/" + id) ?? new Analytics();
            }
        }

        public Dictionary<string, Dictionary<string, Analytics>> GetAnalyticsList(List<string> dataSetIds)
        {
            Dictionary<string, List<Analytics>> analytics = dataSetIds.ToDictionary(dsId => dsId,
                                                 dsId => Get<Analytics[]>(DataSets[dsId].UriAnalytics).ToList());

            Analytics = analytics.ToDictionary(a => a.Key, a => a.Value.ToDictionary(b => b.Id, b => b));
            CurrentDataSet = dataSetIds[0];
            return Analytics;
        }

        public AnalyticsOption[] GetAnalyticsOptions()
        {
            return Get<AnalyticsOption[]>(StatusMsg.AnalysisOptionsUrl) ?? new AnalyticsOption[0].ToArray();
        }

        public AnalyticsData GetAnalyticsData(string url)
        {
            return Get<AnalyticsData>(url) ?? new AnalyticsData();
        }

        public string DownloadData(string url, string dirPath)
        {
            Debug.WriteLine("Download request to " + url + " " + dirPath);
            string fileName = "";
            try
            {

                Task dataDownloadTask =
                    HttpClient.GetAsync(url)
                        .ContinueWith(async responseTask =>
                        {
                            var cdh =
                                ContentDispositionHeaderValue.Parse(
                                    responseTask.Result.Content.Headers.GetValues("Content-Disposition")
                                        .FirstOrDefault());
                            fileName = cdh.FileName; 
                            responseTask.Result.EnsureSuccessStatusCode();
                            using (
                                FileStream fileStream = new FileStream(Path.Combine(dirPath, fileName), FileMode.Create, FileAccess.Write,
                                    FileShare.None))
                            {
                                await responseTask.Result.Content.CopyToAsync(fileStream);
                            }
                            return cdh.FileName;
                        });

                dataDownloadTask.Wait();
                return fileName;
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
            Debug.WriteLine("Post request to " + url);
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
            Debug.WriteLine("Get request to " + url);
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