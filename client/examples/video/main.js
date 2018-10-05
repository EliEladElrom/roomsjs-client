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

// set rooms
rooms = new rooms({
    isdebug : true,
    transporter : {
        type: 'engine.io',
        server : server
    },
    roomdb : roomdb
});
