using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Web;
using GDO.Core;
using GDO.Utility;

namespace GDO.Apps.Graph
{
    enum Mode
    {
        FILL = 1,
        FIT = 0
    };
    public class GraphApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public string ImageName { get; set; }
        public string ImageNameDigit { get; set; }
        public int DisplayMode { get; set; }
        public Image[,] Tiles { get; set; }
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
            this.DisplayMode = (int)Mode.FIT;
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\images");
        }

        // Image is an abstract base class that provides functionality for the Bitmap and Metafile descended classes.

        public string ProcessImage(string imageName, int mode)
        {
            this.ImageName = imageName;

            String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Graph\images\\";
            String path1 = basePath + ImageName;
            Random imgDigitGenerator = new Random();
            while (Directory.Exists(basePath + ImageNameDigit))
            {
                this.ImageNameDigit = imgDigitGenerator.Next(10000, 99999).ToString();
            }
            String path2 = basePath + ImageNameDigit + "\\origin.png";
            Directory.CreateDirectory(basePath + ImageNameDigit);
            Image img1 = Image.FromFile(path1);
            img1.Save(path2, ImageFormat.Png);
            //File.Move(path1, path2);

        
            //create origin
            Image image = Image.FromFile(path2);
            //image.Save(basePath + ImageNameDigit + "\\origin.png", ImageFormat.Png);
            //File.Delete(path1);

            //create thumnail
            Image thumb = image.GetThumbnailImage(200 * image.Width / image.Height, 200, () => false, IntPtr.Zero);
            thumb.Save(basePath + ImageNameDigit + "\\thumb.png", ImageFormat.Png);

            double scaleWidth = (Section.Width + 0.000) / image.Width;
            double scaleHeight = (Section.Height + 0.000) / image.Height;
            int imageScaledWidth;
            int imageScaledHeight;

            int tempImageCols;
            int tempImageRows;


            if (scaleWidth > scaleHeight && mode == (int)Mode.FILL ||
                scaleWidth < scaleHeight && mode == (int)Mode.FIT)
            {
                imageScaledWidth = (image.Width - 1) / Section.Cols + 1; // ceiling
                imageScaledHeight = (imageScaledWidth * (Section.Height / Section.Rows) - 1) / (Section.Width / Section.Cols) + 1;
                tempImageCols = Section.Cols;
                tempImageRows = Math.Max(Section.Rows, (image.Height - 1) / imageScaledHeight + 1); // ceiling
            }
            else
            {
                imageScaledHeight = (image.Height - 1) / Section.Rows + 1; // ceiling
                imageScaledWidth = (imageScaledHeight * (Section.Width / Section.Cols) - 1) / (Section.Height / Section.Rows) + 1; // ceiling and keep ratio
                tempImageCols = Math.Max(Section.Cols, (image.Width - 1) / imageScaledWidth + 1); // ceiling
                tempImageRows = Section.Rows;
            }
            Tiles = new Image[tempImageCols, tempImageRows];
            for (int i = 0; i < tempImageCols; i++)
            {
                for (int j = 0; j < tempImageRows; j++)
                {
                    // each tile is assigned to a newly constructed Bitmap, with the size of each browser
                    // Bitmap is a descendant of Image
                    Tiles[i, j] = new Bitmap((Section.Width / Section.Cols), (Section.Height / Section.Rows));
                    
                    // assign Bitmap to graphics
                    Graphics graphics = Graphics.FromImage(Tiles[i, j]);

                    // then draw image using DrawImage which is part of systems.drawing
                    // Draws the specified portion of the specified Image at the specified location and with the specified size.
      
                    /*
                    public void DrawImage(
	                    Image image,
	                    RectangleF destRect,   // this is the coordinates of rect in tile's Bitmap
	                    RectangleF srcRect,    // here it uses i & j to get the right portion of scaled image
	                    GraphicsUnit srcUnit
                    )
                    */
       
                    graphics.DrawImage(image,
                        new Rectangle(0, 0, (Section.Width / Section.Cols), (Section.Height / Section.Rows)),
                        new Rectangle(i * imageScaledWidth, j * imageScaledHeight, imageScaledWidth, imageScaledHeight),
                        GraphicsUnit.Pixel);
                    graphics.Dispose();
                    path2 = basePath + ImageNameDigit + "\\" + "crop" + @"_" + i + @"_" + j + @".png";
                    Tiles[i, j].Save(path2, ImageFormat.Png);
                }
            }
            return this.ImageNameDigit;
        }
    }
}