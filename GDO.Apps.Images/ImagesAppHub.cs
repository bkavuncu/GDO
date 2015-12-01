using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;
using GDO.Utility;
using Newtonsoft.Json;

//[assembly: System.Web.UI.WebResource("GDO.Apps.Images.Scripts.imagetiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.Images.Configurations.sample.js", "application/json")]

namespace GDO.Apps.Images
{
    [Export(typeof(IAppHub))]
    public class ImagesAppHub : Hub, IBaseAppHub
    {
        public string Name { get; set; } = "Images";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
        public Type InstanceType { get; set; } = new ImagesApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void ProcessImage(int instanceId, string imageName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    
                    ia.ImageName = imageName;

                    Clients.Caller.setMessage("Generating random id for the image...");
                    String basePath = System.Web.HttpContext.Current.Server.MapPath("~/Web/Images/images/");
                    String path1 = basePath + ia.ImageName;
                    Random imgDigitGenerator = new Random();
                    while (Directory.Exists(basePath + ia.ImageNameDigit))
                    {
                        ia.ImageNameDigit = imgDigitGenerator.Next(10000, 99999).ToString();
                    }
                    Clients.Caller.setDigitText(ia.ImageNameDigit);
                    String path2 = basePath + ia.ImageNameDigit + "\\origin.png";
                    Directory.CreateDirectory(basePath + ia.ImageNameDigit);
                    Image img1 = Image.FromFile(path1);
                    img1.Save(path2, ImageFormat.Png);
                    img1.Dispose();
                    //File.Move(path1, path2);

                    // log to index file  
                    String indexFile = HttpContext.Current.Server.MapPath("~/Web/Images/images/Database.txt");
                    File.AppendAllLines(indexFile, new[] { ia.ImageName + "|" + ia.ImageNameDigit });


                    Clients.Caller.setMessage("Loading the image and creating thumbnail...");
                    //create origin
                    Image originImage = Image.FromFile(path2);
                    Image image = null;
                    if (originImage.Height > originImage.Width) {
                        originImage.RotateFlip(RotateFlipType.Rotate90FlipNone);
                        image = originImage;
                    } else {
                        image = originImage;
                    }
                    
                    //image.Save(basePath + ImageNameDigit + "\\origin.png", ImageFormat.Png);
                    //File.Delete(path1);

                    //create thumnail
                    Image thumb = image.GetThumbnailImage(150 * image.Width / image.Height, 150, () => false, IntPtr.Zero);
                    thumb.Save(basePath + ia.ImageNameDigit + "\\thumb.png", ImageFormat.Png);
                    thumb.Dispose();

                    ia.ImageNaturalWidth = image.Width;
                    ia.ImageNaturalHeight = image.Height;

                    Clients.Caller.setMessage("Resizing the image to FIT/FILL the screen...");
                    double scaleWidth = (ia.Section.Width + 0.000) / image.Width;
                    double scaleHeight = (ia.Section.Height + 0.000) / image.Height;

                    int totalTilesNumCols = ia.Section.Cols * ia.TilesNumInEachBlockCol; // default 3*3=9 tiles in each block
                    int totalTilesNumRows = ia.Section.Rows * ia.TilesNumInEachBlockRow; 
                    if (scaleWidth > scaleHeight)
                    {
                        ia.TileWidth = (image.Width - 1) / totalTilesNumCols + 1; // ceiling
                        ia.TileHeight = (ia.TileWidth * (ia.Section.Height / totalTilesNumRows) - 1) / (ia.Section.Width / totalTilesNumCols) + 1;
                        ia.TileCols = totalTilesNumCols;
                        ia.TileRows = Math.Max(totalTilesNumRows, (image.Height - 1) / ia.TileHeight + 1); // ceiling
                    }
                    else
                    {
                        ia.TileHeight = (image.Height - 1) / totalTilesNumRows + 1; // ceiling
                        ia.TileWidth = (ia.TileHeight * (ia.Section.Width / totalTilesNumCols) - 1) / (ia.Section.Height / totalTilesNumRows) + 1; // ceiling and keep ratio
                        ia.TileCols = Math.Max(totalTilesNumCols, (image.Width - 1) / ia.TileWidth + 1); // ceiling
                        ia.TileRows = totalTilesNumRows;
                    }
                    int sum = ia.TileCols*ia.TileRows;
                    // if too many tiles
                    if (sum > 1000) {
                        totalTilesNumCols = Math.Max(ia.Section.Cols * ia.TilesNumInEachBlockCol / (sum/1000 + 1), 1);
                        totalTilesNumRows = Math.Max(ia.Section.Rows * ia.TilesNumInEachBlockRow / (sum/1000 + 1), 1); 
                        if (scaleWidth > scaleHeight)
                        {
                            ia.TileWidth = (image.Width - 1) / totalTilesNumCols + 1; // ceiling
                            ia.TileHeight = (ia.TileWidth * (ia.Section.Height / totalTilesNumRows) - 1) / (ia.Section.Width / totalTilesNumCols) + 1;
                            ia.TileCols = totalTilesNumCols;
                            ia.TileRows = Math.Max(totalTilesNumRows, (image.Height - 1) / ia.TileHeight + 1); // ceiling
                        }
                        else
                        {
                            ia.TileHeight = (image.Height - 1) / totalTilesNumRows + 1; // ceiling
                            ia.TileWidth = (ia.TileHeight * (ia.Section.Width / totalTilesNumCols) - 1) / (ia.Section.Height / totalTilesNumRows) + 1; // ceiling and keep ratio
                            ia.TileCols = Math.Max(totalTilesNumCols, (image.Width - 1) / ia.TileWidth + 1); // ceiling
                            ia.TileRows = totalTilesNumRows;
                        }
                        sum = ia.TileCols*ia.TileRows;
                    }
                    
                    Clients.Caller.setMessage("Cropping the image...");
                    ia.Tiles = new ImagesApp.TilesInfo[ia.TileCols, ia.TileRows];
                    //for (int i = 0; i < ia.TileCols; i++)
                    Parallel.For(0,ia.TileCols, i=> 
                    {
                        for (int j = 0; j < ia.TileRows; j++) {
                            int tileID = i*ia.TileRows + j;
                            Clients.Caller.setMessage("Cropping the image " + tileID.ToString() + "/" + sum.ToString());
                            ia.Tiles[i, j] = new ImagesApp.TilesInfo();
                            Image curTile = new Bitmap(ia.TileWidth, ia.TileHeight);
                            Graphics graphics = Graphics.FromImage(curTile);
                            graphics.DrawImage(image,
                                new Rectangle(0, 0, ia.TileWidth, ia.TileHeight),
                                new Rectangle(i * ia.TileWidth, j * ia.TileHeight, ia.TileWidth, ia.TileHeight),
                                GraphicsUnit.Pixel);
                            graphics.Dispose();
                            path2 = basePath + ia.ImageNameDigit + "\\" + "crop" + @"_" + i + @"_" + j + @".png";
                            ia.Tiles[i, j].left = i * ia.TileWidth;
                            ia.Tiles[i, j].top = j * ia.TileHeight;
                            ia.Tiles[i, j].cols = i;
                            ia.Tiles[i, j].rows = j;
                            curTile.Save(path2, ImageFormat.Png);
                        }
                    });
                    originImage.Dispose();
                    image.Dispose();
                    ia.ThumbNailImage = null;
                    using (StreamWriter file = new StreamWriter(basePath + ia.ImageNameDigit + "\\config.txt")) 
                    {
                        file.WriteLine("//ImageName ImageNameDigit ImageNaturalWidth ImageNaturalHeight TileWidth TileHeight TileCols TileRows");
                        file.WriteLine(ia.ImageName);
                        file.WriteLine(ia.ImageNameDigit);
                        file.WriteLine(ia.ImageNaturalWidth);
                        file.WriteLine(ia.ImageNaturalHeight);
                        file.WriteLine(ia.TileWidth);
                        file.WriteLine(ia.TileHeight);
                        file.WriteLine(ia.TileCols);
                        file.WriteLine(ia.TileRows);
                    }
                    Clients.Caller.setMessage("Sending results...");
                    SendImageNames(instanceId, ia.ImageName, ia.ImageNameDigit);
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void SendImageNames(int instanceId, string imageName, string imageNameDigit)
        {
            try
            {
                Clients.Group("" + instanceId).receiveImageName(imageName, imageNameDigit);
                //Clients.Caller.receiveImageName(imageName, imageNameDigit);
                Clients.Caller.reloadIFrame();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                Clients.Caller.setMessage(e.GetType().ToString());
            }
        }

        public void FindDigits(int instanceId, string digits) 
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Finding image digits " + digits);
                    String basePath = HttpContext.Current.Server.MapPath("~/Web/Images/images/");
                    if (digits == "" || !Directory.Exists(basePath + digits)) {
                        Clients.Caller.setMessage("Digits not found! Please upload a new image!");
                        return; 
                    }
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    ia.ImageNameDigit = digits;
                    Clients.Caller.setMessage("Digits found! Initializing image configuration...");
                    string[] lines = File.ReadAllLines(basePath + ia.ImageNameDigit + "\\config.txt");
                    if (lines.Length != 9) {
                        Clients.Caller.setMessage("Configuration file damaged! Please upload a new image!");
                        return;
                    }
                    ia.ImageName = lines[1];
                    ia.ImageNaturalWidth = Convert.ToInt32(lines[3]);
                    ia.ImageNaturalHeight = Convert.ToInt32(lines[4]);
                    ia.TileWidth = Convert.ToInt32(lines[5]);
                    ia.TileHeight = Convert.ToInt32(lines[6]);
                    ia.TileCols = Convert.ToInt32(lines[7]);
                    ia.TileRows = Convert.ToInt32(lines[8]);
                    ia.ThumbNailImage = null;
                    ia.Tiles = new ImagesApp.TilesInfo[ia.TileCols, ia.TileRows];
                    for (int i = 0; i < ia.TileCols; i++)
                    {
                        for (int j = 0; j < ia.TileRows; j++)
                        {
                            ia.Tiles[i, j] = new ImagesApp.TilesInfo {
                                left = i*ia.TileWidth,
                                top = j*ia.TileHeight,
                                cols = i,
                                rows = j
                            };
                        }
                    }
                    Clients.Caller.setDigitText(ia.ImageNameDigit);
                    SendImageNames(instanceId, ia.ImageName, ia.ImageNameDigit);
                    Clients.Caller.setMessage("Initialized image Successfully!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestImageName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting image name...");
                    if (((ImagesApp) Cave.Apps["Images"].Instances[instanceId]).ImageName != null)
                    {
                        Clients.Caller.receiveImageName(
                            ((ImagesApp) Cave.Apps["Images"].Instances[instanceId]).ImageName,
                            ((ImagesApp) Cave.Apps["Images"].Instances[instanceId]).ImageNameDigit);
                        Clients.Caller.setDigitText(((ImagesApp) Cave.Apps["Images"].Instances[instanceId]).ImageNameDigit);
                        Clients.Caller.setMessage("Request image name Successfully!");
                    }
                    else
                    {
                        Clients.Caller.setMessage("The image name is empty! Please upload a new image.");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        /*
        public void SetDisplayMode(int instanceId, int displaymode)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Updating display mode...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    ia.DisplayMode = displaymode;
                    Clients.Caller.setMessage("Update display mode Successfully!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestDisplayMode(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting display mode...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    Clients.Caller.receiveDisplayMode(ia.DisplayMode);
                    Clients.Caller.setMessage("Request display mode Successfully!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }
        */

        public void SetThumbNailImageInfo(int instanceId, string imageInfo)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Updating thumbnail image information...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    ia.ThumbNailImage = JsonConvert.DeserializeObject<ImagesApp.ThumbNailImageInfo>(imageInfo);
                    ia.Rotate = Convert.ToInt32(ia.ThumbNailImage.imageData.rotate);
                    double ratio = ia.ImageNaturalWidth / (ia.ThumbNailImage.imageData.width + 0.0);
                    double tl = 0.0, tt = 0.0, tw = 0.0, th = 0.0;
                    // compute display region info
                    if (ia.Rotate == 0) {
                        tl = ia.ThumbNailImage.cropboxData.left - ia.ThumbNailImage.canvasData.left;
                        tt = ia.ThumbNailImage.cropboxData.top - ia.ThumbNailImage.canvasData.top;
                        tw = ia.ThumbNailImage.cropboxData.width;
                        th = ia.ThumbNailImage.cropboxData.height;
                    } else if (ia.Rotate == 90) {
                        tl = ia.ThumbNailImage.cropboxData.top - ia.ThumbNailImage.canvasData.top;
                        tt = ia.ThumbNailImage.canvasData.left + ia.ThumbNailImage.canvasData.width -
                             ia.ThumbNailImage.cropboxData.left - ia.ThumbNailImage.cropboxData.width;
                        tw = ia.ThumbNailImage.cropboxData.height;
                        th = ia.ThumbNailImage.cropboxData.width;
                    } else if (ia.Rotate == 180) {
                        tl = ia.ThumbNailImage.canvasData.left + ia.ThumbNailImage.canvasData.width -
                             ia.ThumbNailImage.cropboxData.left - ia.ThumbNailImage.cropboxData.width;
                        tt = ia.ThumbNailImage.canvasData.top + ia.ThumbNailImage.canvasData.height -
                             ia.ThumbNailImage.cropboxData.top - ia.ThumbNailImage.cropboxData.height;
                        tw = ia.ThumbNailImage.cropboxData.width;
                        th = ia.ThumbNailImage.cropboxData.height;
                    } else { // ia.Rotate == 270
                        tl = ia.ThumbNailImage.canvasData.top + ia.ThumbNailImage.canvasData.height -
                             ia.ThumbNailImage.cropboxData.top - ia.ThumbNailImage.cropboxData.height;
                        tt = ia.ThumbNailImage.cropboxData.left - ia.ThumbNailImage.canvasData.left;
                        tw = ia.ThumbNailImage.cropboxData.height;
                        th = ia.ThumbNailImage.cropboxData.width;
                    }
                    ia.DisplayRegion.left = Convert.ToInt32(Math.Floor(ratio * tl));
                    ia.DisplayRegion.top = Convert.ToInt32(Math.Floor(ratio * tt));
                    ia.DisplayRegion.width = Convert.ToInt32(Math.Ceiling(ratio * tw));
                    ia.DisplayRegion.height = Convert.ToInt32(Math.Ceiling(ratio * th));

                    // compute each screen block and related tiles info
                    int blockImageWidth = 0, blockImageHeight = 0;
                    double displayRatio = 0;
                    if (ia.Rotate == 0 || ia.Rotate == 180) {
                        blockImageWidth = (ia.DisplayRegion.width - 1) / ia.Section.Cols + 1; //ceiling
                        blockImageHeight = (ia.DisplayRegion.height - 1) / ia.Section.Rows + 1; //ceiling
                        displayRatio = ia.Section.Height / (ia.DisplayRegion.height + 0.0);
                    } else {  // (ia.Rotate == 90 || ia.Rotate == 270) 
                        blockImageWidth = (ia.DisplayRegion.width - 1) / ia.Section.Rows + 1; //ceiling
                        blockImageHeight = (ia.DisplayRegion.height -1 )/ ia.Section.Cols + 1; //ceiling
                        displayRatio = ia.Section.Height / (ia.DisplayRegion.width + 0.0);
                    }

                    for (int i = 0 ; i < ia.Section.Cols ; i++) {
                        for (int j = 0 ; j < ia.Section.Rows ; j++) {
                            int di, dj;
                            if (ia.Rotate == 0) {
                                di = i; 
                                dj = j;
                            } else if (ia.Rotate == 90) {
                                di = j; 
                                dj = ia.Section.Cols - 1 - i;
                            } else if (ia.Rotate == 180) {
                                di = ia.Section.Cols - 1 - i; 
                                dj = ia.Section.Rows - 1 - j;
                            } else { //if (ia.Rotate == 270)
                                di = ia.Section.Rows - 1 - j; 
                                dj = i;
                            }
                            ia.BlockRegion[i, j].left = di * blockImageWidth + ia.DisplayRegion.left;
                            ia.BlockRegion[i, j].top = dj * blockImageHeight + ia.DisplayRegion.top;
                            ia.BlockRegion[i, j].width = blockImageWidth;
                            ia.BlockRegion[i, j].height = blockImageHeight;
                            int tileLeftTopCol = Math.Max(0, ia.BlockRegion[i, j].left / ia.TileWidth - 1);
                            int tileLeftTopRow = Math.Max(0, ia.BlockRegion[i, j].top / ia.TileHeight - 1);
                            int tileRightBottomCol = Math.Min(ia.TileCols - 1,
                                                          (ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width) / ia.TileWidth + 1);
                            int tileRightBottomRow = Math.Min(ia.TileRows - 1,
                                                          (ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height) / ia.TileHeight + 1);
                            int tilesNum = (tileRightBottomCol - tileLeftTopCol + 1) * (tileRightBottomRow - tileLeftTopRow + 1);
                            if (tilesNum <= 0) {
                                ia.BlockRegion[i, j].tiles = null;
                                continue;
                            }
                            ia.BlockRegion[i, j].tiles = new ImagesApp.DisplayTileInfo[tilesNum];
                            // traverse every tile that will be shown in this screen block
                            for (int ii = tileLeftTopCol ; ii <= tileRightBottomCol ; ii++) {
                                for (int jj = tileLeftTopRow ; jj <= tileRightBottomRow ; jj++) {
                                    if (ia.Rotate == 0) {
                                        tl = ia.Tiles[ii, jj].left - ia.BlockRegion[i, j].left;
                                        tt = ia.Tiles[ii, jj].top - ia.BlockRegion[i, j].top;
                                    } else if (ia.Rotate == 90) {
                                        tl = ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height -
                                             ia.Tiles[ii, jj].top;
                                        tt = ia.Tiles[ii, jj].left - ia.BlockRegion[i, j].left;
                                    } else if (ia.Rotate == 180) {
                                        tl = ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width -
                                             ia.Tiles[ii, jj].left;
                                        tt = ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height -
                                             ia.Tiles[ii, jj].top;
                                    } else { // ia.Rotate == 270
                                        tl = ia.Tiles[ii, jj].top - ia.BlockRegion[i, j].top;
                                        tt = ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width -
                                             ia.Tiles[ii, jj].left;
                                    }
                                    tw = ia.TileWidth;
                                    th = ia.TileHeight;
                                    int rank = (ii - tileLeftTopCol) * (tileRightBottomRow - tileLeftTopRow + 1) + 
                                               (jj - tileLeftTopRow); 
                                    ia.BlockRegion[i, j].tiles[rank] = new ImagesApp.DisplayTileInfo();
                                    ia.BlockRegion[i, j].tiles[rank].tileIdCol = ii;
                                    ia.BlockRegion[i, j].tiles[rank].tileIdRow = jj;
                                    ia.BlockRegion[i, j].tiles[rank].displayLeft = Convert.ToInt32(Math.Floor(displayRatio * tl));
                                    ia.BlockRegion[i, j].tiles[rank].displayTop = Convert.ToInt32(Math.Floor(displayRatio * tt));
                                    ia.BlockRegion[i, j].tiles[rank].displayWidth = Convert.ToInt32(Math.Ceiling(displayRatio * tw));
                                    ia.BlockRegion[i, j].tiles[rank].displayHeight = Convert.ToInt32(Math.Ceiling(displayRatio * th));
                                }
                            }
                        }
                    }
                    Clients.Group("" + instanceId).tilesReady();
                    Clients.Caller.setMessage("Updated thumbnail image information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestTilesInfo(int instanceId, int col, int row)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting tiles information...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    if (ia.BlockRegion[col, row].tiles != null)
                        Clients.Caller.setTiles(ia.ImageNameDigit, ia.Rotate, ia.Section.Width / ia.Section.Cols, ia.Section.Height / ia.Section.Rows, JsonConvert.SerializeObject(ia.BlockRegion[col, row].tiles));
                    else
                        Clients.Caller.setTiles(ia.ImageNameDigit, ia.Rotate, ia.Section.Width / ia.Section.Cols, ia.Section.Height / ia.Section.Rows, "");
                    Clients.Caller.setMessage("Requested tiles information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestThumbNailImageInfo(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting thumbnail image information...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    if (ia.ThumbNailImage != null)
                    {
                        Clients.Caller.setThumbNailImageInfo(JsonConvert.SerializeObject(ia.ThumbNailImage));
                    }
                    else
                    {
                        Clients.Caller.setThumbNailImageInfo(null);
                    }
                    
                    Clients.Caller.setMessage("Requested thumbnail image information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestSectionSize(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting section information...");
                    ImagesApp ia = (ImagesApp) Cave.Apps["Images"].Instances[instanceId];
                    Clients.Caller.getSectionSize(ia.Section.Width, ia.Section.Height);
                    Clients.Caller.setMessage("Requested section information Success!");
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