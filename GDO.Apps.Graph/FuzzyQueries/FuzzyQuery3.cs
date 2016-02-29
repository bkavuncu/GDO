using System;
using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class FuzzyQuery3 : FuzzyQuery
    {

        private LinguisticVariable degree;
        private readonly LinguisticVariable interest;


        public FuzzyQuery3()
        {
            degree = new LinguisticVariable("Degree");
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 20, 30));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 20, 30, 1400, 1500));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("High", 1400, 1500, 3000, 3000));

            interest = new LinguisticVariable("Interest");
            interest.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            interest.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(degree);
            fuzzyEngine.LinguisticVariableCollection.Add(interest);
            fuzzyEngine.Consequent = "Interest";
            
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) THEN Interest IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Low) OR (Degree IS Medium) THEN Interest IS Low"));

            
        }


        public override double DoInference(int degreeValue, double weightValue)
        {
            degree.InputValue = degreeValue;

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