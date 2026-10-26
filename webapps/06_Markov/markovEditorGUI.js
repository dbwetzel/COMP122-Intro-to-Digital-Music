/*
* P5.js functions for GUI
* Creates a user interface with a graphical representation of the Markov graph and connections between nodes
Nov 2025 - This is the player, not the edtor
*/
const markovEditorGUI = (p) => {
  var tButton, s1Button, s2Button, nodes, beatButton;
  var nButtons = [];
  var pitchSet = null,
    rhythmSet = null; // needs setter
  var toneLoop = null; // Tone.js Loop object
  var name = "markov chain";
  var vol = 1;
  var slider;
  var w = 600,
    h = 400;
  var instrument = new Tone.PolySynth(Tone.Synth).toDestination();
  let synthLibrary = []; // array of instruments to add to menu
  var selectSynth;
  var selectLength;
  var noteLength = "legato";
  //var div //= document.querySelector("div.markov").parentNode;

  p.setLoop = function (obj) {
    toneLoop = obj; // reference to a Tone.loop
    // called from markov.js after Tone.loop object is created
  };
  
  p.getLength = function () {
    return noteLength; // "legato", "marcato", "staccato"
    //if staccato, play all notes as 16ths
    //legato is full note value
    //marcato is shortened by 80%
  };

  p.setSynthLib = function (library) {
    // pass an array of synth objects
    // library should have a "synth" parameter that is a valid Tone.js synth
    if (Array.isArray(library)) {
      for (let i = 0; i < library.length; i++) {
        let o = {};
        synthLibrary.push(o);
        if (library[i].hasOwnProperty("name")) {
          synthLibrary[i].name = library[i].name;
        } else {
          synthLibrary[i].name = "Default Synth";
        }
        if (library[i].hasOwnProperty("synth")) {
          synthLibrary[i].synth = library[i].synth;
        } else {
          // if it doesn't have one, make one
          synthLibrary[i].synth = new Tone.PolySynth(
            Tone.Synth
          ).toDestination();
        }
        if (library[i].hasOwnProperty("settings")) {
          synthLibrary[i].settings = library[i].settings;
        } else {
          synthLibrary[i].settings = {};
        }
        if (library[i].hasOwnProperty("type")) {
          synthLibrary[i].type = library[i].type;
        }
      }
    } else {
      let s = {
        name: "default synth",
        type: "Synth",
        settings: {},
      };
      s.synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synthLibrary.push(s);
    }
    for (let i = 0; i < synthLibrary.length; i++) {
      // global variable for synth menu (created in p.setup())
      selectSynth.option(synthLibrary[i].name, i);
    }
  };

  p.getVol = function () {
    return vol; // get the current volume for this graph
  };
  
  p.getInst = function () {
    return instrument;
  };

  p.setVol = function () {
    // set volume
    //vol = slider.
  };

  p.setObj = function (mObj) {
    nButtons = [];
    // called by "update player" button" in editor or from file upload
    let obj = JSON.parse(JSON.stringify(mObj));
    // make a fresh copy so that intermittent updates don't cause errors
    if (obj.hasOwnProperty("pitchSet")) {
      pitchSet = obj.pitchSet;
      p.makeNodes(pitchSet, w, h);
    }
    if (obj.hasOwnProperty("rhythmSet")) {
      rhythmSet = obj.rhythmSet;
    }
    if (obj.hasOwnProperty("name")) {
      name = obj.name;
    }
    if (toneLoop) {
      toneLoop.stop(); // if the loop already exists, stop it
    }
    toneLoop = new Tone.Loop((time) => {
      //console.log("making a loop ...");
      //in this loop, the markov() function will choose the next pitch  and rhythmic value based on the matrix defined in your pitchSet and rhythmSet objects
      let rhythm = p.markov(rhythmSet); // get the next duration value
      let pitch = p.markov(pitchSet); // get the next pitch value
      console.log(`${pitch} ${rhythm}`);
      // p.markov also changes the .state of each set

      let dur = rhythm;

      switch (noteLength) {
        case "legato":
          dur = rhythm;
          break;
        case "staccato":
          if (Tone.Time(rhythm).toSeconds() <= Tone.Time("16n").toSeconds()) {
            dur = Tone.Time(rhythm).toSeconds() * 0.7;
          } else {
            dur = "16n";
          }

          break;
        case "marcato":
          dur = Tone.Time(rhythm).toSeconds() * 0.7;
          break;
        default:
          dur = rhythm;
      }
      let v = p.getVol();
      let instr = p.getInst();
      instr.triggerAttackRelease(pitch, dur, time, v);
      //Tone.Transport.schedule
      toneLoop.interval = rhythm; // set the interval to a new value
      p.onButton(pitch); // light it up!
      let offTime = "+" + 0.9 * Tone.Time(rhythm).toSeconds();
      Tone.Transport.schedule((time) => {
        p.offButton(pitch);
      }, offTime);
      // console.log(`${pitch} ${dur}`);
    }, rhythmSet.state);
    toneLoop.state = "stopped";
  };
  
  p.setup = function () {
    p.createCanvas(w, h);
    //instrument = synthLibrary[0].synth; // set to default
    tButton = new Button(
      p,
      p.width / 2,
      p.height / 2,
      p.color(0, 200, 0),
      "start \n" + name
    );
    slider = new Slider(p, (p.width * 3) / 4, (p.height * 11) / 12);

    selectSynth = p.createSelect();
    selectSynth.class("synthSequenceMenu");
    selectSynth.position(10, 10);
    selectSynth.size(150);
    /*
      for(let i = 0; i < synthLibrary.length; i ++){
        selectSynth.option(synthLibrary[i].name, i);
      }
*/
    selectSynth.changed(p.chooseSynth);

    selectLength = p.createSelect();
    selectLength.class("synthSequenceMenu");
    selectLength.position(p.width * 0.7, 10);
    selectLength.size(100);
    selectLength.option("legato");
    selectLength.option("marcato");
    selectLength.option("staccato");
    selectLength.changed(p.chooseLength);
  };

  p.chooseSynth = function () {
    instrument = synthLibrary[selectSynth.value()].synth;
    //    console.log(instrument);
  };
  p.chooseLength = function () {
    noteLength = selectLength.selected();
    //    console.log(noteLength);
  };

  p.makeNodes = function (pitchSet, w, h) {
    let rad = 150; // radius of nodes from center
    // w and h are width and heigh of the sketch passed from markov.js after instantiating the GUI sketch
    nodes = Object.keys(pitchSet.matrix); // array of nodes
    //console.log("nodes" + nodes);
    let slice = p.TWO_PI; // distribute nodes around a circle
    if (nodes.length > 0) {
      slice = p.TWO_PI / nodes.length; // divide the circle by number of nodes
    }
    for (let i = 0; i < nodes.length; i++) {
      let x = p.cos(slice * i) * rad + w / 2; // find a location
      let y = p.sin(slice * i) * rad + h / 2;

      nButtons[i] = new Button(
        p,
        x,
        y,
        p.color(p.random(250), p.random(250), p.random(250)),
        nodes[i]
      );
      nButtons[i].w = 40; // node button size
      nButtons[i].pitch = nodes[i]; // assign a pitch property
    }
  };

  p.draw = function () {
    p.background(220);
    tButton.message = name;
    tButton.display(); // transport button

    p.drawConnections(); // arrows

    for (let i = 0; i < nButtons.length; i++) {
      nButtons[i].display(); // node buttons
    }
    slider.display();
    //let x = (p.cos(0) * 150) + (p.width / 2); // find a location
    //let y = (p.sin(0) * 150) + (p.height / 2);
    //p.ellipse(x, y, 10)
    if (p.mouseIsPressed) {
      if (
        p.mouseX < slider.x + 50 &&
        p.mouseX > slider.x - 50 &&
        p.mouseY > slider.y - 20 &&
        p.mouseY < slider.y + 20
      ) {
        slider.move(p.mouseX - slider.x);
        vol = slider.val;
      }
    }
    p.textAlign(p.LEFT);
    p.fill(0);
    p.noStroke();
    p.text("Editor", 10, p.height - 20);
  };

  // draw a transparent line between nodes with a connection
  p.drawConnections = function () {
    p.stroke(255, 0, 0, 30);
    p.strokeWeight(5);
    let obj = pitchSet.matrix;
    let keys = Object.keys(obj);
    //console.log(keys);
    for (let i = 0; i < keys.length; i++) {
      let list = obj[keys[i]];
      //console.log(list);
      //draw a line for each element in the list
      let x = nButtons[i].x;
      let y = nButtons[i].y;
      //console.log("button " + i + ": " + x + ", " + y);
      for (let j = 0; j < list.length; j++) {
        //find the index in keys of an item in list
        let connect = keys.indexOf(list[j]);
        let x2 = nButtons[connect].x;
        let y2 = nButtons[connect].y;
        p.line(x, y, x2, y2);
        //use drawArrow() from p5.org lerp() reference
        let v1 = p.createVector(x, y);
        let v2 = p.createVector(x2, y2);
        let v3 = p5.Vector.lerp(v1, v2, 0.7);
        p.drawArrow(v1, v3, p.color(255, 0, 0, 30));
      }
    }
  };

  p.drawArrow = function (base, vec, myColor) {
    p.push();
    p.stroke(myColor);
    p.strokeWeight(3);
    p.fill(myColor);
    vec.x = vec.x - base.x;
    vec.y = vec.y - base.y;
    p.translate(base.x, base.y);
    p.line(0, 0, vec.x, vec.y);
    p.rotate(vec.heading());
    let arrowSize = 7; // adjust to taste
    p.translate(vec.mag() - arrowSize, 0);
    p.triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    p.pop();
  };

  p.onButton = function (note) {
    for (let i = 0; i < nButtons.length; i++) {
      if (note == nButtons[i].pitch) {
        nButtons[i].playing = true;
      }
    }
  };

  p.offButton = function (note) {
    for (let i = 0; i < nButtons.length; i++) {
      if (note == nButtons[i].pitch) nButtons[i].playing = false;
    }
  };

  p.mousePressed = function () {
    //      if (p.dist(p.mouseX, p.mouseY, tButton.x, tButton.y) < tButton.w / 2 && div.style["display"] == "block")
    if (p.dist(p.mouseX, p.mouseY, tButton.x, tButton.y) < tButton.w / 2) {
      console.log("play graph");
      if (Tone.Transport.state == "stopped") {
        Tone.Transport.start();
        console.log(Tone.Transport.state);
      }
      if (toneLoop && toneLoop.state == "stopped") {
        console.log("start loop");
        let t = Tone.Transport.position;
        let times = t.split(":");
        times[2] = 0; // set to downbeat;
        times[1] = Number(times[1]) + 1; // move up to the next downbeat;
        if (times[1] > 3) {
          times[1] = 0;
          times[0] = Number(times[0]) + 1;
        }
        t = times[0] + ":" + times[1] + ":" + times[2];
        toneLoop.start(t); // start on next downbeat
        tButton.col = p.color(0, 255, 0);
      } else if (toneLoop && toneLoop.state == "started") {
        toneLoop.stop();
        tButton.col = p.color(0, 200, 0);
      }
    }
  };

  p.markov = function (obj) {
    // takes a {pitchSet} or {rhythmSet} and chooses a new state
    //console.log(obj.state); // show the next value in the console
    let values = Object.keys(obj.matrix); // get a list of possible values in the matrix
    let i = values.indexOf(obj.state); // find the position current state in the matrix list

    let possibilities = obj.matrix[values[i]]; // get all the possible next values for a given state as an array

    obj.state = possibilities[Math.floor(Math.random() * possibilities.length)];
    // choose a value at random from the list & assign it as the next ".state"

    return obj.state; // return the value chosen for the loop
  };
};

