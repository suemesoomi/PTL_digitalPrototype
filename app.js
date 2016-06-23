//JS in-class 3/3/2015

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 9000;

app.use('/', express.static(__dirname + '/public'));
server.listen(port, function() {
    console.log('Server running at port:' + port);
});

var users = [];

//.on = listener function (for an event)
//everything on the server happens in .on scope
io.on('connection', function(socket) {
    /*––––––––––– SOCKET.IO starts here –––––––––––––––*/

    /*
	.on
	.emit
	.broadcast

    */
    //logging user id
    console.log('The user '+ socket.id+' just connected.');

    users.push(socket.id);
    console.log('current users: '+users.length);

    //when a client connects to server, broadcast to everyone
    io.sockets.emit('current users', {
    	//attaching whole array (users) in currentUsers object
    	currentUsers: users
    });

    //listens for user disconnection
    socket.on('disconnect', function(){
    	console.log('a user '+socket.id+ ' just disconnected.');
    	//use indexOf to find index of res.id
    	var indexToRemove = users.indexOf(socket.id);

    	if(indexToRemove > -1){
    	//indexToRemove will return index number of contect provided
    	//or -1 if not found
    	//second arg is for how many indexes to remove
    	users.splice(indexToRemove, 1);
    	console.log('current users: '+ users.length);
    	}
    });

    // socket.emit('greetings', "hey there. this is server speaking...");

    //need to send back id to cliet bc only the server knows it
    socket.emit('greetings', {
    	message: "Hi",
    	data: socket.id
    });

    socket.on('message', function(d){
      console.log("message received");
      console.log(d)
    	console.log(d.msg);
    	//broadcast to all
    	io.sockets.emit('clients', {
    		data: d
    	})
    	//broadcast to one
    	// socket.emit('confirmed', {
    	// 	confirm: res.message_real
    	// });
    });

});
