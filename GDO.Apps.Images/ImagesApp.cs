﻿using System.IO;
using System.Web;
using GDO.Core;
using GDO.Core.Apps;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Net;
using log4net;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;

namespace GDO.Apps.Images
{
    public class ImagesAppConfig : AppJsonConfiguration {
        public string ImageName;
        public string ImageNameDigit;
        public int Rotate;
        public DisplayBlockInfo DisplayBlock;
        public DisplayRegionInfo DisplayRegion;
        /// <summary>
        /// The image list filter - filter to only images which contain this image
        /// </summary>
        public string ImageListFilter;

        /// <summary>
        /// The URI the image was downloaded to/from
        /// </summary>
        public string Uri;

        /// <summary>
        /// Whether the URI should be redownloaded everytime the image is loaded...
        /// </summary>
        public bool LiveUri;
    }
    enum Mode
    {
        // ReSharper disable once InconsistentNaming
        FILL = 1,
        // ReSharper disable once InconsistentNaming
        FIT = 0
    };
    public class ImagesApp : IBaseAppInstance {
        private static readonly ILog Log = LogManager.GetLogger(typeof(ImagesApp));

        public int Id { get; set; }
        public string AppName { get; set; }
        public App App { get; set; }

        #region config

        public ImagesAppConfig Configuration;
        public IAppConfiguration GetConfiguration() {
            return Configuration;
        }

        public bool SetConfiguration(IAppConfiguration config) {
            if (config is ImagesAppConfig) {
                Configuration = (ImagesAppConfig) config;
                // todo signal update of config status
                // update the live uri link
                if (Configuration.LiveUri) {
                    Log.Info("image up updating uri "+Configuration.LiveUri);
                    DownloadLoadFromURI(Configuration.Uri, Configuration.LiveUri);
                }
                return true;
            }
            Log.Info(" Image app is loading with a default configuration");
            Configuration = (ImagesAppConfig) GetDefaultConfiguration();
            return false;
        }

        public IAppConfiguration GetDefaultConfiguration() {
            return new ImagesAppConfig { Name = "Default", Json = new JObject()};
        }

        #endregion 

        public Section Section { get; set; }

        public bool IntegrationMode { get; set; }
        public ICompositeAppInstance ParentApp { get; set; }
        public int DisplayMode { get; set; }

        public ThumbNailImageInfo ThumbNailImage { get; set; }
        public int TilesNumInEachBlockRow { get; set; }
        public int TilesNumInEachBlockCol { get; set; }
        
        public TilesInfo[,] Tiles { get; set; }
        public int ImageNaturalWidth { get; set; } // natural size of the origin image
        public int ImageNaturalHeight { get; set; }
        public int TileWidth { get; set; } // size of each tile 1:1 to the origin image without any zooming
        public int TileHeight { get; set; }
        public int TileCols { get; set; } // cols of tiles including those not displayed
        public int TileRows { get; set; } // rows of tiles including those not displayed

        private const string IMAGES_DIR = "~/Web/Images/images/";
        private static string IMAGES_PATH;

        public void Init()
        {
            this.DisplayMode = (int)Mode.FIT;

            this.ThumbNailImage = null;
            this.TilesNumInEachBlockRow = 3;
            this.TilesNumInEachBlockCol = 3;
            this.Tiles = null;

            if (this.Configuration.ImageNameDigit != null)
            {
                FindImageData(this.Configuration.ImageNameDigit);
            }
            else
            {
                this.Configuration.ImageNameDigit = "";
                this.Configuration.Rotate = 0;
                this.Configuration.DisplayRegion = new DisplayRegionInfo();
                this.Configuration.DisplayBlock = new DisplayBlockInfo(Section.Cols, Section.Rows);
            }
            IMAGES_PATH = HttpContext.Current.Server.MapPath(IMAGES_DIR);
            Directory.CreateDirectory(IMAGES_PATH);
        }

        public static void SaveImage(string filename, HttpPostedFileBase file)
        {
            Directory.CreateDirectory(IMAGES_PATH); // This shouldn't be needed
            var path = IMAGES_PATH + filename;
            file.SaveAs(path);
        }

