using System;
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
using GDO.Core;


namespace GDO.Apps.Tile
{
    [Export(typeof(IAppHub))]
    public class TileAppHub : Hub, IAppHub
    {
        public int Id { get; set; }
        public string Name { get; set; } = "TileApp";

        //TODO upload Image
    }
}