const keyMap = [
  { pitch: "A3", label: "Kick", file: "Kick.wav" },
  { pitch: "A#3", label: "Kick", file: "Kick.wav" },
  { pitch: "B3", label: "Snare", file: "Snare.wav" },
  { pitch: "C4", label: "Claps", file: "Claps.wav" },
  { pitch: "C#4", label: "Shot1", file: "Shot1.wav" },
  { pitch: "D#4", label: "Shot2", file: "Shot2.wav" },
  { pitch: "D4", label: "Noise", file: "WhiteNoise.wav" },
  { pitch: "E4", label: "Rev Cymbal", file: "ReverseCymbal.wav" },
  { pitch: "F4", label: "Closed Hi-Hat", file: "HiHat_Closed.wav" },
  { pitch: "F#4", label: "Open Hi-Hat", file: "HiHat_Open.wav" },
];

let urls = {};
for (let i = 0; i < keyMap.length; i++) {
  urls[keyMap[i].pitch] = "drums/" + keyMap[i].file;
}

const drumSampler = new Tone.Sampler(urls).toDestination();

const beatPartGUI = (p) => {
  var beatButton, muteButton; // buttons
  var part; //Tone.js Part reference
  var loop; // Tone.js Loop reference
  var cells = []; // array of cell objects
  var cellCount = 0; // keep count of active cell
  var mute = false; // mute the pattern
  var margin = 50; // left padding
  var pitch = "C3"; // default pitch
  var num = -1; // which pattern is this in the array
  var div = document.getElementById("beatParts");
  var playButton, plusButton, minusButton, deleteButton;
  var nameInput, pitchMenu;
  var deleteFlag = false;
  var deleteBox; // checkbox to mark for deletion
  var label = "";
  var canvas;
  var obj = {
    label: "untitled",
    pitch: "A3",
    pattern: "1000",
    accents: "0000",
    mute: false
  };

  p.deleteFlag = function () {
    return deleteFlag;
  };

  p.setObj = function (_obj) {
    obj = _obj;
    if (obj.hasOwnProperty("pitch")) pitch = obj.pitch; //otherwise default "C3"
    pitchMenu.selected(pitch); //set pitchMenu

    if (obj.hasOwnProperty("label")) label = obj.label;
    nameInput.value(label);

    if(obj.hasOwnProperty("mute")) {
      mute = obj.mute;
      muteButton.setMute(mute);
    }

    let w = 15; // width of cell
    let plays = false;
    if (obj.hasOwnProperty("pattern")) {
      //p.text(obj.pattern, 100, p.height/2);
      cells = [];
      for (let i = 0; i < obj.pattern.length; i++) {
        if (obj.pattern[i] == "1") {
          plays = true;
        } else plays = false;
        if (obj.pattern.length > 16) {
          w = 240 / obj.pattern.length; // scale width for longer patterns
        } else w = 15; // 15 px default
        cells.push(new Cell(p, 40 + i * w, 13, w));
        cells[i].w = w; // adjust as necessary
        cells[i].plays = plays;
      }
    }
    if (obj.hasOwnProperty("accents")) {
      for (let i = 0; i < cells.length; i++) {
        if (i > obj.accents.length - 1) {
          cells[i].accented = false;
        } else if (obj.accents[i] == "1") {
          cells[i].accented = true;
        }
      }
    }
    if (loop) {
      //console.log("stop loop");
      loop.dispose();
    }
    loop = new Tone.Loop((time) => {
      // triggered every sixteenth note.
      //console.log(time);
      p.playBeat(time);
    }, "16n");
    // console.log(loop);
    // console.log();
    //loop.stop();
    return loop; // return loop reference to beats.makeBeats()
  };
  //set and get each proiperty individually for editor

  p.setNum = function (_num) {
    num = _num; // keep track of this pattern's place in the array
  };
  p.setLabel = function (_label) {
    obj.label = _label;
  };
  p.getLabel = function () {
    return obj.label;
  };
  p.setPitch = function (_pitch) {
    obj.pitch = _pitch;
  };
  p.getPitch = function () {
    return obj.pitch;
  };

  p.setPattern = function (_pattern) {
    obj.pattern = _pattern;
  };

  p.getPattern = function () {
    return obj.pattern;
  };

  p.getObj = function () {
    return obj;
  };

  p.getLoop = function () {
    return loop;
  };

  p.setMute = function(_m) {
    mute = _m;
  }

  p.setup = function () {
    canvas = p.createCanvas(498, 80);
    // console.log("sampler: " + drumSampler);
    canvas.style("visibility", "visible");
    nameInput = p.createInput();
    nameInput.addClass("input");
    nameInput.size(100);
    nameInput.position(10, 40);
    pitchMenu = p.createSelect();
    pitchMenu.addClass("menu");
    pitchMenu.position(120, 40);
    for (let i = 0; i < keyMap.length; i++) {
      pitchMenu.option(
        keyMap[i].pitch + " - " + keyMap[i].label,
        keyMap[i].pitch
      );
    }
    pitchMenu.changed(() => {
      obj.pitch = pitchMenu.selected();
      pitch = obj.pitch;
    });
    playButton = new PlayButton(p, 15, 25);
    playButton.s = 0.4; // scale

    muteButton = new MuteButton(p, 15, 45);

    plusButton = p.createButton("+");
    plusButton.addClass("button");
    plusButton.position(280, 15);
    plusButton.mousePressed(addCell);

    minusButton = p.createButton("-");
    minusButton.addClass("button");
    minusButton.position(305, 15);
    minusButton.mousePressed(removeCell);

    deleteBox = p.createCheckbox("delete");
    deleteBox.addClass("checkbox");

    p.setObj(obj); // set the default object
  };

  function addCell() {
    let w = 15; // default cell width
    let cellLeftMargin = 40;
    let cellTopMargin = 13;
    let cellMax = 23;
    cells.push(
      new Cell(p, cellLeftMargin + cells.length * w, cellTopMargin, w)
    );
    if (cells.length > cellMax) {
      // scale width of cells
      w = (w * cellMax) / cells.length; // scale width for longer patterns
    }
    obj.pattern = "";
    for (let i = 0; i < cells.length; i++) {
      cells[i].w = w;
      cells[i].x = cellLeftMargin + i * w;
      if (cells[i].plays) {
        obj.pattern += "1";
      } else {
        obj.pattern += "0";
      }
    }
  }

  function removeCell() {
    let w = 15; // default cell width
    if (cells.length > 1) {
      cells.splice(cells.length - 1, 1);
      // remove the last cell, but leave at least one
    }
    obj.pattern = ""; // reset the pattern field
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].plays) {
        obj.pattern += "1";
      } else {
        obj.pattern += "0";
      }
    }
  }

  p.setSynth = function (_synth) {
    //beatSynth = _synth;
  };

  p.draw = function () {
    p.background(200);
    p.fill(0);

    // update the data object with user input
    obj.label = nameInput.value();
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(10);
    p.text(
      num + " " + obj.label + " (" + obj.pattern.length + "): " + obj.pitch,
      5,
      2
    );

    // display the beat pattern
    const w = 15; // default cell width
    const cellLeftMargin = 40;
    const cellTopMargin = 13;
    const cellMax = 23;
    for (let i = 0; i < cells.length; i++) {
      if (cells.length > cellMax) {
        cells[i].w = (cellMax * w) / cells.length;
      } else {
        cells[i].w = w;
      }
      cells[i].x = cellLeftMargin + i * cells[i].w;
      cells[i].y = cellTopMargin;
      cells[i].display(); // draw all the cells
    }
    playButton.display(); // show the play button
    muteButton.display();
    muteButton.position(15, 60);

    if (loop.state == "started") {
      playButton.playing = true;
    } else {
      playButton.playing = false;
    }
    p.fill(30);
    p.text("Label: ", 55, 55);
    nameInput.position(85, 45);
    p.text("Pitch:", 200, 55);
    pitchMenu.position(230, 45);

    plusButton.position(400, 10);
    minusButton.position(450, 10);
    deleteBox.position(400, 40);
    deleteFlag = deleteBox.checked();
  };

  p.loopStart = function () {
    cellCount = 0;
    let t = Tone.Transport.position;
    let times = t.split(":");
    times[2] = 0; // set to downbeat;
    times[1] = 0; // set to first beat
    times[0] = Number(times[0]) + 1; // move up to the next measure;
    t = times[0] + ":" + times[1] + ":" + times[2];
    // console.log("loop start at " + t)
    loop.start(t); // time in beats or seconds
  };

  p.loopStop = function () {
    loop.stop();
    cellCount = 0; // reset counter
  };

  p.loopDispose = function () {
    loop.dispose(); // kill the loop
    // accessed by the controller module when loading a new set
    // or deleting a pattern
  };

  p.playBeat = function (time) {
    // console.log("tick");
    if (cellCount > cells.length - 1) {
      //double check that a cell wasn't deleted between pulses
      cellCount = 0;
    }
    let vel = 0.2; // modify this with accent property
    if (cells[cellCount].accented) {
      vel = 1;
    }
    cells[cellCount].on = true; // light it up!
    if (cells[cellCount].plays && !mute) {
      //drumSampler.triggerAttackRelease(pitch, "16n", time, vel);
      drumSampler.triggerAttack(pitch, time, vel);
    }
    //turn off adjacent cells
    if (cellCount == 0) {
      cells[cells.length - 1].on = false;
    } else cells[cellCount - 1].on = false;
    cellCount++;
    cellCount = cellCount % cells.length; //0%4==0, 4%4==0, 3%4==3
  };

  p.mousePressed = function () {
    //  if (p.mouseY < p.height && p.mouseY > 0 && div.style["display"] == "block") {
    if (p.mouseY < p.height && p.mouseY > 0) {
      if (playButton.clicked(p.mouseX, p.mouseY)) {
        if (loop.state == "started") {
          loop.stop();
          cellCount = 0; // reset counter
        } else {
          if (Tone.Transport.state == "stopped") {
            Tone.Transport.start();
            console.log(`Tone Transport: ${Tone.Transport.state}`);
          }
          let t = Tone.Transport.position;
          let times = t.split(":");
          times[2] = 0; // set to downbeat;
          times[1] = 0; // set to first beat
          times[0] = Number(times[0]) + 1; // move up to the next measure;
          t = times[0] + ":" + times[1] + ":" + times[2];
          loop.start(t); // time in beats or seconds
        }
      }
      if (muteButton.clicked(p.mouseX, p.mouseY)) {
        mute = muteButton.muted;
        obj.mute = mute;
      }
      obj.pattern = "";
      obj.accents = "";
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].clicked(p.mouseX, p.mouseY)) {
          //console.log("clicked " + i);
          if (p.keyIsPressed && p.keyCode === p.SHIFT) {
            if (cells[i].plays && !cells[i].accented) {
              cells[i].accented = true;
            } else if (cells[i].plays && cells[i].accented) {
              cells[i].accented = false;
            }
          } else {
            if (cells[i].plays) {
              cells[i].plays = false;
              cells[i].accented = false;
            } else {
              cells[i].plays = true;
            }
          }
        }
        if (cells[i].plays) {
          obj.pattern += "1";
        } else {
          obj.pattern += "0";
        }
        if (cells[i].accented) {
          obj.accents += "1";
        } else {
          obj.accents += "0";
        }
      }
      console.log(obj.pattern);
    }
  };
};

