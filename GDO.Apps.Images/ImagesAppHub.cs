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

        public void ChangeImageName(int instanceId, string imageName)
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
                    Image thumb = image.GetThumbnailImage(200 * image.Width / image.Height, 200, () => false, IntPtr.Zero);
                    thumb.Save(basePath + ia.ImageNameDigit + "\\thumb.png", ImageFormat.Png);


                    Clients.Caller.setMessage("Resizing the image to FIT/FILL the screen...");
                    double scaleWidth = (ia.Section.Width + 0.000) / image.Width;
                    double scaleHeight = (ia.Section.Height + 0.000) / image.Height;
                    int imageScaledWidth;
                    int imageScaledHeight;

                    int tempImageCols;
                    int tempImageRows;

                    if (scaleWidth > scaleHeight && ia.DisplayMode == (int)Mode.FILL ||
                        scaleWidth < scaleHeight && ia.DisplayMode == (int)Mode.FIT)
                    {
                        imageScaledWidth = (image.Width - 1) / ia.Section.Cols + 1; // ceiling
                        imageScaledHeight = (imageScaledWidth * (ia.Section.Height / ia.Section.Rows) - 1) / (ia.Section.Width / ia.Section.Cols) + 1;
                        tempImageCols = ia.Section.Cols;
                        tempImageRows = Math.Max(ia.Section.Rows, (image.Height - 1) / imageScaledHeight + 1); // ceiling
                    }
                    else
                    {
                        imageScaledHeight = (image.Height - 1) / ia.Section.Rows + 1; // ceiling
                        imageScaledWidth = (imageScaledHeight * (ia.Section.Width / ia.Section.Cols) - 1) / (ia.Section.Height / ia.Section.Rows) + 1; // ceiling and keep ratio
                        tempImageCols = Math.Max(ia.Section.Cols, (image.Width - 1) / imageScaledWidth + 1); // ceiling
                        tempImageRows = ia.Section.Rows;
                    }

                    Clients.Caller.setMessage("Cropping the image...");
                    ia.Tiles = new Image[tempImageCols, tempImageRows];
                    int sum = tempImageCols*tempImageRows;
                    int cur = 0;
                    for (int i = 0; i < tempImageCols; i++)
                    {
                        for (int j = 0; j < tempImageRows; j++)
                        {
                            Clients.Caller.setMessage("Cropping the image " + cur.ToString() + "/" + sum.ToString());
                            ia.Tiles[i, j] = new Bitmap((ia.Section.Width / ia.Section.Cols), (ia.Section.Height / ia.Section.Rows));
                            Graphics graphics = Graphics.FromImage(ia.Tiles[i, j]);
                            graphics.DrawImage(image,
                                new Rectangle(0, 0, (ia.Section.Width / ia.Section.Cols), (ia.Section.Height / ia.Section.Rows)),
                                new Rectangle(i * imageScaledWidth, j * imageScaledHeight, imageScaledWidth, imageScaledHeight),
                                GraphicsUnit.Pixel);
                            graphics.Dispose();
                            path2 = basePath + ia.ImageNameDigit + "\\" + "crop" + @"_" + i + @"_" + j + @".png";
                            ia.Tiles[i, j].Save(path2, ImageFormat.Png);
                            cur ++;
                        }
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
    }
}