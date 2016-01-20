using System;
using System.Collections.Generic;
using System.Linq;
using GDO.Apps.Spreadsheets.Excel;

namespace GDO.Apps.Spreadsheets.Models
{

    //class to create scenarios based on inputs in setupFile
    //assuming it has the specified format

    class ScenarioManager
    {

        //setup sheet 1 macros
        public const string Setup = "setup";
        public const string Results = "results";
        public const string Colstart = "A3";
        public const string Inputcol = "A";
        public const string Outputcol = "J";
        public const string Inputcols = "A4:H4";
        public const string Outputcols = "J4:N4";
        public const int Inputstartcol = 4;

        //setup sheet 2 macros
        public const string Outputcol2 = "F";
        public const string Inputcols2 = "A4:D4";
        public const string Outputcols2 = "F4:J4";

        //results sheet macros
        public const string A1 = "A1";
        public const string Title = "Summary of Scenario Analysis";
        public const string Scenario = "SCENARIO";
        public const string Resultsname = "scenarios";

        public static void DownloadScenarios(ExcelApp file, List<ScenarioBool> scenarios)
        {
            file.AddWorksheetInNewBook(Resultsname);
            file.SelectActiveSheet(Resultsname);

            //write title
            ExcelAddress titleStart = new ExcelAddress(Resultsname, A1);
            ExcelAddress columnStart = new ExcelAddress(Resultsname, Colstart);
            file.SetValue(titleStart, "Results of Scenario Analysis");
            file.MergeCells(titleStart, titleStart.OneRight().OneRight());

            if (scenarios.Count > 0)
            {
                ScenarioBool s0 = scenarios[0];
                file.SetValue(columnStart, Scenario);
                //write output column names
                ExcelAddress cell = columnStart.OneRight();
                for (int i = 0; i < s0.Outputs.Count; i++)
                {
                    string name = s0.Outputs[i].Name;
                    file.SetValue(cell, name.ToUpper());
                    cell = cell.OneRight();
                }
                //write input column names
                cell = cell.OneRight();
                for (int i = 0; i < s0.Inputs.Count; i++)
                {
                    string name = s0.Inputs[i].Name;
                    file.SetValue(cell, name.ToUpper());
                    cell = cell.OneRight();
                }
                file.AutofitColumns(Results);

                //write scenario row
                ExcelAddress scenarioStart = columnStart.OneDown();
                for (int s = 0; s < scenarios.Count; s++)
                {
                    ScenarioBool scenario = scenarios[s];
                    cell = scenarioStart;
                    //write scenario reference
                    string str = Convert.ToString(s);
                    file.SetValue(cell, str);
                    //write scenario input values
                    for (int i = 0; i < scenario.Outputs.Count; i++)
                    {
                        cell = cell.OneRight();
                        str = Convert.ToString(scenario.Outputs[i].Value);
                        file.SetValue(cell, str);
                    }
                    cell = cell.OneRight();
                    //write scenario output values
                    for (int i = 0; i < scenario.Inputs.Count; i++)
                    {
                        cell = cell.OneRight();
                        str = Convert.ToString(scenario.Inputs[i].State);
                        file.SetValue(cell, str);
                    }
                    scenarioStart = scenarioStart.OneDown();
                }
                file.AutofitColumns(Results);
            }
        }

        #region setup sheet 2

        //convert data in setupFile to InputBool objects
        public static List<InputBool> CreateInputs2(string filepath)
        {
            List<InputBool> inputs;

            using (ExcelApp file = new ExcelApp(filepath))
            {
                file.SelectActiveSheet(Setup);
                int inputCount = file.GetLastRowForCol(Inputcol, Setup) - (Inputstartcol - 1);
                inputs = new List<InputBool>(inputCount);

                ExcelAddress inputCells = new ExcelAddress(Setup, Inputcols2);
                List<ExcelAddress> addresses = ExcelAddress.ExpandRangeToExcelAddresses(inputCells);

                for (int i = 0; i < inputCount; i++)
                {
                    if (addresses.Count == 4)
                    {
                        string reference = file.ReadValue(addresses[0]);
                        string name = file.ReadValue(addresses[1]);
                        string sheet = file.ReadValue(addresses[2]);
                        string cell = file.ReadValue(addresses[3]);
                        InputBool input = new InputBool(reference, name, sheet, cell);
                        inputs.Add(input);
                        //update addresses for next input row
                        for (int j = 0; j < addresses.Count; j++)
                        {
                            addresses[j] = addresses[j].OneDown();
                        }
                    }
                }
            }
            return inputs;
        }