const beatsGUI = (p) => {
  // composite beat controller interface
  let library = []; // beats library (new for 10/2025)
  let currentSet = -1;
  let name = "";
  let tempo = Tone.getTransport().bpm.value;
  let metro = null; // reference to the metronome
  let beatMenu, playButton;
  let addBeat; // button to add a new beat pattern
  let deleteBeat; // remove selected from pattern
  let addSet; // button to add a new pattern Set
  let deleteSet; // button to delet rhythm set from library
  let nameBox; // input for pattern set name
  let tempoBox; // input field for tempo (bpm)
  let testLoad;
  let partsDiv;
  let patterns = []; // individual beat patterns
  let objs = []; // pattern objects
  let loops = []; // get p5 sketch instancess from each part and add to array
  // var div = document.getElementById("part3-contents");
  const defaultSet = {
    name: "untitled",
    tempo: "120",
    beats: [],
  };

  p.setLoops = function (arr) {
    loops = arr; // loops is an array of beatPartGUI instances (above)
    //console.log(`loops array for big button: ${loops.length} parts`);
  };

  p.setPartsDiv = function (_div) {
    // x/+ button opens/closes beat parts div
    partsDiv = _div;
  };

  p.setLibrary = function (_lib) {
    library = _lib;
    console.log(library);
    //p.setMenu();
  };

  p.getLibrary = function () {
    return library; // for JSON data display/download
  };

  p.setMetro = function (_sketch) {
    // get a reference to the metronome GUI
    metro = _sketch; // p5 instance of metroGUI
  };

  p.addSet = function () {
    // add a new pattern set to the library
    let newSet = structuredClone(defaultSet);
    // make sure newSet.name is unique in the library
    library.push(newSet);
    console.log(library.length);
    p.setMenu();
    let i = library.length - 1;
    beatMenu.selected(i);
    nameBox.value(library[i].name);
    currentSet = i;
    p.loadSet();
  };

  p.addBeat = function () {
    if (currentSet < 0) {
      p.addSet(); // create a new set if none selected
    }
    let obj = p.makeBeat(); // add a default pattern
    library[currentSet].beats.push(obj); // add to the library
  };

  p.deleteSet = function () {
    if (beatMenu.selected() > -1) {
      library.splice(beatMenu.selected(), 1);
    }
    // first wipe out the existing beats
    let beatPatterns = document.querySelectorAll(".beatPattern");
    for (let i = 0; i < beatPatterns.length; i++) {
      patterns[i].loopDispose();
      beatPatterns[i].remove();
    }
    patterns = [];
    nameBox.value("");
    p.setMenu();
  };

  p.deletePatterns = function () {
    console.log("delete all marked patterns");
    let killList = [];
    for (let i = 0; i < loops.length; i++) {
      if (loops[i].deleteFlag()) {
        killList.push(i); // get list of indexes to kill
        console.log(killList);
      }
    }
    for (let i = library[currentSet].beats.length - 1; i >= 0; i--) {
      console.log(`i is ${i}`);
      if (killList.includes(i)) {
        loops[i].loopDispose(); // Tone loop reference
        patterns.splice(i, 1);
        library[currentSet].beats.splice(i, 1); // library ref
        console.log("deleting loop " + i);
      }
    }
    let beatPatterns = document.querySelectorAll(".beatPattern");
    for (let i = 0; i < killList.length; i++) {
      beatPatterns[killList[i]].remove(); // sketch instance div
    }
  };

  p.setMenu = function () {
    let names = [];
    if (Array.isArray(library)) {
      for (let i = 0; i < library.length; i++) {
        names.push(library[i].name); // get set names
        // make sure it's unique
      }
      console.log(names);
    }
    
    names = renameRepeatOccurrences(names);

    if (beatMenu) {
      beatMenu.remove(); // kill it!
    }
    beatMenu = p.createSelect(); // make a new one
    beatMenu.position(300, p.height / 2);
    beatMenu.addClass("menu");
    beatMenu.size(110);
    beatMenu.option("choose a set ...", -1);

    for (let i = 0; i < names.length; i++) {
      beatMenu.option(names[i], i);
    }

    //console.log("setMenu()");
    beatMenu.selected(0); // set to default
    p.loadSet(); // load currently selected
    beatMenu.changed(p.loadSet); // UI behavior
  };

  function renameRepeatOccurrences(arr) {
    // courtesy Google AI, 10/20/25
    const counts = new Map(); // key:value pairs
    const result = [];

    for (const item of arr) {
      let newItem = item; // default keep it
      let count = counts.get(item) || 0; // check if it's in the Map
      // count is either "undefined" or a number value

      if (count > 0) {
        newItem = `${item} (${count})`;
        // Check for potential collisions with already renamed items (e.g., "a (1)" and "a (1) (1)")
        while (counts.has(newItem)) {
          count++;
          newItem = `${item} (${count})`;
        }
      }

      counts.set(item, count + 1); // Increment count for the original item
      counts.set(newItem, (counts.get(newItem) || 0) + 1); // Track the new item as well
      result.push(newItem);
    }
    return result;
  }

  p.loadSet = function () {
    //p.stop();
    let i = beatMenu.selected();
    if (i > -1) {
      //console.log("Set: " + library[i].name);
      //console.log("Tempo: " + library[i].tempo);
      //console.log("Beats: " + library[i].beats);
      currentSet = i; // keep track for deletion
      name = library[i].name;
      nameBox.value(name);
      tempo = library[i].tempo;
      tempoBox.value(tempo);
      if (metro) {
        metro.setTempo(library[i].tempo);
      }
      if (
        library[i].hasOwnProperty("beats") &&
        Array.isArray(library[i].beats)
      ) {
        // first wipe out the existing beats
        let beatPatterns = document.querySelectorAll(".beatPattern");
        for (let i = 0; i < beatPatterns.length; i++) {
          patterns[i].loopDispose();
          beatPatterns[i].remove();
        }
        patterns = [];
        p.setLoops(patterns); // remove loop references
        // then add the new ones
        for (let j = 0; j < library[i].beats.length; j++) {
          //console.log(library[i].beats[j]);
          p.makeBeat(library[i].beats[j]);
        }
        if (playButton.playing) {
          console.log("still playing");
          for (let i = 0; i < loops.length; i++) {
            // console.log("starting beat " + i);
            loops[i].loopStart(); // P5 sketch for each loop handles timing and loop start/stop
          }
        }
      }
    }
  };

  p.changeSetName = function () {
    if (beatMenu.selected() > -1) {
      library[currentSet].name = nameBox.value();
      p.setMenu();
      beatMenu.selected(currentSet);
      p.loadSet();
    } else {
      // new set
      let name = nameBox.value();
      p.addSet();
      library[currentSet].name = name;
      p.setMenu();
      beatMenu.selected(currentSet);
      nameBox.value(library[currentSet].name);
    }
  };

  p.changeTempo = function () {
    let i = beatMenu.selected();
    if (i > -1) {
      tempo = Number(tempoBox.value());
      library[i].tempo = tempo;
    }
    if (metro) {
      metro.setTempo(Number(tempoBox.value()));
    }
  };

  p.setup = function () {
    p.createCanvas(500, 100);

    playButton = new PlayButton(p, 150, p.height / 2);

    beatMenu = p.createSelect();
    beatMenu.addClass("menu");

    //console.log("beatMenu from setup()");
    p.setMenu();

    nameBox = p.createInput();
    nameBox.addClass("input");
    nameBox.changed(p.changeSetName);

    tempoBox = p.createInput("120", "number");
    tempoBox.addClass("input");
    tempoBox.size(60);
    tempoBox.changed(p.changeTempo);

    addSet = p.createButton("new set");
    addSet.addClass("button");
    addSet.mousePressed(p.addSet);

    addBeat = p.createButton("add pattern");
    addBeat.addClass("button");
    addBeat.position(p.width - 80, p.height / 3);
    addBeat.mousePressed(p.addBeat);
    //testLoad = p.createButton("test");
    //testLoad.position(p.width - 50, p.height / 3);

    deleteSet = p.createButton("delete set");
    deleteSet.addClass("button");
    deleteSet.mousePressed(p.deleteSet);

    deleteBeat = p.createButton("delete pattern(s)");
    deleteBeat.addClass("button");
    deleteBeat.mousePressed(p.deletePatterns);
  };

  p.draw = function () {
    p.background(200);
    p.fill(50);
    p.textSize(16);
    p.text("Beats", 10, 15);
    p.textSize(12);

    p.text("Name:", 10, 40);
    nameBox.position(55, 18);

    beatMenu.position(55, 55);
    beatMenu.size(120);

    // plusButton.display();
    playButton.display();
    for (let i = 0; i < loops.length; i++) {
      state = loops[i].getLoop().state;
      if (state == "started") {
        playButton.playing = true;
      }
    }
    if (Tone.Transport.state == "started") {
      let t = Tone.Transport.position;
      let times = t.split(":");
      if (Math.trunc(Number(times[2])) % 4 == 0) {
        p.fill(255, 0, 0);
      } else {
        p.fill(255);
      }
      p.ellipse(250, 50, 10);
    }
    playButton.position(p.width * 0.57, 30);

    p.fill(50);
    p.text("Tempo:", p.width * 0.44, 75);
    tempoBox.position(p.width * 0.53, 55);

    addSet.position(p.width - 150, 18);

    addBeat.position(p.width - 150, (p.height * 6) / 12);
    addBeat.size(60);

    deleteSet.position(p.width - 80, 18);

    deleteBeat.position(p.width - 80, (p.height * 6) / 12);
    deleteBeat.size(75);
  };

  p.makeBeat = function (_pattern = null) {
    partsDiv = document.getElementById("beatParts");
    let beatPattern = document.createElement("div");
    patterns.push(new p5(beatPartGUI, beatPattern));
    patterns[patterns.length - 1].setNum(patterns.length - 1);
    // needed for delete
    // console.log("makeBeat() beats length " + beats.length);
    beatPattern.style = "position:relative; width: 500px; height: 90px;";
    beatPattern.className = "beatPattern";
    partsDiv.appendChild(beatPattern);

    if (_pattern) {
      //console.log("add pattern");
      patterns[patterns.length - 1].setObj(_pattern);
    } else {
      //console.log("add default to " + partsDiv);
    }

    p.setLoops(patterns);

    return patterns[patterns.length - 1].getObj();
  };

  p.nextMeasure = function () {
    let t = Tone.Transport.position;
    let times = t.split(":");
    times[2] = 0; // set to downbeat;
    times[1] = 0; // set to first beat
    times[0] = Number(times[0]) + 1; // move up to the next measure;
    t = times[0] + ":" + times[1] + ":" + times[2];
    return t;
  };

  p.stop = function () {
    if (playButton.playing) {
      // stop the beat
      playButton.playing = false;
      for (let i = 0; i < loops.length; i++) {
        loops[i].loopStop();
      }
    }
  };

  p.mousePressed = function () {
    if (playButton.clicked(p.mouseX, p.mouseY)) {
      if (playButton.playing) {
        // stop the beat
        playButton.playing = false;
        for (let i = 0; i < loops.length; i++) {
          loops[i].loopStop();
        }
      } else {
        //start beat on next measure
        if (Tone.Transport.state == "stopped") {
          Tone.Transport.start();
          console.log(`Tone Transport: ${Tone.Transport.state}`);
        }
        playButton.playing = true;

        for (let i = 0; i < loops.length; i++) {
          // console.log("starting beat " + i);
          loops[i].loopStart(); // P5 sketch for each loop handles timing and loop start/stop
          // console.log("loop progress: " + loops[i].progress)
        }
      }
    }
  };
};

