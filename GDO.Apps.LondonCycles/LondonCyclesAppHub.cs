﻿using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using GDO.Core;
using GDO.Core.Apps;

using GDO.Utility;
using Microsoft.AspNet.SignalR;

namespace GDO.Apps.LondonCycles
{
	[Export(typeof(IAppHub))]
	public class LondonCyclesAppHub : GDOHub, IBaseAppHub
	{
		public string Name { get; set; } = "LondonCycles";
		public int P2PMode { get; set; } = (int)Cave.P2PModes.None;
		public Type InstanceType { get; set; } = new LondonCyclesApp().GetType();
		public void JoinGroup(string groupId)
		{
			Cave.Deployment.Apps[Name].Hub.Clients = Clients;
			Groups.Add(Context.ConnectionId, "" + groupId);
		}
		public void ExitGroup(string groupId)
		{
			Groups.Remove(Context.ConnectionId, "" + groupId);
		}

		public void UploadMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height,  int zoom)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).SetMapPosition(topLeft, center, bottomRight, resolution, width, height, zoom);
					Clients.Caller.receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
					BroadcastMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void RequestTimeStep()
		{
			int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["LondonCycles"].Instances);
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.receiveTimeStep(instanceId, (((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).TimeStep));
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void SetProperties(int instanceId, int blur, int radius, float opacity, int station, string dataseries)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Blur = blur;
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Radius = radius;
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Opacity = opacity;
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationWidth = station;
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = dataseries;
					Clients.Group("" + instanceId).receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
					Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void RequestProperties(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					int blur = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Blur;
					int radius = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Radius;
					float opacity = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Opacity;
					int station = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationWidth;
					string dataseries = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie;
					Clients.Caller.receiveProperties(instanceId, blur, radius, opacity, station, dataseries);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void StartAnimation()
		{
			int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["LondonCycles"].Instances);
			try
			{
				if (((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).IsAnimating == false)
				{
					Animate();
				}
			}
			catch (Exception e)
			{
				Console.WriteLine(e);
			}
		}

		public void Animate()
		{
			int instanceId = Utilities.GetFirstKey(Cave.Deployment.Apps["LondonCycles"].Instances);
			try
			{
				if (((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).IsAnimating == false)
				{
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).IsAnimating = true;
					while (((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).IsAnimating)
					{
						System.Threading.Thread.Sleep(
							((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).WaitTime);
						if (((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).TimeStep >= 285)
						{
							((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).TimeStep = 0;
						}
						foreach (KeyValuePair<int, IAppInstance> instanceKeyValuePair in Cave.Deployment.Instances)
						{
							if (instanceKeyValuePair.Value.AppName == "LondonCycles")
							{
								Clients.Group("" + instanceKeyValuePair.Value.Id).receiveTimeStep(
									((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).TimeStep);
							}
						}
						((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).TimeStep++;
					}
				}
				else
				{
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).IsAnimating = false;
				}

			}
			catch (Exception e)
			{
				Console.WriteLine(e);
			}
		}

		public void SetBingLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					//change its value with !
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).BingLayer =
						!((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).BingLayer;
					
					Clients.Group("" + instanceId).setBingLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).BingLayer);
					Clients.Caller.setBingLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).BingLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void SetCartoDBLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					//change its value with !
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).CartoDBLayer =
						!((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).CartoDBLayer;

					Clients.Group("" + instanceId).setCartoDBLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).CartoDBLayer);
					Clients.Caller.setCartoDBLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).CartoDBLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
		public void SetOpenCycleLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					//change its value with !
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).OpenCycleLayer =
						!((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).OpenCycleLayer;

					Clients.Group("" + instanceId).setOpenCycleLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).OpenCycleLayer);
					Clients.Caller.setOpenCycleLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).OpenCycleLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void SetStationLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					//change its value with !
					((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationLayer =
						!((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationLayer;

					Clients.Group("" + instanceId).setStationLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationLayer);
					Clients.Caller.setStationLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void SetHeatmapLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					//change its value with !
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).HeatmapLayer = 
						!((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).HeatmapLayer;

					Clients.Group("" + instanceId).setHeatmapLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).HeatmapLayer);
					Clients.Caller.setHeatmapLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).HeatmapLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

 /*       public void SetEntry(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					switch (((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie)
					{
						case "entries":
							((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = "entries";
							break;
						case "exits":
							((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = "exits";
							break;
						case "emptiness":
							((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = "emptiness";
							break;
					}*/
					/*
					if (((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie)
					{
						((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = false;
					}
					else
					{
						((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie = true;
					}*/
 /*                   Clients.Group("" + instanceId).setEntry(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Dataserie);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		} */

		public void RequestBingLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.setBingLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).BingLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void RequestCartoDBLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.setCartoDBLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).CartoDBLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
		public void RequestOpenCycleLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.setOpenCycleLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).OpenCycleLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
		public void RequestStationLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.setStationLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).StationLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void RequestHeatmapLayerVisible(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.setHeatmapLayerVisible(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).HeatmapLayer);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}


		public void UploadMapStyle(int instanceId, string style)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Style = style;
					Clients.Caller.receiveLondonCyclestyle(instanceId, style);
					BroadcastMapStyle(instanceId, style);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void RequestMapPosition(int instanceId, bool control)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					MapPosition position = ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).GetMapPosition();
					if (control)
					{
						Clients.Caller.receiveInitialMapPosition(instanceId, position.Center, position.Resolution, position.Zoom);
					}
					else
					{
						Clients.Caller.receiveMapPosition(instanceId, position.TopLeft, position.Center, position.BottomRight, position.Resolution, position.Width, position.Height, position.Zoom);
					}

				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
		public void RequestMapStyle(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					string style = ((LondonCyclesApp) Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).Style;
					Clients.Caller.receiveMapStyle(instanceId, style);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
		public void BroadcastMapPosition(int instanceId, string[] topLeft, string[] center, string[] bottomRight, string resolution, int width, int height, int zoom)
		{
			Clients.Group("" + instanceId).receiveMapPosition(instanceId, topLeft, center, bottomRight, resolution, width, height, zoom);
		}
		public void BroadcastMapStyle(int instanceId, string style)
		{
			Clients.Group("" + instanceId).receiveLondonCyclestyle(instanceId, style);
		}

		public void Set3DMode(int instanceId, bool mode)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).mode = mode;
					Clients.Group("" + instanceId).receive3DMode(instanceId, mode);
					Clients.Caller.receive3DMode(instanceId, mode);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}

			}
		}

		public void Request3DMode(int instanceId, bool control)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.receive3DMode(instanceId, ((LondonCyclesApp)Cave.Deployment.Apps["LondonCycles"].Instances[instanceId]).mode);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}

		public void UpdateResolution(int instanceId)
		{
			lock (Cave.AppLocks[instanceId])
			{
				try
				{
					Clients.Caller.updateResolution(instanceId);
				}
				catch (Exception e)
				{
					Console.WriteLine(e);
				}
			}
		}
	}
}
