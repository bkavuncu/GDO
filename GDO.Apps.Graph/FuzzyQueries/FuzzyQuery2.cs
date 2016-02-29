using System;
using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class FuzzyQuery2 : FuzzyQuery
    {

        private LinguisticVariable degree;
        private LinguisticVariable weight;
        private readonly LinguisticVariable evil;


        public FuzzyQuery2()
        {
            degree = new LinguisticVariable("Degree");
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 2, 4));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 2, 4, 12, 15));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("High", 12, 15, 150, 150));

            weight = new LinguisticVariable("Weight");
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 6, 7));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 6, 7, 8, 9));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("High", 8, 9, 10, 10));

            evil = new LinguisticVariable("Evil");
            evil.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            evil.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(degree);
            fuzzyEngine.LinguisticVariableCollection.Add(weight);
            fuzzyEngine.LinguisticVariableCollection.Add(evil);
            fuzzyEngine.Consequent = "Evil";

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) THEN Evil IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Low) THEN Evil IS Low"));

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Low) THEN Evil IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Medium) THEN Evil IS Low"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS High) THEN Evil IS Low"));

            
            //fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Low) THEN Evil IS High"));
            //fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) OR (Weight IS High) THEN Interest IS High"));
            //fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Medium) THEN Interest IS Low"));

        }


        public override double DoInference(int degreeValue, double weightValue)
        {
            degree.InputValue = degreeValue;
            weight.InputValue = weightValue;

            return Infer();
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



    }
}