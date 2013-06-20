var os          = require('os'),
    rooms       = require('roomsjs'),
    roomdb      = require('rooms.db'),
    port        = (process.env.PORT || 8081);

// create express server if needed
var express     = require('express'),
    app         = express().use(express.static(__dirname + '/public'));

// create server
var server = require('http').createServer(app).listen(port, function () {
        console.log('Listening on http://' + os.hostname() + ':' + port);
    });

var transporter = {
    type: 'socket.io',
    require : require('socket.io'),
    server : server
};

// services
roomdb.setServices('services_sample/');
// connect database/s
roomdb.connectToDatabase('mysql', 'localhost', 'root', '');

// set rooms
rooms = new rooms({
    isdebug : true,
    transporter : transporter,
    roomdb : roomdb /* or null if roomdb */
});