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
using Microsoft.AspNet.SignalR.Hubs;
using GDO.Core;



namespace GDO.Core
{
    //[Export(typeof(IAppHub))]
    //[HubName("TileAppHub")]
    public class TestHub : Hub
    {
        //public int Id { get; set; }
        public string Name { get; set; } = "Test";
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