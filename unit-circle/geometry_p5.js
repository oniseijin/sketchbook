/**
This visually demonstrates sin, cos, tan on a Unit Circle. 

Move the mouse around to how different angles affect the values. Note how the tangent does not cross over the quadrant: this was done by detecting that the tangent was below 0, and scaling. 
Meant to re-learn some basic geometry, to not forget, and to get a feeling of processing

Also ratios are derived by division and other methods, and match the computed values.
Author: Ryan Mills

Inspired from http://www.mathsisfun.com/sine-cosine-tangent.html

Uploaded as https://www.openprocessing.org/sketch/510296#
*/

var EDGE_OFFSET=175;
var angle; // angle ratio
var degreeValue; 


function setup(){
  createCanvas(500,575); 
}

function draw(){
  background(240);
  drawBase(); 
  drawText();
  drawTracers();  
}

/**
Draw the tracer line and elipse
*/
function drawTracers(){
  var rads = relativeRadians();
  var angle = getAngle();
  var l = (width - EDGE_OFFSET)/2;
  var xMove = sin(rads + HALF_PI) * l;
  var yMove = cos(rads + HALF_PI) * l ;
  var cX = originX() + xMove;
  var cY = originY() + yMove;
  
  var quad = quadrant();
  
  // x and y bolds
  push();
  strokeWeight(2);
  stroke(0, 0, 255);// blue
  line(originX(), originY(), cX, originY());
  var xDist = dist(originX(), originY(), cX, originY());
  fill(0, 0, 255);
  var labelX = xDist / l;
  if (quad == 2 || quad == 3){
     labelX = labelX * -1;  
  }
  textFont("Georgia", 13); 
  strokeWeight(0);
  text(str(labelX), cX, originY() + 15); //  half way better
  strokeWeight(2);
  
  stroke(255, 0, 0); // red
  line(cX, originY(), cX, cY); 
  var yDist = dist(cX, originY(), cX, cY);
  var labelY = yDist / l;
  if (quad == 3 || quad == 4){
     labelY = labelY * -1;  
  }
  fill(255, 0, 0);
  strokeWeight(0);
  text(str(labelY), cX + 15, cY ); // half way better
  strokeWeight(2);
  pop(); 
  
  push();
  stroke(0,255,0); 
  strokeWeight(2);
  ellipse(cX, cY, 7, 7); // circle on end
  // tangent line
  // this will start at cX, cY, but will be tangent
  if ( abs(tan(rads)) < 1){
   // this is going over the respective quadrant 
   // l happens to be the length of the circle
   // this is where geometry gets quite vareresting!
   l *= abs(tan(rads)); // shorten the line by the proportiate amount
   // now the line won't cross over the quadrant!
  }
  var tanXMove = sin(rads - PI ) * l; 
  var tanYMove = cos(rads - PI ) * l; 
  // determine to reverse
  if (quad == 3 || quad == 1 ){
    tanXMove *= -1;
    tanYMove *= -1; 
  }
  var computedX = cX + tanXMove; 
  var computedY = cY + tanYMove; 
  
  line(cX, cY, computedX, computedY );
  pop();
  push();
  noFill(); 
  stroke(150, 150, 150);
  // center line and circle dot
  line(originX(), originY(), cX, cY); 
  arc(originX(), originY(), 75.0, 75.0, -rads, 0 );
  pop(); 
  
    
  
  
}

/**
Determines which quadrant the mouse is in

1, 2, 3, 4 is returned
*/
function quadrant(){
  var left = false; 
  var right = false; 
  var top = false; 
  var bottom = false; 
  
  if (mouseX >= originX()){
    right = true;
    left = false;
  } 
    else {
      right = false; 
      left = true; 
    }
   if (mouseY >= originY()){
     bottom = true; 
     top = false;  
   }
     else {
        bottom = false; 
        top = true;  
     }
  
  if (right && top){
     return 1;  
  } else if (left && top){
     return 2;  
  } else if (left && bottom){
    return 3; 
  } else if (right && bottom){
     return 4; 
  }
  return 0; //something went wrong
}


function originX(){
   return width/2; 
}

function originY(){
   return height-width/2; 
}

function getAngle(){
  var distV = dist(originX(), originY(), mouseX, mouseY); 
  var distX = dist(mouseX, originY(), originX(), originY()); 
  var distY = dist(originX(), mouseY, originX(), originY());
  return distY / distX  ;
  
}

function relativeRadians(){
  angle = getAngle();
  var relativeRadians = atan(angle);
  var quad = quadrant(); 
  if (quad == 1){
     // degree value is fine 
  } else if (quad == 2){
      //relativeDegree = 90 + (90 - relativeDegree);
      relativeRadians = HALF_PI + (HALF_PI - relativeRadians); 
  } else if (quad == 3){
      //relativeDegree = 90 + (90 + relativeDegree);  
      relativeRadians = HALF_PI + (HALF_PI + relativeRadians); 
  } else if (quad ==4){
      //relativeDegree = 270 + (90 - relativeDegree); 
      relativeRadians = PI + HALF_PI + (HALF_PI - relativeRadians); 
  }
  
  return relativeRadians; 
  
}

function drawBase(){
  push();
  translate(width/2, height-width/2);
  push(); 
  strokeWeight(2); 
  ellipse(0,0,width - EDGE_OFFSET, width - EDGE_OFFSET);
  pop();
  translate(-width, 0); // horizontal line
  line(0, 0, width*2, 0);
  pop();
  push();
  translate(width/2, height);
  line(0,0, 0, -width); // vertical line
  pop(); 
}

function drawText(){
  push();
  textFont("Georgia", 13); 
  fill(0,0,0); 
  angle = getAngle();
  var relRadians = relativeRadians();
  var relDegrees = degrees(relRadians); 
  fill(255, 0, 0);
  text("sin=" + sin(relRadians), width/2 -50, 10); 
  fill(0, 0, 255);
  text("cos="+ cos(relRadians), width/2 -50, 20); 
  fill(0, 150, 0); 
  text("tan="+ tan(relRadians), width/2 -50, 30); 
  fill(0,0,0); 
  text("Angle ratio:" +str(angle), width/2 -50, 40); 
  text("Relative Degree:" +str(relDegrees), width/2 -50, 50);
  text("Relative Radians:" +str(relRadians), width/2 -50, 60);
  text("Quadrant:" + str(quadrant()), width/2 - 50, 70); 
  pop(); 
  
}
