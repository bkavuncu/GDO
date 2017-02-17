using log4net;

namespace GDO.Core.Apps
{
	/// <summary>
	/// An interace to force hubs to support Logging, 
	/// todo eventually this will be taged on the Hub class forcing all hubs to implement logging 
	/// </summary>
	public interface IHubLog
	{
		ILog Log { get; set; } 

	}
}