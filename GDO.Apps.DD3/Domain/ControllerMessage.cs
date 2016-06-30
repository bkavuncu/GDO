using Newtonsoft.Json;

namespace GDO.Apps.DD3.Domain {
    /*This class represents the message that will be sent from the server to the controller
     * For example, when adding a new browser or initialising the controller
     * Id of the configuration (i.e. data viz)
     * Number of clients
     * state: if the application is stateful. Not used at the moment always initialised at one.
     */
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