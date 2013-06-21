package com.video
{
	import flash.events.ActivityEvent;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	
	public final class MicrophoneAndVideoHelper
	{
		public static function setMicOptions(activityHandler:Function, statusHandler:Function):Microphone
		{
			var microphone:Microphone = Microphone.getMicrophone();
			
			// settings
			microphone.setLoopBack(false);
			microphone.setUseEchoSuppression(true); // being ignored but setting it anyway
			microphone.encodeQuality = 6; 
			microphone.framesPerPacket = 1;
			microphone.setSilenceLevel(0, 2000);
			microphone.gain = 75;
			microphone.rate = 16;	
			
			microphone.addEventListener(ActivityEvent.ACTIVITY, activityHandler);
			microphone.addEventListener(StatusEvent.STATUS, statusHandler);
			
			return microphone;
		}		
	}
}