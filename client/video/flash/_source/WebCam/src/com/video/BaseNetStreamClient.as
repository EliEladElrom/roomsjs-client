package com.video
{
	import flash.display.Loader;
	import flash.events.Event;
	import flash.net.NetStream;
	import flash.utils.ByteArray;
	
	/**
	 * Dispatched when camera activity level is received
	 *
	 * @eventType shindig.api.communication.event.ActivityLevelUpdateEvent.CAMERA_ACTIVITY_LEVEL_UPDATE
	 */ 
	[Event(name="cameraActivityLevelUpdate", type="shindig.api.communication.event.ActivityLevelUpdateEvent")]
	
	/**
	 * Dispatched when microphone activity level is received
	 *
	 * @eventType shindig.api.communication.event.ActivityLevelUpdateEvent.MICROPHONE_ACTIVITY_LEVEL_UPDATE
	 */ 
	[Event(name="microphoneActivityLevelUpdate", type="shindig.api.communication.event.ActivityLevelUpdateEvent")]
	
	/**
	 * Dispatched when an object of type <code>ISharedModel</code> is received through the 
	 * NetStream
	 * 
	 * @eventType obecto.event.DataObjectEvent
	 * 
	 * @see shindig.api.communication.model.shared.ISharedModel
	 */ 
	[Event(name="sharedModelReceived", type="obecto.event.DataObjectEvent")]
	
	/**
	 * Dispatched when a node's heartbeat to which the current node is subscribed is received
	 * 
	 * @eventType obecto.event.DataObjectEvent
	 */ 
	[Event(name="heartbeatReceived", type="obecto.event.DataObjectEvent")]
	
	/**
	 * Dispatched when a beacon is received from the node to which the current node is subscribed
	 * 
	 * @eventType obecto.event.DataObjectEvent
	 */ 
	[Event(name="beaconReceived", type="obecto.event.DataObjectEvent")]
	
	/**
	 * A class used by the <code>BaseNetStreamTransportAdapter</code> class as a client 
	 * for the NetStream objects.
	 * 
	 * @see shindig.api.communication.transport.impl.BaseNetStreamTransportAdapter
	 */ 
	public class BaseNetStreamClient
	{
		/**
		 * @private
		 */ 
		public static const ACTIVITY_LEVELS_UPDATE_HANDLER_NAME:String = "activityLevelsUpdate";
		/**
		 * @private
		 */
		public static const SHARED_MODEL_HANDLER_NAME:String = "handleSharedModelReceive";
		
		/**
		 * @private
		 */
		public static const TIMESTAMP_HANDLER_NAME:String = "handleHeartBeat";
		
		/**
		 * @private
		 */
		public static const BEACON_HANDLER_NAME:String = "handleBeacon";
		
		/**
		 * The name of the beacon received event
		 */
		public static const BEACON_RECEIVED_EVENT:String = "beaconReceived";
		
		/**
		 * a reference to the NetStream object on which this object is the client
		 */ 
		public var netStream:NetStream;
		
		/**
		 * Constructor
		 */ 
		public function BaseNetStreamClient(netStream:NetStream)
		{
			this.netStream = netStream;
		}
		
		/**
		 * @private
		 */
		public function handleSharedModelReceive(sharedModel:Object, ...rest):void
		{
		}
		
		/**
		 * @private
		 */
		public function onBWDone():void
		{
			// LOG.info("onBWDone");
		}
		
		/**
		 * @private
		 */
		public function onPeerConnect(netStream:NetStream):Boolean
		{
			// LOG.info("onPeerConnect");
			
			return true;
		}
		
		/**
		 * @inheritDoc
		 */
		public function sendActivityLevels(microphoneActivityLevel : Number, cameraActivityLevel : Number) : void
		{
		}
		
		/**
		 * @private
		 */ 
		public function handleHeartBeat(nodeId:String):void
		{
		}
		
		/**
		 * @inheritDoc
		 */
		public function sendHeartbeat(nodeId:String):void
		{
		}
		
		public function sendHackSampleAccess():void
		{
		}
		
		public function onPlayStatus( p_o:Object ):void
		{
			
		}
		
		/**
		 * @private
		 */
		public function activityLevelsUpdate(microphoneActivityLevel : Number, cameraActivityLevel : Number) : void
		{
		}
		
		protected var imageLoader:Loader;
		public function imageSnapshot( imageData:ByteArray ):void
		{
		}
		
		protected function onImageDataLoaded( event:Event ):void
		{
		}
		
		public function sendBeacon(beacon:Object):void
		{
		}
		
		public function handleBeacon(beacon:Object):void
		{
		}
		
	}
}