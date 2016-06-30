function draw(){
    
    //DRAW--------------  
    // set lastX & Y to -1 at the start to indicate that we don't have a good value for it yet
    var lastX,lastY=-1;
    var hue, size;
    var eraser = false;

    function update(){
      size = document.getElementById("brushSize").value;
      hue = document.getElementById("hue").value;
    }

    update();

    $("#hue").on('input',function(){
      update();
      $("#previewSlider").css({
        "background":"hsl("+hue+", 100%, 50%)"
      });
    });
    $("#brushSize").on('input',function(){
      update();
      $("#previewSlider").css({
        "height":size,
        "width":size
      });
    });
    $('#eraser').click(function(){
      if($(this).hasClass('active')){
        $(this).removeClass('active')
        eraser = false;
      } else {
        $(this).addClass('active')
        eraser = true;
      }

    });


    function drawLine(context,x,y, size) {
      if (lastX ==-1){
        lastX = x;
        lastY = y;
      }

      update();

      // Select a fill style
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = "hsl("+hue+", 100%, 50%)";
      context.lineJoin = "round";
      context.lineCap = "round";
      // Draw a line
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x,y);
      context.lineWidth = size;
      context.stroke();
      context.closePath();

  //    brushPreview();

      lastX = x;
      lastY = y;

      }

    function erase(context, x, y, size){
      if (lastX ==-1){
        lastX = x;
        lastY = y;
      }

      update();

      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
      context.lineJoin = "round";
      context.lineCap = "round";
      // Draw a line
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x,y);
      context.lineWidth = size*2;
      context.stroke();
      context.closePath();

      lastX = x;
      lastY = y;
    }

   //TRACK MOUSE FOR DRAWING 
    var mouseX,mouseY,mouseDown=0;

    function sketch_mouseDown() {
        mouseDown=1;
      if($("#draw").hasClass('active')){
        if(!eraser){
          drawLine(context,mouseX,mouseY, size);
        } else {
          erase(context, mouseX, mouseY, size);
        }
      }
    }

    function sketch_mouseUp() {
        mouseDown=0;
        lastX = -1;
        lastY = -1;
    }

    function sketch_mouseMove(e) { 
        // Update the mouse co-ordinates when moved
        getMousePos(e);

        if (mouseDown==1) { 
          if($("#draw").hasClass('active')){
            if(!eraser){
              drawLine(context,mouseX,mouseY, size);
            } else {
              erase(context, mouseX, mouseY);
            }
          }
        }
    }

    // Get the current mouse position relative to the top-left of the canvas
      function getMousePos(e) {
          if (!e)
           var e = event;

          if (e.offsetX) {
              mouseX = e.offsetX;
              mouseY = e.offsetY;
          }
          else if (e.layerX) {
              mouseX = e.layerX;
              mouseY = e.layerY;
          }
      }
      canvas.addEventListener('mousedown', sketch_mouseDown, false);
      canvas.addEventListener('mousemove', sketch_mouseMove, false);
      window.addEventListener('mouseup', sketch_mouseUp, false);

  // TRACK TOUCH FOR DRAWING
    var touchX,touchY;

    function sketch_touchStart() {
      getTouchPos();
      if($("#draw").hasClass('active')){
        if(!eraser){
          drawLine(context,touchX,touchY, size);
          event.preventDefault(); 
        } else {
          erase(context, touchX, touchY, size);
          event.preventDefault();
        } 
      }
    }

    function sketch_touchEnd(){
      lastX=-1;
      lastY=-1;
    }

    function sketch_touchMove(e) { 
      // Update the touch co-ordinates
      getTouchPos(e);
      if($("#draw").hasClass('active')){ 
        if(!eraser){
          drawLine(context,touchX,touchY, size);
          event.preventDefault();// Prevent a scrolling action as a result of this touchmove triggering.
        } else {
          erase(context, touchX, touchY, size);
          event.preventDefault();
        }
      }
    }
  //Get the touch position relative to the top-left of the canvas
  //When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
  //but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
  //"target.offsetTop" to get the correct values in relation to the top left of the canvas.
    function getTouchPos(e) {
      if (!e)
         var e = event;

      if (e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
          var touch = e.touches[0]; // Get the information for finger #1
          touchX=touch.pageX-touch.target.offsetLeft;
          touchY=touch.pageY-touch.target.offsetTop;
        }
      }
    }

    canvas.addEventListener('touchstart', sketch_touchStart, false);
    canvas.addEventListener('touchend', sketch_touchEnd, false);
    canvas.addEventListener('touchmove', sketch_touchMove, false);
  }
