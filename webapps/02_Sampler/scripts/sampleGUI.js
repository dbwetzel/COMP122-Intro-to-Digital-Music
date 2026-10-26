const sampleGUI = p => {
  var playButton, stopButton, loopButton, revButton, rmsMeter, radio, rgroup, onNextSelector, tpUp, tpDown, tuneUp, tuneDown;
  
  var object; // initialized in p.setup()

  p.setGrain = function(_g){
    object.player.grainSize = _g;
    object.grainSize = _g;
  }

  p.setOverlap = function(_o){
    object.player.overlap = _o;
    object.overlap = _o;
  }
  
  p.setTP = function(_tp){
    // transposition in semitones
    object.transpose = Number(_tp);
    object.pitchShift = (object.transpose * 100) + object.tuning;
    console.log("pitch shift " + object.pitchShift);
    if(object.ready){
      object.player.detune = object.pitchShift
    }
  }

  p.setTuning = function(_t){
    // fine tuning in cents
    object.tuning = Number(_t);
    object.pitchShift = (object.transpose * 100) + object.tuning;
    console.log("pitch shift " + object.pitchShift);
    if(object.ready){
      object.player.detune = object.pitchShift;
    }
    
  }

  p.setName = function(newName){
    object.name = newName;
  }

  p.getname = function(){
    return object.name;
  }

  p.setBPM = function(newBPM){
    //bpm = newBPM;
    object.bpm = newBPM;
  }

  p.getBPM = function(){
    return object.bpm;
  }

  p.setLoop = function(dur){
    if(Number(dur)){
      dur = Number(dur);
    } else if(dur == "sample"){
      dur = object.duration;
    }
    // object.part.loopEnd = dur;
    object.loop = dur;
  }

  p.getLoop = function(){
    return object.part.loopEnd;
  }

  p.setFile = function(fileName){
    object.fileName = fileName;
  }

  p.getFile = function(){
    return object.fileName;
  }

  p.setType = function(fileType){
    object.fileType = fileType;
  }

  p.setPartNum = function(_i){
    object.partnum = _i;
  }

  p.setSample = function(_url) {
    console.log('trying to load sample ' + _url)
    // this is primarily for loading a sample file to the player
    object.url = _url; // hold on to this for later
    object.meter = new Tone.Meter(); // dB level meter
    // load Tone.Buffer from Base64-encoded audio file first, then pass the buffer to GrainPlayer. This avoids problems with spaces in file names.
    object.player = new Tone.GrainPlayer(_url, function(){
      //after the player has loaded:
      console.log("Tone.GrainPlayer loaded sample " + _url);
      console.log("duration " + object.player.buffer.duration);
      object.duration = object.player.buffer.duration;
      object.ready = true; // set flag for player button display
      console.log(`player ${object.partnum} ready? ${object.ready}`);
      }).toDestination();
    object.player.fan(object.meter, Tone.Destination); 
    // connect output to both meter and speakers
    // create Tone.Part as object.part
    object.part = new Tone.Part((time) => {
      object.player.start(time);
    }, [0]);
  }

  p.loadfromJSON = function(_obj) {
    console.log(JSON.stringify(_obj));
    // load sample from url
    if(_obj.hasOwnProperty("url")){
      // console.log("loadfromJSON(): " + _obj.url);
      p.setSample(_obj.url);
    }
    if(_obj.hasOwnProperty("name")){
      p.setName(_obj.name);
    }
    if(_obj.hasOwnProperty("bpm")){
      p.setBPM(_obj.bpm);
    }
    if(_obj.hasOwnProperty("transpose")){
      p.setTP(_obj.transpose);
    }
    if(_obj.hasOwnProperty("tuning")){
      p.setTuning(_obj.tuning);
    }
    if(_obj.hasOwnProperty("fileName")){
      p.setFile(_obj.fileName);
    }
    if(_obj.hasOwnProperty("fileType")){
      p.setType(_obj.fileType);
    }
    if(_obj.hasOwnProperty("loop")){
      p.setLoop(_obj.loop);
    }
    if(_obj.hasOwnProperty("grain")){
      p.setGrain(_obj.grain);
    }
    if(_obj.hasOwnProperty("overlap")){
      p.setOverlap(_obj.overlap);
    }
  }

  p.getObj = function(){
    return object;
  }
  
  p.cloneObj = function(_obj){
    // use this to re-insert a sampler object after deletion
    object = _obj; // sampler object now points to the passed-in object reference?
  }
  
/*
  p.setObj = function(_o) {
    // read from JSON object

    if(_o.hasOwnProperty("name")){
      object.name = _o.name;
    }

    if(_o.hasOwnProperty("url")){
      object.url = _o.url; // hold on to this for later
      object.meter = new Tone.Meter();
      object.player = new Tone.GrainPlayer(_o.sampleURL, function(){
        //after the player has loaded:
        console.log("Tone.GrainPlayer loaded sample " + _o.sampleURL);
        // console.log(object.player.buffer);
        console.log("duration " + object.player.buffer.duration);
            // let event = makeEvent(object.player);
        object.ready = true;
      }).toDestination();
      object.player.fan(object.meter, Tone.Destination);
      if(_o.hasOwnProperty("bpm")){
        // scale playback rate to tempo
        object.bpm = _o.bpm;
        bpm = object.bpm;
      }
    }
  }
*/
  p.setup = function(){
    let canvas = p.createCanvas(350, 170);
    canvas.style("visibility: visible"); 
    // not sure why add sample button was loading canvas with "visibilty : hidden;"
    object = {
      "partNum" : 0,
      "name": "Untitled", 
      "fileName" : "",
      "url" : "", 
      "duration" : 0,
      "bpm" : 120, 
      "transpose" : 0,
      "tuning" : 0,
      "pitchShift" : 0,
      "loop" : "1m", // Tone.Time or "sample" to set loop to sample length
      "grainSize" : 0.1, // 100 ms
      "overlap" : 0.05, // 50 ms
      "fileType" : "",
      "player" : {},
      "meter" : {},
      "ready" : false,
      "looping" : false,
      "reversed" : false
    }; // temp container for the sample metadata

    rmsMeter = new RMS_Meter(p, 10, 25);
    playButton = new SamplePlayButton(p, 145, 30);
    stopButton = new SampleStopButton(p, 200, 30);
    loopButton = new SampleLoopButton(p, 255, 30);
    revButton = new SampleReverseButton(p, 310, 30);
    onNextSelector = new OnNext(p, 60, 10);
    //tpUp = new TransposeButton(p, 145, 70, "up");
    //tpDown = new TransposeButton(p, 200, 70, "down");
  }

  p.draw = function(){
    p.background(150, 0); // transparent

    //panel
    p.stroke("white"); 
    p.strokeWeight(2);
    p.fill(150);
    p.rect(1, 1, p.width-2, p.height -2, 5);

    // sample object name
    let t = object.name;
    if (object.name.length > 16){
      t = "";
      for(let i = 0; i < 16; i++){
        t += object.name[i];
      } // truncate to 16 characters
      t += "..."; // add ellipsis
    }
    
    // display file name
    let fn = object.fileName;
    if (object.hasOwnProperty("fileName") && (object.fileName.length > 20)){
      fn = "";
      for(let i = 0; i < 8; i++){
        fn += object.fileName[i];
      }
      fn += "..."
      for(let i = object.fileName.length - 8; i < object.fileName.length; i++){
        fn += object.fileName[i];
      } // abbreviate file name preserving last characters and file extension
    }
    
    // loop interval
    let lp = object.loop;
    if(typeof lp == "number"){
      lp = Number.parseFloat(lp).toFixed(4); 
      // loop value might be a float number
    } 

    // transposition (pitch shift)
    let ps = "0"
    if(object.pitchShift > 0){
      ps = "+" + (object.pitchShift/100);
    } else if (object.pitchShift < 0){
      ps = "-" + (object.pitchShift/100)
    }
    
    // text block
    p.fill("white");
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    p.text((object.partnum + 1) + ". " + t, 10, 5, 120, 40); // name
    p.text("file: " + fn, 10, 55);
    p.text("type: " + object.fileType, 10, 70);
    p.text(object.bpm + " bpm", 10, 85); // sample bpm
    p.text("transposition: " + ps, 10, 100); // transpose
    p.text("loop: " + lp, 10, 115);
    p.text("grain size: " + object.grainSize, 10, 130);
    p.text("overlap: " + object.overlap, 10, 145);

    // UI
    //playButton.x = 20;
    playButton.display(object.ready);
    stopButton.display(object.ready);
    loopButton.display(object.looping);
    revButton.display(object.reversed);
    if(object.ready){
      // only displays if sample is loaded
      rmsMeter.display(object.meter.getValue());
    }
    // play on next measure or next beat
    onNextSelector.display(250, 80); // next measure or next beat
  }

  p.mousePressed = function(){
    //button presses
    let d = document.getElementById("samples");
    if(onNextSelector.click(p.mouseX, p.mouseY)){
      console.log(onNextSelector.state);
    }
    
    if(object.ready){
      //play button
      if(playButton.click(p.mouseX, p.mouseY) ){
        //play sample
        //set playback rate
        if(Tone.Transport.state == "stopped"){
          Tone.Transport.start();
        }

        object.part.stop(); // if already playing
        if(object.hasOwnProperty("loop")){
          object.part.loopEnd = object.loop;    
        } else {  
          object.part.loopEnd = object.player.buffer.duration;
          object.loop = object.player.buffer.duration;
          // console.log(part.loopEnd);
        }
        // object.player.grainSize = 0.04; // 40 msec grain
        object.player.grainSize = object.grainSize;
        // player.overlap = 0.01 // 10 ms grain crossfade
        object.player.overlap = object.overlap;
        object.player.playbackRate = Tone.getTransport().bpm.value / object.bpm;
        let pbr = Tone.getTransport().bpm.value / object.bpm;
         console.log("Tone.getTransport().bpm.value: " + Tone.getTransport().bpm.value)
         console.log("playback rate: " + object.player.playbackRate); 
        // console.log("grain size: " + object.player.grainSize);
        // console.log("grain overlap: " + object.player.overlap);
        //get next measure
        let t = Tone.getTransport().position;
        let times = t.split(':');
        if(onNextSelector.state == "m"){
          times[2] = 0; // set to first sixteenth;
          times[1] = 0; // set to first beat
          times[0] = Number(times[0]) + 1; // move up to the next measure;  
        } else {
          times[2] = 0;
          times[1] = (Number(times[1]) + 1) % 4; // 4/4 time
          if(times[1] == 0){
            times[0] = Number(times[0]) + 1; // scooch up one
          } else {
            times[0] = Number(times[0]); // leave it alone
          }
          
        }
        t = times[0] + ":" + times[1] + ":" + times[2]; 
         console.log("play sample at " + t);
//         object.part.stop();
        object.part.start(t); // object.part is a sequence that contains the grainplayer
      }
      // stop button
      if(stopButton.click(p.mouseX, p.mouseY)){
        object.player.stop();
        object.part.stop();
        //object.part.dispose(); // kill the part to prevent zombie loops
      } 
      //loop button
      if(loopButton.click(p.mouseX, p.mouseY)){
        if(object.looping){
          object.looping = false;
          object.part.loop = false;
        } else {
          object.looping = true;
          object.part.loop = true;
        }
        console.log("loop status: " + object.part.loop);
      }
      // reverse button
      if(revButton.click(p.mouseX, p.mouseY)){
        if(object.reversed){
          object.reversed = false;
          object.player.reverse = false;
        } else {
          object.reversed = true;
          object.player.reverse = true;
        }
      }
    }
  }
}

