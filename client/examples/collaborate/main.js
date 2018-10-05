let os = require('os'),
    rooms = require('roomsjs'),
    roomdb = require('rooms.db'),
    port = (process.env.PORT || 8081);

// create express server if needed
let express = require('express'),
    app = express().use(express.static(__dirname + '/public'));

// create server
let server = require('http').createServer(app).listen(port, function () {
    console.log('Listening on http://' + os.hostname() + ':' + port);
});

// services
roomdb.setServices('services/', app);
app = express().use(express.static(__dirname + '/public'));

console.log('hostname: ' + os.hostname());
let roomsSettingsJSON;

let isLocalHost = !!(os.hostname().indexOf('192.168') || os.hostname().indexOf('MacBook'));
console.log('*** Listening *** :: ' + os.hostname() + ', localhost: ' + (isLocalHost).toString());
roomsSettingsJSON = isLocalHost ? require('./roomsdb.json') :  require('./roomsdb-local.json');

roomdb.connectToDatabase('leveldb', './mydb', {});

let transporterCallback = (type, data) => {
    console.log('transporterCallback :: type: ' + type + '' + ', data: ' +JSON.stringify( data));
    if (data.hasOwnProperty('register')) {
        console.log('transporterCallback :: register userId: ' + data.register);
    } else if (data.hasOwnProperty('disconnect')) {
        console.log('transporterCallback :: disconnect userId: ' + data.disconnect);
    }
};

// set rooms
rooms = new rooms({
    isdebug : true,
    transporter : {
        type: 'engine.io',
        server : server,
        transporterCallback: transporterCallback
    },
    roomdb : roomdb
});

// Internal Robot connects to room and send data to all collaborate users
let messagetype = require('./node_modules/roomsjs/lib/enums/messagetype.js');
let robotMsgCallback = (type, data) => {
    console.log('robotMsgCallback :: type: ' + type + '' + ', data: ' + JSON.stringify(data));
};

setTimeout(function(){
    console.log('-------- joinRoom -------- ');
    rooms[messagetype.JOIN_ROOM]({
        'roomName': 'tester',
        subscriptions : {
            RoomInfoVO : true,
            ClientVO : true
        }
    });

    rooms[messagetype.REGISTER]({
        'roomName': 'tester',
        'userId' : 'robot',
        isRobot: true,
        robotMsgCallback: robotMsgCallback
    });

    setTimeout(function(){
        console.log('-------- store change -------- ');
        rooms[messagetype.STORE_STATE]({"roomName":"tester","name":"ClientVO","vo":{"clientId":"robot","mouseX":0,"mouseY":0,"comment":"","isDrag":true},"userId":"robot"});
    }, 5000);


    setTimeout(function(){
        console.log('-------- disconnect -------- ');
        rooms[messagetype.DISCONNECT]('robot');
    }, 10000);

}, 5000);

/*
let listenToP2PServerMessage = () => {
    server.on(messagetype.CONNECTION, function(ws) {
        console.log('listenToP2PServerMessage :: connected');
    });
    console.log('listenToP2PServerMessage :: listening websocket p2p');
};
listenToP2PServerMessage();
*/