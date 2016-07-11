/*-------------WORKROOM---------------*/

$("#timelineButton").click(function(){
    openWindow($(".timelineWindow"));
  });
  
  $("#binButton").click(function(){
    openWindow($(".binWindow"));
  });
  $(document).on('click', '.closeButton',function(){ 
    $(this).parent().css("width","0");
  });
  $(".overlay").click(function(){ 
    $(this).parent().css("width","0");
  });

  function openWindow(window) {
    window.css("width","100%");
  }
  
  //ROOMNAME FROM TIMELINE
  function nameRoom(roomName){
    $("#roomName").empty();
    $("#roomName").append(roomName);
  }
  
  //ADD CONTACTS IN TIMELINE = PARTICIPANTS IN WORKROOM
  var colors = ["black","red","gold","limegreen","MediumBlue ","BlueViolet"];
  function assignColor(){
    return colors.splice(0,1)[0];
  }

  function addParticipants(name) {
	var participant = $('<div class="participant">');
	var inUseDevice = $('<div class="inUseDevice">');

	participant.css('color', assignColor());

	participant.append(inUseDevice);
	participant.append($('<p>').text(name));

	$('#participants').append(participant);

	return inUseDevice;
  }
  

//at start: 
  addParticipants("\uD83E\uDD16"); //add AI
nameRoom("PARSONS TELELCOMMUNICATION LAB MEETING");

/*------------- USER WEBCAM ---------------*/  
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
function webCam(inUseDevice) {
  var w = inUseDevice.width();
  navigator.getUserMedia(
    { video: true },
    function(mediaStream) {
        $('<video>')
            .appendTo(inUseDevice)
            .width(w)
            .prop('src', window.URL.createObjectURL(mediaStream))
            .on('loadedmetadata', function(e) {
                this.play();
            });
    },
    function(err) { console.log(err); }
  );
}
///*------------- WEBRTC NOT ENABLED YET---------------*/
//var webrtc = new SimpleWebRTC({
//    // the id/element dom element that will hold "our" video
//    localVideoEl: 'webcam',
//    // the id/element dom element that will hold remote videos
//    remoteVideosEl: 'video',
//    // immediately ask for camera access
//    autoRequestMedia: true,
//    url: location.href,
//    enableDataChannels: true      
//  });

/*-------------TIMELINE---------------*/

var app = {};