        /// <summary>
        /// Post-save processing of image
        /// </summary>
        /// <param name="imageName"></param>
        /// <returns>digits</returns>
        public string ProcessImage(string imageName)
        {
            Configuration.ImageName = imageName;
            Configuration.ImageNameDigit = GenerateImageDigits();

            String basePath = HttpContext.Current.Server.MapPath(IMAGES_DIR);
            String path1 = basePath + Configuration.ImageName;
            String path2 = basePath + Configuration.ImageNameDigit + "\\origin.png";
            Directory.CreateDirectory(basePath + Configuration.ImageNameDigit);
            Image img1 = Image.FromFile(path1);
            img1.Save(path2, ImageFormat.Png);
            img1.Dispose();
            Log.Info("Generated id " + Configuration.ImageNameDigit + " for a new uploaded image");

            // log to index file
            String indexFile = HttpContext.Current.Server.MapPath("~/Web/Images/images/Database.txt");
            File.AppendAllLines(indexFile, new[] { Configuration.ImageName + "|" + Configuration.ImageNameDigit });

            return Configuration.ImageNameDigit;
        }

        private string GenerateImageDigits()
        {
            using (var md5 = MD5.Create())
            {
                using (var file = File.OpenRead(IMAGES_PATH + Configuration.ImageName))
                {
                    var sum = md5.ComputeHash(file);
                    return BitConverter.ToString(sum).Replace("-", "").ToLowerInvariant();
                }
            }
        }

        private void FindImageData(string digits)
        {
            if (digits == "" || !Directory.Exists(IMAGES_PATH + digits))
            {
                return;
            }
            string[] lines = File.ReadAllLines(IMAGES_PATH + this.Configuration.ImageNameDigit + "\\config.txt");
            if (lines.Length != 9)
            {
                return;
            }
            this.Configuration.ImageName = lines[1];
            this.ImageNaturalWidth = Convert.ToInt32(lines[3]);
            this.ImageNaturalHeight = Convert.ToInt32(lines[4]);
            this.TileWidth = Convert.ToInt32(lines[5]);
            this.TileHeight = Convert.ToInt32(lines[6]);
            this.TileCols = Convert.ToInt32(lines[7]);
            this.TileRows = Convert.ToInt32(lines[8]);
            this.ThumbNailImage = null;
            this.Tiles = new TilesInfo[this.TileCols, this.TileRows];
            for (int i = 0; i < this.TileCols; i++)
            {
                for (int j = 0; j < this.TileRows; j++)
                {
                    this.Tiles[i, j] = new TilesInfo
                    {
                        left = i * this.TileWidth,
                        top = j * this.TileHeight,
                        cols = i,
                        rows = j
                    };
                }
            }
        }

        public List<ImageList> GetDatabase() {
            string databasePath = HttpContext.Current.Server.MapPath("~/Web/Images/Images/Database.txt");
            if (File.Exists(databasePath)) {
                var images = File.ReadAllLines(databasePath).Where(l => !string.IsNullOrWhiteSpace(l)).Select(l => {
                    var res = l.Split(new[] {"|"}, StringSplitOptions.None);
                    return new ImageList {Id = res[1], Name = res[0]};
                }).ToList();
                // allow filtering of the image list
                if (!string.IsNullOrWhiteSpace(this.Configuration.ImageListFilter)) {
                    Log.Info("filtering image list to "+this.Configuration.ImageListFilter);
                    images = images.Where(i => i.Name.Contains(this.Configuration.ImageListFilter)).ToList();
                }

                return images;
            }
            return new List<ImageList>();
        }

        /// <summary>
        /// downloads an image to the image directory giving it a new guid name 
        /// save the uri in the config 
        /// </summary>
        /// <param name="uri">The URI.</param>
        /// <param name="liveLink">if set to <c>true</c> [update on load].</param>
        /// <returns>
        /// success or errors
        /// </returns>
        public string DownloadLoadFromURI( string uri, bool liveLink = false) {
            try {
                var filename = Guid.NewGuid() + ".png";

                Log.Info("Images App - downloading image from "+uri);
                Directory.CreateDirectory(IMAGES_PATH); // This should not be necessary
                var savePath = IMAGES_PATH + filename;

                //download the image and save as a PNG
                using (WebClient webClient = new WebClient()) {
                    byte[] data = webClient.DownloadData(uri);

                    using (MemoryStream mem = new MemoryStream(data)) {
                        using (var image = Image.FromStream(mem)) {
                            image.Save(savePath, ImageFormat.Png);
                        }
                    }

                }
                this.Configuration.ImageName = filename;
                this.Configuration.Uri = uri;
                this.Configuration.LiveUri = liveLink;
            }catch (Exception e) {
                var message = "Images App failed to load from URI " +e;
                Log.Error(message);
                return message;
            }
            return "success";
        }
    }
}