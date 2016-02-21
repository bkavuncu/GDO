using System;
using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class TestFuzzy
    {
        static void Main(string[] args)
        {
            Example2();
            Console.ReadKey();
        }


        /****************************************************************************************************************/

        static void Example1()
        {
            LinguisticVariable water = new LinguisticVariable("Water");
            water.MembershipFunctionCollection.Add(new MembershipFunction("Cold", 0, 0, 20, 40));
            water.MembershipFunctionCollection.Add(new MembershipFunction("Tepid", 30, 50, 50, 70));
            water.MembershipFunctionCollection.Add(new MembershipFunction("Hot", 50, 80, 100, 100));

            LinguisticVariable power = new LinguisticVariable("Power");
            power.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 25, 25, 50));
            power.MembershipFunctionCollection.Add(new MembershipFunction("High", 25, 50, 50, 75));

            FuzzyEngine fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(water);
            fuzzyEngine.LinguisticVariableCollection.Add(power);
            fuzzyEngine.Consequent = "Power";
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Water IS Cold) OR (Water IS Tepid) THEN Power IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Water IS Hot) THEN Power IS Low"));

            water.InputValue = 60;

            try
            {
                System.Console.WriteLine(fuzzyEngine.Defuzzify().ToString());
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.Message);
            }
        }


        static void Example2()
        {
            LinguisticVariable service = new LinguisticVariable("Service");
            service.MembershipFunctionCollection.Add(new MembershipFunction("Poor", 0, 0, 0, 1.5));
            service.MembershipFunctionCollection.Add(new MembershipFunction("Good", 3.5, 5, 5, 6.5));
            service.MembershipFunctionCollection.Add(new MembershipFunction("Excellent", 8.5, 10, 10, 11.5));

            LinguisticVariable food = new LinguisticVariable("Food");
            food.MembershipFunctionCollection.Add(new MembershipFunction("Rancid", -2, 0, 2, 4));
            food.MembershipFunctionCollection.Add(new MembershipFunction("Delicious", 7, 9, 11, 13));

            LinguisticVariable tip = new LinguisticVariable("Tip");
            tip.MembershipFunctionCollection.Add(new MembershipFunction("Cheap", 0, 5, 5, 10));
            tip.MembershipFunctionCollection.Add(new MembershipFunction("Average", 7.5, 12.5, 12.5, 17.5));
            tip.MembershipFunctionCollection.Add(new MembershipFunction("Generous", 15, 20, 20, 25));

            FuzzyEngine fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(service);
            fuzzyEngine.LinguisticVariableCollection.Add(food);
            fuzzyEngine.LinguisticVariableCollection.Add(tip);
            fuzzyEngine.Consequent = "Tip";
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Service IS Poor) OR (Food IS Rancid) THEN Tip IS Cheap"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Service IS Good) THEN Tip IS Average"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Service IS Excellent) OR (Food IS Delicious) THEN Tip IS Generous"));

            service.InputValue = 4;
            food.InputValue = 4;

            try
            {
                System.Console.WriteLine(fuzzyEngine.Defuzzify().ToString());
                Console.ReadLine();
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.Message);
            }
        }
    }
}