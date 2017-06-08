using Microsoft.AspNet.SignalR;

namespace GDO.Core
{
    public class GDOHub : Hub {
        /// <summary>
        /// Sets the state from another hub, this is a hack to get around problems with SignalR / AutoFac integration 
        /// </summary>
        /// <param name="other">The other.</param>
        public void SetStateFrom(Hub other) {
            // todo this should only be done if the hubconnectioncontext actually contains NullClientProxy
            
            this.Context = other.Context;
            this.Clients = other.Clients;
            this.Groups = other.Groups;// todo i am not sure this is a good idea
        }

    }
}