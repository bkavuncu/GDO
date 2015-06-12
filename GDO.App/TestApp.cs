using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using GDO.Core;


namespace GDO.Core
{
    public class App : Hub, IApp
    {
        public int id { get; set; }
        public string name { get; set; }
    }
}