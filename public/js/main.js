/*-------------WORKROOM---------------*/

$("#timelineButton").click(function(){
    openWindow($(".timelineWindow"));
  });
  
  $("#binButton").click(function(){
    openWindow($(".binWindow"));
  });
  
  $(".closeButton").click(function(){ 
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
  
  function addParticipants(newName){
    $("#participants").append("<div class='participant' id='"+newName+"'>"+newName+"</div>")
    
    $("#"+newName).css("color",assignColor());
  }
  

//at start:
    nameRoom("my room"); 
    addParticipants("\uD83E\uDD16"); //add AI

/*-------------TIMELINE---------------*/

var app = {};

app.init = function() {
    var socket;
    var name;

    var start = function() {
        //create a name input using prompt
        //first is the prompt, second arg is the in the input
        name = prompt('What is your name?', 'type your name here');
      
        addParticipants(name);

        //init socket with server
        //meaning connect to the server
        //don't need to put anything in io.connect() bc
        //server is hosting everything incl socket
        socket = io.connect();
        socket.on('greetings', function(res) {
            console.log(res);
        });

        socket.on('confirm', function(res) {
            console.log(res);
        });

        socket.on('current users', function(res) {
            console.log(res);
        });

        socket.on('broadcast message', function(res) {
            console.log(res);
        });

        attachEvents();
    };

    var attachEvents = function() {
        //keeping every eventlistener 
        $('#js-btn-send').on('click', function() {
            //after user clicks
            var chat_msg = $('#js-ipt-text').val();
            console.log(chat_msg);
            var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
            var isScript;
            isScript = re.test(chat_msg);
            //.emit submits or sends an event
            //you can name it anything and you can
            //attach anything (string, num etc.)
            //but usually it's an object
            socket.emit('message', {
                // message_one: "hey lovely.",
                // message_two: "hola!",
                user: name,
                msg: chat_msg
            });
            // Reset input field
            $('#js-ipt-text').val('');
        });

        $('#chat-input').keyup(function(event){
            if(event.keyCode == 13){
             var chat_msg = $('#js-ipt-text').val();
             console.log('enter pressed & value is: '+chat_msg);
             var re = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
            var isScript;
            isScript = re.test(chat_msg);
            console.log(isScript);

            console.log('Sending: ' + chat_msg);
            // emit a chat message to server
            socket.emit('message', {
                name: name,
                msg: chat_msg
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
        var tplToCompile = $('#tpl-chat-item').html();
        var compiled = _.template(tplToCompile)({
            timestamp: 'now',
            data: res.data
        });
        $('#chat-container').prepend(compiled);
        console.log(res.data);
    });
 };

start();
};

app.init();

//add contacts
function contactsPopup(){
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
  var contact = $(this).prev().text();
  $(this).css("width","0");
  $(this).children().text("\u2713");
  addParticipants(contact);  
});