﻿using System;
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
        
        // TEST APP TODO
        // ----------------
        // some variables
        // some methods to update variables
        // each node displays a cave table
        // select node to send message, and message is displayed in the table on that node
    }
}