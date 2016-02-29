using DotFuzzy;

namespace GDO.Apps.Graph
{
    public abstract class FuzzyQuery
    {

        protected FuzzyEngine fuzzyEngine;


        public FuzzyQuery()
        {
            fuzzyEngine = new FuzzyEngine();
        }

        public abstract double DoInference(int degreeValue, double weightValue);



        public double Infer()
        {
            return fuzzyEngine.Defuzzify();
        }


    }
}