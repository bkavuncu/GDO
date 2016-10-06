using System.IO;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using System.Collections.Generic;
using System.Linq;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

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
        public App App { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public bool IntegrationMode { get; set; }
        public string BasePath { get; set; }
        public string ImagesAppBasePath { get; set; }

        public int CurrentPage { get; set; }
        public int CurrentPlayingIndex { get; set; }
        public int IsPlaying { get; set; }
        public int VoiceControlStatus { get; set; }

        public List<Dictionary<int, Slide>> Pages { get; set; }

        public Dictionary<string, List<string>> FileNames { get; set; }
        public List<string> SlideNames { get; set; }
        public List<string> ImageNames { get; set; }

        public CaveHub caveHub { get; set; }


        public void Init()
        {
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/PresentationTool/Files");
            this.ImagesAppBasePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
     
            Directory.CreateDirectory(this.BasePath + "/PPTs");
            Directory.CreateDirectory(this.BasePath + "/PPTs/Origin");
            Directory.CreateDirectory(this.BasePath + "/Images");
            Directory.CreateDirectory(this.BasePath + "/Images/Origin");
            Directory.CreateDirectory(this.ImagesAppBasePath);

            CurrentPlayingIndex = 0;
            CurrentPage = 0;
            IsPlaying = 0;
            VoiceControlStatus = 0;

            FileNames = new Dictionary<string, List<string>>();
            SlideNames = new List<string>();
            ImageNames = new List<string>();
            Pages = new List<Dictionary<int, Slide>>();
            caveHub = new CaveHub();
            
            // first page
            Dictionary<int, Slide> page = new Dictionary<int, Slide>();
            Pages.Add(page);
        }

        public Bitmap ResizeImage(string imagePath, int width, int height)
        {
            Image image = Image.FromFile(imagePath);
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighSpeed;
                graphics.InterpolationMode = InterpolationMode.Low;
                graphics.SmoothingMode = SmoothingMode.HighSpeed;
                graphics.PixelOffsetMode = PixelOffsetMode.HighSpeed;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }
            image.Dispose();
            return destImage;
        }

        public void GetAllFileNames()
        {
            this.FileNames.Clear();
            this.SlideNames.Clear();
            this.ImageNames.Clear();

            foreach (string d in Directory.GetDirectories(this.BasePath))
            {
                List<string> fs = new List<string>();
                foreach (string f in (Directory.GetFiles(d).OrderBy(f => new FileInfo(f).CreationTime)))
                {
                    string extension = Path.GetExtension(f);
                    if (extension.Equals(".pptx") || extension.Equals(".ppt"))
                        continue;
                    fs.Add(f.Remove(0, d.Length + 1));
                }
                this.FileNames.Add(d.Remove(0, this.BasePath.Length + 1), fs);
            }

            for (int i = 0; i < FileNames["PPTs"].Count; i++)
            {
                SlideNames.Add("Files/PPTs/" + FileNames["PPTs"][i]);
            }
        
            for (int i = 0; i < FileNames["Images"].Count; i++)
            {
                ImageNames.Add("Files/PPTs/" + FileNames["Images"][i]);
            }
        }

        public void deleteFiles(string[] files)
        {         
            foreach (string s in files)
            {
                string path = this.BasePath + s;
                File.Delete(path);             
                File.Delete(this.BasePath + "/PPTs/Origin/" + Path.GetFileName(s));
            }
        }

        public void clearDirectory(string path)
        {
            DirectoryInfo di = new DirectoryInfo(path);

            foreach (FileInfo file in di.GetFiles())
            {
                file.Delete();
            }
            foreach (DirectoryInfo dir in di.GetDirectories())
            {
                if (dir.Name != "Origin")
                {
                    dir.Delete(true);
                }             
            }
        }
    }
}