
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


console.log('Server started');

server.listen(port);