using Microsoft.AspNet.SignalR;

namespace GDO.Core
{
    public class GDOHub : Hub {
        /// <summary>
        /// The root which all Hubs in the GDO framework should inherit from. 
        /// Sets the state from another hub, this is a hack to get around problems with SignalR / AutoFac integration 
        /// </summary>
        /// <param name="other">The other.</param>
        public void SetStateFrom(Hub other) {
            // todo this should only be done if the hubconnectioncontext actually contains NullClientProxy
            
            this.Context = other.Context;
            this.Clients = other.Clients; //todo try to load this from the  Cave.Deployment.Apps[app].Hub.Clients ???
            this.Groups = other.Groups;
            
            // todo i am not sure this is a good idea
        }

        /// <summary>
        /// Signals the configuration updated - please override to do your signalling
        /// </summary>
        public virtual void SignalConfigUpdated(int instanceId) {
            
        }


    }
}