        //convert data in setupFile to Output objects fulfilling specific requirements
        public static List<Output> CreateOutputs2(string filepath)
        {
            List<Output> outputs;

            using (ExcelApp file = new ExcelApp(filepath))
            {
                file.SelectActiveSheet(Setup);
                int outputCount = file.GetLastRowForCol(Outputcol2, Setup) - (Inputstartcol - 1);
                outputs = new List<Output>(outputCount);

                ExcelAddress outputCells = new ExcelAddress(Setup, Outputcols2);
                List<ExcelAddress> cells = ExcelAddress.ExpandRangeToExcelAddresses(outputCells);

                for (int i = 0; i < outputCount; i++)
                {
                    if (cells.Count == 5)
                    {
                        string reference = file.ReadValue(cells[0]);
                        string name = file.ReadValue(cells[1]);
                        string sheet = file.ReadValue(cells[2]);
                        string cell = file.ReadValue(cells[3]);
                        double original = Convert.ToDouble(file.ReadValue(cells[4]));
                        Output output = new Output(reference, name, sheet, cell, original);
                        outputs.Add(output);
                        for (int j = 0; j < cells.Count; j++)
                        {
                            cells[j] = cells[j].OneDown();
                        }
                    }
                }
            }
            return outputs;
        }

        #endregion

        #region setup sheet 1

        //convert data in setupFile to Output objects fulfilling specific requirements
        public static List<Output> CreateOutputs(string filepath)
        {
            List<Output> outputs;

            using (ExcelApp file = new ExcelApp(filepath))
            {
                file.SelectActiveSheet(Setup);
                int outputCount = file.GetLastRowForCol(Outputcol, Setup) - (Inputstartcol - 1);
                outputs = new List<Output>(outputCount);

                ExcelAddress outputCells = new ExcelAddress(Setup, Outputcols);
                List<ExcelAddress> cells = ExcelAddress.ExpandRangeToExcelAddresses(outputCells);

                for (int i = 0; i < outputCount; i++)
                {
                    if (cells.Count == 5)
                    {
                        string reference = file.ReadValue(cells[0]);
                        string name = file.ReadValue(cells[1]);
                        string sheet = file.ReadValue(cells[2]);
                        string cell = file.ReadValue(cells[3]);
                        double original = Convert.ToDouble(file.ReadValue(cells[4]));
                        Output output = new Output(reference, name, sheet, cell, original);
                        outputs.Add(output);
                        //update addresses for next output row
                        for (int j = 0; j < cells.Count; j++)
                        {
                            cells[j] = cells[j].OneDown();
                        }
                    }
                }
            }
            return outputs;
        }


        public static List<ScenarioNumeric> CreateScenarios(List<InputNumeric> inputs, List<Output> outputs)
        {
            List<ScenarioNumeric> queue = new List<ScenarioNumeric>();

            //first set all inputs values to min
            for (int i = 0; i < inputs.Count; i++)
            {
                inputs[i].SetValueToMin();
            }

            //create scenario objects and add to queue
            CreateScenarios(1, inputs.Count - 1, queue, inputs, outputs);
            Console.WriteLine(queue.Count + " scenarios");

            return queue;
        }

        //recursive function to generate all possible scenarios from inputs list
        private static void CreateScenarios(int count, int inputNo, List<ScenarioNumeric> queue,
                                     List<InputNumeric> inputs, List<Output> outputs)
        {
            List<InputNumeric> sInputs = new List<InputNumeric>(inputs.Select(x => new InputNumeric(x)));
            List<Output> sOutputs = new List<Output>(outputs);

            //base case: all inputs at max
            if (inputNo == 0 && AllInputsAtMax(inputs))
            {
                return;

                //recursive case
            }
            else {
                ScenarioNumeric scenario = new ScenarioNumeric(count, sInputs, sOutputs);
                queue.Add(scenario);

                int nextInputNo = inputNo;
                //increment last input to the right not at max value
                for (int i = inputs.Count - 1; i >= inputNo; i--)
                {
                    if (inputs[i].IsMax())
                    {
                        //if current input is also at max
                        if (i == inputNo)
                        {
                            //go to next input to the left not at max
                            nextInputNo = GotoLeftInput(inputNo, inputs);
                            break;
                        }
                    }
                    else {
                        IncrementInput(i, inputs);
                        nextInputNo = i;
                        break;
                    }
                }
                CreateScenarios(count + 1, nextInputNo, queue, inputs, outputs);
            }
        }

        private static bool AllInputsAtMax(List<InputNumeric> inputs)
        {
            bool result = true;
            for (int i = 0; i < inputs.Count; i++)
            {
                if (!inputs[i].IsMax())
                {
                    return false;
                }
            }
            return result;
        }

        private static int GotoLeftInput(int pos, List<InputNumeric> inputs)
        {
            int leftPos = 0;
            for (int i = pos; i >= 0; i--)
            {
                if (!inputs[i].IsMax())
                {
                    inputs[i].IncrementValue();
                    SetRightInputsToMin(i + 1, inputs);
                    return i;
                }
            }
            return leftPos;
        }

