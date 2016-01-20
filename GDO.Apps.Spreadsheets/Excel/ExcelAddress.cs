using System;
using System.Collections.Generic;
using System.Linq;

namespace GDO.Apps.Spreadsheets.Excel
{

    [Serializable]

    public class ExcelAddress : ICloneable, IEquatable<ExcelAddress>
    {

        public string WorkSheet { get; set; }
        public string Cell { get; set; }
        public string FullName { get; set; }
        private readonly int _hash;

        public ExcelAddress()
            : this("sheet1!A1")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ExcelAddress"/> struct.
        /// from a string "Sheet1!A1"
        /// </summary>
        /// <param name="cellName">Name of the cell.</param>
        public ExcelAddress(string cellName)
        {
            cellName = cellName.Replace("'", "");// remove quotes from cell names starting with numbers...
            string[] components = cellName.Split(new[] { '!' });
            if (components.Length != 2)
            {
                Console.WriteLine("Cell names must be in the format Sheet!Cell");
            }
            this.WorkSheet = components[0];
            this.Cell = components[1];
            this.FullName = this.WorkSheet + "!" + this.Cell;
            this._hash = this.FullName.GetHashCode();
        }

        public ExcelAddress(string workSheet, string cellName)
        {
            this.WorkSheet = workSheet;
            this.Cell = cellName;
            this.FullName = this.WorkSheet + "!" + this.Cell;
            this._hash = this.FullName.GetHashCode();
        }

        #region Implementation of ICloneable

        /// <summary>
        /// Creates a new object that is a copy of the current instance.
        /// </summary>
        /// <returns>
        /// A new object that is a copy of this instance.
        /// </returns>
        /// <filterpriority>2</filterpriority>
        public object Clone()
        {
            return new ExcelAddress(this.WorkSheet, this.Cell);
        }

        #endregion

        public override string ToString()
        {
            return this.WorkSheet + "!" + this.Cell;
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((Cell?.GetHashCode() ?? 0) * 397) ^ (WorkSheet != null ? WorkSheet.GetHashCode() : 0);
            }
        }

        /// <summary>
        /// returns the column of this instnace of NULL if excel address is a range
        /// </summary>
        /// <returns></returns>
        public string Column()
        {
            try
            {
                return (new Cell(this.Cell)).Column;
            }
            catch (Exception)
            {
                return null;
            }
        }

        /// <summary>
        /// returns the row of this instnace of NULL if excel address is a range
        /// </summary>
        /// <returns></returns>
        public string Row()
        {
            try
            {
                return (new Cell(this.Cell)).Row;
            }
            catch (Exception)
            {
                return null;
            }
        }

        #region static expand range methods:

        public static List<String> ExpandRangeToCellList(ExcelAddress address)
        {
            return ExpandRangeToExcelAddresses(address).Select(addr => addr.Cell).ToList();
        }

        public static List<Cell> ExpandRangeToCells(ExcelAddress address)
        {
            return ExpandRangeToExcelAddresses(address).Select(addr => new Cell(addr.Cell)).ToList();
        }

        public static List<ExcelAddress> ExpandRangeToExcelAddresses(ExcelAddress address)
        {

            string[] split = address.Cell.Replace("$", "").Split(':');
            Cell topleft = new Cell(split[0]);
            Cell bottomright = new Cell(split[1]);

            List<ExcelAddress> cells = GetCellsBetween(address.WorkSheet, topleft, bottomright);

            return cells;
        }

        public static List<ExcelAddress> GetCellsBetween(string workSheet, Cell topleft, Cell bottomright)
        {
            List<ExcelAddress> cells = new List<ExcelAddress>();
            Cell current = topleft;

            if (topleft.Row == bottomright.Row && topleft.Column == bottomright.Column)
            {
                // only 1 cell
                cells.Add(new ExcelAddress(workSheet, current.ToString()));
            }
            else if (topleft.Row == bottomright.Row)
            {
                // one row

                while (current.Column != bottomright.Column)
                {
                    // a single row selection
                    cells.Add(new ExcelAddress(workSheet, current.ToString()));
                    current = current.OneRight();
                }
                cells.Add(new ExcelAddress(workSheet, current.ToString()));

            }
            else if (topleft.Column == bottomright.Column)
            {
                // one column

                while (current.Row != bottomright.Row)
                {
                    cells.Add(new ExcelAddress(workSheet, current.ToString()));
                    current = current.OneDown();
                }

                cells.Add(new ExcelAddress(workSheet, current.ToString()));

            }
            else {
                // a rectangle

                while (!(current.Row == bottomright.Row && current.Column == bottomright.Column))
                {
                    Cell leftmost = current;
                    // a rectangle
                    while (current.Column != bottomright.Column)
                    {
                        cells.Add(new ExcelAddress(workSheet, current.ToString()));
                        current = current.OneRight();
                    }
                    cells.Add(new ExcelAddress(workSheet, current.ToString()));
                    if (current.Row != bottomright.Row)
                    {
                        current = leftmost.OneDown();
                    }
                }
            }
            return cells;
        }

        #endregion

        public bool IsRange()
        {
            return this.Cell.Contains(":");
        }

        public Tuple<int, int> RangeDimensions()
        {
            if (!IsRange())
            {
                return null;
            }

            string[] split = this.Cell.Replace("$", "").Split(':');
            Cell topleft = new Cell(split[0]);
            Cell bottomright = new Cell(split[1]);

            int width = 0;
            int height = 0;

            Cell current = topleft;

            while (current.Column != bottomright.Column)
            {
                width++;
                current = current.OneRight();
            }
            while (current.Row != bottomright.Row)
            {
                height++;
                current = current.OneDown();
            }

            return new Tuple<int, int>(width, height);
        }

        /// <summary>
        /// Returns the top left cell in a range
        /// </summary>
        /// <returns></returns>
        public Cell RangeTopLeft()
        {
            if (!IsRange())
            {
                throw new ArgumentOutOfRangeException("ExcelAddress is not a range " + this.ToString());
            }

            string[] split = this.Cell.Replace("$", "").Split(':');
            return new Cell(split[0]);

        }

        public static ExcelAddress CreateRange(string workSheet, Cell rangeTopLeft, int width, int height)
        {

            Cell bottomright = new Cell(rangeTopLeft.ToString());
            for (int i = 0; i < width; i++)
            {
                bottomright = bottomright.OneRight();
            }
            for (int i = 0; i < height; i++)
            {
                bottomright = bottomright.OneDown();
            }

            return new ExcelAddress(workSheet, rangeTopLeft + ":" + bottomright);
        }

        #region equality

        public bool Equals(ExcelAddress other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return Equals(other.Cell, Cell) && Equals(other.WorkSheet, WorkSheet);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != typeof(ExcelAddress)) return false;
            return Equals((ExcelAddress)obj);
        }

        public static bool operator ==(ExcelAddress left, ExcelAddress right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(ExcelAddress left, ExcelAddress right)
        {
            return !Equals(left, right);
        }

        #endregion

        public ExcelAddress OneRight()
        {
            //todo this wont deal with absolutes or ranges
            return new ExcelAddress(this.WorkSheet, (new Cell(this.Cell)).OneRight().ToString());
        }

        public ExcelAddress OneDown()
        {
            //todo this wont deal with absolutes or ranges
            return new ExcelAddress(this.WorkSheet, (new Cell(this.Cell)).OneDown().ToString());
        }
    }
}
