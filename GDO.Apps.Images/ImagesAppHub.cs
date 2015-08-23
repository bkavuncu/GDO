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
    public class ImagesAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "Images";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
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
                    String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\Images\images\\";
                    String path1 = basePath + ia.ImageName;
                    Random imgDigitGenerator = new Random();
                    while (Directory.Exists(basePath + ia.ImageNameDigit))
                    {
                        ia.ImageNameDigit = imgDigitGenerator.Next(10000, 99999).ToString();
                    }
                    String path2 = basePath + ia.ImageNameDigit + "\\origin.png";
                    Directory.CreateDirectory(basePath + ia.ImageNameDigit);
                    Image img1 = Image.FromFile(path1);
                    img1.Save(path2, ImageFormat.Png);
                    //File.Move(path1, path2);

                    Clients.Caller.setMessage("Loading the image and creating thumnail...");
                    //create origin
                    Image image = Image.FromFile(path2);
                    //image.Save(basePath + ImageNameDigit + "\\origin.png", ImageFormat.Png);
                    //File.Delete(path1);

                    //create thumnail
                    Image thumb = image.GetThumbnailImage(500 * image.Width / image.Height, 500, () => false, IntPtr.Zero);
                    thumb.Save(basePath + ia.ImageNameDigit + "\\thumb.png", ImageFormat.Png);

                    ia.ImageNaturalWidth = image.Width;
                    ia.ImageNaturalHeight = image.Height;

                    Clients.Caller.setMessage("Resizing the image to FIT/FILL the screen...");
                    double scaleWidth = (ia.Section.Width + 0.000) / image.Width;
                    double scaleHeight = (ia.Section.Height + 0.000) / image.Height;

                    int totalTilesNumCols = ia.Section.Cols * ia.TilesNumInEachBlockCol;
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

                    Clients.Caller.setMessage("Cropping the image...");
                    ia.Tiles = new ImagesApp.TilesInfo[ia.TileCols, ia.TileRows];
                    int sum = ia.TileCols*ia.TileRows;
                    int cur = 0;
                    for (int i = 0; i < ia.TileCols; i++)
                    {
                        for (int j = 0; j < ia.TileRows; j++)
                        {
                            Clients.Caller.setMessage("Cropping the image " + cur.ToString() + "/" + sum.ToString());
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
                            cur ++;
                        }
                    }
                    ia.ThumbNailImage = null;
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
                    double ratio = ia.ImageNaturalWidth / ia.ThumbNailImage.imageData.width;
                    double tl = 0, tt = 0, tw = 0, th = 0;
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
                    } else if (ia.Rotate == 270) {
                        tl = ia.ThumbNailImage.canvasData.top + ia.ThumbNailImage.canvasData.height -
                             ia.ThumbNailImage.cropboxData.top - ia.ThumbNailImage.cropboxData.height;
                        tt = ia.ThumbNailImage.cropboxData.left - ia.ThumbNailImage.canvasData.left;
                        tw = ia.ThumbNailImage.cropboxData.height;
                        th = ia.ThumbNailImage.cropboxData.width;
                    }
                    ia.DisplayRegion.left = Convert.ToInt32(ratio * tl);
                    ia.DisplayRegion.top = Convert.ToInt32(ratio * tt);
                    ia.DisplayRegion.width = Convert.ToInt32(ratio * tw);
                    ia.DisplayRegion.height = Convert.ToInt32(ratio * th);

                    // compute each screen block and related tiles info
                    int blockImageWidth = 0, blockImageHeight = 0;
                    double displayRatio = 0;
                    if (ia.Rotate == 0 || ia.Rotate == 180) {
                        blockImageWidth = ia.DisplayRegion.width / ia.Section.Cols;
                        blockImageHeight = ia.DisplayRegion.height / ia.Section.Rows;
                        displayRatio = ia.Section.Height / ia.DisplayRegion.height;
                    } else if (ia.Rotate == 90 || ia.Rotate == 270) {
                        blockImageWidth = ia.DisplayRegion.width / ia.Section.Rows;
                        blockImageHeight = ia.DisplayRegion.height / ia.Section.Cols;
                        displayRatio = ia.Section.Height / ia.DisplayRegion.width;
                    }

                    int tileLeftTopCol, tileLeftTopRow; // can be smaller than 0 because of buffer & blank region
                    int tileRightBottomCol, tileRightBottomRow; // can exceed tiles[,] index because of buffer & blank region
                    for (int i = 0 ; i < ia.Section.Cols ; i++) {
                        for (int j = 0 ; j < ia.Section.Rows ; j++) {
                            ia.BlockRegion[i, j].left = i * blockImageWidth;
                            ia.BlockRegion[i, j].top = j * blockImageHeight;
                            ia.BlockRegion[i, j].width = blockImageWidth;
                            ia.BlockRegion[i, j].height = blockImageHeight;
                            tileLeftTopCol = Math.Max(0, ia.BlockRegion[i, j].left / ia.TileWidth - 1);
                            tileLeftTopRow = Math.Max(0, ia.BlockRegion[i, j].top / ia.TileHeight - 1);
                            tileRightBottomCol = Math.Min(ia.TileCols - 1,
                                                          (ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width) / ia.TileWidth + 1);
                            tileRightBottomRow = Math.Min(ia.TileRows - 1,
                                                          (ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height) / ia.TileHeight + 1);
                            for (int ii = tileLeftTopCol ; ii <= tileRightBottomCol ; ii++) {
                                for (int jj = tileLeftTopRow ; jj <= tileRightBottomRow ; jj++) {
                                    if (ia.Rotate == 0) {
                                        tl = ia.Tiles[ii, jj].left - ia.BlockRegion[i, j].left;
                                        tt = ia.Tiles[ii, jj].top - ia.BlockRegion[i, j].top;
                                        tw = ia.TileWidth;
                                        th = ia.TileHeight;
                                    } else if (ia.Rotate == 90) {
                                        tl = ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height -
                                             ia.Tiles[ii, jj].top - ia.TileHeight;
                                        tt = ia.Tiles[ii, jj].left - ia.BlockRegion[i, j].left;
                                        tw = ia.TileHeight;
                                        th = ia.TileWidth;
                                    } else if (ia.Rotate == 180) {
                                        tl = ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width -
                                             ia.Tiles[ii, jj].left - ia.TileWidth;
                                        tt = ia.BlockRegion[i, j].top + ia.BlockRegion[i, j].height -
                                             ia.Tiles[ii, jj].top - ia.TileHeight;
                                        tw = ia.TileWidth;
                                        th = ia.TileHeight;
                                    } else if (ia.Rotate == 270) {
                                        tl = ia.Tiles[ii, jj].top - ia.BlockRegion[i, j].top;
                                        tt = ia.BlockRegion[i, j].left + ia.BlockRegion[i, j].width -
                                             ia.Tiles[ii, jj].left - ia.TileWidth;
                                        tw = ia.TileHeight;
                                        th = ia.TileWidth;
                                    }
                                    ia.Tiles[ii, jj].displayLeft = Convert.ToInt32(displayRatio * tl);
                                    ia.Tiles[ii, jj].displayTop = Convert.ToInt32(displayRatio * tt);
                                    ia.Tiles[ii, jj].displayWidth = Convert.ToInt32(displayRatio * tw);
                                    ia.Tiles[ii, jj].displayHeight = Convert.ToInt32(displayRatio * th);
                                }
                            }
                        }
                    }
                    Clients.Caller.setMessage("Updated thumbnail image information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestThumNailImageInfo(int instanceId)
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