using System;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;

namespace GDO.Apps.Spreadsheets
{

    [HubName("ScenarioHub")]
    public class ScenarioHub : Hub
    {

        public static IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<ScenarioHub>();

        #region test

        public void send(string message)
        {
            Clients.All.test(message);
        }

        #endregion

        #region control panel

        public void controlShowModel()
        {
            Clients.Others.showModel();
        }

        public void controlHideModel()
        {
            Clients.Others.hideModel();
        }

        public void controlUnfoldSheets()
        {
            Clients.Others.unfoldSheets();
        }

        public void controlFoldSheets()
        {
            Clients.Others.foldSheets();
        }

        public void controlShowSheet(string sheetname)
        {
            Clients.Others.showSheet(sheetname);
        }

        public void controlDownloadScenarios()
        {
            System.Diagnostics.Debug.WriteLine("download scenario called");
            Clients.Others.downloadScenarios();
        }

        #endregion

        #region analysis

        public void variablesAdded()
        {
            Clients.Others.showVariables();
        }

        public void scenarioAdded(int scenarioNumber)
        {
            Clients.Others.showScenario(scenarioNumber);
        }

        public void showScenario(string id)
        {
            Clients.Others.showScenario(id);
        }

        #endregion

    }

}






