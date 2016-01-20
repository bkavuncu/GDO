using System;
using GDO.Apps.Spreadsheets.Excel;

namespace GDO.Apps.Spreadsheets.Models
{

    public abstract class Variable
    {
        public Guid Id { get; set; }
        public string Reference { get; set; }
        public string Name { get; set; }

        public string Sheet { get; set; }
        public string Cell { get; set; }

        public Variable(string reference, string name, string sheet, string cell)
        {
            this.Id = Guid.NewGuid();
            this.Reference = reference;
            this.Name = name;
            this.Sheet = sheet;
            this.Cell = cell;
        }

        public Variable(Guid id, string reference, string name, string sheet, string cell)
        {
            this.Id = id;
            this.Reference = reference;
            this.Name = name;
            this.Sheet = sheet;
            this.Cell = cell;
        }

        public ExcelAddress GetAddress()
        {
            return new ExcelAddress(Sheet, Cell);
        }

        public override string ToString()
        {
            return "Variable: " + Name;
        }

    }

}
