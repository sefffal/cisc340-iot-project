// CISC 340 Project
// Author: Will Thompson
//
// This component runs on the Intel Edison.
// It retreives sensor data and pushes it to
// our cloud server.

var mraa = require('mraa');
var io = require('socket.io-client');

// SocketIO server address
var azure = 'http://cisc340-iot.azurewebsites.net'


// Hookup analog inputs for light anbd termperature sensors
var light_sensor = new mraa.Aio(1);
var temp_sensor = new mraa.Aio(2);

// Get readings from the sensors, and return them as an object.
function getReadings() {
	return {
		'temp': (500*temp_sensor.read())/1024 - 10,
		'light': light_sensor.readFloat()*5.0
	};
}

// Connect the the server
socket = io.connect(azure);

// When we connect, start sending updates
socket.on('connect', function () {

	// Need to "clear" it once, for some reason.
	getReadings();

	// Send updates to the server twice a second	
	setInterval(function() {
		var reading = getReadings();
		console.log( getReadings() );
		socket.emit('weather', reading);
	}, 500);
	
});