class TransposeButton {
  constructor(_p, _x, _y, _dir){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.dir = _dir; 
    this.size = 20;
  }  
  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }
  
  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.stroke("white");
    this.p.noFill();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, 0, this.size, this.size, 3);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    if(this.dir == "up"){
      this.p.text("+", 0, 0);
    } else if (this.dir == "down"){
      this.p.text("-", 0, 0);      
    }
    this.p.pop();
  }
  
}

class SamplePlayButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(_ready){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(_ready){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.fill("white");
    this.p.strokeJoin(this.p.ROUND);
    this.p.beginShape();
    this.p.vertex(this.p.cos(0) * 10, this.p.sin(0) * 10);
    this.p.vertex(this.p.cos(this.p.PI - 1) * 12, this.p.sin(this.p.PI - 1) * 12);
    this.p.vertex(this.p.cos(this.p.PI + 1) * 12, this.p.sin(this.p.PI + 1) * 12);
//    this.p.vertex(20, 0);
//    this.p.vertex(-20, 20);
    this.p.endShape(this.p.CLOSE);
//    this.p.triangle(-20, -20, 20, 0, -20, 20, 10);
    this.p.pop();
  }
}

class SampleStopButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }


  display(_ready){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(_ready){
      this.p.fill("red");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.fill("white");
    this.p.strokeJoin(this.p.ROUND);
    this.p.beginShape();
    this.p.vertex(-7, -7);
    this.p.vertex(7, -7);
    this.p.vertex(7, 7);
    this.p.vertex(-7, 7);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
}


class SampleLoopButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40; // 40px round button
  }
  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(_looping){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(_looping){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.noFill();
    this.p.arc(0, 0, 25, 25, 0, this.p.PI + this.p.HALF_PI);
    let ax = this.p.cos(- this.p.HALF_PI) * 25/2;
    let ay = this.p.sin(- this.p.HALF_PI) * 25/2;
    ax += 3;
    this.p.line(ax, ay, ax - 5, ay - 2);
    this.p.line(ax, ay, ax - 5, ay + 2);
    //this.p.ellipse(ax, ay, 10);
    this.p.noStroke();
    this.p.fill("white");
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("L", 0, 0);
    this.p.pop();
  }
}

