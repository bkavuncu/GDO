using Newtonsoft.Json;

namespace GDO.Apps.DD3.Domain {
    public class ControllerMessage
    {
        public ControllerMessage(int configurationId, int state, int numClient)
        {
            this.configurationId = configurationId;
            this.numClient = numClient;
            this.state = state;
        }

        public string toString ()
        {
            return JsonConvert.SerializeObject(this);
        }

        public int configurationId { get; set; }
        public int state { get; set; }
        public int numClient { get; set; }
    }
}