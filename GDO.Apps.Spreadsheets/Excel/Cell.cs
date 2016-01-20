using System;
using System.Linq;

namespace GDO.Apps.Spreadsheets.Excel
{

    [Serializable]

    public class Cell
    {

        public string Column { get; set; }
        public string Row { get; set; }

        public Cell()
            : this("A1")
        {
        }

        public Cell(string str)
        {
            if (string.IsNullOrEmpty(str) || string.IsNullOrWhiteSpace(str))
            {
                throw new ArgumentNullException("str", @"null or empty cell address");
            }
            str = str.ToUpper();
            str = str.Replace("$", "");
            this.Column = "";
            while (str.Length > 0 && !"0123456789".Contains(str[0]))
            {
                if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".Contains(str[0]))
                {
                    this.Column += str[0];
                }
                else {
                    throw new ArgumentException("Found a " + str[0] + " in a cellname!");
                }
                str = str.Substring(1);
            }
            this.Row = str;
            int.Parse(this.Row); //should be a valid number

            if (string.IsNullOrEmpty(this.Row) || string.IsNullOrWhiteSpace(this.Row))
            {
                throw new ArgumentNullException("str", @"null or empty cell row address");
            }

            if (string.IsNullOrEmpty(this.Column) || string.IsNullOrWhiteSpace(this.Column))
            {
                if (str.Contains(":"))
                {
                    throw new ArgumentNullException("str", @"null or empty cell col address - please remove entire row references such as sheet!6:100");
                }
                else {
                    throw new ArgumentNullException("str", @"null or empty cell col address");
                }
            }
        }

        public Cell OneDown()
        {
            return new Cell(this.Column + (int.Parse(this.Row) + 1));
        }

        public Cell OneRight()
        {
            return new Cell(IncColumn(this.Column) + this.Row);
        }

        private string IncColumn(string column)
        {
            if (string.IsNullOrWhiteSpace(column))
            {
                return "A";
            }
            if (!column.EndsWith("Z", StringComparison.CurrentCultureIgnoreCase))
            {
                char lastLetter = column.Last();
                return column.Substring(0, column.Length - 1) + IncLetter(lastLetter);
            }
            return IncColumn(column.Substring(0, column.Length - 1)) + "A";
        }

        private static char IncLetter(char letter)
        {
            return (char)(((int)letter) + 1);
        }

        public override string ToString()
        {
            return this.Column + this.Row;
        }

    }
}