class SampleReverseButton {
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.size = 40;
  }

  click(m_x, m_y){
    // takes location of the mouse and reports a hit
    if(this.p.dist(this.x, this.y, m_x, m_y) < this.size/2){
      return true;
    }
    else {
      return false;
    }
  }

  display(_reversed){
    this.p.push();
    this.p.translate(this.x, this.y);
    if(_reversed){
      this.p.fill("green");
    } else {
      this.p.fill("gray");
    }
    this.p.stroke("white");
    this.p.strokeWeight(3);
    this.p.ellipse(0, 0, this.size);
    this.p.noFill();
    this.p.arc(5, 0, 20, 20, 0, this.p.PI/2)
    let ax = -10;
    let ay = 10;
    this.p.line(ax, ay, ax + 5, ay - 2);
    this.p.line(ax, ay, ax + 5, ay + 2);
    this.p.line(ax, ay, ax + 15, ay);
    this.p.noStroke();
    this.p.fill("white");
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("Rev", 0, 0);
    this.p.pop();
  }
}

class RMS_Meter{
  constructor(_p, _x, _y){
    this.p = _p;
    this.x = _x;
    this.y = _y;
  }

  display (value){
    this.p.push();
    this.p.translate(this.x, this.y);
    let rms = this.p.map(value, -96, 0, 0, 100);
    if(rms < 0){
      rms = 0;
    }
    this.p.fill("gray");
    this.p.rect(0, 0, 100, 15); // meter background
    let blocks = Math.ceil(rms / 5); // 5px meter segments
    //this.p.stroke("white");
    for(let i = 0; i < blocks; i++){
      if(i < 15){
        this.p.fill("green");
      } else if (i >= 15 && i < 18) {
       this.p.fill("yellow");
      }
      else if (i >= 18) {
        this.p.fill("red");
      }
      this.p.rect(i * 5, 0, 5, 15);
    }

    let mval = value;
    if(mval < -96){
      mval = "-∞ ";
    } else {
      mval = mval.toFixed(0); // truncate
    }
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.fill("white");
    this.p.text(mval + " dB", 0, 7);
    this.p.pop();

  }
}

