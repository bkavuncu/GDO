using System.Collections.Generic;

namespace DP.src.Augment
{

    // An ((A)ugmented)Column in a RichDS.
    // An AColumn has a name (Header) and a Number (left-to-right, 0-indexed).
    // An AColumn has type information about the data it contains.
    class AColumn
    {
        //
        public AType PrincipalType = AType.Unknown;

        //
        public Dictionary<AType, int> TypeModes = new Dictionary<AType, int>();

        //
        public Stats<dynamic> Data = null;

        //
        public string Header = null;

        //
        public int Number = 0;

        
        // Creates a new AColum, empty, but with a header and a number at least.
        public AColumn(string header, int number)
        {
            Header = header;
            Number = number;
        }


        // Pretty printing of an AColumn.
        public override string ToString()
        {
            return string.Format(
                "#{0} - {1} : {2} of {3}\n\t{4} Min, {5} Max, {6} Count, {7} Modes, {8}, {9} Sum, {10} Mean, {11} Median, {12} Variance, {13} StdDev\n\tData: {14}",
                Number, Header, PrincipalType.ToString(), TypeModes.Count,
                Data.Min, Data.Max, Data.Count, Data.Modes.Count, Data.Enum ? "ENUM" : "NON-ENUM", Data.Sum, Data.Mean, Data.Median, Data.Variance, Data.StdDev,
                string.Join(",", Data.Data));
        }
    }
}
