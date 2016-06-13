namespace GDO.Core.States
{
    public class AppState
    {
        public int Col { get; set; }
        public int Row { get; set; }
        public int Cols { get; set; }
        public int Rows { get; set; }
        public string AppName { get; set; }
        public string ConfigName { get; set; }

        public AppState(int col, int row, int cols, int rows, string appName, string configName)
        {
            this.Col = col;
            this.Row = row;
            this.Cols = cols;
            this.Rows = rows;
            this.AppName = appName;
            this.ConfigName = configName;
        }
    }
}