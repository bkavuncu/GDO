using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using GDO.Core;


namespace GDO.Apps.Tile
{
    public class TileAppHub : Hub, IAppHub
    {
        public int Id { get; set; }
        public string Name { get; set; }
        
        //TODO upload Image
    }
}