class PlusButton {
  constructor(_p, _x, _y) {
    this.p = _p; // p5 instance
    this.x = _x;
    this.y = _y;
    this.r = 0; // rotation
    this.d = 30; // diameter
  }

  display() {
    //looks like a big plus sign
    //rotates into an X when clicked
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.r);
    this.p.strokeWeight(5);
    this.p.line(-this.d / 2, 0, this.d / 2, 0);
    this.p.line(0, -this.d / 2, 0, this.d / 2);
    this.p.pop();
  }
  click() {
    if (this.r > 0) {
      this.r = 0;
    } else {
      this.r = p.PI / 4;
    }
  }
}

class Cell {
  /** 
  individual cell in a beat pattern interface
  */
  constructor(_p, _x, _y, _w) {
    this.p = _p; // p5 instance
    this.x = _x;
    this.y = _y;
    this.w = _w; // width (default)
    this.h = 20; // height
    this.plays = false; // cell plays a note (default false)
    this.on = false; // is this cell the focus on this 16th note?
    this.accented = false;
  }

  clicked(_x, _y) {
    if (
      _x > this.x &&
      _x < this.x + this.w &&
      _y > this.y &&
      _y < this.y + this.h
    ) {
      return true;
    } else {
      return false;
    }
  }

  display() {
    if (this.on) {
      if (this.plays) {
        this.p.fill(this.p.color("#4caf50")); // active player, green
      } else {
        this.p.fill(150); // non-player, active (gray)
      }
    } else {
      // not on
      if (this.plays) this.p.fill(this.p.color("#ba64e8"));
      // non-active player, purple
      else this.p.fill(255); //non-player, not active (white)
    }
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rect(0, 0, this.w, this.h, 2);
    this.p.fill(0);
    //this.p.text(Math.trunc(this.w), 0, 0);
    if (this.plays && this.accented) {
      this.p.stroke(200);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text(">", this.w / 2, this.h / 2);
    }
    this.p.pop();
  }
}

