var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};


var express = require('express');
var app = express();
//var server = require('http').Server(app);
var httpsServer = https.createServer(credentials, app);

var io = require('socket.io')(httpsServer);
var port = 8000;

app.use('/', express.static(__dirname + '/public'));
httpsServer.listen(port, function() {
    console.log('Server running at port:' + port);
});

var users = [];

var aiArray = {
    1: {
        "name":'AI bot',
        "msg": 'Great. Started workspace for _. Who do you want to invite to attend the meeting? <button type="button" id="contactsButton">Contacts</button>',
        "state": 1
    },
    2: {
        "name":'AI bot',
        "msg": 'I\'ve added _ to the meeting. What is the date and time that the meeting will take place?',
        "state": 2
    },
    3: {
        "name":'AI bot',
        "msg":'Got it. Sending a calendar invite for _.',
        "state": 3
    }
};

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

    var state = 0;

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
    	msg: "Hi",
    	data: socket.id,
        state: 0
    });

    socket.on('message', function(res){
    	console.log(res.state);
        //call parseResponse function
        parseState(res);
        parseRes(res);
    	//broadcast to all
    	io.sockets.emit('clients', {
    		data: res
    	})
    	//broadcast to one
    	// socket.emit('confirmed', {
    	// 	confirm: res.message_real
    	// });
    });

    var parseState = function(userRes) {
        //change state for first scenario
        state+=1;
        userRes.state = state;
        console.log("current user state: " + userRes.state);
        chooseBotRes(userRes);
    }

    var parseRes = function(userRes) {
        //parse reseponse for other parts of the meeting
    }

    var chooseBotRes = function(res) {
        setTimeout(function() {
        var currentRes = aiArray[res.state];
        // if (res.state == 2){
            console.log('got to state 2 with '+res.msg);
            var altRes = currentRes.msg.replace('_', res.msg);
            // currentRes.msg = altRes;
            // console.log(currentRes.msg);
            io.sockets.emit('botRes', {
            msg: altRes,
            name: currentRes.name,
            state: currentRes.state
        })
        // } else {
        // console.log('this is currentRes: '+currentRes.msg);
        // io.sockets.emit('botRes', {
        //     data: currentRes
        // })
    // }
    }, 2000);
}

});

///*----------- WEBRTC-------------*/
//var sockets = require('signal-master/sockets');
//sockets(httpsServer, {
//  "rooms": {
//    "maxClients": 0
//  },
//  "stunservers": [
//    {
//      "url": "stun:stun.l.google.com:19302"
//    }
//  ],
//  "turnservers": [
//    {
//      "urls": ["turn:your.turn.servers.here"],
//      "secret": "turnserversharedsecret",
//      "expiry": 86400
//    }
//  ]
//});
//
//var roomNumber = 0;
//var availableRooms = [];
//// var waiting = false;
//app.get('/get-room', function(req, res){
//  if (availableRooms.length){
//    res.send(availableRooms.shift());
//  } else {
//    res.send('room'+roomNumber);
//    roomNumber++;
//  }
//});
//
//app.get('/waiting', function(req, res){
//  availableRooms.push(req.query.roomName);
//});
