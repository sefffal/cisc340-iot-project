/*
 * CISC 340 IOT Project.
 *
 * Author: Will Thompson
 *
 * This is the Node.js server for our weather application.
 * It serves a static directory for the web app, and it
 * hosts a socket.io server for live udpates.
 *
 * Here are the events it supports:
 * - subscribe-weather  Indicates this client wants realtime weather updates
 * - weather-all        Request to get all available weather information from the server
 * - weather            New weather information from the Intel Edison
 *
 * It generates the following events:
 * - weather            New weather information sent out to all weather clients
 *                      in response to a weather event from the Edison
 * - weather-all        Send out all weather the server has recorded
 *
 */

// Create an express app
var express = require('express');
var app  = express();

// Set the port to serve on
var port = process.env.PORT || 1337;
app.set('port', port);

// Max data array size
// Cap to this much data
var max_data = 24*60*60*2; // 2 updates per second for one day

// Create a webserver to host it
var http = require('http');
var server = http.createServer(app);

// Hook up socket.io for real-time push comminucations
var io = require('socket.io')(server);



app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/static'));
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/static/index.html');
});


// This is a list of clients subscribed to weather updates
weather_clients = [];
weather_data = [];


// This is triggered when we get a weather update from the Edison
function weather_received_callback(data) {

    // Add a timestamp to the data.
    // We do that here instead of the Edison because we trust
    // the server's clock more.
    data.time = new Date();

    // Add the new data to our data array
    var i = weather_data.length;
    // But cap the weather array to max_data
    if (i > max_data) {
        // This is extraodinarily inefficient.
        // We should actually wrap around the index using i%max_data
        weather_data.splice(i, 200);
        i-=200;
    }
    weather_data[i] = data;

    // Send out the new weather update
    for (var i=0, l=weather_clients.length; i<l; i++) {
        weather_clients[i].emit('weather', data);
    }
}

// This is a big array of our weather data
io.on('connection', function(client) {  

    console.log('Connection from client: '+client.handshake.address);

    // Clients send this if they want to get realtime weather updates
    client.on('subscribe-weather', function() {

        // Add them to the list weather_clients
        var i = weather_clients.length;
        weather_clients[i] = client;

        console.log('Client '+client.handshake.address+' subscribed to weather updates');

        // This is the disconnect event.
        // We only need to do this cleanup if they subscribed to weather, though.
        // That's why it is inside the subscribe-weather event.
        client.on('disconnect',function() {
            // Remove the client from the list
            weather_clients.splice(i, 1);
            console.log('Client '+client.handshake.address+' has disconnected');
        });
    });

    // Clients send this if they want all the information on weather that the server has collected
    client.on('weather-all', function() {
        console.log('Client '+client.handshake.address+' asked for all weather data');
        client.emit('weather-all', weather_data);
    });

    // This is triggered when we get a weather update from the Edison
    client.on('weather', weather_received_callback);

});
// For testing purposes
setInterval(function(){
    weather_received_callback({temp:Math.random()*35, light:Math.random()*5});
}, 500);

console.log('Server started on port '+port);
server.listen(port);