class PlayButton {
  constructor(_p, _x, _y) {
    this.p = _p; // P5 object reference
    this.x = _x;
    this.y = _y;
    this.w = 50;
    this.col = this.p.color("#4caf50");
    this.playing = false;
    this.s = 0.8; // scale factor
  }

  clicked(_x, _y) {
    if (this.p.dist(this.x, this.y, _x, _y) < (this.w * this.s) / 2) {
      return true;
    } else {
      return false;
    }
  }

  position(_x, _y) {
    this.x = _x;
    this.y = _y;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.scale(this.s);
    this.p.fill("#fde4a9");
    this.p.stroke("#5d0024");
    this.p.strokeWeight(4);
    if (this.playing) {
      this.p.rectMode(this.p.CENTER);
      this.p.rect(-this.w / 4, 0, this.w / 4, 40);
      this.p.rect(this.w / 4, 0, this.w / 4, 40);
      this.col = this.p.color("#4caff0");
    } else {
      this.p.ellipse(0, 0, this.w);
      //this.p.triangle(this.w/2, 0, -this.w/2, -this.w/2, -this.w/2, this.w/2);
      this.p.stroke(0, 150, 0);
      this.p.strokeJoin(this.p.ROUND);
      this.p.fill(this.col);
      this.p.beginShape();
      this.p.vertex((this.w / 2) * 0.7, 0);
      let x = this.p.cos(this.p.PI - 1) * ((this.w / 2) * 0.75);
      let y = this.p.sin(this.p.PI - 1) * ((this.w / 2) * 0.75);
      this.p.vertex(x, y);
      x = ((this.p.cos(this.p.PI + 1) * this.w) / 2) * 0.75;
      y = ((this.p.sin(this.p.PI + 1) * this.w) / 2) * 0.75;
      this.p.vertex(x, y);
      this.p.endShape(this.p.CLOSE);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.noStroke();
      this.p.fill(0, 150, 0);
      this.p.text("P", -2, 1);
      this.col = this.p.color("#4caf50");
    }
    this.p.pop();
  }
}

