using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class FuzzyQuery6 : FuzzyQuery
    {

        private LinguisticVariable degree;
        private readonly LinguisticVariable interest;


        public FuzzyQuery6()
        {
            degree = new LinguisticVariable("Degree");
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 2, 4));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 2, 4, 12, 15));
            degree.MembershipFunctionCollection.Add(new MembershipFunction("High", 12, 15, 150, 150));

            interest = new LinguisticVariable("Interest");
            interest.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            interest.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(degree);
            fuzzyEngine.LinguisticVariableCollection.Add(interest);
            fuzzyEngine.Consequent = "Interest";

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS High) THEN Interest IS High"));

            //fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Low) AND (Weight IS Low) THEN Interest IS Low"));
            //fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Degree IS Medium) AND (Weight IS Medium) THEN Interest IS Low"));
            
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