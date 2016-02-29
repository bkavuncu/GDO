using DotFuzzy;

namespace GDO.Apps.Graph
{
    public class FuzzyQuery7 : FuzzyQuery
    {

        private LinguisticVariable weight;
        private readonly LinguisticVariable interest;


        public FuzzyQuery7()
        {
            weight = new LinguisticVariable("Weight");
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 50, 60));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("Medium", 50, 60, 170, 180));
            weight.MembershipFunctionCollection.Add(new MembershipFunction("High", 170, 180, 211, 211));

            interest = new LinguisticVariable("Interest");
            interest.MembershipFunctionCollection.Add(new MembershipFunction("Low", 0, 0, 0, 0.5));
            interest.MembershipFunctionCollection.Add(new MembershipFunction("High", 0.5, 1, 1, 1));

            fuzzyEngine = new FuzzyEngine();
            fuzzyEngine.LinguisticVariableCollection.Add(weight);
            fuzzyEngine.LinguisticVariableCollection.Add(interest);
            fuzzyEngine.Consequent = "Interest";

            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Weight IS High) THEN Interest IS High"));
            fuzzyEngine.FuzzyRuleCollection.Add(new FuzzyRule("IF (Weight IS Low) OR (Weight IS Medium) THEN Interest IS Low"));
            
        }


        public override double DoInference(int degreeValue, double weightValue)
        {
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