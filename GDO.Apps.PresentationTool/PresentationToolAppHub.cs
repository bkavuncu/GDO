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

        public void RequestAppUpdate(int instanceId, int slide)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    List<string> sections = new List<string>(pa.Slides[slide].Sections.Count);
                    for (int i = 0; i < pa.Slides[slide].Sections.Count; i++)
                    {
                        sections.Add(GetSectionUpdate(instanceId, pa.Slides[slide].Sections[i].Id));
                    }
                    Clients.Caller.receiveAppUpdate(sections, slide, pa.Slides.Count);
                }
                catch (Exception e)
                {
                    Log.Error("failed to prepare App Update ", e);
                }
            }
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
                    pa.PPTPageCount = pptFile.Slides.Count;
                    int width = 3072;
                    int height = Convert.ToInt32(width * pptFile.PageSetup.SlideHeight / pptFile.PageSetup.SlideWidth);
                    for (int i = 0; i < pptFile.Slides.Count; i++)
                    {
                        Clients.Caller.setMessage("Processing presentation file: " + i.ToString() + "/" + pa.PPTPageCount.ToString());
                        string extension = System.IO.Path.GetExtension(filename);
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
                    Log.Error("failed to load presentation ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
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
                    Log.Error("failed to upload image ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
                }
            }
        }

        public void UpdateProcessedImages(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    string database_path = System.Web.HttpContext.Current.Server.MapPath("~/Web/Images/Images/Database.txt");
                    string[] database = { };
                    if (File.Exists(database_path))
                    {
                        database = File.ReadAllLines(database_path);
                        Clients.Caller.receiveProcessedImages(database);
                    }
                }
                catch (Exception e)
                {
                    Log.Error("failed to process image ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
                }
            }
        }

        public void DeleteImageFolder(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    string database_path = System.Web.HttpContext.Current.Server.MapPath("~/Web/Images/Images/Database.txt");
                    string[] database = { };
                    if (File.Exists(database_path))
                    {
                        database = File.ReadAllLines(database_path);
                        string tempFile = Path.GetTempFileName();
                        using (var sw = new StreamWriter(tempFile))
                        {
                            foreach (string s in database)
                            {
                                if (s.Split('|')[0].Equals(filename))
                                {
                                    Directory.Delete(pa.ImagesAppBasePath + s.Split('|')[1], false);
                                    Clients.Caller.setMessage("Delete " + s.Split('|')[0] + " Success!");
                                } else
                                {
                                    sw.WriteLine(s);
                                }
                            }
                        }
                        File.Delete(database_path);
                        File.Move(tempFile, database_path);
                    } 
                }
                catch (Exception e)
                {
                    Log.Error("failed to process image ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
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
                    // PPT images name
                    int numOfPPTImages = pa.FileNames["PPTs"].Count;
                    string[] pptImages = new string[numOfPPTImages];
                    for (int i = 0; i < numOfPPTImages; i++)
                        pptImages[i] = pa.FileNames["PPTs"][i];
                    // Images name
                    int numOfImages = pa.FileNames["Images"].Count;
                    string[] images = new string[numOfImages];
                    for (int i = 0; i < numOfImages; i++)
                        images[i] = pa.FileNames["Images"][i];
                    Clients.Caller.receiveFileNames(pptImages, images);
                }
                catch (Exception e)
                {
                    Log.Error("failed to create section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
                }

            }
        }


        public void RequestImagesToBePlayed(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    List<List<string>> imagesList = new List<List<string>>(pa.Slides.Count);
       
                    for (int i = 0; i < pa.Slides.Count; i ++)
                    {
                        List<string> images = new List<string>(pa.Slides[i].Sections.Count);
                        for (int j = 0; j < pa.Slides[i].Sections.Count; j++)
                        {
                            if (pa.Slides[i].Sections[j].AppName == "Images")
                            {
                                images.Add(pa.Slides[i].Sections[j].Src);
                                //allImages.Add(pa.Slides[i].Sections[j].Src); 
                            }
                        }
                        imagesList.Add(images);
                    }

                    Clients.Caller.receiveAllImagesToBePlayed(imagesList);
                }
                catch (Exception e)
                {
                    Log.Error("failed to request process slides", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestCreateNewSlide(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.CreateNewSlide();
                    Clients.Caller.receiveSlideUpdate(pa.CurrentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to get refresh info", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestDeleteCurrentSlide(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.DeleteCurrentSlide();
                    RequestPreviousSlide(instanceId);
                    Clients.Caller.receiveSlideUpdate(pa.CurrentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to get refresh info", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestSlideTable(int instanceId, int slideIndex)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.setMessage("Requesting show Slide " + slideIndex);
                    if (slideIndex < 0 || slideIndex >= pa.Slides.Count) return;
                    pa.CurrentSlide = slideIndex;
                    Clients.Caller.receiveSlideUpdate(slideIndex);
                }
                catch (Exception e)
                {
                    Log.Error("failed to request previous slide", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestPreviousSlide(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    if (pa.CurrentSlide <= 0)
                    {
                        Clients.Caller.setMessage("Already at first slide!");
                        return;
                    }
                    pa.CurrentSlide--;
                    Clients.Caller.receiveSlideUpdate(pa.CurrentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to request previous slide", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        

        public void RequestNextSlide(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    if (pa.CurrentSlide + 1 >= pa.Slides.Count)
                    {
                        Clients.Caller.setMessage("Already at last slide!");
                        return;
                    }
                    pa.CurrentSlide++;
                    Clients.Caller.receiveSlideUpdate(pa.CurrentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to request next slide", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestSlideSave(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    Clients.Caller.receiveSlideSave(JsonConvert.SerializeObject(pa.Slides));
                }
                catch (Exception e)
                {
                    Log.Error("failed to save slide", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestSlideOpen(int instanceId, string filename)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    List<Core.Slide> slides;
                    using (StreamReader r = new StreamReader(pa.BasePath + "\\" + filename))
                    {
                        string json = r.ReadToEnd();
                        slides = JsonConvert.DeserializeObject<List<Core.Slide>>(json);
                    }
                    pa.Slides.Clear();
                    foreach (Core.Slide slide in slides)
                    {
                        pa.Slides.Add(slide);
                    }
                    Clients.Caller.setMessage("Load Successfully");
                    Clients.Caller.receiveSlideOpen();

                }
                catch (Exception e)
                {
                    Log.Error("failed to open slide", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void requestVoiceInfo(int instanceId, string info, int type)
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
                    Log.Error("failed to update voice information", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void swapSrc(int instanceId, int sectionId1, int sectionId2)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    string temp = pa.Slides[pa.CurrentSlide].Sections[sectionId1].Src;
                    pa.Slides[pa.CurrentSlide].Sections[sectionId1].Src = pa.Slides[pa.CurrentSlide].Sections[sectionId2].Src;
                    pa.Slides[pa.CurrentSlide].Sections[sectionId2].Src = temp;
                }
                catch (Exception e)
                {
                    Log.Error("failed to update voice information", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void UpdateVoiceInfo(int instanceId, int col, int row, string info, int type)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    if (col == 0 && row == 0)
                    {
                        Clients.Caller.setVoiceInfo(info, type, true);
                    }
                    else
                    {
                        Clients.Caller.setVoiceInfo(info, type, false);
                    }

                }
                catch (Exception e)
                {
                    Log.Error("failed to update voice information", e);
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
                    Log.Error("failed to update voice control status", e);
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

        public void CreateSection(int instanceId, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    int sectionId = pa.CreateSection(colStart, rowStart, colEnd, rowEnd);
                    if (sectionId == -1)
                    {
                        Clients.Caller.setMessage("Cannot create section, please check nodes status!");
                        return;
                    }
                    BroadcastSectionUpdate(instanceId, sectionId);
                }
                catch (Exception e)
                {
                    Log.Error("failed to create section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
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
                    pa.CloseSection(sectionId);
                    BroadcastSectionUpdate(instanceId, sectionId);
                }
                catch (Exception e)
                {
                    Log.Error("failed to close section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
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
                    int result = pa.DeployResource(sectionId, src, appName);
                    if (result == -1)
                    {
                        Clients.Caller.setMessage("Cannot deploy resource, please check nodes status!");
                        return;
                    }
                    Clients.Caller.setMessage(src);
                    BroadcastSectionUpdate(instanceId, sectionId);
                }
                catch (Exception e)
                {
                    Log.Error("failed to create section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
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
                    pa.UnDelpoyResource(sectionId);
                    BroadcastSectionUpdate(instanceId, sectionId);
                }
                catch (Exception e)
                {
                    Log.Error("failed to create section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
                }

            }
        }

        public void UpdateSectionInfo(int instanceId, int sectionId, int realSectionId, int realInstanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Slides[pa.CurrentSlide].Sections[sectionId].RealSectionId = realSectionId;
                    pa.Slides[pa.CurrentSlide].Sections[sectionId].RealInstanceId = realInstanceId;
                }
                catch (Exception e)
                {
                    Log.Error("failed to create section ", e);
                    Clients.Caller.setMessage(e.GetType().ToString() + e);
                }

            }
        }

        public void ClearCave(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Slides.Clear();
                    pa.CreateNewSlide();
                    Clients.Caller.receiveSlideUpdate(pa.CurrentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to clear cave", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        private bool BroadcastSectionUpdate(int instanceId, int sectionId)
        {
            try
            {
                PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                string serializedSection = GetSectionUpdate(instanceId, sectionId);
                if (pa.ContainsSection(sectionId) && serializedSection != null)
                {
                    Clients.Caller.receiveSectionUpdate(true, sectionId, serializedSection);
                    return true;
                }
                else
                {
                    Clients.Caller.receiveSectionUpdate(false, sectionId, "");
                    return true;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return false;
            }
        }

        private string GetSectionUpdate(int instanceId, int sectionId)
        {
            try
            {
                PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                if (pa.ContainsSection(sectionId))
                {
                    AppSection section;
                    pa.Slides[pa.CurrentSlide].Sections.TryGetValue(sectionId, out section);
                    return JsonConvert.SerializeObject(section);
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Log.Error("failed to GetSectionUpdate", e);
                return null;
            }
        }
    }
}