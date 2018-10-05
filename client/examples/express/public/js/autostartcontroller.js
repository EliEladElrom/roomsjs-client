/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

var isAutoConnect = false,
  rooms,
  userId,
  roomName;

function connectToSocket() {
  'use strict';
  var hostName = window.location.hostname,
    port,
    roomSetup,
    transporter,
    connectURL;

  userId = Rooms.makeid(16);
  roomName = window.location.href;

  connectURL = 'http://0.0.0.0:8081';
  // connectURL = 'http://devsocket1.webthriftstore.com:80';

  roomSetup = {
    roomName : roomName,
    subscriptions : {
      RoomInfoVO : true
    }
  };

  rooms = new Rooms({
    roomSetup : roomSetup,
    userConnectedCallBackFunction : userConnectedCallBackFunction,
    userRegisteredCallBackFunction : userRegisteredCallBackFunction,
    numOfUsersInARoomCallBackFunction : numOfUsersInARoomCallBackFunction,
    stateChangeCallBackFunction : stateChangeCallBackFunction,
    debugMode : true
  });

  // or localhost on server
  transporter = new eio.Socket('ws://localhost/');

  rooms.start({
    transporter : transporter,
    type : 'engine.io'
  });
}

function stateChangeCallBackFunction(data) {
  'use strict';
  // impl
}

function userConnectedCallBackFunction() {
  'use strict';
  if (isAutoConnect) {
    rooms.registerUser(userId);
  }
}

function userRegisteredCallBackFunction() {
  'use strict';
  rooms.getNumberOfRegisteredUsersInRoom(userId);

  $(function() {
    applicationConnectedReady();
  });
}

function numOfUsersInARoomCallBackFunction(data) {
  'use strict';
  var numofppl = data.size;
  document.getElementById('visitors').innerHTML = '<div style="font-size: 15px; top: 5px">Currently there are <b>'+numofppl+'</b> visitors on this page</div>';

  if (data.hasOwnProperty('register')) {
    sendMessageToLog('register userId: ' + data.register);
  } else if (data.hasOwnProperty('disconnect')) {
    sendMessageToLog('disconnect userId: ' + data.disconnect);
  }
}

function connectUser() {
  'use strict';
  isAutoConnect = true;
  connectToSocket();
}

if (typeof jQuery !== 'undefined') {
  $(document).ready(function () {
    'use strict';
    connectUser();
  });
} else {
  sendMessageToLog('jQuery not loaded');
}

function serviceCall(serviceMethodName, retCallBackName, params) {
  'use strict';
  console.log('Calling: ' + serviceMethodName);
  rooms.callDbConnector(userId, serviceMethodName, retCallBackName, params);
}