using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.Office.Interop.Excel;

namespace GDO.Apps.Spreadsheets.Excel
{

    [Serializable]

    public class ExcelApp : IDisposable
    {

        public string Filepath;
        private Application _app;
        private Workbook _activeBook;
        private Worksheet _activeSheet;

        #region constructor

        public ExcelApp(string filepath)
        {
            this.Filepath = filepath;
            if (!File.Exists(this.Filepath))
            {
                throw new FileNotFoundException("Excel Services could not find file " + this.Filepath);
            }
            try
            {
                _app = new Application
                {
                    AlertBeforeOverwriting = false,
                    DisplayAlerts = false
                };
                _activeBook = _app.Workbooks.Open(this.Filepath, // filepath
                                                  0, //updatelinks
                                                  false, //readonly 
                                                  5, //format
                                                  "", //Password 
                                                  "", //writeResPass
                                                  true, //ignoreReadOnly
                                                  XlPlatform.xlWindows, //origin
                                                  "\t", //delimiter
                                                  true, //editable
                                                  false, //Notify
                                                  0, //converter
                                                  false, //AddToMru
                                                  1, //Local
                                                  0); //corruptLoad

                Sheets worksheets = _activeBook.Worksheets;

                this._dirtyHacks = new Dictionary<string, string>();
                for (int ws = 1; ws <= worksheets.Count; ws++)
                {
                    dynamic worksheet = worksheets[ws];
                    dynamic sheetname = worksheet.Name;
                    // {"'Sum Resources'","Sum_Resources"}, 
                    string originalname = "'" + sheetname.ToString() + "'";
                    string newname = originalname.Replace("'", "");
                    newname = newname.Replace(" ", "_");
                    this._dirtyHacks.Add(originalname, newname);
                    ReleaseObject(worksheet);
                    // ReleaseObject(sheetname);dont thinks tihs need releasing
                }
                _activeSheet = _activeBook.Worksheets[1];
                ((Microsoft.Office.Interop.Excel._Worksheet)_activeSheet).Activate();
                this._app.Calculation = Microsoft.Office.Interop.Excel.XlCalculation.xlCalculationManual;

            }
            catch (Exception)
            {
                Dispose(true);
                throw;
            }
        }

        #endregion

        #region file operations

        public void SaveTo(string filename)
        {
            if (_activeBook != null)
            {
                const int maxcompathlength = 218;
                if (filename.Length > maxcompathlength)
                {
                    string directory = Path.GetDirectoryName(filename);
                    string newFname = Guid.NewGuid() + "." + Path.GetExtension(filename);

                    string shortfname = Path.Combine(directory + newFname);
                    try
                    {
                        _activeBook.SaveAs(shortfname);
                        File.WriteAllText(Path.ChangeExtension(shortfname, "txt"), "Filename was too long - should have been: " + Environment.NewLine + filename);
                    }
                    catch (Exception e)
                    {
                        throw new Exception("Failed to save file : " + e);
                    }
                }
                else {
                    if (File.Exists(filename))
                    {
                        var newfilename = Path.Combine(Path.GetDirectoryName(filename),
                            Path.GetFileName(filename) + "_2" + Path.GetExtension(filename));
                        while (File.Exists(newfilename))
                        {
                            newfilename = Path.Combine(Path.GetDirectoryName(filename),
                            Path.GetFileName(filename) + DateTime.Now.Millisecond + Path.GetExtension(filename));
                        }
                        _activeBook.SaveAs(newfilename);
                    }
                    else {
                        lock (_saveaslockobject)
                        {
                            try
                            {
                                _activeBook.SaveAs(filename);
                            }
                            catch (Exception e)
                            {
                                throw new Exception("Could not save file " + filename + ": " + e);
                            }
                        }
                    }
                }
            }
            else {
                throw new Exception("No active workbook to save.");
            }
        }

        private static object _saveaslockobject = new object();

        public void CloseBook(string book)
        {
            try
            {
                Workbook workbook = GetBook(book);
                if (_activeBook != null)
                {
                    if (_activeBook.Name == workbook.Name)
                    {
                        _activeBook = null;
                    }
                }
                try
                {
                    workbook.Close(false, book, Missing.Value);
                }
                catch (Exception e)
                {
                    throw new Exception("Cannot close workbook " + book + ": " + e.Message);
                }
            }
            catch (Exception e)
            {
                throw new ArgumentException("Cannot find workbook " + book + ": " + e.Message);
            }
        }

