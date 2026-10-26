const simplePlayerGUI = (p) => {
  let playerButtons = [];
  let numButtons = 8;
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  const sampler = new Tone.Sampler().toDestination();
  const QWERTYmap = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ','];
  let bgColor = 200;
  let mute = false;
  
  p.setup = function(){
    p.createCanvas(400, 400);

  }
  p.draw = function(){
    p.background(bgColor);
    for(let i = 0; i < playerButtons.length; i++){
      playerButtons[i].display();
    }
  }

  p.setMute = function(_state){
    mute = _state;
  }
  
  p.touchStarted = function(){
    for(let touch of p.touches){
      for(let button of playerButtons){
        if(button.click(touch.x, touch.y)){
          playNote(button);
        }
      }
    }
  }
  
  p.keyPressed = function(){
    // console.log(p.key);
    for(let button of playerButtons){
      if(button.press(p.key)){
        playNote(button);
      }
    }
  }
  
  p.mousePressed = function(){
    for(let button of playerButtons){
      if(button.click(p.mouseX, p.mouseY)){
        playNote(button);
      }
    }
  }
  
  function playNote(_button){
    if(mute){
      return;
    }
    if (Tone.getTransport().state == "stopped") {
      Tone.getTransport().start();
      console.log("Transport " + Tone.getTransport().state);
    }
    let t = quantize("8n"); // ??
    let offTime = "+" + Tone.Time("4n").toSeconds();
    if(_button.type == "synth"){
      //console.log(t);
      const synthPart = new Tone.Part((time, val) => {
        synth.triggerAttackRelease(val.pitch, val.dur, time);
        _button.playing = true;
        Tone.Transport.schedule((time) => {
              _button.playing = false;
            }, offTime);
          },[{time: 0, pitch: _button.pitch, dur: "4n"}]).start(t);
        } else if(_button.type == "sampler"){
          //console.log(t);
          const synthPart = new Tone.Part((time, val) => {
            sampler.triggerAttack(val.pitch, time);
            _button.playing = true;
            Tone.Transport.schedule((time) => {
              _button.playing = false;
            }, offTime);
          },[{time: 0, pitch: _button.pitch}]).start(t);     
        }
  }
  
  function quantize(val){
    // local internal function
    // quantize to next 8th note ???
    let t = Tone.getTransport().position;
    let times = t.split(":");
    // console.log(`16th: ${times[2]}`);
    switch(val){
      case "8n":
        if(Number(times[2]) < 2){
          times[2] = 2; // move up to next 8th note
        } else {
          times[2] = 0; // move to next down beat
          times[1] = Number(times[1]) + 1;
          if(times[1] > 3){
            times[1] = 0; // bump to next measure
            times[0] = Number(times[0]) + 1;
          }
        }
        break;
      case "4n":
        times[2] = 0; // move to next down beat
        times[1] = Number(times[1]) + 1;
        if(times[1] > 3){
          times[1] = 0; // bump to next measure
          times[0] = Number(times[0]) + 1;
        }
        break;
      default:
        times[2] = 0; // set to downbeat;
        times[1] = 0; // set to first beat
        times[0] = Number(times[0]) + 1; // move up to the next measure;
    }
    t = times[0] + ":" + times[1] + ":" + times[2];
    return t;
  }
  
  p.setLibrary = function(_data){
    // called externally to load buttons based on JSON data
    // console.log(JSON.stringify(_data)); // test
    if(_data.hasOwnProperty("samples")){
      //console.log(JSON.stringify(_data.samples))
      let notes = Object.keys(_data.samples);
      for(let i = 0; i < notes.length; i++){
        sampler.add(notes[i], _data.samples[notes[i]]);
      }
      //sampler.add("A3", "drums/Kick.wav"); // add each individually
    }
    let buttons = _data.buttons;
    console.log(buttons.length); // test
    for(let i = 0; i < buttons.length; i++){
      playerButtons.push(new SimplePlayButton(p, 50 + ((i % 4) * 100), 50 + (Math.trunc(i / 4) * 100), buttons[i].type, buttons[i].pitch, buttons[i].label));
      if(i < QWERTYmap.length){
        playerButtons[i].keyTrigger = QWERTYmap[i];
      }
    }
  }
}


class SimplePlayButton{
  constructor(_p, _x, _y, _type, _pitch, _label){
    this.p = _p; // p5 instance
    this.x = _x;
    this.y = _y;
    this.w = 90; // width
    this.type = _type;
    this.pitch = _pitch;
    this.label = _label;
    this.col = this.p.color(this.p.random(200), this.p.random(200), this.p.random(200));
    this.playing = false;
    this.keyTrigger = 'a';
    this.button = this.p.createButton("");
    this.button.position(this.x - this.w/2, this.y - this.w/2);
    this.button.style("width:90px; height:90px; backgroundColor:transparent; border:none; outline:none")
  }
  
  display(){
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rectMode(this.p.CENTER);
    this.p.fill(this.col);
    this.p.noStroke();
    this.p.rect(0, 0, this.w, this.w, 10);
    if(this.playing){
      this.p.fill(255, 255);
    } else {
      this.p.fill(255, 190);
    }
    this.p.ellipse(0, 0, 60);
    this.p.fill(this.col);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(this.label, 0, 0);
    this.p.fill(255, 190);
    this.p.text(this.keyTrigger, 35, 35)
    this.p.pop();
  }
  
  click(_x, _y){
    let clicked = false;
    if(this.p.dist(this.x, this.y, _x, _y) < this.w/2){
      //console.log(this.label);
      clicked = true;
    }
    return clicked;
  }
  
  press(_key){
    let pressed = false;
    if(this.keyTrigger === _key){
      pressed = true;
    }
    return pressed;
  }
}