app.init = function() {
    var socket;
    var name;

    var start = function() {
        //create a name input using prompt
        //first is the prompt, second arg is the in the input
        name = prompt('What is your name?', 'type your name here');
//        addParticipants(name);
//      
//        webCam(name);
        webCam(addParticipants(name));
      
        //init socket with server
        //meaning connect to the server
        //don't need to put anything in io.connect() bc
        //server is hosting everything incl socket
        socket = io.connect();
        socket.emit('userInfo', {
            userName: name,
            userID: socket.id,
        }); 

        socket.on('timeline', function(res){
            console.log("timeline: "+res);
            var tplToCompile = $('#tpl-chat-item').html();
            var compiled = _.template(tplToCompile)(res);
            $('#chat-container').prepend(compiled);
        });

        socket.on('greetings', function(res) {
//            console.log(res);
            startMsg(res, name);
        });
        socket.on('joinedUser', function(res) {
          console.log("joined user: "+res);
          if (res!==name){
            addParticipants(res);
          }
        });
        socket.on('confirm', function(res) {
            console.log(res);
        });
        var usersExisting = false;
        socket.on('current users', function(res) { 
          if(!usersExisting){
            for (var u in res.currentUsers){
              console.log("current users:"+res.currentUsers[u].name);
              addParticipants(res.currentUsers[u].name);
            }
          }
          usersExisting = true;
        });

        socket.on('broadcast message', function(res) {
            console.log(res);
        });

        attachEvents();

    };
  
    var attachEvents = function() {
        var state = 0;
        //keeping every eventlistener 
        $('#js-btn-send').on('click', function() {
            //after user clicks
            var chat_msg = $('#js-ipt-text').val();
            console.log(chat_msg);
//            var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
//            var isScript;
//            isScript = re.test(chat_msg);
            //.emit submits or sends an event
            //you can name it anything and you can
            //attach anything (string, num etc.)
            //but usually it's an object
            socket.emit('message', {
                // message_one: "hey lovely.",
                // message_two: "hola!",
                user: name,
                msg: chat_msg,
                state: state,
              timestamp: 'now'
            });
            // Reset input field
            $('#js-ipt-text').val('');
        
        });

        $('#chat-input').keyup(function(event){
            if(event.keyCode == 13){
             var chat_msg = $('#js-ipt-text').val();
             console.log('enter pressed & value is: '+chat_msg);
//             var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
//            var isScript;
//            isScript = re.test(chat_msg);
//            console.log(isScript);

            console.log('Sending: ' + chat_msg);
            // emit a chat message to server
            socket.emit('message', {
                name: name,
                msg: chat_msg,
                state: state,
              timestamp: 'now'
            });
              
             
            // Reset input field
            $('#js-ipt-text').val('');
            }
         
          
      
        });
      
      

    //mousemove event test
    // $(window).on('mousemove', function(res){
    //   //could also do pageX, pageY; sometimes one works
    //   //better than the other
    //   var posX = res.clientX;
    //   var posY = res.clientY;

    //   console.log(posX, posY);

    //   socket.emit('mouse position', {
    //     x: posX,
    //     y: posY
    //   })
    // });

    //listen for clients

   socket.on('clients', function(res) {
        console.log('this is the res: '+res);
        var tplToCompile = $('#tpl-chat-item').html();
        var compiled = _.template(tplToCompile)(res);
        $('#chat-container').prepend(compiled);
        console.log(res.data);
     /*----------------KEEP TRACK OF STATES----------------*/
//        console.log("state#: "+res.data.state);
//          if(res.data.state==1){
//            nameRoom(res.data.msg);
//          } else if(res.data.state==2){
//            
//          }
    });

    socket.on('botRes', function(res) {
        var tplToCompile = $('#tpl-bot-item').html();
        var compiled = _.template(tplToCompile)({
            timestamp: 'now',
            msg: res.msg,
            name: res.name,
            state: res.state
        });
        
            $('#chat-container').prepend(compiled);
        console.log(res.data);
    });
      
    var passtoAI = function(contacts){
   var string = '';
   for (var i=0; i<contacts.length; i++){
     if (i == 0){
       string = string.concat(contacts[i]);
     } else if (i == contacts.length-1){
       string = string.concat(' and ');
       string = string.concat(contacts[i]);
     } else {
       string = string.concat(', ');
       string = string.concat(contacts[i]);
     }
     }

   socket.emit('message', {
               name: name,
               msg: string,
               state: state
           });
    }
 
    /*----------------CONTACTS WINDOW POPUP----------------*/
var contacts = [];

function contactsPopup(){
  contacts = [];
  $("#contactsPopup").css("width","60%");
  var contactHeight = ($("#contactsPopup").height())-($(".server-msg").outerHeight());
  $("#contacts").css("height", contactHeight);
    
}

$(".contacts").mouseover(function(){
  $(this).children(".add").css("width","20%")  
});
$(".contacts").mouseout(function(){
  $(this).children(".add").css("width","0")  
});
  

$(".add").click(function(){
  contacts.push($(this).prev().text());
  $(this).children().text("\u2713");
});

$("#contactsPopup .closeButton").click(function(){
  passtoAI(contacts);
  for(i=0; i<contacts.length;i++){
    addParticipants(contacts[i])
  }
});

$('#chat-container').on('click', '#contactsButton', function(){
  contactsPopup();
});

//open links from timeline
$('#chat-container').on('click', 'img', function(){
  var source = this.src;
  addPhoto(source);
});
    

};

var startMsg = function(response){
    // console.log('start message is: '+response.msg + name);
    // var greeting = response.msg+', '+ name+'. What would you like to name this meeting?';
    var tplToCompile = $('#tpl-bot-item').html();
    var compiled = _.template(tplToCompile)(response);
    $('#chat-container').prepend(compiled);
}

start();
};