        #endregion

        #region display

        public void Display(bool b)
        {
            _app.Visible = b;
        }

        public void Maximize()
        {
            _app.WindowState = XlWindowState.xlMaximized;
        }

        #endregion

        #region fold / unfold sheets

        public void DisplayWorkbooks(string style)
        {
            style = style.ToLower();
            switch (style)
            {
                case "tiled":
                    _app.Windows.Arrange(XlArrangeStyle.xlArrangeStyleTiled, Type.Missing, Type.Missing, Type.Missing);
                    break;
                case "cascade":
                    _app.Windows.Arrange(XlArrangeStyle.xlArrangeStyleCascade, Type.Missing, Type.Missing, Type.Missing);
                    break;
                case "vertical":
                    _app.Windows.Arrange(XlArrangeStyle.xlArrangeStyleVertical, Type.Missing, Type.Missing, Type.Missing);
                    break;
                case "horizontal":
                    _app.Windows.Arrange(XlArrangeStyle.xlArrangeStyleHorizontal, Type.Missing, Type.Missing, Type.Missing);
                    break;
                default:
                    _app.Windows.Arrange(XlArrangeStyle.xlArrangeStyleTiled, Type.Missing, Type.Missing, Type.Missing);
                    break;
            }
            _app.Visible = true;
        }

        public void UnfoldSheets()
        {
            _app.Visible = false;
            _app.SheetsInNewWorkbook = 1;
            int totalBooks = _app.Workbooks.Count;
            for (int i = 1; i <= totalBooks; i++)
            {
                int totalSheets = _app.Workbooks.get_Item(i).Sheets.Count;
                for (int j = 1; j <= totalSheets; j++)
                {
                    Workbook workbook = _app.Workbooks.get_Item(i);
                    Worksheet sheet = workbook.Worksheets.get_Item(j);
                    //Workbook newWorkbook = app.Workbooks.Add(Type.Missing);
                    //Worksheet newWorksheet = (Worksheet)newWorkbook.Worksheets.get_Item(1);
                    //sheet.Copy(After: newWorksheet);
                    sheet.Copy(Type.Missing, Type.Missing);
                }
            }
        }

        public void FoldSheets()
        {
            Workbook workbookMain = _app.Workbooks.get_Item(1);
            int totalBooks = _app.Workbooks.Count;
            if (totalBooks >= 2)
            {
                for (int i = 2; i <= totalBooks; i++)
                {
                    int totalSheets = _app.Workbooks.get_Item(i).Sheets.Count;
                    for (int j = 1; j <= totalSheets; j++)
                    {
                        Workbook workbook = _app.Workbooks.get_Item(i);
                        Worksheet sheet = workbook.Worksheets.get_Item(j);
                        sheet.Copy(Type.Missing, workbookMain.Worksheets[workbookMain.Worksheets.Count]);
                    }
                }
            }
            _activeBook = workbookMain;
        }

        public void FoldSheets2()
        {
            Workbook workbookMain = _app.Workbooks.get_Item(1);
            int totalBooks = _app.Workbooks.Count;
            while (totalBooks > 1)
            {
                Workbook workbook = _app.Workbooks.get_Item(totalBooks);
                workbook.Close();
                totalBooks--;
            }
            _activeBook = workbookMain;
        }

        #endregion

        #region last row and columns

        public int GetLastRowForCol(string columnLetter, string sheet)
        {
            Worksheet worksheet = GetSheet(sheet);
            int col = GetColumnNumber(columnLetter);
            int lastRow = worksheet.Cells[worksheet.Rows.Count, col].End(XlDirection.xlUp).Row;
            return lastRow;
        }

        private int GetColumnNumber(string columnLetter)
        {
            columnLetter = columnLetter.ToUpperInvariant();
            int number = 0;
            for (int i = 0; i < columnLetter.Length; i++)
            {
                number *= 26;
                number += (columnLetter[i] - 'A' + 1);
            }
            return number;
        }

        #endregion

        #region formatting

        public void ColorCell(ExcelAddress cell)
        {
            Worksheet worksheet = GetSheet(cell.WorkSheet);
            worksheet.Cells[cell.Row(), cell.Column()].Interior.Color = XlRgbColor.rgbGreen;
            worksheet.Cells[cell.Row(), cell.Column()].Font.Color = XlRgbColor.rgbGreen;
        }

