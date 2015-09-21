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

//[assembly: System.Web.UI.WebResource("GDO.Apps.BitCoin.Scripts.BitCointiles.js", "application/x-javascript")]
//[assembly: System.Web.UI.WebResource("GDO.Apps.BitCoin.Configurations.sample.js", "application/json")]

namespace GDO.Apps.BitCoin
{
    enum Mode {
        FILL = 1,
        FIT = 0
    };

    [Export(typeof(IAppHub))]
    public class BitCoinsAppHub : Hub, IAppHub
    {
        public string Name { get; set; } = "BitCoins";
        public int P2PMode { get; set; } = (int)Cave.P2PModes.Neighbours;
        public Type InstanceType { get; set; } = new BitCoinsApp().GetType();
        public void JoinGroup(int instanceId)
        {
            Groups.Add(Context.ConnectionId, "" + instanceId);
        }
        public void ExitGroup(int instanceId)
        {
            Groups.Remove(Context.ConnectionId, "" + instanceId);
        }

        public void ProcessBitCoin(int instanceId, string BitCoinName)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void SendBitCoinNames(int instanceId, string BitCoinName, string BitCoinNameDigit)
        {
            try
            {
                Clients.Group("" + instanceId).receiveBitCoinName(BitCoinName, BitCoinNameDigit);
                //Clients.Caller.receiveBitCoinName(BitCoinName, BitCoinNameDigit);
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
                    Clients.Caller.setMessage("Finding BitCoin digits " + digits);
                    String basePath = System.Web.HttpContext.Current.Server.MapPath("~/") + @"\Web\BitCoins\BitCoins\\";
                    if (digits == "" || !Directory.Exists(basePath + digits)) {
                        Clients.Caller.setMessage("Digits not found! Please upload a new BitCoin!");
                        return; 
                    }
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
                    ia.BitCoinNameDigit = digits;
                    Clients.Caller.setMessage("Digits found! Initializing BitCoin configuration...");
                    string[] lines = System.IO.File.ReadAllLines(basePath + ia.BitCoinNameDigit + "\\config.txt");
                    if (lines.Length != 9) {
                        Clients.Caller.setMessage("Configuration file damaged! Please upload a new BitCoin!");
                        return;
                    }
                    ia.BitCoinName = lines[1];
                    ia.BitCoinNaturalWidth = Convert.ToInt32(lines[3]);
                    ia.BitCoinNaturalHeight = Convert.ToInt32(lines[4]);
                    ia.TileWidth = Convert.ToInt32(lines[5]);
                    ia.TileHeight = Convert.ToInt32(lines[6]);
                    ia.TileCols = Convert.ToInt32(lines[7]);
                    ia.TileRows = Convert.ToInt32(lines[8]);
                    ia.ThumbNailBitCoin = null;
                    ia.Tiles = new BitCoinsApp.TilesInfo[ia.TileCols, ia.TileRows];
                    for (int i = 0; i < ia.TileCols; i++)
                    {
                        for (int j = 0; j < ia.TileRows; j++)
                        {
                            ia.Tiles[i, j] = new BitCoinsApp.TilesInfo();
                            ia.Tiles[i, j].left = i * ia.TileWidth;
                            ia.Tiles[i, j].top = j * ia.TileHeight;
                            ia.Tiles[i, j].cols = i;
                            ia.Tiles[i, j].rows = j;
                        }
                    }
                    Clients.Caller.setDigitText(ia.BitCoinNameDigit);
                    SendBitCoinNames(instanceId, ia.BitCoinName, ia.BitCoinNameDigit);
                    Clients.Caller.setMessage("Initialized BitCoin Successfully!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestBitCoinName(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting BitCoin name...");
                    if (((BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId]).BitCoinName != null)
                    {
                        Clients.Caller.receiveBitCoinName(
                            ((BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId]).BitCoinName,
                            ((BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId]).BitCoinNameDigit);
                        Clients.Caller.setDigitText(((BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId]).BitCoinNameDigit);
                        Clients.Caller.setMessage("Request BitCoin name Successfully!");
                    }
                    else
                    {
                        Clients.Caller.setMessage("The BitCoin name is empty! Please upload a new BitCoin.");
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
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
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
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
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

        public void SetThumbNailBitCoinInfo(int instanceId, string BitCoinInfo)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Updating thumbnail BitCoin information...");
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
                    ia.ThumbNailBitCoin = JsonConvert.DeserializeObject<BitCoinsApp.ThumbNailBitCoinInfo>(BitCoinInfo);
                    ia.Rotate = Convert.ToInt32(ia.ThumbNailBitCoin.BitCoinData.rotate);
                    double ratio = ia.BitCoinNaturalWidth / (ia.ThumbNailBitCoin.BitCoinData.width + 0.0);
                    double tl = 0.0, tt = 0.0, tw = 0.0, th = 0.0;
                    // compute display region info
                    if (ia.Rotate == 0) {
                        tl = ia.ThumbNailBitCoin.cropboxData.left - ia.ThumbNailBitCoin.canvasData.left;
                        tt = ia.ThumbNailBitCoin.cropboxData.top - ia.ThumbNailBitCoin.canvasData.top;
                        tw = ia.ThumbNailBitCoin.cropboxData.width;
                        th = ia.ThumbNailBitCoin.cropboxData.height;
                    } else if (ia.Rotate == 90) {
                        tl = ia.ThumbNailBitCoin.cropboxData.top - ia.ThumbNailBitCoin.canvasData.top;
                        tt = ia.ThumbNailBitCoin.canvasData.left + ia.ThumbNailBitCoin.canvasData.width -
                             ia.ThumbNailBitCoin.cropboxData.left - ia.ThumbNailBitCoin.cropboxData.width;
                        tw = ia.ThumbNailBitCoin.cropboxData.height;
                        th = ia.ThumbNailBitCoin.cropboxData.width;
                    } else if (ia.Rotate == 180) {
                        tl = ia.ThumbNailBitCoin.canvasData.left + ia.ThumbNailBitCoin.canvasData.width -
                             ia.ThumbNailBitCoin.cropboxData.left - ia.ThumbNailBitCoin.cropboxData.width;
                        tt = ia.ThumbNailBitCoin.canvasData.top + ia.ThumbNailBitCoin.canvasData.height -
                             ia.ThumbNailBitCoin.cropboxData.top - ia.ThumbNailBitCoin.cropboxData.height;
                        tw = ia.ThumbNailBitCoin.cropboxData.width;
                        th = ia.ThumbNailBitCoin.cropboxData.height;
                    } else { // ia.Rotate == 270
                        tl = ia.ThumbNailBitCoin.canvasData.top + ia.ThumbNailBitCoin.canvasData.height -
                             ia.ThumbNailBitCoin.cropboxData.top - ia.ThumbNailBitCoin.cropboxData.height;
                        tt = ia.ThumbNailBitCoin.cropboxData.left - ia.ThumbNailBitCoin.canvasData.left;
                        tw = ia.ThumbNailBitCoin.cropboxData.height;
                        th = ia.ThumbNailBitCoin.cropboxData.width;
                    }
                    ia.DisplayRegion.left = Convert.ToInt32(Math.Floor(ratio * tl));
                    ia.DisplayRegion.top = Convert.ToInt32(Math.Floor(ratio * tt));
                    ia.DisplayRegion.width = Convert.ToInt32(Math.Ceiling(ratio * tw));
                    ia.DisplayRegion.height = Convert.ToInt32(Math.Ceiling(ratio * th));

                    // compute each screen block and related tiles info
                    int blockBitCoinWidth = 0, blockBitCoinHeight = 0;
                    double displayRatio = 0;
                    if (ia.Rotate == 0 || ia.Rotate == 180) {
                        blockBitCoinWidth = (ia.DisplayRegion.width - 1) / ia.Section.Cols + 1; //ceiling
                        blockBitCoinHeight = (ia.DisplayRegion.height - 1) / ia.Section.Rows + 1; //ceiling
                        displayRatio = ia.Section.Height / (ia.DisplayRegion.height + 0.0);
                    } else {  // (ia.Rotate == 90 || ia.Rotate == 270) 
                        blockBitCoinWidth = (ia.DisplayRegion.width - 1) / ia.Section.Rows + 1; //ceiling
                        blockBitCoinHeight = (ia.DisplayRegion.height -1 )/ ia.Section.Cols + 1; //ceiling
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
                            ia.BlockRegion[i, j].left = di * blockBitCoinWidth + ia.DisplayRegion.left;
                            ia.BlockRegion[i, j].top = dj * blockBitCoinHeight + ia.DisplayRegion.top;
                            ia.BlockRegion[i, j].width = blockBitCoinWidth;
                            ia.BlockRegion[i, j].height = blockBitCoinHeight;
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
                            ia.BlockRegion[i, j].tiles = new BitCoinsApp.DisplayTileInfo[tilesNum];
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
                                    ia.BlockRegion[i, j].tiles[rank] = new BitCoinsApp.DisplayTileInfo();
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
                    Clients.Caller.setMessage("Updated thumbnail BitCoin information Success!");
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
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
                    if (ia.BlockRegion[col, row].tiles != null)
                        Clients.Caller.setTiles(ia.BitCoinNameDigit, ia.Rotate, ia.Section.Width / ia.Section.Cols, ia.Section.Height / ia.Section.Rows, JsonConvert.SerializeObject(ia.BlockRegion[col, row].tiles));
                    else
                        Clients.Caller.setTiles(ia.BitCoinNameDigit, ia.Rotate, ia.Section.Width / ia.Section.Cols, ia.Section.Height / ia.Section.Rows, "");
                    Clients.Caller.setMessage("Requested tiles information Success!");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    Clients.Caller.setMessage(e.GetType().ToString());
                }
            }
        }

        public void RequestThumbNailBitCoinInfo(int instanceId)
        {
            lock (Cave.AppLocks[instanceId])
            {
                try
                {
                    Clients.Caller.setMessage("Requesting thumbnail BitCoin information...");
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
                    if (ia.ThumbNailBitCoin != null)
                    {
                        Clients.Caller.setThumbNailBitCoinInfo(JsonConvert.SerializeObject(ia.ThumbNailBitCoin));
                    }
                    else
                    {
                        Clients.Caller.setThumbNailBitCoinInfo(null);
                    }
                    
                    Clients.Caller.setMessage("Requested thumbnail BitCoin information Success!");
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
                    BitCoinsApp ia = (BitCoinsApp) Cave.Apps["BitCoins"].Instances[instanceId];
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