class MuteButton {
  constructor(_p, _x, _y) {
    this.p = _p; // P5 object reference
    this.x = _x;
    this.y = _y;
    this.w = 50;
    this.col = this.p.color("#E1C9CF");
    this.muted = false;
    this.s = 0.4; // scale factor
  }

  clicked(_x, _y) {
    if (this.p.dist(this.x, this.y, _x, _y) < (this.w * this.s) / 2) {
      this.muted = !this.muted;
      return true;
    } else {
      return false;
    }
  }

  setMute(_state){
    this.muted = _state;
  }
  
  position(_x, _y) {
    this.x = _x;
    this.y = _y;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.scale(this.s);
    this.p.fill(this.col);
    this.p.stroke("#5d0024");
    this.p.strokeWeight(4);
    this.p.ellipse(0, 0, this.w);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(24);
    if (this.muted) {
      this.col = this.p.color("#BB6177");
      this.p.fill(50);
      this.p.strokeWeight(2);
      this.p.text("M", 0, 0);
    } else {
      this.col = this.p.color("#E1C9CF");
      this.p.fill(50);
      this.p.noStroke();
      this.p.text("m", 0, 0);
    }
    this.p.pop();
  }
}

const testBeatLibrary = [
  {
    name: "Basic House",
    tempo: 120,
    beats: [
      {
        label: "Kick",
        pitch: "A3",
        pattern: "1000100010001000",
        accents: "1000000000000000",
      },
      {
        label: "Claps",
        pitch: "C4",
        pattern: "0000100000001000",
        accents: "1000000000001000",
      },
    ],
  },
  {
    name: "funky polyrhythms",
    tempo: 108,
    beats: [
      {
        label: "claps",
        pitch: "C4",
        pattern: "10110110101101",
        accents: "10100010000100",
      },
      {
        label: "kick",
        pitch: "A3",
        pattern: "110110110100101010",
        accents: "100010000000000010",
      },
      {
        label: "snare",
        pitch: "B3",
        pattern: "101001101",
        accents: "100000000",
      },
      {
        label: "closed hi-hat",
        pitch: "F4",
        pattern: "1001011001110",
        accents: "1000010000110",
      },
      {
        label: "open hi-hat",
        pitch: "F#4",
        pattern: "1001101011",
        accents: "1001001000",
      },
    ],
  },
];