app.init();



/*----------------BIN----------------*/

var $photoInput = $("#photoInput");

//PHOTO INPUT HACK
  $("#photoInputButton").click(function(){
    $photoInput.click();
  });

$photoInput.change(function(event){  
  var source = URL.createObjectURL(this.files[0]); 
  addPhoto(source);
  //send to timeline by tricking js into text input
  $('#js-ipt-text').val("<img src="+source+">");
  $('#js-btn-send').click();
});

function addPhoto(source){
  var container = $('<div>',{"class":'container'});
  var photo = $('<img>', {"class":'photo', src: source }); 
//  photo.css("height"," ");
  $("#workRoom").append(container);
  container.append(photo);
  container.draggable();
  
  photo.on('load',function(){
    var $canvas = $('<canvas>',{"class":'annotateCanvas'})
    container.append($canvas);
  var canvas = $canvas[0],
      context = canvas.getContext('2d');
    canvas.width = container.children('img').outerWidth();
    canvas.height = container.children('img').outerHeight();
    context.rect(0,0,canvas.width, canvas.height);
    context.drawImage(photo[0],0,0,photo.width(), photo.height());
    
  var annotateButton =$('<button>',{"class":'annotateButton'}),
      annotateClear =$('<button>',{"class":'annotateClear'}),
      annotateSend =$('<button>',{"class":'annotateSend'}),
      closeButton =$('<input>',{type:"button", value:"close", "class":'closeImg'});
  annotateButton.text("annotate"); 
  annotateClear.text("clear all");
  annotateSend.text("send");
  closeButton.text("close");
  container.append(annotateButton);
  container.append(annotateClear);
  container.append(annotateSend);
  container.append(closeButton);
  });
  
}

$('#workRoom').on('click', 'button.annotateButton', function(){
  var container = $(this).parent();
  container.toggleClass("annotate");
  var $canvas = $(this).siblings("canvas");
  var canvas = $canvas[0],
      context = canvas.getContext('2d');

  if(container.hasClass("annotate")){
    $(this).text("hide");
    $(this).siblings("button").css("display","inline");
    $canvas.css("display","block");
    container.draggable('disable');
    draw(canvas, context);
  }else{
    $(this).text("annotate").css("color","black");
    $(this).siblings("button").css("display","none");
    $(this).prev().css("display","none");
    container.draggable('enable');
  }
});

$('#workRoom').on('click', 'button.annotateClear', function(){
  var $canvas = $(this).siblings("canvas");
  var canvas = $canvas[0],
      context = canvas.getContext('2d');
  canvas.width = $canvas.width();
  canvas.height = $canvas.height();
  context.rect(0,0,canvas.width, canvas.height);
  var photo = $(this).siblings("img");
  context.drawImage(photo[0],0,0,photo.width(), photo.height());
});

$('#workRoom').on('click', 'button.annotateSend', function(){
  $(this).siblings(".annotateButton").click();
  var $canvas = $(this).siblings("canvas");
  var canvas = $canvas[0];
  var source = canvas.toDataURL();
  $('#js-ipt-text').val("<img src="+source+">");
  $('#js-btn-send').click();
});
$('#workRoom').on('click', '.closeImg', function(){
  $(this).parent().css("display","none");
  
});

$("#urlInputButton").click(function(){
  source = prompt('Insert URL', 'Enter URL');
  
  var url = $('<iframe>',{ "class": 'url', src: source });
    $("#workRoom").append(url);
    url.draggable();
  //send to timeline by tricking js into text input
  $('#js-ipt-text').val("<a target='_blank' href="+source+">"+source+"</a>");
  $('#js-btn-send').click();
});

function annotate(item){
  
}
