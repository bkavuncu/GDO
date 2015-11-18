using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace GDO.Apps.Hercules.BackEnd.Parser
{

    // A parser of Something-Separated-Values files.
    public class ParserSSV
    {

        // Behind the scenes we are doing Visual Basic.
        private TextFieldParser Inner = null;

        // Initially the current row is empty.
        private string[] Row = new string[0];

        // The current row number. This is NOT the line number.
        // This is the line number minus one, because the first line is the headers.
        // Rows are 0-indexed.
        private long RowNumber = -1;

        // The total number of rows in the source, or the maximum number of rows to parse.
        private long RowCount = 0;

        // Whether or not the headers have been parsed.
        private bool HeadersParsed = false;


        // IO Exception when reading the file.
        private Exception Exception = null;

        // Dictionary of malformed lines.
        private Dictionary<long, string> Malformed = new Dictionary<long, string>();

        // Source of the file.
        private Stream Source = null;

        // Can't construct directly, use FromFile or FromStream instead.
        private ParserSSV() { }


        // Obtains a ParserSSV for the file at location path. How fields are separated is 
        // given by the value of delimiter. If delimiter is null or the empty string, it defaults to ",".
        // If path is null, Exception will contain a NullPointerException.
        // If some IO exception occurs, including FileNotFound, that is also recorded in 
        // the field Exception. If an exception does occurr, the parser will be useless.
        // FromFile will create the stream, will count how many lines are in the file at path, and will
        // in turn call FromStream with those values.
        public static ParserSSV FromFile(string path, string delimiter)
        {
            ParserSSV parser = new ParserSSV();
            // Defaulting to "," if null or empty string
            if (delimiter == null || delimiter.Length == 0)
            {
                delimiter = ",";
            }
            try {
                long rows = File.ReadLines(path).Count() - 1; // Compute line count, account for headers.
                parser = FromStream(new FileStream(path, FileMode.Open), delimiter, rows); 
            } catch (Exception ouch) {
                parser.Exception = ouch;
            }
            return parser;
        }

        // Obtains a ParserSSV for the data in the stream provided. How fields are separated is 
        // given by the value of delimiter. If delimiter is null or the empty string, it defaults to ",".
        // If source is null, Exception will contain a NullPointerException.
        // If some IO exception occurs, including FileNotFound, that is also recorded in 
        // the field Exception. If an exception does occurr, the parser will be useless.
        // An addition field, @rows, is required: this is maximum number of rows that will be parsed.
        // If the source contains less lines than @rows, all the rows will be read; if it contains
        // more, only @rows rows will be read.
        // If @rows is negative, it defaults to 2^15, just cos we be expecting big files.
        // BEWARE this is the number ROWS, not lines. 
        //                        
        // +---------+---------+---------+---------+
        // |      DATASET      | Line No | Row No  |
        // +---------+---------+---------+---------+
        // | Header1 | Header2 | 0       | -1      |
        // +---------+---------+         |         |
        // | Datum1  | Catum1  | 1       | 0       |
        // | Datum2  | Catum2  | 2       | 1       | LineCount = 4 
        // | Datum3  | Catum3  | 3       | 2       | RowCount = 3
        // +---------+---------+---------+---------+
        public static ParserSSV FromStream(Stream source, string delimiter, long rows)
        {
            ParserSSV parser = new ParserSSV();
            try {
                TextFieldParser inner = new TextFieldParser(source);
                inner.TextFieldType = FieldType.Delimited;
                inner.SetDelimiters(delimiter);
                parser.Inner = inner;
                parser.RowCount = rows < 0 ? 2 ^ 15 : rows;
                parser.Source = source;
            } catch (Exception ouch) {
                parser.Exception = ouch;
            }
            return parser;
        }

        // Returns true if EOF has not been reached, of if the upper bound of GetRowCount 
        // has not been reached. This will also return false if the Parser was not properly
        // initialized (i.e. the field Exception is not null). Otherwise it returns true.
        public bool HasData()
        {
            if (Inner == null)
                return false;

            if (Inner.EndOfData || RowNumber + 1 >= RowCount)
                return false;

            return true;
        }


        // Parses the Headers. This is equivalent to ParseRow, except that it doesn't advance the 
        // RowNumber counter. Calling this more than one time has no side effects and returns null;
        public string[] ParseHeaders()
        {
            if (!HasData() || HeadersParsed)
                return null;

            string[] headers = null;

            try {
                headers = Inner.ReadFields();
            } catch (MalformedLineException line) {
                Malformed.Add(line.LineNumber, line.Message);
            }

            HeadersParsed = true;

            return headers;
        }


        // Parses one row. 
        // If HasData() returns false, no parsing will occur.
        // Otherwise, the next row will be parsed. If the row is malformed,
        // it is added to a dictionary that can be retrieved with GetMalformed(), and 
        // this returns null. Otherwise the row is split into fields and it is retuned.
        // The row number is incremented regardless of whether the line is malformed or not,
        // so long as HasData would return true.
        public string[] ParseRow()
        {
            if (!HasData())
            {
                CloseSource();
                return null;
            }
            string[] row = null;

            RowNumber++;

            try {
                row = Inner.ReadFields();
            } catch (MalformedLineException line) {
                Malformed.Add(line.LineNumber, line.Message);
            }

            return row;
        }

        // Get the row number of the last row parsed.
        // Whehter the line was malformed or not, this refers to the last row parsed.
        // This is only incremented with a call to ParseRow when HasData returns true.
        // Initially this is set to -1.
        public long GetRowNumber()
        {
            return RowNumber;
        }

        // Get the maximum numer or rows that will be parsed by this parser.
        // If the source file contains more rows, only GetRowCount rows will be parsed.
        // If it contains fewer, all of them will be parsed. 
        public long GetRowCount()
        {
            return RowCount;
        }

        // Get the current dictionary of malformed lines. This includes lines that were 
        // unable to be parsed and lines that were added via AddMalformed.
        // Each line number maps to the malformed line.
        public Dictionary<long, string> GetMalformed()
        {
            return Malformed;
        }

        // Add a message @line for the malformed line at line @number.
        // Beware that Dictionaries throws when you attempt to put a value for
        // a key that is already preset, and they don't provide an Update method...
        // So make sure that an entry with key @number is not already present, including
        // those added automatically by ParseRow.
        public void AddMalformed(long number, string line)
        {
            Malformed.Add(number, line);
        }

        // If something went wrong during initialization of this parser, the exception that
        // was caught resides here. If the returned value is not null, therefore, this parser is useless.
        public Exception GetException()
        {
            return Exception;
        }

        public TextFieldParser GetInner()
        {
            return Inner;
        }

        // Closes the source file. Only call this method when you are done parsing.
        public void CloseSource()
        {
            this.Source.Close();
        }
    }
}