        private static void IncrementInput(int input, List<InputNumeric> inputs)
        {
            SetRightInputsToMin(input, inputs);
            inputs[input].IncrementValue();
        }

        private static void SetRightInputsToMin(int pos, List<InputNumeric> inputs)
        {
            for (int i = pos; i < inputs.Count; i++)
            {
                inputs[i].SetValueToMin();
            }
        }

        public static void PrepareResultsSheet(ExcelApp file, List<InputNumeric> inputs, List<Output> outputs)
        {
            file.AddWorksheet(Results);
            file.UnfoldSheets();
            string bookname = System.IO.Path.GetFileName(file.Filepath);
            file.CloseBook(bookname);
            file.DisplayWorkbooks("tiled");
            file.SelectActiveSheet(Results);

            //write title
            ExcelAddress titleStart = new ExcelAddress(Results, A1);
            ExcelAddress columnStart = new ExcelAddress(Results, Colstart);
            file.SetValue(titleStart, Title);
            file.MergeCells(titleStart, titleStart.OneRight().OneRight());

            file.SetValue(columnStart, Scenario);
            //write input column names
            ExcelAddress cell = columnStart.OneRight();
            for (int i = 0; i < inputs.Count; i++)
            {
                string name = inputs[i].Name;
                file.SetValue(cell, name.ToUpper());
                cell = cell.OneRight();
            }
            //write output column names
            cell = cell.OneRight();
            for (int i = 0; i < outputs.Count; i++)
            {
                string name = outputs[i].Name;
                file.SetValue(cell, name.ToUpper());
                cell = cell.OneRight();
            }
            file.AutofitColumns(Results);
        }

        public static void WriteResultsSheet(string filepath, string newFilepath, List<ScenarioNumeric> scenarioResults)
        {
            using (ExcelApp file = new ExcelApp(filepath))
            {
                file.AddWorksheet(Results);
                SortScenarios(scenarioResults);

                ExcelAddress titleStart = new ExcelAddress(Results, A1);
                ExcelAddress columnStart = new ExcelAddress(Results, Colstart);
                file.SetValue(titleStart, Title);
                file.MergeCells(titleStart, titleStart.OneRight().OneRight());

                List<InputNumeric> inputs = scenarioResults[0].inputs;
                List<Output> outputs = scenarioResults[0].outputs;

                file.SetValue(columnStart, Scenario);
                //write input column names
                ExcelAddress cell = columnStart.OneRight();
                for (int i = 0; i < inputs.Count; i++)
                {
                    string name = inputs[i].Name;
                    file.SetValue(cell, name.ToUpper());
                    cell = cell.OneRight();
                }
                //write output column names
                cell = cell.OneRight();
                for (int i = 0; i < outputs.Count; i++)
                {
                    string name = outputs[i].Name;
                    file.SetValue(cell, name.ToUpper());
                    cell = cell.OneRight();
                }

                //write scenario row
                ExcelAddress scenarioStart = columnStart.OneDown();
                foreach (ScenarioNumeric scenario in scenarioResults)
                {
                    cell = scenarioStart;
                    //write scenario reference
                    string str = Convert.ToString(scenario.Id);
                    file.SetValue(cell, str);
                    //write scenario input values
                    for (int i = 0; i < inputs.Count; i++)
                    {
                        cell = cell.OneRight();
                        str = Convert.ToString(scenario.inputs[i].Value);
                        file.SetValue(cell, str);
                    }
                    cell = cell.OneRight();
                    //write scenario output values
                    for (int i = 0; i < outputs.Count; i++)
                    {
                        cell = cell.OneRight();
                        str = Convert.ToString(scenario.outputs[i].Value);
                        file.SetValue(cell, str);
                    }
                    scenarioStart = scenarioStart.OneDown();
                }
                file.AutofitColumns(Results);
                //file.SaveTo(newFilepath);
            }

        }

        public static void SortScenarios(List<ScenarioNumeric> list)
        {
            list.Sort((x, y) => x.CompareTo(y));
        }

    }
}

#endregion


