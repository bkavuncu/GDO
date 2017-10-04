using GDO.Core.Apps;

namespace GDO.Core.States
{
    /// <summary>
    /// Stores the state of a deployment of an app instance on the GDO 
    /// it is created from an IAppInstance 
    /// </summary>
    public class AppState
    {
        public int Col { get; set; }
        public int Row { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public string AppName { get; set; }
        public IAppConfiguration Config { get; set; }

        public AppState() {
            
        }
        public AppState(int col, int row, int cols, int rows, string appName, IAppConfiguration config)
        {
            this.Col = col;
            this.Row = row;
            this.Cols = cols;
            this.Rows = rows;
            this.AppName = appName;
            this.Config = config;
        }
    }
}