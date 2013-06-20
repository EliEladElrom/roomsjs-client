/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

var isAutoConnect = false,
    socketController,
    userId,
    roomName;

function listenToUserActions() {
    $("#getResultsButton").bind('click', function () {
        socketController.callDbConnector(userId, 'getitems', 'messageFromRoomCallBackfunction');
        socketController.callDbConnector(userId, 'getnames', 'messageFromRoomCallBackfunction');
    });
}

function connectToSocket() {
    'use strict';
    var hostName = window.location.hostname,
        port,
        roomSetup,
        transporter,
        connectURL;

    userId = SocketController.makeid(10);
    roomName = window.location.hostname;
    port = (hostName !== '0.0.0.0' && hostName !== 'localhost') ? '80' : '8081';
    connectURL = 'http://' + roomName + ':' + port;

    roomSetup = {
        roomName : roomName,
        subscriptions : {
            RoomInfoVO : true
        }
    };

    socketController = new SocketController({
        roomSetup : roomSetup,
        userConnectedCallBackFunction : userConnectedCallBackFunction,
        userRegisteredCallBackFunction : userRegisteredCallBackFunction,
        numOfUsersInARoomCallBackFunction : numOfUsersInARoomCallBackFunction,
        stateChangeCallBackFunction : stateChangeCallBackFunction,
        debugMode : true
    });

    transporter = {
        transporterType : 'engine.io',
        socket : io.connect(connectURL)
    };

    socketController.connectToSocket(transporter);
}

function stateChangeCallBackFunction(data) {
    'use strict';
    // impl
}

function userConnectedCallBackFunction() {
    'use strict';
    if (isAutoConnect) {
        socketController.registerUser(userId);
    }
}

function userRegisteredCallBackFunction() {
    'use strict';
    socketController.getNumberOfRegisteredUsersInRoom(userId);
}

function numOfUsersInARoomCallBackFunction(data) {
    'use strict';
    var numofppl = data.size;
    document.getElementById('visitors').innerHTML = '<div style="font-size: 15px; top: 5px">Currently there are <b>'+numofppl+'</b> visitors on this page</div>';

    if (data.hasOwnProperty('register')) {
        console.log('register userId: ' + data.register);
    } else if (data.hasOwnProperty('disconnect')) {
        console.log('disconnect userId: ' + data.disconnect);
    }
}

function messageFromRoomCallBackfunction(data) {
    'use strict';
    console.log('messageFromRoomCallBackfunction');
    console.log(JSON.stringify(data.vo));
}

function messageFromRoomCallBackfunction2(data) {
    'use strict';
    console.log('messageFromRoomCallBackfunction2');
    console.log(JSON.stringify(data.vo));
}

function connectUser() {
    'use strict';
    isAutoConnect = true;
    connectToSocket();
}

$(document).ready(function () {
    'use strict';
    connectUser();
    listenToUserActions();
});