        public void UncolorCell(ExcelAddress cell)
        {
            Worksheet worksheet = GetSheet(cell.WorkSheet);
            worksheet.Cells[cell.Row(), cell.Column()].Interior.Color = XlRgbColor.rgbWhite;
            worksheet.Cells[cell.Row(), cell.Column()].Font.Color = XlRgbColor.rgbWhite;
        }

        public void AutofitColumns(string sheet)
        {
            Worksheet worksheet = GetSheet(sheet);
            worksheet.UsedRange.EntireColumn.AutoFit();
        }

        public void MergeCells(ExcelAddress cell1, ExcelAddress cell2)
        {
            if (cell1.WorkSheet == cell2.WorkSheet)
            {
                Worksheet worksheet = GetSheet(cell1.WorkSheet);
                worksheet.get_Range(cell1.Cell, cell2.Cell).Merge();
            }
            else {
                throw new ArgumentException("Cannot merge cells from different worksheets.");
            }
        }

        #endregion

        #region books

        public Workbook GetBook(string book)
        {
            try
            {
                if (_activeBook != null)
                {
                    if (_activeBook.Name == book)
                    {
                        return _activeBook;
                    }
                }
                else {
                    int totalBooks = _app.Workbooks.Count;
                    for (int i = 1; i <= totalBooks; i++)
                    {
                        if (_app.Workbooks[i].Name == book)
                        {
                            return _app.Workbooks[i];
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw new ArgumentException("Can not find workbook " + book + ": " + e.Message);
            }
            return null;
        }

        #endregion

        #region sheets

        public void ShowSheet(string sheetname)
        {
            Worksheet worksheet = GetSheet(sheetname);
            ((Microsoft.Office.Interop.Excel._Worksheet)worksheet).Activate();
            _activeSheet = worksheet;
            Maximize();
            _app.Visible = true;
        }

        public List<string> GetSheetnames()
        {
            List<string> sheetnames = new List<string>();
            int totalBooks = _app.Workbooks.Count;
            for (int i = 1; i <= totalBooks; i++)
            {
                Workbook workbook = _app.Workbooks[i];
                int totalSheets = _app.Workbooks[i].Worksheets.Count;
                for (int j = 1; j <= totalSheets; j++)
                {
                    Worksheet worksheet = _app.Workbooks[i].Worksheets[j];
                    Console.WriteLine("sheet: " + worksheet.Name);
                    sheetnames.Add(worksheet.Name);
                }
            }
            return sheetnames;
        }

        public Worksheet GetSheet(string sheet)
        {
            Worksheet worksheet = null;
            try
            {
                string sheetname = UnDoDirtyHack(sheet);
                if (_activeSheet != null)
                {
                    if (_activeSheet.Name == sheetname)
                    {
                        return _activeSheet;
                    }
                }
                int totalBooks = _app.Workbooks.Count;
                for (int i = 1; i <= totalBooks; i++)
                {
                    Workbook workbook = _app.Workbooks[i];
                    int totalSheets = _app.Workbooks[i].Worksheets.Count;
                    for (int j = 1; j <= totalSheets; j++)
                    {
                        worksheet = _app.Workbooks[i].Worksheets[j];
                        if (worksheet.Name == sheetname)
                        {
                            return worksheet;
                        }
                    }

                }
            }
            catch (Exception e)
            {
                throw new ArgumentException("BadSheetName " + sheet + ": " + e.Message);
            }
            return worksheet;
        }

        public void SelectActiveSheet(string sheet)
        {
            string sheetname = UnDoDirtyHack(sheet);
            int totalBooks = _app.Workbooks.Count;
            Console.WriteLine("total books (select active sheet): " + totalBooks);
            for (int i = 1; i <= totalBooks; i++)
            {
                int totalSheets = _app.Workbooks[i].Worksheets.Count;
                for (int j = 1; j <= totalSheets; j++)
                {
                    Workbook workbook = _app.Workbooks[i];
                    Worksheet worksheet = workbook.Worksheets[j];
                    if (worksheet.Name == sheetname)
                    {
                        Console.WriteLine("new active sheet is " + worksheet.Name);
                        _activeSheet = worksheet;
                        ((Microsoft.Office.Interop.Excel._Worksheet)worksheet).Activate();
                        return;
                    }
                }
            }
        }

        public void AddWorksheet(string sheetname)
        {
            Worksheet newWorksheet = (Worksheet)_app.Worksheets.Add();
            newWorksheet.Name = sheetname;
            //move new worksheet to first
            newWorksheet.Move(_app.Worksheets[1]);
        }

        public void AddWorksheetInNewBook(string sheetname)
        {
            Workbook newWorkbook = _app.Workbooks.Add();
            Worksheet newWorksheet = newWorkbook.Worksheets.get_Item(1);
            newWorksheet.Name = sheetname;
            //activeBook = newWorkbook;
        }

        #endregion

        #region writing

        public void SetValue(ExcelAddress cell, string value)
        {
            try
            {
                string worksheetName = UnDoDirtyHack(cell.WorkSheet);
                Worksheet worksheet = GetSheet(worksheetName);
                //Worksheet worksheet = getSheet(cell.WorkSheet);
                Range range = worksheet.get_Range(cell.Cell, cell.Cell);
                range.Value2 = value;
                ReleaseObject(range);
                range = null;
                return;
            }
            catch (Exception e)
            {
                throw new Exception("Could not write value " + value + " to address " + cell + ": " + e);
            }
        }

        #endregion

        #region reading

        public string ReadValue(ExcelAddress cell)
        {
            string result = null;
            try
            {
                string worksheetName = UnDoDirtyHack(cell.WorkSheet);
                Worksheet worksheet = GetSheet(worksheetName);
                //Worksheet worksheet = getSheet(cell.WorkSheet);
                try
                {
                    Range range = worksheet.Range[cell.Cell, cell.Cell];
                    Range cellsrange = range.Cells;
                    object objresult = cellsrange.Value2;
                    if (objresult == null)
                    {
                        result = string.Empty;
                    }
                    else if (objresult is double)
                    {
                        result = ((double)objresult).ToString("G17");
                    }
                    else {
                        result = objresult.ToString();
                    }
                    ReleaseObject(cellsrange);
                    cellsrange = null;
                    ReleaseObject(range);
                    range = null;
                }
                catch (Exception e)
                {
                    throw new ArgumentException("BadCell" + cell + e.Message);
                }
            }
            catch (Exception e)
            {
                throw new ArgumentException("BadSheetName" + cell + e.Message);
            }

            result = DoDirtyHack(result);
            return result;
        }

        #endregion

        #region calculations

        public void Calculate()
        {
            try
            {
                this._app.CalculateFull();
            }
            catch (Exception e)
            {
                throw new Exception("Calculation failure: " + e);
            }
        }

        #endregion

        #region dirtyhacks

        private Dictionary<string, string> _dirtyHacks = new Dictionary<string, string> {
               {"'Resource Output Comparison'","Resource_Output_Comparison"}
            };

        private string DoDirtyHack(string result)
        {
            return _dirtyHacks.Aggregate(result, (current, dirtyHack) => current.Replace(dirtyHack.Key, dirtyHack.Value));
        }

        private string UnDoDirtyHack(string result)
        {
            foreach (var dirtyHack in _dirtyHacks)
            {
                result = result.Replace(dirtyHack.Value, dirtyHack.Key);
            }
            result = result.Replace("'", "");
            return result;
        }

        #endregion

        #region destructors and disposal

        private static void ReleaseObject(object obj)
        {
            // ReSharper disable RedundantAssignment 
            //we allow it to be garbage collected?
            if (obj != null)
            {
                try
                {
                    System.Runtime.InteropServices.Marshal.FinalReleaseComObject(obj);
                    obj = null;
                }
                catch (Exception ex)
                {
                    obj = null;
                    throw new Exception("Unable to release the Object" + ex.Message);
                }
            }
            // ReSharper restore RedundantAssignment
        }

        private bool _isDisposed; // defaults to false

        ~ExcelApp()
        {
            Dispose(false);
        }

        protected void Dispose(bool disposing)
        {
            if (disposing && !_isDisposed)
            {
                // nasty stuff since com can screw up in so many ways!   
                if (_activeSheet != null) ReleaseObject(_activeSheet);
                _activeSheet = null;
                if (_activeBook != null) ReleaseObject(_activeBook);
                _activeBook = null;
                if (_app != null) ReleaseObject(_app);
                _app = null;
                // GC.Collect(); dont think this is necessary 
            }

            _isDisposed = true;
        }

        public void Dispose()
        {
            //new null propagation operator used here instead of null checks.
            _activeBook?.Close(false, Missing.Value, Missing.Value);
            _app?.Quit();
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

    }
}