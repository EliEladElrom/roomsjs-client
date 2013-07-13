angular.module('myModule', ['rooms'])
  .run(['roomsGateway', function (roomsGateway) {
    'use strict';
    roomsGateway.connectToGateway('ws://localhost:8081/', true);
  }]);
