using System;
using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class FuzzyQuery1
    {

        private LinguisticVariable degree;
        private LinguisticVariable weight;
        private readonly LinguisticVariable interest;
        private FuzzyEngine fuzzyEngine;


        public FuzzyQuery1()
        {
            degree = new LinguisticVariable("Degree");
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 2, 4));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 2, 4, 12, 15));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("High", 12, 15, 150, 150));

            weight = new LinguisticVariable("Weight");
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 6, 7));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 6, 7, 8, 9));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("High", 8, 9, 10, 10));

            interest = new LinguisticVariable("Interest");
            interest.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            interest.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            interest = new LinguisticVariable("Danger");
            interest.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            interest.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(degree);
            fuzzyEngine.LinguisticVariableCollection.Add(weight);
            fuzzyEngine.LinguisticVariableCollection.Add(interest);
            fuzzyEngine.Consequent = "Interest";

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) OR (Weight IS High) THEN Interest IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Low) AND (Weight IS Low) THEN Interest IS Low"));

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) AND (Weight IS Low) THEN Danger IS High"));

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Weight IS High) THEN Interest IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Medium) THEN Interest IS Low"));
            
        }


        public double DoInference(int degreeValue, double weightValue)
        {
            degree.InputValue = degreeValue;
            weight.InputValue = weightValue;

            return fuzzyEngine.Defuzzify();
        }


        void RunExample()
        {
            var values = new[]
            {
                new{degree=1, weight=1},
                new{degree=20, weight=2},
                new{degree=4, weight=50},
                new{degree=1, weight=10}
            };

            foreach (var v in values)
            {
                System.Console.WriteLine("Degree: "+v.degree + " Weight: "+v.weight +" --> "+DoInference(v.degree, v.weight));
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