var molecules = [];
var waves = [];
var osc1;

function setup() {
  createCanvas(400, 400);
  osc1 = new p5.Oscillator("sawtooth");
  osc1.amp(0, 0);
  osc1.freq(220);
  
  for(let x = 5; x < width; x+=10){
    for(let y = 5; y < height; y+=10){
      molecules.push(new Molecule(x, y));
    }
  }
}

function draw() {
  background(220);
  
  for(let i = 0; i < molecules.length; i++){
    molecules[i].display();
    
    for(let j = 0; j < waves.length; j++){
      let d = abs(dist(molecules[i].x, molecules[i].y, waves[j].x, waves[j].y) - (waves[j].d/2));
      if(d <= molecules[i].d/2){
        molecules[i].oscillate();
      } 
    }
    
  }
  
  if(mouseIsPressed){
    if(frameCount % 60 == 0){
      waves.push(new Wave(width/2, height/2));
    }
    //osc1.amp(1);
  } else {
    osc1.amp(0);
  }
  
  waves.forEach((wave) => {
    wave.display();
  })

    
  for(let i = 0; i < waves.length; i++){
    if(waves[i].d > (width * 1.5)){
      waves.splice(i, 1);
    }
  }
  
  push();
  translate(width/2, height/2)
  fill("green");
  ellipse(0, 0, 40);
  fill("white");
  textAlign(CENTER, CENTER);
  text("Press", 0, 0)
  pop();
  
}

function mousePressed(){
  osc1.start();
}

class Wave{
  constructor(_x, _y){
    this.x = _x;
    this.y = _y;
    this.d = 5; // 5 px diameter
  }
  
  display(){
    push();
    translate(this.x, this.y);
    stroke("red");
    noFill();
    ellipse(0, 0, this.d);
    //text(this.d, 0, this.d/2)
    pop();
    this.d ++;
  }
}

class Molecule{
  
  constructor(_x, _y){
    this.x = _x;
    this.y = _y;
    this.osc = 0;
    this.d = 5;
    this.c = "darkgray";
    this.phase = 0;
    this.dur = 30; // animation duration
    this.angle = atan2(this.y - (height/2), this.x - (width/2));
    this.xAmp = cos(this.angle) * 5;
    this.yAmp = sin(this.angle) * 5;
  }
  
  display(){
    let x = 0, y = 0;    
    if(this.osc > 0){
      this.phase = map(this.osc, this.dur, 0, TWO_PI, 0); // phase
      let p = sin(this.phase); // 0 to -1 to 1 to 0
      x = p * -this.xAmp;
      y = p * -this.yAmp;
      this.osc--; // count down from this.dur
      //this.c = "blue";
    } else {
      //this.c = "white";
      this.phase = 0;
      x = 0;
      y = 0;
    }
    push();
    translate(this.x, this.y);
    stroke(0);
    fill(this.c);
    ellipse(0 + x, 0 + y, this.d);
    pop();
  }
  
  oscillate(){
    this.osc = this.dur; // set number of frames
  }
}