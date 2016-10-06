

namespace GDO.Core
{
    /// <summary>
    /// Slide Object Class
    /// </summary>
    public class Slide
    {
        public int Id { get; set; }
        public int ColStart { get; set; }
        public int RowStart { get; set; }
        public int ColEnd { get; set; }
        public int RowEnd { get; set; }
        public string Src { get; set; } 
        public string AppName { get; set; }

        public Slide(int id, int colStart, int rowStart, int colEnd, int rowEnd)
        {
            this.Id = id;
            this.ColStart = colStart;
            this.RowStart = rowStart;
            this.ColEnd = colEnd;
            this.RowEnd = rowEnd;
            this.Src = null;
            this.AppName = null;
        }
    }
}