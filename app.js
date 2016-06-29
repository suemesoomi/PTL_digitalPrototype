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
var port = 9000;

app.use('/', express.static(__dirname + '/public'));
httpsServer.listen(port, function() {
    console.log('Server running at port:' + port);
});

var masterTimeline = [];
// var users = []; BC
var users = {};

var userCount = function() {
    return Object.keys(users).length;
};

var aiArray = {
    1: {
        "name": '@bot',
        "msg": 'Great. Started workspace for _. Who do you want to invite to attend the meeting?',
        "state": 1
    },
    2: {
        "name": '@bot',
        "msg": 'I\'ve added _ to the meeting. What is the date and time that the meeting will take place?',
        "state": 2
    },
    3: {
        "name": '@bot',
        "msg": 'Got it. Sending a calendar invite for _.',
        "state": 3
    }
};

var aiCommands = {
    "end meeting": {
        'triggers': ['end meeting', 'end this meeting', 'meeting over', 'end the meeting', 'end our meeting'],
        'matchReq': 2,//not used right now
        'response': "Okay, ending your meeting." 
    },
    "schedule meeting": {
        'triggers': ['schedule', 'schedule meeting', 'schedule a meeting', 'reschedule', 'schedule a new meeting', 'add meeting', 'add a meeting time'],
        'matchReq': 2,//not used right now
        'response': "When would you like to schedule that?"
    },
    "add to meeting": {
        'triggers': ['add', 'add someone', 'add to meeting'],
        'matchReq': 2,//not used right now
        'response': 'Whom would you like to add? <button type="button" id="contactsButton">Contacts</button>'
    },
    "off the record": {
        'triggers': ['off the record', 'leave', 'leave the room','GTFO'],
        'matchReq': 2,//not used right now
        'response': "Fine. I'll get out of your hair."
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
    console.log('The socket ' + socket.id + ' just connected.');

    var thisUser = {};
    socket.on('userInfo', function(res){

        

        var userRecord = "user" + userCount();
        console.log("New User Record is: " + userRecord);

        var thisUser = users[userRecord] = {
            "socketID": socket.id,
            "index": userCount,
            "userRecord": userRecord,
            "name": res.userName
        };

        console.log('This is the master timeline: '+masterTimeline);
//        console.log('These are the users: '+users[userRecord].name);
        for (item in masterTimeline){
            io.sockets.emit('timeline', masterTimeline[item]);
        }
        var joinMsg = thisUser.name +' joined the meeting.';

        emitObj = {
            name: '@bot',
            msg: joinMsg,
            state: 0,
            timestamp: 'now'
        }

        io.sockets.emit('greetings', emitObj);
      
        
      
        for(i=0;i<userCount();i++){
          console.log("this is the user name: "+users[i]);
          io.sockets.emit('joinedUser', users[i]);
        }

        record(emitObj);

    })

    
    var emitObj = {};

    //users.push(socket.id);
    console.log('current users: ' + userCount()); //users.length);

    //when a client connects to server, broadcast to everyone
    io.sockets.emit('current users', {
        //attaching whole array (users) in currentUsers object
        currentUsers: users
    });

    var state = 0;

    //listens for user disconnection
    socket.on('disconnect', function() {
        console.log('a user ' + socket.id + ' just disconnected.');
        //use indexOf to find index of res.id
        // var indexToRemove = users.indexOf(socket.id);

        // if (indexToRemove > -1) {
        //     //indexToRemove will return index number of contect provided
        //     //or -1 if not found
        //     //second arg is for how many indexes to remove
        //     users.splice(indexToRemove, 1);
        //     console.log('current users: ' + users.length);
        // }
    });

    //function to keep masterTimeline
    var record = function(res) {
        //push data into array
        masterTimeline.push(res);
    }

    socket.on('message', function(res) {
        console.log(res.state);
        //call parseResponse function
        parseState(res);
        ai.parseRes.run(res);
        //broadcast to all
        io.sockets.emit('clients', res)

        record(res);

        //broadcast to one
        // socket.emit('confirmed', {
        // 	confirm: res.message_real
        // });
    });

    var parseState = function(userRes) {
        //change state for first scenario
        state += 1;
        userRes.state = state;
        console.log("current user state: " + userRes.state);
        // chooseBotRes(userRes);
    }

    var ai = {
        //msg: "",
        parseRes: {
            run: function(userRes) {
                setTimeout(function(){
                //clear any old response
                delete ai.parseRes.matchedCmd;

                var m = userRes.msg;

                if (ai.botWanted(m)) {
                    console.log("Message addressed to Bot!");
                    ai.parseRes.matchedCmd = ai.checkCommands(m);

                    if (ai.parseRes.matchedCmd !== undefined) {
                        emitObj = {
                            msg: ai.parseRes.matchedCmd.response,
                            name: "@bot command res",
                            state: "whatever",
                            timestamp: 'now',
                        }
                        console.log("Sending " + ai.parseRes.matchedCmd.response);
                        io.sockets.emit('botRes', emitObj);

                        record(emitObj);
                    } else {
                        console.log("No matched command found for message to bot");
                    }
                }
            }, 2000);
        }
        },
        botWanted: function(msg) {
            if (msg.indexOf("@bot") !== -1) {
                return true;
            } else {
                return false;
            }
        },
        checkCommands: function(msg) {
            //var wordsArray = msg.split(" ");

            var matchedCommand = undefined;

            for (var c in aiCommands) {
                if (ai.matchTriggers(aiCommands[c], msg)) {
                    matchedCommand = aiCommands[c];
                };
            }

            return matchedCommand;
        },
        matchTriggers: function(cmd, text) {

            var matched = [];

            var matchFound = false;

            for (var t in cmd.triggers) { //for each trigger term...
                var thisTrigger = cmd.triggers[t];

                if (text.indexOf(thisTrigger) !== -1) {
                    matchFound = true;
                    break;
                }

                //THIS WOULD BE FOR WORD BY WORD MATCH
                //for (var i = 0; i < text.length; i++) { //check each word in the message...

                // var thisWord = text[i];
                // if (thisTrigger == thisWord) { //if a word matches a trigger term
                //     matched.push(thisTrigger);
                //     break; //break so we don't match the same trigger more than once per message
                // }
                //}
            }

            // if (matched.length > 0){

            // }

            return matchFound;
        },
        proximityCheck: function(matchedArray, textArray) {
            //this should check how close together terms are but didn't do yet
        }




    };

    var chooseBotRes = function(res) {
        setTimeout(function() {
            var currentRes = aiArray[res.state];
            // if (res.state == 2){
            console.log('got to state 2 with ' + res.msg);
            var altRes = currentRes.msg.replace('_', res.msg);
            // currentRes.msg = altRes;
            // console.log(currentRes.msg);
            emitObj = {
                msg: altRes,
                name: currentRes.name,
                state: currentRes.state,
                timestamp: 'now'
            }
            io.sockets.emit('botRes', emitObj)

            record(emitObj);
            // } else {
            // console.log('this is currentRes: '+currentRes.msg);
            // io.sockets.emit('botRes', {
            //     data: currentRes
            // })
            // }
        }, 2000);
    }

});

/*----------- LISTEN FOR MOBILE -------------*/
app.get('/Upload-photo', (req, res) => {
    res.send("hello");
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
