var options,
  transporter;

// message in
var messageTypes = {
  CONNECT : 'connect',
  MESSAGE : 'message',
  REQUEST_NUM_OF_USERS : 'numberOfUsersInRoom',
  STATE_CHANGE : 'stateChange',
  GET_STATE : 'getState',
  DBCONNECTOR : 'dbconnector'
};

// messages out
var CONNECTION = 'connection',
  JOIN_ROOM = 'joinRoom',
  REGISTER = 'register',
  STORE_STATE = 'storeState',
  REQUEST_NUM_OF_USERS = messageTypes.REQUEST_NUM_OF_USERS,
  PRIVATE_MESSAGE = 'privmessage',
  SUBSCRIPTIONS = 'subscriptions',
  DISCONNECT = 'disconnect';

function Rooms(optns) {
  'use strict';
  options = optns;
}

sendMessageToLog = function (msg) {
  'use strict';
  if (options.debugMode) {
    console.log(msg);
  }
}

Rooms.prototype.registerUser = function (userId) {
  var data = {
    userId : userId,
    roomName : options.roomSetup.roomName
  };
  this.sendMessage(REGISTER, data);
  options.userRegisteredCallBackFunction();
}

Rooms.prototype.storeState = function (stateVO, stateName, userId) {

  var object = {
    roomName : options.roomSetup.roomName,
    name : stateName,
    vo : stateVO,
    userId : userId
  };

  sendMessageToLog('store state ' + stateName);
  this.sendMessage(STORE_STATE, object);
}

Rooms.prototype.getNumberOfRegisteredUsersInRoom = function (userId) {

  var data = {
    userId : userId,
    room : options.roomSetup.roomName
  };

  this.sendMessage(REQUEST_NUM_OF_USERS, data);
  sendMessageToLog('request num of users in a room to user: ' + JSON.stringify(data));
}

Rooms.prototype.getState = function (userId, stateName) {
  sendMessageToLog('get state: '+ stateName);

  var data = {
    userId : userId,
    room : options.roomSetup.roomName,
    stateName : stateName
  };

  this.sendMessage(GET_STATE, data);
}

Rooms.prototype.start = function (options) {
  transporter = options.transporter;

  switch (options.type) {
    case 'socket.io':
      Object.keys(messageTypes).forEach(function (key) {
        transporter.on(messageTypes[key], function (data) {
          Rooms.prototype[messageTypes[key]](data);
        });
      });
      break;
    case 'engine.io':
      transporter.onopen = function () {
        transporter.onmessage = function (data) {
          var dataParsed = JSON.parse(data);
          Rooms.prototype[dataParsed.message](dataParsed.data);
        };
      }
      break;
    case 'SockJS':
      transporter.onopen = function () {
        transporter.onmessage = function (data) {
          console.log(data);
          var dataParsed = JSON.parse(data.data);
          Rooms.prototype[dataParsed.message](dataParsed.data);
        };
      }
      break;
  }
}

Rooms.prototype.callDbConnector = function (userId, methodName, callBackMethodName, params) {

  var data = {
    userId : userId,
    methodName : methodName,
    room : options.roomSetup.roomName,
    callBackMethodName : callBackMethodName,
    params : params
  };

  this.sendMessage('dbconnector',data);
}

Rooms.prototype[messageTypes.CONNECT] = function (data) {
  this.sendMessage(JOIN_ROOM, options.roomSetup);
  sendMessageToLog('connect to room: ' + options.roomSetup.roomName);
  options.userConnectedCallBackFunction();
}

Rooms.prototype[messageTypes.DBCONNECTOR] = function (data) {
  sendMessageToLog('dbconnector message back, methodName: ' + data.data.methodName);
  if (data.data.hasOwnProperty('callBackMethodName')) {
    if (options.hasOwnProperty('serviceCallBackHandler')) {
      // method handled by a callback method
      options.serviceCallBackHandler(data);
    } else {
      // method set on global
      window[data.data.callBackMethodName](data);
    }
  }
}

Rooms.prototype[messageTypes.MESSAGE] = function (data) {
  sendMessageToLog('message from room');
  if (messageFromRoomCallBackfunction != null) {
    messageFromRoomCallBackfunction (data);
  }
}

Rooms.prototype[messageTypes.REQUEST_NUM_OF_USERS] = function (data) {
  sendMessageToLog('numberOfUsersInRoom message: ' + data.size);
  if (options.numOfUsersInARoomCallBackFunction != null) {
    options.numOfUsersInARoomCallBackFunction(data);
  }
}

Rooms.prototype[messageTypes.GET_STATE] = function (data) {
  sendMessageToLog('get state results: ' + data.name);
  messageFromRoomCallBackfunction (data.vo);
}

Rooms.prototype[messageTypes.STATE_CHANGE] = function (data) {
  sendMessageToLog('get state change: ' + data.name);
  options.stateChangeCallBackFunction(data.vo);
}

Rooms.makeid = function (numOfChar) {
  'use strict';
  var text = "",
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    i;

  for(i = 0; i < numOfChar; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

Rooms.prototype.sendMessage = function (message, data) {
  transporter.send(JSON.stringify({ message : message, data : data}));
  sendMessageToLog('send message to room: ' + message);
}

if (typeof exports != 'undefined' ) {
  exports.transporter = transporter;
  exports.options = options;
  exports.CONNECTION = CONNECTION;
  exports.CONNECT = messageTypes.CONNECT;
  exports.MESSAGE = messageTypes.MESSAGE;
  exports.JOIN_ROOM = JOIN_ROOM;
  exports.REGISTER = REGISTER;
  exports.REQUEST_NUM_OF_USERS = REQUEST_NUM_OF_USERS;
  exports.STORE_STATE = STORE_STATE;
  exports.STATE_CHANGE = messageTypes.STATE_CHANGE;
  exports.PRIVATE_MESSAGE = PRIVATE_MESSAGE;
  exports.GET_STATE = messageTypes.GET_STATE;
  exports.SUBSCRIPTIONS = SUBSCRIPTIONS;
  exports.DISCONNECT = DISCONNECT;
  exports.DBCONNECTOR = messageTypes.DBCONNECTOR;
}