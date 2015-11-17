

var mraa = require('mraa');
var io = require('socket.io-client');

var light_sensor = new mraa.Aio(1);
var temp_sensor = new mraa.Aio(2);


function getReadings() {
	return {
		'temp': (500*temp_sensor.read())/1024,
		'light': light_sensor.readFloat()*5.0
	};
}

socket = io.connect('http://cisc340-iot.azurewebsites.net');
socket.on('connect', function () {

	// Need to "clear" it once, for some reason.
	getReadings();
	setInterval(function() {
		socket.emit('broadcast', {type:'weather', payload:getReadings()})
		console.log( getReadings() );
		
	}, 500);
	
});

