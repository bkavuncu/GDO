using System.IO;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using System.Collections.Generic;
using GDO.Utility;
using GDO.Apps.PresentationTool.Core;

namespace GDO.Apps.PresentationTool
{
    enum Mode
    {
        CROP = 1,
        FIT = 0
    };

    public class PresentationToolApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public IAdvancedAppInstance ParentApp { get; set; }
        public string BasePath { get; set; }
        public string ImagesAppBasePath { get; set; }
        public string FileName { get; set; }
        public int PPTPageCount { get; set; }
        public int CurrentSlide { get; set; }
        public int VoiceControlStatus { get; set; }
        public List<Slide> Slides { get; set; }
        public Dictionary<string, List<string>> FileNames { get; set; }

        public void Init()
        {
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/PresentationTool/Files");
            this.ImagesAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            this.FileName = "";
            Directory.CreateDirectory(this.BasePath + "/PPTs");
            Directory.CreateDirectory(this.BasePath + "/Images");
            Directory.CreateDirectory(this.ImagesAppBasePath);

            this.CurrentSlide = -1;
            VoiceControlStatus = 0;

            FileNames = new Dictionary<string, List<string>>();
            Slides = new List<Slide>();
            // app sections
            CreateNewSlide();
        }

        public void GetAllFileNames()
        {
            this.FileNames.Clear();
            foreach (string d in Directory.GetDirectories(this.BasePath))
            {
                List<string> fs = new List<string>();
                foreach (string f in Directory.GetFiles(d))
                {
                    string extension = Path.GetExtension(f);
                    if (extension.Equals(".pptx") || extension.Equals(".ppt"))
                        continue;
                    fs.Add(f.Remove(0, d.Length + 1));
                }
                this.FileNames.Add(d.Remove(0, this.BasePath.Length + 1), fs);
            }
        }

        public void copyFileToImagesFolder(string type, string filename)
        {
            string currPath = "";
            if (type.Equals("ppt"))
            {
                currPath = this.BasePath + "\\PPTs" + "\\" + filename;
            }
            else if (type.Equals("image"))
            {
                currPath = this.BasePath + "\\Images" + "\\" + filename;
            }

            string destPath = this.ImagesAppBasePath + "\\" + filename;
            File.Copy(currPath, destPath, true);
        }

        public void deleteFiles(string[] files)
        {
            foreach (string s in files)
            {
                string path = this.BasePath + s;
                File.Delete(path);
            }
        }

        public void CreateNewSlide()
        {
            Dictionary<int, AppSection> Sections = new Dictionary<int, AppSection>();
            Dictionary<int, string> Instances = new Dictionary<int, string>();
            Slide slide = new Slide(Sections, Instances);
            Slides.Add(slide);
            CurrentSlide = Slides.Count - 1;
            CreateSection(0, 0, Section.Cols - 1, Section.Rows - 1);
            DeployResource(0, null, null);
        }

        public void DeleteCurrentSlide()
        {
            if (CurrentSlide == 0) return;
            Slide slide = Slides[CurrentSlide];
            Slides.Remove(slide);
        }

        public int CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {

            int sectionId = Utilities.GetAvailableSlot<AppSection>(Slides[CurrentSlide].Sections);
            AppSection appSection = new AppSection(sectionId, colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
            Slides[CurrentSlide].Sections.Add(sectionId, appSection);
            for (int i = 0; i < appSection.NumNodes; i++)
            {
                appSection.Width += Cave.NodeWidth;
                appSection.Height += Cave.NodeHeight;
            }

            appSection.Width = appSection.Width / appSection.Rows;
            appSection.Height = appSection.Height / appSection.Cols;
            return sectionId;
        }

        public void DeployResource(int sectionId, string src, string appName)
        {
            int instanceId = Utilities.GetAvailableSlot<string>(Slides[CurrentSlide].Instances);
            Slides[CurrentSlide].Instances.Add(instanceId, appName);
            Slides[CurrentSlide].Sections[sectionId].Src = "Files" + src;
            Slides[CurrentSlide].Sections[sectionId].AppInstanceId = instanceId;
            Slides[CurrentSlide].Sections[sectionId].AppName = appName;
            return;
        }

        public void UnDelpoyResource(int sectionId)
        {
            Slides[CurrentSlide].Instances.Remove(Slides[CurrentSlide].Sections[sectionId].AppInstanceId);
            Slides[CurrentSlide].Sections[sectionId].Src = null;
            Slides[CurrentSlide].Sections[sectionId].AppName = null;
            return;
        }

        public void CloseSection(int sectionId)
        {
            Slides[CurrentSlide].Sections[sectionId].Nodes = null;
            Slides[CurrentSlide].Sections.Remove(sectionId);
            return;
        }

        public bool ContainsSection(int sectionId)
        {
            return Slides[CurrentSlide].Sections.ContainsKey(sectionId);
        }
    }
}