class OnNext {
  constructor(_p5, _x, _y){
    this.p5 = _p5;
    this.x = _x;
    this.y = _y;
    this.mx = 15;
    this.my = 20;
    this.bx = 15;
    this.by = 45
    this.state = "m"; // default
    this.size = 65;
    this.clicked = false;
  }

  display(_x, _y){
    // draw a "fieldset" with label and two radio-button options
    // optioons are "m" and "b"
    // label is "on next"
    this.x = _x;
    this.y = _y;
    this.p5.push();
    this.p5.translate(this.x, this.y);
    this.p5.noFill();
    this.p5.stroke(255); // white border
    this.p5.rect(0, 0, this.size); // fieldset outline
    this.p5.noStroke();
    this.p5.fill(150); // match player background
    this.p5.rect(2, -2, 57, 30); // panel behind text
    this.p5.fill(255);
    this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
    this.p5.textSize(10);
    this.p5.text("play on next", 3, 0); // fieldset label
    this.p5.text("meas.", this.mx+15, this.my); // button label (default)
    this.p5.text("beat", this.bx+15, this.by); // button label
    this.p5.stroke("gold"); 
    this.p5.strokeWeight(0.5); // thin gold outline
    this.p5.ellipse(this.mx, this.my, 15); // option background ("m")
    this.p5.ellipse(this.bx, this.by, 15); // b
    this.p5.noStroke(); // selected button
    this.p5.fill('maroon'); // go Ramblers
    if(this.state == "m"){
      this.p5.ellipse(this.mx, this.my, 12); // selected location
    } else if (this.state == "b"){
      this.p5.ellipse(this.bx, this.by, 12);
    }
    this.p5.pop();
  }

  click(mx, my){
    // detect a mouse click on this object
    let mt = this.y + this.my - 10; // get the box boundaries
    let mb = this.y + this.my + 10;
    let bt = this.y + this.by - 10;
    let bb = this.y + this.by + 10;

    if(mx > this.x && mx < this.x + this.size && my > mt && my < mb){
      this.state = "m"; // select option 1
      this.clicked = true;
    } else if(mx > this.x && mx < this.x + this.size && my > bt && my < bb){
      this.state = "b"; // select option 2
      this.clicked = true;
    } else {
      this.clicked = false;
    }
    return this.clicked; // report clicked state
  }
}