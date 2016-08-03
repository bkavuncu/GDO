using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using GDO.Apps.Twitter.Core;

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


        public DataSetMeta[] GetDataSetMetas()
        {
            return (Get<DataSet[]>("API/dataset") ?? new DataSet[0]).Select(ds => new DataSetMeta()
            {
                Description = ds.Description,
                Id = ds.Id,
                Status = ds.Status,
                Tags = ds.Tags
            }).ToArray();
        }

        public AnalyticsMeta[] GetAnalyticsMetas(string dataSetId)
        {
            return
                (Get<Analytics[]>("API/dataset/" + dataSetId + "/analytics") ?? new Analytics[0]).Select(an => new AnalyticsMeta()
                    {
                        Id = an.Id,
                        Description = an.Description,
                        Status = an.Status,
                        Classification = an.Classification,
                        Type = an.Type
                    }).ToArray();
        }

        public DataSet GetDataSet(string id)
        {
            return Get<DataSet>("API/dataset/" + id);
        }

        public Analytics GetAnalytics(string dataSetId, string id)
        {
            return Get<Analytics>("API/dataset/" + dataSetId + "/analytics/" + id);
        }

        public string DownloadData(string dataSetId, string analyticsId, string filePath)
        {
            Debug.WriteLine("Attempting to dowload data for " + dataSetId + " " + analyticsId + " to " + filePath);
            try
            {

                Task dataDownloadTask =
                    HttpClient.GetAsync("/API/dataset/" + dataSetId + "/analytics/" + analyticsId +  "/data")
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


        public T Get<T>(string url) where T : class
        {
            Task<T> dataSetTask = HttpClient.GetAsync(url).ContinueWith(resposeTask =>
            {
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