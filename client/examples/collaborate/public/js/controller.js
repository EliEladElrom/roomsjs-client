/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 * Code licensed under the BSD License:
 * @author Elad Elrom <elad.ny...gmail.com>
 */

var isAutoConnect = false,
  rooms,
  userId,
  roomName;

var cursors = {},
    clientVO,
    isDragging = true,
    topPositionVideoStart = 50;

function connectToSocket() {
  'use strict';
  var hostName = window.location.hostname,
    roomSetup,
    transporter;

  userId = Rooms.makeid(16);
  roomName = 'tester';

  roomSetup = {
    roomName : roomName,
    subscriptions : {
      RoomInfoVO : true,
      ClientVO : true
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

    sendMessageToLog('stateChangeCallBackFunction :: ' + data.clientId + ': isDrag: ' + data.isDrag);

    var cursorId = 'cursor'+data.clientId;
    if (!cursors.hasOwnProperty(cursorId)) {
        cursors[cursorId] = true;
        $('body').append('<div class="'+cursorId+'" id="'+cursorId+'" style="background-color: red; width: 5px; height: 5px; position: absolute;"></div>​');
        $('body').append('<textarea class="comment'+cursorId+'" id="comment'+cursorId+'" style="position: absolute;"></div>');
    }

    if (data.isDrag) {
        $('.'+cursorId).css('top',(data.mouseY)+'px');
        $('.'+cursorId).css('left',(data.mouseX)+'px');

        $('.comment'+cursorId).css('top',(data.mouseY)+'px');
        $('.comment'+cursorId).css('left',(data.mouseX+30)+'px');
        document.getElementById('comment'+cursorId).innerHTML = data.comment;

        sendMessageToLog('#userDraggableContainer'+data.clientId+': x: '+data.mouseX+',y: '+data.mouseY);
        $('#userDraggableContainer'+data.clientId).css('top',(data.mouseY+50)+'px');
        $('#userDraggableContainer'+data.clientId).css('left',(data.mouseX+40)+'px');
    }
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

  sendMessageToLog('numOfUsersInARoomCallBackFunction :: ' + data.size);

  var numofppl = data.size;
  document.getElementById('visitors').innerHTML = '<div style="font-size: 15px; top: 5px">Currently there are <b>'+numofppl+'</b> visitors on this page</div>';

  if (data.hasOwnProperty('register')) {
    sendMessageToLog('register userId: ' + data.register);
  } else if (data.hasOwnProperty('disconnect')) {
    sendMessageToLog('disconnect userId: ' + data.disconnect);
    removeDraggableImage(data.disconnect);
  }
}

function connectUser() {
  'use strict';
  isAutoConnect = true;
  connectToSocket();
  addDraggableImage(userId,false);
}

if (typeof jQuery !== 'undefined') {
  $(document).ready(function () {
    'use strict';
    listenToUserActions();
    connectUser();
  });
} else {
  sendMessageToLog('jQuery not loaded');
}

function serviceCall(serviceMethodName, retCallBackName, params) {
  'use strict';
  sendMessageToLog('Calling: ' + serviceMethodName);
  rooms.callDbConnector(userId, serviceMethodName, retCallBackName, params);
}

function listenToUserActions() {
    $("#numOfRegisteredUsersButton").bind('click', function () {
            rooms.getNumberOfRegisteredUsersInRoom(userId);
        }
    );

    $("#grabAllPodsButton").bind('click', function () {
            var i = -1;
            var dropDivPosition = $(".well").position();
            for (var user in cursors) {
                clientVO = new ClientVO(user, dropDivPosition.left + (++i * 150), topPositionVideoStart, '', isDragging);
                sendMessageToLog('grabAllPodsButton: ' + clientVO);
                draggingUserPod(clientVO,user);
            }
        }
    );

    $(".well").bind('click', function() {
        isDragging = !isDragging;
    });
}

function listnToEventMouseMoveEvent() {
    $(document).mousemove( function(event) {
        var comment = cursors.hasOwnProperty(userId) ? $('.comment'+userId).val() : '';
        clientVO = new ClientVO(userId, event.pageX, event.pageY, comment, isDragging);

        if (!cursors.hasOwnProperty(userId)) {
            cursors[userId] = true;

            // add own component
            $('body').append('<textarea class="comment'+userId+'" type="text" size="10" value="'+clientVO.clientId+'" style="position: absolute;">');

            $('.comment'+userId).bind('keyup', function() {
                clientVO.comment = $('.comment'+userId).val();
                rooms.storeState(clientVO,'ClientVO', userId);
            });

            $('.comment'+userId).focus();
        }

        if (isDragging)
            draggingUserPod(clientVO,userId);

        rooms.storeState(clientVO,'ClientVO', clientVO.clientId);
    });

    $('body').keydown(function() {
        $('.comment'+userId).focus();
    });
}

function addDraggableImage(clientId) {
    var dropDivPosition = $(".well").position();
    $('body').append('<div id="userDraggableContainer'+clientId+'" class="ui-widget-content" style="width: 120px; height: 100px; position:absolute; top: '+topPositionVideoStart+'px; left: '+(dropDivPosition.left+20)+'px;"><img src="https://static.thenounproject.com/png/1356002-200.png" alt="Smiley face" height="42" width="42"></div>');

    $('#userDraggableContainer'+userId).draggable();
    $('#userDraggableContainer'+userId).stop();
    listnToEventMouseMoveEvent();
}

function removeDraggableImage(clientId) {
    sendMessageToLog('removeDraggableImage :: ' + clientId);
    $("#commentcursor"+clientId).remove();
    $('#cursor'+clientId).remove();
}

function draggingUserPod(clientVO,userId) {
    $('.comment'+userId).css('top',(clientVO.mouseY)+'px');
    $('.comment'+userId).css('left',(clientVO.mouseX+30)+'px');
    $('#userDraggableContainer'+userId).css('top',(clientVO.mouseY+50)+'px');
    $('#userDraggableContainer'+userId).css('left',(clientVO.mouseX+40)+'px');
}