let jsonData = []; // beat library as JSON

// add the metronome
let metroDiv = document.getElementById("metronome");
metroDiv.style = "position:relative;";
let metro = new p5(metroGUI, metroDiv);

// add the main controller
let controllerDiv = document.getElementById("controller");
let beatControl = new p5(beatsGUI, controllerDiv);
// hand the test library to the controller module
//beatControl.setLibrary(structuredClone(testBeatLibrary));
beatControl.setMetro(metro); // connect the controller to the metro

// find the div for the individual beat patterns
let beatPartDiv = document.getElementById("beatParts");
beatPartDiv.style = "position: relative;";
// hand the div reference to the controller
beatControl.setPartsDiv(beatPartDiv);

// save beats to library
//let savebeats = document.getElementById("saveBeats");
//savebeats.addEventListener("click", updateJSON);
setInterval(updateJSON, 1000); // update automatically every second

function updateJSON() {
  jsonData = [{}]; // rebuild from p5 beat loops
  jsonData = beatControl.getLibrary();
  const libraryJSON = document.querySelector(".data pre");
  libraryJSON.innerHTML = JSON.stringify(jsonData, null, 2);
}
updateJSON();

// Download json file: beats.json
const dl = document.getElementById("download");
dl.addEventListener("click", downloadZip);

