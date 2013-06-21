package com.video
{
	import flash.display.Sprite;
	import flash.events.ActivityEvent;
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.StatusEvent;
	import flash.external.ExternalInterface;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.utils.setInterval;
	
	import mx.core.UIComponent;
	
	import spark.components.Group;
	
	public class VideoElement
	{
		import mx.controls.Alert;
		import mx.core.FlexGlobals;
		import mx.core.UIComponent;
		
		
		/***************************
		 *  Settings
		/*************************** */
		private var rtmpEndPoint:String;
		private var isWebCam:Boolean;
		
		public static const ASPECT_RATIO:Number = 500/380;
		public static const LIVE_FEED_WIDTH:Number = 150;  // make sure that both live and stream are in the same aspect ratio
		public static const LIVE_FEED_HEIGHT:Number = LIVE_FEED_WIDTH/ASPECT_RATIO;
		public static const CAM_FEED_WIDTH:Number = 150;
		public static const CAM_FEED_HEIGHT:Number = CAM_FEED_WIDTH/ASPECT_RATIO;	
		public static const FPS:Number = 30; // recommended between 15-30 - defualt 15
		public static const QUALITY:int = 100; // values from 0-100
		public static const BANDWIDTH:int = 0; // when set as 0 will adjust to highest bw based on user's settings
		public static const CAM_FEED_X:Number = 0;
		public static const CAM_FEED_Y:Number = 0;
		public static const LIVE_FEED_BORDER:int = 1;
		
		// video variables
		private var camera:Camera;
		private var mic:Microphone;
		private var netConnection:NetConnection;
		private var cameraNetStream:NetStream = null;
		private var liveFeedNetStream:NetStream;
		private var cameraVideo:Video = null;
		private var liveFeedVideo:Video;
		
		private var isCameraAvaliable:Boolean = false;
		private var isMicAvailable:Boolean = false;
		private var isVideoFMSConnected:Boolean = false;
		
		private var isCoverOnLiveFeed:Boolean;
		
		// feeds ids
		private var camFeedId:String = '';
		private var liveFeedId:String = '';
		
		// views
		private var _videoPlayerGroupElement:Group = new Group();
		private var liveFeed:UIComponent = new UIComponent();
		private var coverCamFeedVideoBorder:UIComponent = new UIComponent();
		private var camFeed:UIComponent = new UIComponent();			
		
		public function get videoPlayerGroupElement():Group
		{
			return _videoPlayerGroupElement;
		}
		
		public function set videoPlayerGroupElement(value:Group):void
		{
			_videoPlayerGroupElement = value;
		}
		
		public function startVideo(rtmpEndPoint:String,roomNameUrl:String,isWebCam:Boolean,camFeedId:String,liveFeedId:String):void {
			this.camFeedId = camFeedId;
			this.liveFeedId = liveFeedId;
			this.rtmpEndPoint = rtmpEndPoint;
			this.isWebCam = isWebCam;
			
			setViews();
			
			if (isWebCam)
				setupCamera();
			
			setCameraCovers();
			
			if (rtmpEndPoint != '')
				connectToFMS();
			else 
				startCameraAndLiveFeed();			
		}
		
		private function setupCamera():void
		{								
			// setup camera
			trace('cameraVideo = new Video('+CAM_FEED_WIDTH+','+(CAM_FEED_HEIGHT+7)+');');
			cameraVideo = new Video(CAM_FEED_WIDTH,CAM_FEED_HEIGHT+7);
			cameraVideo.smoothing = true;
			camFeed.addChild( cameraVideo );

			try {
				mic = MicrophoneAndVideoHelper.setMicOptions(activityHandler, statusHandler);
				isMicAvailable = true;
			}
			catch (error:Error) {
				mic = null;
				isMicAvailable = false;
				setAlertMessage("No Mic detected: " + error.message);
			}
			
			if (Camera.names.length != 0)
				isCameraAvaliable = true;
		}
		
		private function setCameraCovers():void 
		{
			var shapelCamFeedVideoBorder:UIComponent = createShape(CAM_FEED_WIDTH, CAM_FEED_HEIGHT, 0x999999);
			coverCamFeedVideoBorder.addChild(shapelCamFeedVideoBorder);
		}
		
		private function startCameraAndLiveFeed():void
		{			
			if (isWebCam)
				startCamFeedCamera();
			else
				startLiveFeedCamera();
		}
		
		private function connectToFMS():void
		{
			netConnection = new NetConnection();
			netConnection.client = {};
			
			netConnection.addEventListener(NetStatusEvent.NET_STATUS, onNetConnectStatus);
			netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, function(event:SecurityErrorEvent):void { trace('FMS video stream - SecurityErrorEvent'); });
			netConnection.addEventListener(IOErrorEvent.IO_ERROR,function(event:IOErrorEvent):void { trace('FMS video stream - IOErrorEvent'); });
			
			trace("Connecting to stream: "+rtmpEndPoint);
			
			netConnection.connect(rtmpEndPoint);
		}
		
		private function onNetConnectStatus(e:NetStatusEvent):void 
		{
			trace("Connect to netConnection: " + e.info.code);
			
			isVideoFMSConnected = true;
			
			var info:Object = e.info;
			switch (info.code) 
			{
				case "NetStream.Publish.BadName" :
					setAlertMessage("Couldn't connect to video: Bad Name: " + rtmpEndPoint);
					break;
				case "NetConnection.Connect.Success" :
					startCameraAndLiveFeed();					
					break;
				case "NetConnection.Connect.Rejected":
					trace("Rejected");
					break;			
			}
		}
		
		private function cameraNetStreamStatusHandler(e:NetStatusEvent):void {
			trace("Camera Netstream Status: " + e.info.code);
		}
		
		private function netStreamStatusHandler(e:NetStatusEvent):void 
		{
			trace("Netstream Status: " + e.info.code);
			var info:Object = e.info;
			
			switch (info.code) 
			{
				case "NetStream.Play.Reset":
					trace("Play reset");
					break;
				case "NetStream.Play.StreamNotFound":
					trace("Unable to locate video");
					break;
				case "NetStream.Buffer.Empty":
					trace("Buffer empty");
					break;
				case "NetStream.Buffer.Full":
					trace("Buffer full");
					break;
				case "NetStream.Play.Start":
					trace("Play start");
					liveFeed.addChild( liveFeedVideo );
					break; 				
			}
		}		
		
		private function setCamera():void
		{
			camera = Camera.getCamera();
			
			// Cameras & quality
			if (camera)
			{
				camera.addEventListener(StatusEvent.STATUS, onAllowButtonClicked); 
				camera.setMode(LIVE_FEED_WIDTH,LIVE_FEED_WIDTH,FPS,false);
				camera.setQuality(BANDWIDTH,QUALITY);
				
				trace('camera.setMode('+LIVE_FEED_WIDTH+','+LIVE_FEED_WIDTH+','+FPS+',false);');
			}
			else
			{
				setAlertMessage("No Camera detected");
			}
			
			if (netConnection)
			{
				cameraNetStream = new NetStream(netConnection);
				cameraNetStream.client = new BaseNetStreamClient(cameraNetStream);
			}
			else
			{
				setAlertMessage("Couldn't connect camera to FMS server netConnection not connected");
			}
		}
		
		private function onAllowButtonClicked(event:StatusEvent):void
		{
			trace('onAllowButtonClicked: event code: '+event.code);
			ExternalInterface.call('acceptWebCam');
		}
		
		private function activityHandler(event:ActivityEvent):void 
		{
			trace("activityHandler: " + event);
		}
		
		private function statusHandler(event:StatusEvent):void 
		{
			trace("statusHandler: " + event);
		}
		
		private function createShape(shapeWidth:Number, shapeHeight:Number, shapeColor:uint):UIComponent
		{
			var rect:Sprite = new Sprite();
			rect.graphics.lineStyle(1, shapeColor);
			rect.graphics.beginFill(shapeColor);
			rect.graphics.drawRect(0,0,shapeWidth, shapeHeight);
			rect.graphics.endFill();
			
			var uicom:UIComponent = new UIComponent();
			
			uicom.addChild(rect);	
			uicom.x = uicom.y = 0;
			uicom.width = uicom.height = 100;
			
			return uicom;
		}
		
		private function startCamFeedCamera():void
		{
			setCamera();

			cameraVideo.attachCamera(camera);
			cameraNetStream.attachCamera(camera);
			
			trace('-- attach camera to video and netstream (to stream on FMS)');
			trace('cameraVideo.attachCamera(camera);');
			trace('cameraNetStream.attachCamera(camera);');			
			
			if (mic != null && cameraNetStream)
				cameraNetStream.attachAudio(mic);
			else 
				trace('mic is off due to cameraNetStream or no mic detected');
			
			if (cameraNetStream)
			{	
				cameraNetStream.addEventListener(NetStatusEvent.NET_STATUS, cameraNetStreamStatusHandler);
				
				trace('cameraNetStream.publish('+getCameraFeedId+');');
				cameraNetStream.publish(getCameraFeedId);
			}
			else
			{
				error("Error connecting camera to FMS server cameraNetStream null");
			}
		}
		
		private function startLiveFeedCamera():void
		{
			trace('startLiveFeedCamera');
			
			// bring from FMS 
			if (netConnection && netConnection.connected)
			{
				var infoClient:Object = new Object();
				infoClient.onMetaData = function oMD():void {};
				infoClient.onCuePoint = function oCP():void {};
				
				liveFeedNetStream = new NetStream(netConnection,NetStream.CONNECT_TO_FMS);
				liveFeedNetStream.client = infoClient;	
								
				trace('play stream: "' + getLiveFeedId + '"');
				liveFeedNetStream.addEventListener(NetStatusEvent.NET_STATUS, netStreamStatusHandler);
				liveFeedNetStream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
				liveFeedVideo.attachNetStream(liveFeedNetStream);
				liveFeedNetStream.play(getLiveFeedId);
			}
			else
			{
				error("Couldn't connect to FMS server");
			}
		}
		
		public function onFCSubscribe(info:Object):void {       
			// Do nothing. Prevents error if connecting to CDN.     
		}
		
		public function onFCUnsubscribe(info:Object):void {     
			// Do nothing. Prevents error if connecting to CDN.     
		}
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			trace('AsyncErrorEvent: '+event.text);
		}
		
		private function get getLiveFeedId():String
		{
			return liveFeedId;	
		}
		
		private function get getCameraFeedId():String
		{
			return camFeedId;
		}
		
		private function error(message:String):void
		{
			trace(message);
		}			
		
		private function setAlertMessage(message:String):void
		{
			// Alert.show( message );
			trace("---> Alert Message: "+message);
		}
		
		private function setViews():void {
			if (isWebCam) {
				trace('Setting WebCam');
				coverCamFeedVideoBorder.x=CAM_FEED_X; coverCamFeedVideoBorder.y=CAM_FEED_Y;
				camFeed.width=CAM_FEED_WIDTH; camFeed.height=CAM_FEED_HEIGHT; camFeed.x=CAM_FEED_X; camFeed.y=CAM_FEED_Y;
				videoPlayerGroupElement.addElement( coverCamFeedVideoBorder );
				videoPlayerGroupElement.addElement( camFeed );
			} else {
				trace('Setting liveStream');
				coverCamFeedVideoBorder.x=CAM_FEED_X; coverCamFeedVideoBorder.y=CAM_FEED_Y;
				camFeed.width=CAM_FEED_WIDTH; camFeed.height=CAM_FEED_HEIGHT; camFeed.x=CAM_FEED_X; camFeed.y=CAM_FEED_Y;
				videoPlayerGroupElement.addElement( coverCamFeedVideoBorder );
				
				liveFeed.width=LIVE_FEED_WIDTH; liveFeed.height=LIVE_FEED_HEIGHT; liveFeed.y=liveFeed.x=0;
				videoPlayerGroupElement.addElement( liveFeed );
				liveFeedVideo = new Video(LIVE_FEED_WIDTH,LIVE_FEED_HEIGHT);
			}
		}		
	}
}