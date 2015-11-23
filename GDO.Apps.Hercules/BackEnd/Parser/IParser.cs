using System;
using System.Collections.Generic;

namespace GDO.Apps.Hercules.BackEnd.Parser
{

    // General interface for parsing stuff row by row.
    public interface IParser
    {
        // Returns true if there is still data to be read, 
        // false otherwise (EOF reached).
        bool HasData();

        // Attempts to parse one row (reads upto newline). 
        // If EOF was reached, or if the line is malforned, ParseRow returns null.
        // Otherwise it reads the line(row) and splits it into fields(cells).
        string[] ParseRow();

        // Gets the number of the last row that was parsed i.e. the line number at
        // which it appeared. Initially this returns -1.
        // This value is incremented with each call to ParseRow, whether it succeeds or not. 
        long GetRowNumber();

        // Returns the total number of rows present in the dataset.
        // This value also affects HasData and ParseRow, in that when
        // GetRowNumber becomes equals to GetRowCount, the parser will stop parsing
        long GetRowCount();

        // When malformed lines are found, they are saved together with the line number 
        // at which they occurred.
        Dictionary<long, string> GetMalformed();

        // A line may be parsed correctly but still be malformed for other reasons.
        // Use this to add a line and its number to the list of malformed lines.
        void AddMalformed(long number, string line);

        // When the Parser is created, some IO stuff might go wrong.
        // If an exception occurred during the creating of this parser, from which
        // we can't recover, this is where it should be saved.
        Exception GetException();
    }

}
