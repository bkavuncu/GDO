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

namespace GDO.Apps.ImageTiles
{
    enum Mode
    {
        CROP=1,
        FIT=0
    };
    public class ImageTilesApp : IAppInstance
    {
        public int Id { get; set; }
        public Section Section { get; set; }
        public AppConfiguration Configuration { get; set; }
        public string ImageName { get; set; }
        public Image[,] Tiles { get; set; }
        public void init(int instanceId, Section section, AppConfiguration configuration)
        {
            this.Id = instanceId;
            this.Section = section;
            this.Configuration = configuration;
        }

        public void ProcessImage(string imageName, int mode)
        {
            this.ImageName = imageName;
            String path = Directory.GetCurrentDirectory() + @"\Web\ImageTiles\images\"+ ImageName;
            Image image = Image.FromFile(path);
            double scaleWidth = (Section.Width + 0.000) / image.Width;
            double scaleHeight = (Section.Height + 0.000) / image.Height;
            int imageScaledWidth;
            int imageScaledHeight;

            int tempImageCols;
            int tempImageRows;


            if (scaleWidth > scaleHeight && mode == (int)Mode.CROP ||
                scaleWidth < scaleHeight && mode == (int)Mode.FIT)
            {
                imageScaledWidth = (image.Width - 1) / Section.Cols + 1; // ceiling
                imageScaledHeight = (imageScaledWidth * (Section.Height/Section.Rows) - 1) / (Section.Width / Section.Cols) + 1;
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
            Tiles = new Image[tempImageCols,tempImageRows];
            for (int i = 0; i < tempImageCols; i++)
            {
                for (int j = 0; j < tempImageRows; j++)
                {
                    Tiles[i, j] = new Bitmap((Section.Width / Section.Cols), (Section.Height / Section.Rows));
                    Graphics graphics = Graphics.FromImage(Tiles[i, j]);
                    graphics.DrawImage(image,
                        new Rectangle(0, 0, (Section.Width / Section.Cols), (Section.Height / Section.Rows)),
                        new Rectangle(i * imageScaledWidth, j * imageScaledHeight, imageScaledWidth, imageScaledHeight),
                        GraphicsUnit.Pixel);
                    graphics.Dispose();
                    path = Directory.GetCurrentDirectory() + @"\Web\ImageTiles\images\" + ImageName + @"_" + Id + @"_" + i + @"_" + j + @".png";
                    Tiles[i, j].Save(path, ImageFormat.Png);
                }
            }

        }
    }
}