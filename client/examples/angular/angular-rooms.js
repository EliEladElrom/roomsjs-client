'use strict';

angular.module('rooms', [])
  .factory('roomsGateway', ['$rootScope', '$window', function ($rootScope, $window) {

    var logMessage = function (message) {
      if (isDebugLogEnabled) {
        console.log(message);
      }
    };

    var serviceAPI = {},
      isAutoConnect = false,
      rooms,
      userId,
      roomName,
      callBacks = {},
      callBacksCount = 0,
      isGatewayReady = false,
      queuedServiceCalls = [],
      socketAddress = null,
      isDebugLogEnabled = true,
      roomsDebugMode = true;

    var connectToSocket = function () {
      var roomSetup,
        transporter;

      userId = Rooms.makeid(16);
      roomName = $window.location.href;

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
        serviceCallBackHandler : serviceCallBackHandler,
        debugMode : roomsDebugMode
      });

      transporter = new eio.Socket(socketAddress);

      rooms.start({
        transporter : transporter,
        type : 'engine.io'
      });
    };

    var serviceCallBackHandler = function (data) {
      logMessage('roomsGateway::serviceCallBackHandler ' + data.data.callBackMethodName);
      callBacks[data.data.callBackMethodName](data);
    };

    var stateChangeCallBackFunction = function (data) {
      // impl
    };

    var userConnectedCallBackFunction = function () {
      if (isAutoConnect) {
        rooms.registerUser(userId);
      }
    };

    var userRegisteredCallBackFunction = function () {
      rooms.getNumberOfRegisteredUsersInRoom(userId);

      // rooms app is now ready
      setGatewayReady();
    };

    var numOfUsersInARoomCallBackFunction = function (data) {
      // var numofppl = data.size;

      if (data.hasOwnProperty('register')) {
        logMessage('register userId: ' + data.register);
      } else if (data.hasOwnProperty('disconnect')) {
        logMessage('disconnect userId: ' + data.disconnect);
      }
    };

    var connectUser = function () {
      isAutoConnect = true;
      connectToSocket();
    };

    //
    // service calls
    //
    var queueServiceCall = function (serviceCall) {
      logMessage('roomsGateway::queueServiceCall ', serviceCall);
      queuedServiceCalls.push(serviceCall);
    };

    var setGatewayReady = function () {
      logMessage('roomsGateway:: gateway is ready');
      isGatewayReady = true;
      angular.forEach(queuedServiceCalls, function (serviceCall) {
        logMessage('making queued call ', serviceCall);
        makeServiceCall(serviceCall);
      });
    };

    var makeServiceCall = function (serviceCall) {
      rooms.callDbConnector(userId, serviceCall.serviceMethodName, serviceCall.retCallBackName, serviceCall.params);
    };

    // public method
    serviceAPI = angular.extend(serviceAPI, {
      connectToGateway: function (address, isDebug) {
        if (socketAddress === null) {
          if (angular.isDefined(isDebug)) {
            isDebugLogEnabled = isDebug;
            roomsDebugMode = isDebug;
          }
          socketAddress = address;
          connectUser();
        } else {
          // connectToGateway was already called
        }
      },
      registerCallBack: function (callBackFunction) {
        var generatedCallBackName = 'roomsGatewayCallBack' + callBacksCount;
        callBacks[generatedCallBackName] = callBackFunction;
        callBacksCount += 1;
        logMessage('roomsGateway::registerCallBack ' + generatedCallBackName);

        return generatedCallBackName;
      },
      serviceCall: function (serviceMethodName, retCallBackName, params) {
        var serviceCall = {
          serviceMethodName: serviceMethodName,
          retCallBackName: retCallBackName,
          params: params
        };
        logMessage('roomsGateway::serviceCall: serviceMethod=' + serviceCall.serviceMethodName + "  callback="+serviceCall.retCallBackName);
        if (!isGatewayReady) { // queue service call
          queueServiceCall(serviceCall);
        } else {
          makeServiceCall(serviceCall);
        }
      }
    });

    return serviceAPI;
  }]);