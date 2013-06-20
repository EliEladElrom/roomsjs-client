var options,
    socket;

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
    REQUEST_NUM_OF_USERS = 'numberOfUsersInRoom',
    PRIVATE_MESSAGE = 'privmessage',
    SUBSCRIPTIONS = 'subscriptions',
    DISCONNECT = 'disconnect';


function SocketController(optns) {
    'use strict';
    options = optns;
}

sendMessageToLog = function (msg) {
    'use strict';
    if (options.debugMode) {
        console.log(msg);
    }
}

SocketController.prototype.sendMessageToSocket = function (message) {
    socket.send(message);
    sendMessageToLog('message to room: ' + message);
}

SocketController.prototype.emitMessageToSocket = function (message, data) {
    socket.emit(message,data);
    sendMessageToLog('emit message to room: ' + message);
}

SocketController.prototype.registerUser = function (userId) {
    var data = {
        userId : userId,
        roomName : options.roomSetup.roomName
    };
    this.emitMessageToSocket(REGISTER,data);
    options.userRegisteredCallBackFunction();
}

SocketController.prototype.storeState = function (stateVO, stateName, userId) {

    var object = {
        name : stateName,
        vo : stateVO,
        userId : userId
    };

    sendMessageToLog('store state ' + stateName);
    this.emitMessageToSocket(STORE_STATE,object);
}

SocketController.prototype.getNumberOfRegisteredUsersInRoom = function (userId) {

    var data = {
        userId : userId,
        room : options.roomSetup.roomName
    };

    this.emitMessageToSocket(REQUEST_NUM_OF_USERS, data);
    sendMessageToLog('request num of users in a room');
}

SocketController.prototype.getState = function (userId, stateName) {
    sendMessageToLog('get state: '+stateName);

    var data = {
        userId : userId,
        room : options.roomSetup.roomName,
        stateName : stateName
    };

    this.emitMessageToSocket(GET_STATE,data);
}

SocketController.prototype.connectToSocket = function (transporter) {
    socket = transporter.socket;
    this.listenToMessagesFromSocket();
}

SocketController.prototype.callDbConnector = function (userId, methodName, callBackMethodName, params) {

    var data = {
        userId : userId,
        methodName : methodName,
        room : options.roomSetup.roomName,
        callBackMethodName : callBackMethodName,
        params : params
    };

    this.emitMessageToSocket('dbconnector',data);
}

SocketController.prototype.listenToMessagesFromSocket = function () {

    sendMessageToLog('listenToMessages from room: ' + options.roomSetup.roomName);

    Object.keys(messageTypes).forEach(function (key) {
            socket.on(messageTypes[key], function (data) {
                SocketController.prototype[messageTypes[key]](data);
            });
        });
}

SocketController.prototype[messageTypes.CONNECT] = function (data) {
    socket.emit(JOIN_ROOM, options.roomSetup);
    sendMessageToLog('connect to room: ' + options.roomSetup.roomName);
    options.userConnectedCallBackFunction();
}

SocketController.prototype[messageTypes.DBCONNECTOR] = function (data) {
    sendMessageToLog('dbconnector message back, methodName: ' + data.data.methodName);
    if (data.data.hasOwnProperty('callBackMethodName')) {
        window[data.data.callBackMethodName](data);
    }
}

SocketController.prototype[messageTypes.MESSAGE] = function (data) {
    sendMessageToLog('message from room');
    if (messageFromRoomCallBackfunction != null) {
        messageFromRoomCallBackfunction (data);
    }
}

SocketController.prototype[messageTypes.REQUEST_NUM_OF_USERS] = function (data) {
    sendMessageToLog('numberOfUsersInRoom message: ' + data.size);
    if (options.numOfUsersInARoomCallBackFunction != null) {
        options.numOfUsersInARoomCallBackFunction(data);
    }
}

SocketController.prototype[messageTypes.GET_STATE] = function (data) {
    sendMessageToLog('get state results: ' + data.name);
    messageFromRoomCallBackfunction (data.vo);
}

SocketController.prototype[messageTypes.STATE_CHANGE] = function (data) {
    sendMessageToLog('get state change: ' + data.name);
    options.stateChangeCallBackFunction(data.vo);
}

SocketController.makeid = function (numOfChar) {
    'use strict';
    var text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        i;

    for(i = 0; i < numOfChar; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

if (typeof exports != 'undefined' ) {
    exports.socket = socket;
    exports.options = options;
    exports.CONNECTION = CONNECTION;
    exports.CONNECT = CONNECT;
    exports.MESSAGE = MESSAGE;
    exports.JOIN_ROOM = JOIN_ROOM;
    exports.REGISTER = REGISTER;
    exports.REQUEST_NUM_OF_USERS = REQUEST_NUM_OF_USERS;
    exports.STORE_STATE = STORE_STATE;
    exports.STATE_CHANGE = STATE_CHANGE;
    exports.PRIVATE_MESSAGE = PRIVATE_MESSAGE;
    exports.GET_STATE = GET_STATE;
    exports.SUBSCRIPTIONS = SUBSCRIPTIONS;
    exports.DISCONNECT = DISCONNECT;
    exports.DBCONNECTOR = DBCONNECTOR;
    exports.REQUEST_NUM_OF_USERS = REQUEST_NUM_OF_USERS;
}