function download() {
  let filename = "beats.json";
  console.log(filename);
  let text = JSON.stringify(jsonData, null, 2);

  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadZip() {
  updateJSON();
  var zip = new JSZip();
  let text = JSON.stringify(beatControl.getLibrary(), null, 2);
  zip.folder("JSON").file("beats.json", text);
  // make a .zip and download it
  zip.generateAsync({ type: "blob" }).then(function (content) {
    // see FileSaver.js
    saveAs(content, "beatLibrary.zip");
  });
}

// Upload previous file for editing
const fileSelect = document.getElementById("upload");
const fileElem = document.getElementById("fileElem");

fileSelect.addEventListener(
  "click",
  (e) => {
    if (fileElem) {
      fileElem.click();
    }
  },
  false
);

fileElem.addEventListener("change", handleFiles, false);

function handleFiles() {
  const file = this.files[0];
  console.log("loading file: " + file.name + " file type: " + file.type);

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let obj = JSON.parse(e.target.result); // if JSON is valid, make an object
      if (checkObject(obj)) {
        console.log("checks out OK"); // make sure it's a valid library
        // send the file to beatController as a library
        beatControl.setLibrary(obj); // load the library
        beatControl.setMenu(); // update the pattern set menu
      } else {
        console.log("wrong file format for beats.json");
      }
      return obj;
    } catch (error) {
      let e =
        'error - invalid JSON file ${file.name}<br /> copy and paste your JSON to <a href = "https://jsonlint.com/" target="_blank">jsonlint.com</a>';
      console.log(e);
      return;
    }
  };
  reader.readAsText(file);
}

