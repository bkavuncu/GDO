﻿using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using GDO.Utility;
using Microsoft.AspNet.SignalR;
using Microsoft.Office.Core;
using Microsoft.Office.Interop.PowerPoint;

namespace GDO.Apps.Presentation
{
    enum Mode
    {
        CROP = 1,
        FIT = 0
    };
    public class PresentationApp : IBaseAppInstance
    {
        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }
        public Section Section { get; set; }
        #region config
        public AppJsonConfiguration Configuration { get; set; }
        public IAppConfiguration GetConfiguration() {
            return this.Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is AppJsonConfiguration) {
                this.Configuration = (AppJsonConfiguration)config;
                // todo signal status change
                return true;
            }
            this.Configuration = (AppJsonConfiguration)GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new AppJsonConfiguration();
        }
        #endregion
        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public string BasePath { get; set; }
        public string FileName
        {
            get { return Configuration.State.FileName; }
            set { Configuration.State.FileName = value; }
        }
        public string FileNameDigit
        {
            get { return Configuration.State.FileNameDigit; }
            set { Configuration.State.FileNameDigit = value; }
        }
        public int PageCount
        {
            get { return Configuration.State.PageCount; }
            set { Configuration.State.PageCount = value; }
        }
        public int CurrentPage
        {
            get { return Configuration.State.CurrentPage; }
            set { Configuration.State.CurrentPage = value; }
        }

        public void Init()
        {
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/Presentation/PPTs/");
            if (Configuration.State == null)
            {
                this.Configuration.State = new PresentationAppStateConfiguration();
            }
            if (this.FileNameDigit == null)
            {
                this.FileName = "";
                this.FileNameDigit = "";
                this.PageCount = 0;
                this.CurrentPage = 0;
            }
            if (!Directory.Exists(this.BasePath))
            {
                Directory.CreateDirectory(this.BasePath);
            }
        }

        public void ProcessImage(string imagePath, int pageNumber, int mode)
        {
            Image image = Image.FromFile(imagePath);
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/Presentation/PPTs/");
            //create thumnail
            Image thumb = image.GetThumbnailImage(500 * image.Width / image.Height, 500, () => false, IntPtr.Zero);
            thumb.Save(BasePath + "\\" + FileNameDigit + "\\thumb_" + pageNumber + ".png", ImageFormat.Png);

            double scaleWidth = (Section.Width + 0.000) / image.Width;
            double scaleHeight = (Section.Height + 0.000) / image.Height;
            int scaledCroppedImagedWidth;
            int scaledCroppedImagedHeight;
            double scale;

            if (scaleWidth > scaleHeight && mode == (int)Mode.CROP ||
                scaleWidth < scaleHeight && mode == (int)Mode.FIT)
            {
                scaledCroppedImagedWidth = (image.Width - 1) / Section.Cols + 1; // ceiling
                scaledCroppedImagedHeight = (scaledCroppedImagedWidth * (Section.Height / Section.Rows) - 1) / (Section.Width / Section.Cols) + 1;
                scale = scaleWidth;
            }
            else
            {
                scaledCroppedImagedHeight = (image.Height - 1) / Section.Rows + 1; // ceiling
                scaledCroppedImagedWidth = (scaledCroppedImagedHeight * (Section.Width / Section.Cols) - 1) / (Section.Height / Section.Rows) + 1; // ceiling and keep ratio
                scale = scaleHeight;
            }

            int scaledOriginImageWidth = Convert.ToInt32(image.Width*scale);
            int scaledOriginImageHeight = Convert.ToInt32(scale*image.Height);

            int offsetWidth = Convert.ToInt32((Section.Width - scaledOriginImageWidth)/scale);
            int offsetHeight = Convert.ToInt32((Section.Height - scaledOriginImageHeight)/scale);
            
            for (int i = 0; i < Section.Cols; i++)
            {
                for (int j = 0; j < Section.Rows; j++)
                {
                    Image tile = new Bitmap((Section.Width / Section.Cols), (Section.Height / Section.Rows));
                    Graphics graphics = Graphics.FromImage(tile);
                    graphics.DrawImage(image,
                        new Rectangle(0, 0, (Section.Width / Section.Cols), (Section.Height / Section.Rows)),
                        new Rectangle(i*scaledCroppedImagedWidth - offsetWidth/2, j * scaledCroppedImagedHeight - offsetHeight/2, scaledCroppedImagedWidth, scaledCroppedImagedHeight),
                        GraphicsUnit.Pixel);
                    graphics.Dispose();
                    string path = BasePath + "\\" + FileNameDigit + "\\" + "crop" + @"_" + pageNumber + @"_" + i + @"_" + j + @".png";
                    tile.Save(path, ImageFormat.Png);
                    tile.Dispose();
                }
            }
            image.Dispose();
        }

        public void GenerateUniqueDigit(string filename)
        {
            this.FileName = filename;
            this.BasePath = HttpContext.Current.Server.MapPath("~/Web/Presentation/PPTs/");

            // generate unique digit id
            String path1 = BasePath + "\\" + FileName;
            Random fileDigitGenerator = new Random();
            while (Directory.Exists(BasePath + "\\" + FileNameDigit))
            {
                this.FileNameDigit = fileDigitGenerator.Next(10000, 99999).ToString();
            }
            String path2 = BasePath + "\\" + FileNameDigit + "\\" + FileName;
            Directory.CreateDirectory(BasePath + "\\" + FileNameDigit);
            File.Move(path1, path2);
            
            return;
        }
    }

    public class PresentationAppStateConfiguration
    {
        public string FileName { get; set; }
        public string FileNameDigit { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
    }
}