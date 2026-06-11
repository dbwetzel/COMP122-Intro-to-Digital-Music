var osc = [], sliders = [], ampR = [];
//var playing = false;
var button1, button2;
var concentric, composite, mute;
var numOscs = 8; // number of oscillators
var buffSize = 200; // waveform display window in px
var buffer = new Array(buffSize); // display buffer for composite wave
var buffers = new Array(numOscs); // display buffer for concentric waves
// buffers[] is multi-deminsional array, inits in setup()

var offset = 100;
var f = 220; // fundamental freq in Hz
var theta = [];
var r = 60; // unit circle radius
var v = 0.02; // orbital velocity
var c = ["red", "orange", "yellow", "green", "aqua", "blue", "fuchsia", "purple"];

function setup() {
  
  var cnv = createCanvas(800, 500);
  cnv.parent("module");
 // cnv.style('float', 'left');
  //cnv.position(100, 0);
  backgroundColor = color(200);
  textAlign(LEFT);
  
  //create a buffer display array for each oscillator
  for(let i = 0; i < numOscs; i ++){
    buffers[i] = new Array(buffSize);
  } // applies only to concentric view


  concentric = createCheckbox('concentric', true); 
  concentric.parent("module");
  concentric.position(10, 80);
  composite = createCheckbox('composite', false); 
  composite.parent("module");
  composite.position(10, 100);
  mute = createCheckbox('mute', false); 
  mute.parent("module");
  mute.position(10, 120);
  
  //create an array of sliders and position on screen
  for(let i = 0; i < numOscs; i++){
    sliders[i] = createSlider(0, 1, 0, 0);
    sliders[i].parent("module");
    sliders[i].style('width', '100px');
    sliders[i].style('float', 'left');
    sliders[i].style('position', 'relative');
    sliders[i].style('left', '20px');
    sliders[i].style('top',  160 + (30 * i) + 'px');
  }

  for (let i = 0; i < numOscs; i ++){
    osc[i] = new p5.Oscillator();
    osc[i].setType('sine');
    osc[i].freq(f + (f * i)); // add harmonics
    osc[i].amp(0);
    //osc[i].start();
    
    theta[i] = 0;
  }
}

function mousePressed(){
  for (let i = 0; i < numOscs; i ++){
    osc[i].start();
  }
}

function draw() {
  background(backgroundColor);
  frameRate(24);
  textSize(22);
  text("Sine Harmonics Graph", 8, 20);
  textSize(12);
  text("Construct a rich timbre from individual harmonics by moving the volume sliders.", 10, 40);
  text("The lowest tone is the 'fundamental.' Each harmonic is an integer multiple of the fundamental", 10, 55);
  text("See the harmonics individually (concentric), or as an additive wave shape (composite).", 10, 70);
  
  for(let i = 0; i < numOscs; i++){
    if(mute.checked()){
      osc[i].amp(0, 0.05);
    } else {
      osc[i].amp(sliders[i].value() * 0.05, 0.05);
    }
    ampR[i] = sliders[i].value();
  }
  
  for(let i = 0; i < sliders.length; i++){
    let pos = sliders[i].position();
    text(f * (i+1) + " Hz", pos.x + 110, pos.y + 10);
  }
  
  push();
  translate(250, height/2);
  
  // "spirograph" composite wave  
  if (composite.checked())
  {
    for(let i = 0; i < numOscs; i++){
    let x, y, d, ox = 0, oy = 0;
        stroke(100);
        fill(255, 0);
        d = ampR[i] * r * 2; //slider val * 2r
        for(let j = 0; j < i; j++){
          ox += cos(theta[j]) * ampR[j] * r;
          oy += -sin(theta[j]) * ampR[j] * r;
        }
        ellipse(ox, oy, d, d);
        x = cos(theta[i]) * ampR[i] * r;
        y = -sin(theta[i]) * ampR[i] * r;
        ellipse(ox+x, oy+y, 2, 2);
        line(ox, oy, ox + x, oy + y);
        if (i == numOscs - 1){
          let xPlot = map(degrees(theta[0]) % 720, 0, 720, 0, buffSize);
          //show the plot point for the composite wave
          ellipse(xPlot + offset, oy+y, 5, 5);
          buffer[Math.round(xPlot)] = oy+y;
          for(let s=0; s < xPlot; s++){
            stroke(150);
            line(s+offset, 0, s+offset, buffer[s]);
          }
          stroke(100);
          line(ox+x, oy+y, width,  oy+y);
          //text(Math.round(xPlot), 100, 100);
          
        }

      }
  }

  // concentric sine waves (in color!)
  if(concentric.checked())
  {
    let x, y, d, ox = 0, oy = 0;
    for(let i = 0; i < numOscs; i++){
        
        if(ampR[i] > 0){
          stroke(c[i]);
          noFill();
          d = ampR[i] * r * 2; // slider val * 2r
          ellipse(0, 0, d, d); // concentric unit circle
          x = cos(theta[i]) * ampR[i] * r;
          y = -sin(theta[i]) * ampR[i] * r;
          ellipse(x, y, 2, 2); // dot on the edge
          line(0, 0, x, y); // radius
          line(x, y, width, y); // projected amplitude line
          let xPlot = map(degrees(theta[0]) % 720, 0, 720, 0, buffSize);
          ellipse(xPlot+offset, y, 2, 2);
          //line(xPlot+offset, y, xPlot+offset, 0);
          
          buffers[i][Math.round(xPlot)] = y;
          stroke(color(red(c[i]), green(c[i]), blue(c[i]), 50));
          for(let j = 0; j < xPlot; j++){
            line(j+offset, 0, j+offset, buffers[i][j]);
          }
          
        }      
      }
}
  // center line
  stroke(0);
  line(0, 0, width, 0);
  pop();
  
  //theta += .01;
  for(let i = 0; i < theta.length; i ++){
    theta[i] += v * (i + 1);
  }
//  text("Vol: " + vol.toFixed(2), 50, 40);
}