function checkObject(obj) {
  // is this a valid beat library?
  /*
   * [{"name" : string, "tempo" : string/number, "beats" : [
   *
   * ]},
   *  { ... }]
   */
  let flag = false;
  if (Array.isArray(obj) && obj.length > 0) {
    // library should be an array
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].hasOwnProperty("tempo") && obj[i].hasOwnProperty("beats")) {
        if (Array.isArray(obj[i].beats)) {
          flag = true;
        }
      } else flag = false;
    }
  }
  // console.log(obj);
  return flag;
}

async function getJsonFromUrl(url) {
  try {
    const response = await fetch(url); // Make the HTTP request
    if (!response.ok) {
      // Check if the request was successful
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Parse the response as JSON
    return data;
  } catch (error) {
    //console.error("Error fetching JSON:", error);
    return null; // Or handle the error as appropriate
  }
}

// Load the JSON library:
const jsonUrl = "JSON/beats.json"; // look for the beat library
getJsonFromUrl(jsonUrl).then((data) => {
  if (data) {
    // console.log("JSON data:", data);
    // You can now work with the 'data' object
    if (checkObject(data)) {
      console.log("data looks OK");
      beatControl.setLibrary(data);
      beatControl.setMenu();
    } else if (Array.isArray(data) && data.length == 0) {
      console.log("empty beats library (beats.json)");
    } else {
      console.log("not a valid beats.json file");
    }
  } else {
    console.log("No file " + jsonUrl);
  }
});

let copyButton = document.getElementById("copy");
copyButton.addEventListener("click", copyToClipboard);

/*
 * this function uses the now-deprecated document.execCommand('copy') because of the cross-origin frame in editor.p5js.org
 */
function copyToClipboard() {
  console.log("copy json");
  // Get the text from the input field
  let textToCopy = JSON.stringify(beatControl.getLibrary(), null, 2);

  // Create a temporary textarea element
  let tempTextarea = document.createElement("textarea");
  tempTextarea.value = textToCopy;

  // Make the textarea invisible and add it to the DOM
  tempTextarea.style.position = "fixed";
  document.body.appendChild(tempTextarea);

  // Select the text and copy it
  tempTextarea.select();
  document.execCommand("copy");

  // Remove the temporary textarea
  document.body.removeChild(tempTextarea);
}

//let shareButton = document.getElementById("share")
//shareButton.addEventListener("click", share);

function share() {
  console.log("share link");
}
