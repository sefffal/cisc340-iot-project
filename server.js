
// Create an express app
var express = require('express');
var app  = express();

// Set the port to serve on
var port = process.env.PORT || 1337;
app.set('port', port);


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


subscriptions = {};

io.on('connection', function(client) {  
    console.log('Client connected...');

    client.on('subscribe', function(type) {
    	if (!subscriptions[type]) {
    		subscriptions[type] = [];
    	}
    	subscriptions[type].push(client);
        console.log('Client subscribed to: '+type);

    });


    setInterval(function(){
        client.emit('weather', {temp:2, light:3});
    }, 1000);

    client.on('broadcast', function(data) {
    	if (subscriptions[data.type]) {
    		for (var i=0, l=subscriptions[data.type].length; i<l; i++) {
    			subscriptions[data.type][i].emit(data.type, data.payload);
    		}
    	}
    })
});

console.log('Server started');

server.listen(port);