/*** methods implementing scenario analysis without concurrency

        //runs scenario analysis on inputs and creates a results summary sheet (without concurrency)
        public static int runScenarios2() {
            int count;
            prepareResultsSheet();
            ExcelAddress startCell = new ExcelAddress(RESULTS, INPUTSTART);
            setInputsToMin();
            count = run(inputs.Count - 1, inputs[inputs.Count - 1].min, new ExcelAddress(RESULTS, INPUTSTART));
            file.autofitColumns();
            return count;
        }

        //recursive function to run scenario analysis (without concurrency)
        private static int run(int inputNo, double inputRange, ExcelAddress cellRow) {
            int count = 0;
            ExcelAddress cell = new ExcelAddress(inputs[inputNo].sheet, inputs[inputNo].cell);
            string value = Convert.ToString(inputRange);

            file.SetValue(cell, value);
            file.Calculate();
            writeScenarioToResults(count, cellRow.CellName);

            //base case
            if (inputNo == 0 && inputRange == inputs[inputNo].max) {
            //recursion case
            } else if (inputRange == inputs[inputNo].max) {
                //set inputs to the right of self to min
                for (int i = inputNo; i < inputs.Count; i++) {
                    ExcelAddress cell2 = new ExcelAddress(inputs[i].sheet, inputs[i].cell);
                    string value2 = Convert.ToString(inputs[i].min);
                    file.SetValue(cell2, value2);
                }
                //go to previous inputNo
                ExcelAddress previousInput = new ExcelAddress(inputs[inputNo - 1].sheet, inputs[inputNo -1].cell);
                double previousInputValue = Convert.ToDouble(file.ReadValue(previousInput));
                count += run(inputNo - 1, previousInputValue + inputs[inputNo - 1].increment, cellRow.OneDown());
            
            //recursion case
            } else {
                //increment input to the right
                ExcelAddress nextInput = new ExcelAddress(inputs[inputNo + 1].sheet, inputs[inputNo + 1].cell);
                double nextInputValue = Convert.ToDouble(file.ReadValue(nextInput));
                count += run(inputNo + 1, nextInputValue + inputs[inputNo + 1].increment, cellRow.OneDown());
            }
            return count;
        }

        //helper method to copy data from model to results sheet
        private static void writeScenarioToResults(int count, string cellRow) {
            ExcelAddress cellToPaste = new ExcelAddress(RESULTS, cellRow);
            string str = Convert.ToString(count);
            file.SetValue(cellToPaste, str);
            //copy input values to results sheet
            for (int j = 0; j < inputs.Count; j++) {
                cellToPaste = cellToPaste.OneRight();
                str = file.ReadValue(new ExcelAddress(inputs[j].sheet, inputs[j].cell));
                file.SetValue(cellToPaste, str);
            }
            //copy output values to results sheet
            cellToPaste = cellToPaste.OneRight();
            for (int j = 0; j < outputs.Count; j++) {
                cellToPaste = cellToPaste.OneRight();
                str = file.ReadValue(new ExcelAddress(outputs[j].sheet, outputs[j].cell));
                file.SetValue(cellToPaste, str);
            }
        }

        //helper method to set inputs in model to min to prepare for scenario analysis
        private static void setInputsToMin() {
            for (int i = 0; i < inputs.Count; i++) {
                Input input = inputs[i];
                ExcelAddress address = new ExcelAddress(input.sheet, input.cell);
                string value = Convert.ToString(input.min);
                file.SetValue(address, value);
            }
        }

        //prepare format of scenario analysis results sheet
        public static void prepareResultsSheet() {
            file.AddWorksheet(RESULTS);
            ExcelAddress colStart = new ExcelAddress(RESULTS, COLSTART);
            file.SetValues(new Dictionary<ExcelAddress, string> {{new ExcelAddress(RESULTS, "A1"), "Summary of Scenario Analysis"}, 
                                                                 {colStart, "Scenario"}});
            //copy input names to results sheet
            ExcelAddress inputCell = colStart.OneRight();
            for (int i = 0; i < inputs.Count; i++) {
                string name = inputs[i].name;
                file.SetValue(inputCell, name);
                inputCell = inputCell.OneRight();
            }
            //copy output names to results sheet
            ExcelAddress outputCell = inputCell;
            outputCell = outputCell.OneRight();
            for (int i = 0; i < outputs.Count; i++) {
                string name = outputs[i].name;
                file.SetValue(outputCell, name);
                outputCell = outputCell.OneRight();
            }

        }

        /*
        public static void prepareSetupSheet() {
            file.AddWorksheet("Setup");
            List<string> inputCols = new List<string>() { "Reference", "Name", "Sheet", "Cell", "Original", "Min", "Max", "Increment" };
            List<string> outputCols = new List<string>() { "Reference", "Name", "Sheet", "Cell", "Original" };

            file.SetValues(new Dictionary<ExcelAddress, string> {{new ExcelAddress("Setup!A1"), "Inputs"},
                                                                {new ExcelAddress("Setup!A3"), "Reference"},
                                                                {new ExcelAddress("Setup!B3"), "Name"},
                                                                {new ExcelAddress("Setup!C3"), "Sheet"},
                                                                {new ExcelAddress("Setup!D3"), "Cell"}});
        }*/
