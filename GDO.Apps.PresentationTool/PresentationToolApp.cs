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
        public int currentSlide { get; set; }
        public List<Slide> Slides { get; set; }
        public Dictionary<string, List<string>> FileNames { get; set; }

        public void Init()
        {
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/PresentationTool/Files");
            this.ImagesAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
            this.FileName = "";
            this.currentSlide = -1;
            Directory.CreateDirectory(this.BasePath + "/PPTs");
            Directory.CreateDirectory(this.BasePath + "/Images");
            Directory.CreateDirectory(this.ImagesAppBasePath);

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
            File.Copy(currPath, destPath);
        }

        public void CreateNewSlide()
        {
            Dictionary<int, AppSection> Sections = new Dictionary<int, AppSection>();
            Dictionary<int, string> Instances = new Dictionary<int, string>();
            Slide slide = new Slide(Sections, Instances);
            Slides.Add(slide);
            currentSlide = Slides.Count - 1;
            CreateSection(0, 0, Section.Cols - 1, Section.Rows - 1);
        }

        public void DeleteCurrentSlide()
        {
            if (currentSlide == 0) return;
            Slide slide = Slides[currentSlide];
            Slides.Remove(slide);
        }

        public int CreateSection(int colStart, int rowStart, int colEnd, int rowEnd)
        {

            int sectionId = Utilities.GetAvailableSlot<AppSection>(Slides[currentSlide].Sections);
            AppSection appSection = new AppSection(sectionId, colStart, rowStart, colEnd - colStart + 1, rowEnd - rowStart + 1);
            Slides[currentSlide].Sections.Add(sectionId, appSection);
            for (int i = 0; i < appSection.NumNodes; i++)
            {
                appSection.Width += Cave.NodeWidth;
                appSection.Height += Cave.NodeHeight;
            }

            appSection.Width = appSection.Width / appSection.Rows;
            appSection.Height = appSection.Height / appSection.Cols;
            return sectionId;
        }

        public void DeployResource(int sectionId, string src)
        {
            int instanceId = Utilities.GetAvailableSlot<string>(Slides[currentSlide].Instances);
            string appName = "Images";
            Slides[currentSlide].Instances.Add(instanceId, appName);
            Slides[currentSlide].Sections[sectionId].Src = src;
            Slides[currentSlide].Sections[sectionId].AppInstanceId = instanceId;
            return;
        }

        public void UnDelpoyResource(int sectionId)
        {
            Slides[currentSlide].Instances.Remove(Slides[currentSlide].Sections[sectionId].AppInstanceId);
            Slides[currentSlide].Sections[sectionId].Src = null;
            return;
        }

        public void CloseSection(int sectionId)
        {
            Slides[currentSlide].Sections[sectionId].Nodes = null;
            Slides[currentSlide].Sections.Remove(sectionId);
            return;
        }

        public bool ContainsSection(int sectionId)
        {
            return Slides[currentSlide].Sections.ContainsKey(sectionId);
        }
    }
}