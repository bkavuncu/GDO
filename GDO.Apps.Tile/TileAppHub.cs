﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;

[assembly: System.Web.UI.WebResource("GDO.Apps.Tile.Scripts.gdo.app.tile.js", "application/x-javascript")]


namespace GDO.Apps.Tile
{
    [Export(typeof(IAppHub))]
    public class TileAppHub : Hub, IAppHub
    {
        //public int Id { get; set; }
        public string Name { get; set; } = "Tile";
        //TODO upload Image

        public void RequestTest()
        {
            try
            {
                Clients.Caller.receiveTest("TEST");
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }
}