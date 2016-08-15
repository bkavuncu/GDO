using System;
using System.ComponentModel.Composition;
using Microsoft.AspNet.SignalR;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Apps.PresentationTool.Core;
using log4net;
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;

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
                    Clients.Caller.receiveAppUpdate(sections, slide);
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
                        string imagepath = pa.BasePath + "\\PPTs" + "\\" + result + i + ".png";
                        pptFile.Slides[i + 1].Export(imagepath, "png", width, height);
                        pa.copyFileToImagesFolder("ppt", result + i + ".png");
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
                    Clients.Caller.setMessage("Uploading" + filename);
                    UpdateFileList(instanceId);
                    pa.copyFileToImagesFolder("image", filename);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Log.Error("failed to upload image ", e);
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

        public void CreateSection(int instanceId, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    int sectionId = pa.CreateSection(colStart, rowStart, colEnd, rowEnd);
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
                    pa.DeployResource(sectionId, src, appName);
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
                    pa.Slides[pa.currentSlide].Sections.TryGetValue(sectionId, out section);
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

        public void RequestCreateNewSlide(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.CreateNewSlide();
                    Clients.Caller.receiveSlideUpdate(pa.currentSlide);
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
                    Clients.Caller.receiveSlideUpdate(pa.currentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to get refresh info", e);
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
                    if (pa.currentSlide <= 0)
                    {
                        Clients.Caller.setMessage("Already at first slide!");
                        return;
                    }
                    pa.currentSlide--;
                    Clients.Caller.receiveSlideUpdate(pa.currentSlide);
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
                    if (pa.currentSlide + 1 >= pa.Slides.Count)
                    {
                        Clients.Caller.setMessage("Already at last slide!");
                        return;
                    }
                    pa.currentSlide++;
                    Clients.Caller.receiveSlideUpdate(pa.currentSlide);
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

        public void clearCave(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    PresentationToolApp pa = ((PresentationToolApp)Cave.Apps["PresentationTool"].Instances[instanceId]);
                    pa.Slides.Clear();
                    pa.CreateNewSlide();
                    Clients.Caller.receiveSlideUpdate(pa.currentSlide);
                }
                catch (Exception e)
                {
                    Log.Error("failed to clear cave", e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
    }
}