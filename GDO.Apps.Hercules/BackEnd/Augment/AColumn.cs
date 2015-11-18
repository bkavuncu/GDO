using System.Collections.Generic;

namespace GDO.Apps.Hercules.BackEnd.Augment
{

    // An ((A)ugmented)Column in a RichDS.
    // An AColumn has a name (Header) and a Number (left-to-right, 0-indexed).
    // An AColumn has type information about the data it contains.
    class AColumn
    {
        public AType Type = AType.Unknown;
        public Stats<dynamic> Stats = null;
        public string Header = null;
        public int Number = 0;

        public AColumn(string header, int number)
        {
            Header = header;
            Number = number;
        }

        // Pretty printing of an AColumn.
        public override string ToString()
        {
            return string.Format
                (
                    "#{0} - {1} : {2}\n\t{3} Min, {4} Max, {5} Count, {6}, {7} Sum, {8} Mean, {9} Median, {10} Variance, {11} StdDev",
                    Number, Header, Type.ToString(),
                    Stats.Min, Stats.Max, Stats.Count, Stats.Modes.Count, Stats.Enum ? "ENUM" : "NON-ENUM", Stats.Sum, Stats.Mean, Stats.Median, Stats.Variance, Stats.StdDev
                );
        }
    }
}
