using System;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;
using log4net;
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Drawing;


namespace GDO.Apps.PresentationTool
{
    [Export(typeof(IAppHub))]
    public class PresentationToolAppHub : Hub, IBaseAppHub
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(PresentationToolAppHub));

        public string Name { get; set; } = "PresentationTool";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new PresentationToolApp().GetType();

        public void JoinGroup(string groupId)
        {
            Groups.Add(Context.ConnectionId, "" + groupId);
        }
        public void ExitGroup(string groupId)
        {
            Groups.Remove(Context.ConnectionId, "" + groupId);
        }

        public void UploadPPT(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);

                    Clients.Caller.setMessage("Initializing presentation procession");
                    // convert ppt to png
                    String pptPath = pa.BasePath + "\\PPTs" + "\\" + filename;
                    Application pptApp = new Application();
                    Presentation pptFile = pptApp.Presentations.Open(pptPath, MsoTriState.msoFalse, MsoTriState.msoFalse, MsoTriState.msoFalse);
                    int width = 5760;
                    int height = Convert.ToInt32(width * pptFile.PageSetup.SlideHeight / pptFile.PageSetup.SlideWidth);
                    for (int i = 0; i < pptFile.Slides.Count; i++)
                    {
                        Clients.Caller.setMessage("Processing presentation file: " + i.ToString() + "/" + pptFile.Slides.Count.ToString());
                        string extension = Path.GetExtension(filename);
                        string result = filename.Substring(0, filename.Length - extension.Length);
                        string imagepath = pa.BasePath + "\\PPTs\\Origin" + "\\" + result  + i + ".png";
                        pptFile.Slides[i + 1].Export(imagepath, "png", width, height);
                        File.Copy(imagepath, pa.ImagesAppBasePath + "\\" + result + i + ".png", true);
                        string newPath = pa.BasePath + "\\PPTs" + "\\" + result + i + ".png";
                        Bitmap preview = pa.ResizeImage(imagepath, width / 10, height / 10);
                        preview.Save(newPath);
                        preview.Dispose();
                    }

                    UpdateFileList(instanceId);
                    Clients.Caller.setMessage("Success!");
                    pptFile.Close();
                    pptApp.Quit();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void UploadImage(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.setMessage("Uploading " + filename);
 
                    string imagepath = pa.BasePath + "\\Images" + "\\" + filename;
                    string newPath = pa.BasePath + "\\Images\\Origin" + "\\" + filename;
                    if (!File.Exists(newPath))
                    {
                        File.Move(imagepath, newPath);
                    }
   
                    File.Copy(newPath, pa.ImagesAppBasePath + "\\" + filename, true);

                    Image image = Image.FromFile(newPath);
                    Bitmap preview = pa.ResizeImage(newPath, image.Width / 10, image.Height / 10);
                    preview.Save(imagepath);
                    preview.Dispose();
                    UpdateFileList(instanceId);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
       
        public void UpdateFileList(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.GetAllFileNames();
                    Clients.Caller.receiveFileNames(pa.SlideNames, pa.ImageNames);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }

            }
        }

        public void ChangePlayingStatus(int instanceId, int status)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.IsPlaying = status;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }

            }
        }

        public void changePlayingIndex(int instanceId, int index)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.CurrentPlayingIndex = index;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }

            }
        }

        public void RequestAppUpdate(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.receiveAppUpdate(pa.IsPlaying, pa.CurrentPage);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
             
        public void SetPage(int instanceId, int pageIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    if (pageIndex < 0 || pageIndex >= pa.Pages.Count) return;

                    // Todo close check

                    // undeploy apps and close sections
                    foreach (int id in Cave.Sections.Keys)
                    {
                        if (pa.Pages[pa.CurrentPage].ContainsKey(id))
                        {
                            pa.caveHub.CloseSection(id);
                            Clients.Caller.broadcastSectionUpdate(id);
                        }
                    }

                    pa.CurrentPage = pageIndex;

                    // copy page
                    Dictionary<int, Core.Slide> tempPage = new Dictionary<int, Core.Slide>(pa.Pages[pa.CurrentPage].Count);
                    foreach (KeyValuePair<int, Core.Slide> element in pa.Pages[pa.CurrentPage])
                    {
                        tempPage.Add(element.Key, element.Value);
                    }

                    pa.Pages[pa.CurrentPage].Clear();


                    foreach (Core.Slide slide in tempPage.Values)
                    {
                        CreateSection(instanceId, slide.ColStart, slide.RowStart, slide.ColEnd, slide.RowEnd);
                        DeployResource(instanceId, Cave.GetSectionId(slide.ColStart, slide.RowStart), slide.Src, slide.AppName);
                    }

                    tempPage.Clear();
                          

                    Clients.Caller.receivePageUpdate(pa.CurrentPage, pa.Pages.Count);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void CreateNewPage(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Dictionary<int, Core.Slide> page = new Dictionary<int, Core.Slide>();
                    pa.Pages.Add(page);
                    SetPage(instanceId, pa.CurrentPage + 1);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void DeleteCurrentPage(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    if (pa.CurrentPage == 0) return;
                    SetPage(instanceId, pa.CurrentPage - 1);
                    Dictionary<int, Core.Slide> page = pa.Pages[pa.CurrentPage + 1];
                    pa.Pages.Remove(page);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }


        public void RequestSavePresentation(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.receiveSavePresentation(JsonConvert.SerializeObject(pa.Pages));
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestOpenPrensentation(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    List<List<Section>> pages;
                    using (StreamReader r = new StreamReader(pa.BasePath + "\\" + filename))
                    {
                        string json = r.ReadToEnd();
                        pages = JsonConvert.DeserializeObject<List<List<Section>>>(json);
                    }
                    pa.Pages.Clear();
                    foreach (List<Section> page in pages)
                    {
                       // pa.Pages.Add(page);
                    }
                    Clients.Caller.setMessage("Load Successfully");
                    Clients.Caller.receivePPTOpen();

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void UpdateVoiceInfo(int instanceId, string info, int type)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Group("" + instanceId).receiveVoiceInfo(info, type);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void ChangeVoiceControlStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.VoiceControlStatus = 1 - pa.VoiceControlStatus;
                    Clients.Caller.changeVoiceControlStatus(pa.VoiceControlStatus);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RestoreVoiceControlStatus(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.receiveVoiceControlStatus(pa.VoiceControlStatus);
                }
                catch (Exception e)
                {
                    Log.Error("failed to restore voice control status", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestDeleteFiles(int instanceId, String[] files)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.setMessage("Deleting Files");
                    pa.deleteFiles(files);
                    UpdateFileList(instanceId);
                }
                catch (Exception e)
                {
                    Log.Error("failed to restore voice control status", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestDeleteAllFiles(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.clearDirectory(pa.BasePath + "/PPTs");
                    pa.clearDirectory(pa.BasePath + "/Images");
                    pa.clearDirectory(pa.BasePath + "/PPTs/Origin");
                    pa.clearDirectory(pa.BasePath + "/Images/Origin");
                    //pa.clearDirectory(pa.ImagesAppBasePath);
                    UpdateFileList(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }      

        public void ClearPages(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Pages.Clear();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void CreateSection(int instanceId, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.caveHub.CreateSection(colStart, rowStart, colEnd, rowEnd);
                    int sectionId = Cave.GetSectionId(colStart, rowStart);
                    Clients.Caller.broadcastSectionUpdate(sectionId);
                
                    Core.Slide slide = new Core.Slide(sectionId, colStart, rowStart, colEnd, rowEnd);
                    pa.Pages[pa.CurrentPage].Add(sectionId, slide);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void CloseSection(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Pages[pa.CurrentPage].Remove(sectionId);

                    //

                    pa.caveHub.CloseSection(sectionId);
                    Clients.Caller.broadcastSectionUpdate(sectionId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void DeployResource(int instanceId, int sectionId, string src, string appName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Pages[pa.CurrentPage][sectionId].Src = src;
                    pa.Pages[pa.CurrentPage][sectionId].AppName = appName;
                    BroadcastSectionUpdate(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void UnDeployResource(int instanceId, int sectionId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Pages[pa.CurrentPage][sectionId].Src = null;
                    pa.Pages[pa.CurrentPage][sectionId].AppName = null;
                    BroadcastSectionUpdate(instanceId);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        private void BroadcastSectionUpdate(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    List<string> slides = new List<string>();
                    foreach (Core.Slide slide in pa.Pages[pa.CurrentPage].Values)
                    {
                        slides.Add(JsonConvert.SerializeObject(slide));
                    }
                    Clients.Caller.receiveSectionUpdate(slides);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void LoadTemplate(int instanceId, int id)
        {
            lock(Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    // Check node availability
                    foreach (Section section in Cave.Sections.Values)
                    {
                        if (section.AppInstanceId >= 0 && section.AppInstanceId != instanceId)
                        {
                            Clients.Caller.setMessage("Some nodes are not free!");
                            return;
                        }
                    }

                    // Load template
                    int numOfFiles = pa.SlideNames.Count;
                    switch (id)
                    {
                        case 1:
                            int numOfPages = numOfFiles / 4 + 1;
                            int count = 0;
                            for (var i = 0; i < numOfPages; i++)
                            {
                                for (var j = 0; j < 5; j++)
                                {
                                    if (count == numOfFiles) break;
                                    CreateSection(instanceId, j * 3, 0, j * 3 + 2, 3);
                                    DeployResource(instanceId, j + 2, pa.SlideNames[count], "Images");
                                    count++;
                                }
                                if (count == numOfFiles) break;
                                CreateNewPage(instanceId);
                            }
                            break;
                        case 2:

                            break;
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

    }
}