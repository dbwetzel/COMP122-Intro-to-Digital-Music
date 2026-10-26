/**
 * This UI script uses P5.js to create an animated and interactive keyboard. 
 * It works in conjunction with the script "synth.js" that contains the noteOn() and noteOff() function definitions as well as definitions for synths using Tone.js
 *  - DB Wetzel, Feb. 2022
 * updated October 2023 for COMP/MUSC 122
 */
const keyGUI = p => {
  var selectSynth;
  var instrument;
  var keyInput = false; // enable/disable QUERTY input
  var canvas; // get a reference to the canvas element
  var keyboard = []; // an array of keys
  var whiteKeys = [0, 2, 4, 5, 7, 9, 11];
  var size = 16; // how many keys?
  var start = 57; // lowest key (MIDI note #57 is A3)
  //QWERTY keymap
  var keyMap = ['a', 'w', 's', 'd', 'r', 'f', 't', 'g', 'h', 'u', 'j', 'i', 'k', 'o', 'l', ';'];
  // var div = document.getElementById("synth-contents");

  p.setup = function() {
    // P5 setup funciton (runs once on load)
    canvas = p.createCanvas(350, 160);
//    console.log("synth interface parent node: ");
//    div = cnv.parent();
    //console.log("synth display: " + div.style["display"]);
    let keypos = 0;
//    let k1 = new Key(p, 100, 100, 'a', 57, true);

    for (let i = 0; i < size; i++) {
      // generate array of key objects
      let key = start + i; // starting note
      if (whiteKeys.indexOf(key % 12) < 0) { // black
        keyboard.push(new Key(p, 10 + keypos * 30, 10, keyMap[i], key, false));
      } else { // white
        keyboard.push(new Key(p, 25 + keypos * 30, 10, keyMap[i], key, true));
        keypos++;
      }
    }
    // selectSynth = p.createSelect();
    // selectSynth.class("synthMenu"); // create menu
    // selectSynth.position(10, 30); // place menu
    //for(let i = 0; i < synthLibrary.length; i ++){
      // add synth pre-set titles to menu
      // selectSynth.option(synthLibrary[i].name, i);
    // }
    // selectSynth.changed(p.chooseSynth);
    // instrument = synthLibrary[0].synth; // set default

  }
  p.chooseSynth = function(){
    for(let i = 0; i < keyboard.length; i++){         
      keyboard[i].instrument = synthLibrary[selectSynth.value()].synth;
    }
    console.log(selectSynth.value()); 
  }

  p.setSynth = function(settings){
    for(let i = 0; i < keyboard.length; i++){         
      keyboard[i].instrument.set(settings);
    }
  }

  p.setP5synth = function(p5synth){
    for(let i = 0; i < keyboard.length; i++){  
      // console.log("setSynth " + i);      
      keyboard[i].setSynth(p5synth);
      // attach a reference to the p5synth editor to each key
    }    
  }

  // allow device to enable/disable keyboard for input focus
  p.setKeyInput = function(value){
    //value is true/false
    // console.log("setKeyInput" + value);
    keyInput = value;
  }


//P5 event handler looks for key presses
  p.keyPressed = function() {
    //if(div.style["display"] == "block"){
    if(keyInput){
      let pressedKey = keyMap.indexOf(p.key); //is the key in the map?
      if (pressedKey >= 0) // if so, it's 0 or higher
        keyboard[pressedKey].press(); // call the key object's press() method     
    }
    // return false;
  }

//P5 event handler for the key release
  p.keyReleased = function() {
    let releasedKey = keyMap.indexOf(p.key);
    if (releasedKey >= 0)
      keyboard[releasedKey].release(); // key object release() method
    return false;
  }

//P5 Event loop -- runs 60 times per second
  p.draw = function() {
    p.background(200);//medium grey background

    for (let i = 0; i < keyboard.length; i++) {
      keyboard[i].displayW(); //draw the white keys
    }
    for (let i = 0; i < keyboard.length; i++) {
      keyboard[i].displayB(); //draw the black keys on top
//      if (p.mouseIsPressed && div.style["display"] == "block") {
      if (p.mouseIsPressed) {
          keyboard[i].mousePressed(p.mouseX, p.mouseY, true);
      }
      else {
        keyboard[i].mousePressed(p.mouseX, p.mouseY, false);
      }
    }
  }
};
/** Constructor function for individual keys on keyboard UI */
class Key {
  constructor(_p, X, Y, QWERTY, note, isWhiteKey){
    this.p = _p; //P5 instance
    this.x = X; // screen position
    this.y = Y;
    this.white = isWhiteKey; //true or false (passed in)
    this.qwerty = QWERTY;
    this.px = X; // target for mouse press
    this.py = Y; // move these in .display() methods
    this.noteNames = ['C', "C#", 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this.noteNum = note; // MIDI note number passed in
    this.letter = this.noteNames[note % 12];
    this.octave = Math.trunc(note / 12) - 1;
    this.noteName = this.letter + this.octave.toString();
    this.pressed = false;
    this.size = 30; 
    this.instrument = new Tone.PolySynth(Tone.Synth).toDestination();
    this.p5synth;
  }

  setSynth(synth){
    //console.log("setSynth " + this.noteName);
    this.p5synth = synth;
  }

  mousePressed(_x, _y, on) { // receives mouse coordinates + boolean "on"
    let d = this.p.dist(this.p.mouseX, this.p.mouseY, this.px, this.py);
    if (!this.pressed && d < 20 && on) {
      this.press();
      return [this.noteNum, 127];
    }
    else if (this.pressed && d < 20 && !on){
      this.release();
    }
  }

  press() {
    //console.log([this.noteName, 127]);
    this.pressed = true;
    //synth.triggerAttack(this.noteName, Tone.now());
    // this.instrument.triggerAttack(this.noteName, Tone.now());
    if(this.p5synth){
      this.p5synth.noteOn(this.noteName);
    }
  }

  release() {
    //console.log([this.noteName, 0]);
    this.pressed = false;
    //synth.triggerRelease(this.noteName, Tone.now());
    // this.instrument.triggerRelease(this.noteName, Tone.now());
    if(this.p5synth){
      this.p5synth.noteOff(this.noteName);
    }  
  }

  displayW() {
    //display white keys
    if (this.white) {
      if (this.pressed) {
        this.p.fill(200);
      } else this.p.fill(255);
      let w = this.size;
      let h = this.size * 4.7;
      this.p.rect(this.x, this.y, w, h);
      //      fill(255, 0, 0, 100);
      this.px = this.x + w / 2;
      this.py = this.y + h - 40;
      //      ellipse(this.px, this.py, 40);
      this.p.textAlign(this.p.CENTER);
      this.p.fill(0)
      this.p.text(this.noteNum, this.x + 15, this.y + 102);
      this.p.text(this.noteName, this.x + 15, this.y + 117);
      this.p.text("(" + this.qwerty + ")", this.x + 15, this.y + 132);
    }
  }

  displayB() {
    //display black keys
    if (!this.white) {
      if (this.pressed) {
        this.p.fill(100); //grey
      } else this.p.fill(0);
      let w = this.size * 4 / 5;
      let h = this.size * 3;
      this.p.rect(this.x, this.y, w, h);
      this.p.fill(255, 0, 0, 100);
      this.px = this.x + w / 2;
      this.py = this.y + h - 30;
      //      ellipse(this.px, this.py, 40);
      this.p.textAlign(this.p.CENTER);
      this.p.fill(255);
      this.p.text(this.noteNum, this.x + 12, this.y + 40);
      this.p.text(this.noteName, this.x + 12, this.y + 55);
      this.p.text("(" + this.qwerty + ")", this.x + 12, this.y + 70);
    }
  }

}
