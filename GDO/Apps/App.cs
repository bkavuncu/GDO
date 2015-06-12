using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.ComponentModel.Composition.Registration;
using Microsoft.AspNet.SignalR;
using GDO.Core;


namespace GDO.Core
{
    //[Export(typeof(IApp))]
    public class App : Hub, IApp
    {
        public int id { get; set; }
        public string name { get; set; }
    }
}