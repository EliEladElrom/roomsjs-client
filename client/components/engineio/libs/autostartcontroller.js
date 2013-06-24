/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

var isAutoConnect = false,
    rooms,
    userId,
    roomName;

function listenToUserActions() {
    $("#getResultsButton").bind('click', function () {
        rooms.callDbConnector(userId, 'getitems', 'messageFromRoomCallBackfunction');
        rooms.callDbConnector(userId, 'getnames', 'messageFromRoomCallBackfunction');
    });
}

function connectToSocket() {
    'use strict';
    var hostName = window.location.hostname,
        port,
        roomSetup,
        transporter,
        connectURL;

    userId = Rooms.makeid(16);
    roomName = window.location.href;
    port = (hostName !== '0.0.0.0' && hostName !== 'localhost') ? '80' : '8081';
    connectURL = 'http://' + hostName + ':' + port;

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

if (typeof jQuery !== 'undefined') {
    $(document).ready(function () {
        'use strict';
        connectUser();
        listenToUserActions();
    });
} else {
    console.log('jQuery not loaded');
}