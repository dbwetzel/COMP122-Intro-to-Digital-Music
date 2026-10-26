/*
 * P5.js functions for GUI
 * Nov-Dec 2025
 * Creates a user interface with a graphical representation of the Markov graph and connections between nodes
 * This version is now a fully graphical editor that can load multiple markov graphs from a library.
 * The library is a reference to the object handed to it via p.setLibrary()
 */
const mGUI = (p) => {
  var tButton, s1Button, s2Button, nodes, beatButton, matrixSelector;
  var playButton; // new play button imported from sequencer
  const matrixSize = 220; // 220 px circle
  var nButtons; // array of pitch nodes
  var rButtons; // array of rhythm nodes
  var pitchSet = null,
    rhythmSet = null; // needs setter
  var toneLoop = null;
  var pitch = "C4"; // default pitch
  var rhythm = "4n"; // default rhythm
  var delay; // Timer object for animation timing
  var name = "markov chain";
  var vol = 1;
  var slider;
  var w = 500,
    h = 420;
  var graphX = 320, graphY = 240;
  var instrument; //= synthLibrary[0].synth;
  var selectSynth;
  var selectLength;
  var noteLength = "legato";
  //var div = document.getElementById("markov").parentNode;
  var musicFont;
  const pitches = ["C", "C#", "Db", "D", "D#", "Eb", "E", "E#", "Fb", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B", "B#", "Cb"]
  const durSymbols = ["𝅝", "𝅗𝅥.", "𝅗𝅥", "𝅘𝅥.", "𝅘𝅥", "𝅘𝅥𝅮.", "𝅘𝅥𝅮", "𝅘𝅥𝅯.", "𝅘𝅥𝅯"];
  const durations = ["1n", "2n.", "2n", "4n.", "4n", "8n.", "8n", "16n.", "16n"];
  
  var markovLibrary = []; // working copy of library
  var libMenu; // dropdown menu for editing a graph
  var currentGraph = {}; // for editing
  var pitchMenu, octMenu, durMenu, addPitchNodeButton, addRhythmNodeButton, delPitchNodeButton, delRhythmNodeButton;
  var nodeToConnect = null;
  var matrixToConnect = null;
  var pNodeMenu = null, rNodeMenu = null;
  var newGraphButton, deleteGraphButton, changeNameButton, changeName;
  var containerDiv = null;
  
  p.setDiv = function(_divName){
    containerDiv = document.getElementById(_divName)
  }
  
  p.preload = function () {
    musicFont = p.loadFont("fonts/NotoMusic-Regular.ttf");
  };
  
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
  
  p.setLibrary = function (library){
    // library is a reference to jsonData (in markov.js)
    //console.log(JSON.stringify(library));
    markovLibrary = library
    if(containerDiv){
      containerDiv.replaceChildren();
    }
    for(let i = 0; i < markovLibrary.length; i ++){
      markovLibrary[i].number = i;
      // if it didn't have this property, it does now
      makePlayer(markovLibrary[i]);
    }
    p.setObj(markovLibrary[0]);
    p.setMenu();
  }
  
  function makePlayer(_graph){
    let div = document.createElement("div");
    //div.style = "position: relative; visibility: visible;"
    let player = new p5(mPlayer, div);
    player.setGraph(_graph);
    if(containerDiv){    
      containerDiv.appendChild(div);
      for (const child of div.children) {
        child.style.visibility = "visible";
      }
    }
  }
  
  p.newGraph = function(){
    console.log("new graph!");
    let graph = {
      "name" : "untitled",
      "pitchSet" : {
        "state" : "C4",
        "matrix" : {
          "C4" : []
        }
      },
      "rhythmSet" : {
        "state" : "4n",
        "matrix" : {
          "4n" : []
        }
      }
    };
    
    markovLibrary.push(graph);
    graph.number = markovLibrary.length-1;
    //makePlayer(graph);
    p.setLibrary(markovLibrary);
    p.setObj(markovLibrary[graph.number]);
    p.setMenu();
  }
  
  p.deleteGraph = function(){
    console.log("delete graph!");
    markovLibrary.splice(currentGraph.number, 1);
    for(let i = 0; i < markovLibrary.length; i++){
      markovLibrary[i].number = i; // renmber after deletion
    }
    if(markovLibrary.length > 0){
      p.setObj(markovLibrary[0]);
    } else {
      p.newGraph();
    }
    p.setMenu();
  }
  
  p.setMenu = function () {
    let names = [];
    if (Array.isArray(markovLibrary)) {
      for (let i = 0; i < markovLibrary.length; i++) {
        names.push(markovLibrary[i].name); // get set names   
      }
      console.log(names);
    }
    names = renameRepeatOccurrences(names);// make sure it's unique

    if (libMenu) {
      libMenu.remove(); // kill it!
    }
    libMenu = p.createSelect(); // make a new one
    libMenu.position(20, 50);
    libMenu.addClass("menu");
    libMenu.size(130);
    libMenu.option("edit graph ...", -1);

    for (let i = 0; i < names.length; i++) {
      libMenu.option(names[i], i);
    }
    if(names.length > 0){
      //libMenu.disable(-1);
    }
    //console.log("setMenu()");
    libMenu.changed(p.loadGraph);
    libMenu.selected(currentGraph.number)
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
  
  p.loadGraph = function(){
    //load a graph from the dropdown menu
    if(libMenu.value() >= 0){
      p.setObj(markovLibrary[libMenu.value()]);
    }
  }

  p.setObj = function (obj) {
    currentGraph = obj; // still refers to jsonData in markov.js
    if (currentGraph.hasOwnProperty("pitchSet")) {
      pitchSet = currentGraph.pitchSet;
      if(pitchSet.state == null){
        pitchSet.state = "C4";
        console.log("replacing null state with C4")
      }  
      pitch = pitchSet.state;
      let pMatrix = Object.keys(pitchSet.matrix);
      if(pMatrix.length == 0){
        addNode(pitch, pitchSet.matrix);
        pMatrix = Object.keys(pitchSet.matrix);
      }
      if(pNodeMenu){
        pNodeMenu.remove();
      }
      pNodeMenu = p.createSelect();
      pNodeMenu.class("menu");
      pNodeMenu.position(400, 120);
      for(let i = 0; i < pMatrix.length; i++){
        pNodeMenu.option(pMatrix[i]);
      }
      pNodeMenu.selected(pitchSet.state);
      pNodeMenu.changed(()=>{
        pitchSet.state = pNodeMenu.selected();
        pitch = pitchSet.state;
      });
      console.log("opening pitch " + pitch);
      nButtons = p.makeNodes2(pitchSet, w, h);
    }
    if (currentGraph.hasOwnProperty("rhythmSet")) {
      rhythmSet = currentGraph.rhythmSet;
      if(rhythmSet.state == null){
        rhythmSet.state = "4n";
      }   
      rhythm = rhythmSet.state;
      let rMatrix = Object.keys(rhythmSet.matrix);
      if(rMatrix.length == 0){
         addNode(rhythm, rhythmSet.matrix);
      }
      if(rNodeMenu){
        rNodeMenu.remove();
      }
      rNodeMenu = p.createSelect();
      rNodeMenu.class("menu");
      rNodeMenu.position(400, 120);
      for(let i = 0; i < rMatrix.length; i++){
        rNodeMenu.option(rMatrix[i]);
      }
      rNodeMenu.selected(pitchSet.state);
      rNodeMenu.changed(()=>{
        rhythmSet.state = rNodeMenu.selected();
        rhythm = rhythmSet.state;
      });
      
      console.log("opening rhythm " + rhythm);
      rButtons = p.makeNodes2(rhythmSet, w, h);
    }
    if (currentGraph.hasOwnProperty("name")) {
      name = currentGraph.name;
    }

    if (toneLoop) {
      toneLoop.stop(); // if the loop already exists, stop it
    }
    toneLoop = new Tone.Loop((time) => {
      // console.log("making a loop ...");
      // in this loop, the markov() function will choose the next pitch  and rhythmic value based on the matrix defined in your pitchSet and rhythmSet objects
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
      instrument.triggerAttackRelease(pitch, dur, time, v);
      // Tone.Transport.schedule
      toneLoop.interval = rhythm; // set the interval to a new value
      p.onButton(pitch); // light it up!
      p.onButton(rhythm)
      let offTime = "+" + 0.9 * Tone.Time(rhythm).toSeconds();
      let oldPitch = pitch;
      let oldRhythm = rhythm
      Tone.Transport.schedule((time) => {
        p.offButton(oldPitch);
        p.offButton(oldRhythm);
      }, offTime);
      
      rhythm = p.markov(rhythm, rhythmSet.matrix); // get the next duration value
      pitch = p.markov(pitch, pitchSet.matrix); // get the next pitch value

    }, rhythm);
    toneLoop.state = "stopped";
  };

  p.markov = function (state, matrix) {
    // takes a {pitchSet} or {rhythmSet} matrix and chooses a new state
    //console.log(obj.state); 
    let nodes = Object.keys(matrix); // get a list of possible nodes in the matrix
    if(nodes.length > 0 && nodes.includes(state)){
      let i = nodes.indexOf(state); // find the position current state in the matrix list
      let edges = matrix[nodes[i]]; // get all the possible next values for a given state as an array
      if(edges.length > 0){
        state = edges[Math.floor(Math.random() * edges.length)];
        // choose a value at random from the list & assign it as the next "state"
      } 
    }
    return state; // return the value chosen for the loop
  };

  p.setup = function () {
    
    
    p.createCanvas(w, h); // see above
    newGraphButton = p.createButton("Create New Graph");
    newGraphButton.class("button");
    newGraphButton.position(200, 20);
    newGraphButton.mousePressed(p.newGraph);
    
    deleteGraphButton = p.createButton("Delete Current Graph");
    deleteGraphButton.class("button");
    deleteGraphButton.position(200, 50);
    deleteGraphButton.mousePressed(p.deleteGraph);
    
    pitchMenu = p.createSelect();
    pitchMenu.class("menu");
    pitchMenu.position(p.width - 130, 50);
    pitchMenu.style("width", "50px");
    pitchMenu.attribute("title", "pitch");
    for(let i = 0; i < pitches.length; i++){
      pitchMenu.option(pitches[i]);
    }
    octMenu = p.createSelect();
    octMenu.class("menu");
    octMenu.position(p.width - 70, 50);
    octMenu.style("width", "40px");
    octMenu.attribute("title", "octave");
    for(let i = 1; i < 8; i++){
      octMenu.option(i);
    }
    octMenu.selected("4");
    
    durMenu = p.createSelect();
    durMenu.class("menu");
    durMenu.position(p.width - 130, 50);
    durMenu.style("width", "50px");
    durMenu.attribute("title", "duration");
    for(let i = 0; i < durations.length; i++){
      durMenu.option(durations[i], i);
    }
    
    addPitchNodeButton = p.createButton("+");
    addPitchNodeButton.class("button");
    addPitchNodeButton.position(p.width - 130, 85);
    addPitchNodeButton.attribute("title", "add selected pitch as new node");
    addPitchNodeButton.mousePressed(()=>{
      addNode(pitchMenu.value() + octMenu.value(), currentGraph.pitchSet.matrix);
    })
    
    delPitchNodeButton = p.createButton("-");
    delPitchNodeButton.class("button");
    delPitchNodeButton.position(p.width - 90, 85);
    delPitchNodeButton.attribute("title", "delete selected pitch node");
    delPitchNodeButton.mousePressed(() => {
      delNode(pitchMenu.value() + octMenu.value(), currentGraph.pitchSet)
    })
    
    addRhythmNodeButton = p.createButton("+");
    addRhythmNodeButton.class("button");
    addRhythmNodeButton.position(p.width - 130, 85);
    addRhythmNodeButton.attribute("title", "add selected rhythm node");
    addRhythmNodeButton.mousePressed(()=>{
      addNode(durations[durMenu.value()], currentGraph.rhythmSet.matrix);
    })
    
    delRhythmNodeButton = p.createButton("-");
    delRhythmNodeButton.class("button");
    delRhythmNodeButton.position(p.width - 90, 85);
    delRhythmNodeButton.attribute("title", "delete selected rhythm node");
    delRhythmNodeButton.mousePressed(() => {
      delNode(durations[durMenu.value()], currentGraph.rhythmSet)
    })
    
    // Play button adapted from sequencer GUI
    playButton = new PlayButton(p, 40, 50);

    // volume slider
    slider = new Slider(p, (p.width * 3) / 4, (p.height * 11) / 12);
    // toggle between pitch and rhythm matrices
    matrixSelector = new MatrixSelect(p, 10, p.height - 50);

    // choose an instrument timbre
    selectSynth = p.createSelect();
    selectSynth.class("menu");
    selectSynth.position(10, 10);
    selectSynth.style("width: 110px");

    // synthLibrary is defined separately in synths.js
    // FIX THIS so that synthLibrary is passed to the sketch instance
    for (let i = 0; i < synthLibrary.length; i++) {
      selectSynth.option(synthLibrary[i].name, i);
    }
    selectSynth.changed(p.chooseSynth);

    selectLength = p.createSelect();
    selectLength.class("menu");
    selectLength.style("width: 100px");
    selectLength.position(p.width * 0.7, 10);
    selectLength.option("legato");
    selectLength.option("marcato");
    selectLength.option("staccato");
    selectLength.changed(p.chooseLength);

    instrument = new Tone.PolySynth(Tone.Synth).toDestination();
    instrument.set(synthLibrary[0].settings);
    
    changeName = p.createInput();
    changeName.position(300, 5);
    changeName.style("visibility", "hidden");
    changeName.changed(()=>{
      changeNameButton.style("visibility", "visible");
      changeName.style("visibility", "hidden");
      name = changeName.value();
      currentGraph.name = name;
      p.setMenu();
    })
    changeNameButton = p.createButton("Change Name");
    changeNameButton.class("button")
    changeNameButton.position(300, 5);
    changeNameButton.mousePressed(()=>{
      changeName.value(name);
      changeName.style("visibility", "visible");
      changeNameButton.style("visibility", "hidden");
    })
  }; // end of setup()

  function addNode(nodeToAdd, matrix){
    console.log("add node " + nodeToAdd);
    let nodes = Object.keys(matrix);
    if(nodes.includes(nodeToAdd)){
      console.log(nodeToAdd + " is already in the graph")
    } else {
      matrix[nodeToAdd] = [];
      p.setObj(currentGraph);
    }
  }

  function delNode(nodeToDelete, _set){
    console.log("delete node " + nodeToDelete)
    let nodes = Object.keys(_set.matrix);
    if(nodes.includes(nodeToDelete)){
      console.log("deleting " + nodeToDelete + " from the graph");
      delete _set.matrix[nodeToDelete];
      nodes = Object.keys(_set.matrix);
      console.log(nodes); // remaining nodes
      
      for(let i = 0; i < nodes.length; i++){
        let transitions = _set.matrix[nodes[i]]
        if(transitions.includes(nodeToDelete)){
          // remove all occurances of the deleted node from the transition list
          _set.matrix[nodes[i]] = transitions.filter((node) => node !== nodeToDelete)
          
        }
      } 
      if(_set.state == nodeToDelete){
        console.log("deleting opening state node")
        if(nodes.length > 0){
          console.log("changing state to " + nodes[0])
          _set.state = nodes[0];
        } else {
          _set.state = null; 
        }
      }
      p.setObj(currentGraph)
    } else {
      console.log(nodeToDelete + " in not in the graph");
    }

  }
  
  function delPitchNode(){
    console.log("delete pitch node " + pitchMenu.value() + octMenu.value())
    let nodeToDelete = pitchMenu.value() + octMenu.value();
    let nodes = Object.keys(currentGraph.pitchSet.matrix);
    if(nodes.includes(nodeToDelete)){
      console.log("deleting " + nodeToDelete + " from the graph");
      delete currentGraph.pitchSet.matrix[nodeToDelete];
      nodes = Object.keys(currentGraph.pitchSet.matrix);
      console.log(nodes); // remaining nodes

      for(let i = 0; i < nodes.length; i++){
        let transitions = currentGraph.pitchSet.matrix[nodes[i]]
        if(transitions.includes(nodeToDelete)){
          // remove all occurances of the deleted node from the transition list
          currentGraph.pitchSet.matrix[nodes[i]] = transitions.filter((node) => node !== nodeToDelete)
          
        }
      } 
      if(currentGraph.pitchSet.state == nodeToDelete){
        console.log("deleting opening state node")
        if(nodes.length > 0){
          console.log("changing state to " + nodes[0])
          currentGraph.pitchSet.state = nodes[0];
        } else {
          currentGraph.pitchSet.state = "C4"; // default
        }
      }
      p.setObj(currentGraph)
    } else {
      console.log(nodeToDelete + " in not in the graph");
    }

  }
  
  p.chooseSynth = function () {
    instrument.set(synthLibrary[selectSynth.value()].settings);
    //    console.log(instrument);
  };

  p.chooseLength = function () {
    noteLength = selectLength.selected();
    //    console.log(noteLength);
  };

  p.makeNodes2 = function (_set) {
    let buttons = [];
    let nodes = Object.keys(_set.matrix);
    let slice = p.TWO_PI;
    if (nodes.length > 0) {
      slice = p.TWO_PI / nodes.length; // divide the circle by number of nodes
    }

    for (let i = 0; i < nodes.length; i++) {
      let x = p.cos(slice * i) * matrixSize/2 + graphX; // find a location
      let y = p.sin(slice * i) * matrixSize/2 + graphY;

      buttons.push(
        new Button(
          p,
          x,
          y,
          nodes[i]
        )
      );
      buttons[i].w = 40; // node button size
      buttons[i].node = nodes[i]; // assign node name
    }
    return buttons;
    // returns an array of button objects, each representing a node
  };

  p.draw = function () {
    p.background(200);
    //p.ellipse(graphX, graphY, matrixSize);
    
    p.textAlign(p.LEFT);
    p.fill(0);
    p.noStroke();
    p.textSize(18)
    p.text("Current Graph: " + name, 15, 15);

    // Graph management and editing
    p.textSize(12);
    p.text("Load from library ...", 15, 40);
    libMenu.position(15, 50)
    newGraphButton.position(15, 90);
    deleteGraphButton.position(15, 120);
    
    // add delete node
    p.text("Add/Delete nodes ...", p.width * 1/3, 40);
    pitchMenu.position(p.width * 1/3, 50);
    octMenu.position(p.width * 1/3 + 55, 50);
    durMenu.position(p.width * 1/3, 50);
    addPitchNodeButton.position(p.width * 1/3 + 100, 50);
    delPitchNodeButton.position(p.width * 1/3 + 140, 50);
    addRhythmNodeButton.position(p.width * 1/3 + 100, 50);
    delRhythmNodeButton.position(p.width * 1/3 + 140, 50);
    
    //set starting state
    p.text("Set initial state ...", p.width * 4/5, 40);
    pNodeMenu.position(p.width * 4/5 +20, 50);  
    rNodeMenu.position(p.width * 4/5 +20, 50); 
  
    // show pitch or rhythm matrix
    matrixSelector.display();
    matrixSelector.position(75, p.height/2 - 15);
    
    // playback controls
    playButton.display();
    playButton.position(45, p.height / 2);
    p.text("Choose synth voice:", 15, p.height - 160);
    selectSynth.position(15, p.height - 150); // instrument
    p.text("Choose articulation style:", 15, p.height - 110);
    selectLength.position(15, p.height - 100); // articulation style
    slider.position(75, p.height - 50); // volume slider

    if (matrixSelector.showing == "pitches") {
      p.drawConnections(pitchSet.matrix, nButtons); // arrows
      for (let i = 0; i < nButtons.length; i++) {
        nButtons[i].display(); // node buttons
      }
      durMenu.style("visibility", "hidden");
      pitchMenu.style("visibility", "visible");
      octMenu.style("visibility", "visible");
      addPitchNodeButton.style("visibility", "visible");
      addRhythmNodeButton.style("visibility", "hidden");
      delPitchNodeButton.style("visibility", "visible");
      delRhythmNodeButton.style("visibility", "hidden");
      pNodeMenu.style("visibility", "visible");
      rNodeMenu.style("visibility", "hidden");

    } else {
      p.drawConnections(rhythmSet.matrix, rButtons); // arrows
      for (let i = 0; i < rButtons.length; i++) {
        rButtons[i].display(); // node buttons
      }
      durMenu.style("visibility", "visible");
      pitchMenu.style("visibility", "hidden");
      octMenu.style("visibility", "hidden");
      addPitchNodeButton.style("visibility", "hidden");
      addRhythmNodeButton.style("visibility", "visible");
      delPitchNodeButton.style("visibility", "hidden");
      delRhythmNodeButton.style("visibility", "visible");
      pNodeMenu.style("visibility", "hidden");
      rNodeMenu.style("visibility", "visible");
    }
    if(nodeToConnect){
      p.fill(255, 100);
      p.noStroke();
      p.ellipse(graphX, graphY, matrixSize - 50);
      p.fill(0);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      let string = "Connect/Disconnect node: " + nodeToConnect + " :"
      p.text(string, p.width * 1/3, 90);
      
      let string2 = "[ "
      for(let i = 0; i < matrixToConnect[nodeToConnect].length; i ++){
        if(i == matrixToConnect[nodeToConnect].length - 1){
          string2 += matrixToConnect[nodeToConnect][i] + " "
        } else {
          string2 += matrixToConnect[nodeToConnect][i] + ", "
        }
      }
      string2 += "]";
      let string2x = (p.width * 1/3) + p.textWidth(string) + 5;
      p.text(string2, string2x, 90, 130);
      p.textSize(12);
      p.rectMode(p.CENTER);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("hold the 'a' key and click another node to add a connection (or 'd' to delete)", graphX, graphY, 100);
      p.rectMode(p.CORNERS);
      p.noFill();
    } else {
      p.fill(0);
      p.noStroke();
      p.textSize(12);
      p.textAlign(p.LEFT);
      p.text("'Shift-click' a node to connect/disconnect", p.width * 1/3, 90);
      p.noFill();

    }
    //adust volume
    slider.display();
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
  };

  // draw a transparent line between nodes with a connection

  p.drawConnections = function (_matrix, _buttons) {
    p.stroke(255, 0, 0, 30);
    p.strokeWeight(5);
    let keys = Object.keys(_matrix);
    for (let i = 0; i < keys.length; i++) {
      let list = _matrix[keys[i]];
      //console.log(list);
      //draw a line for each element in the list
      let x = _buttons[i].x;
      let y = _buttons[i].y;
      //console.log("button " + i + ": " + x + ", " + y);
      for (let j = 0; j < list.length; j++) {
        //find the index in keys of an item in list
        let connect = keys.indexOf(list[j]);
        let x2 = _buttons[connect].x;
        let y2 = _buttons[connect].y;
        if (x == x2 && y == y2) {
          // connect to self
          p.drawLoop(x, y);
        } else {
          // connect across
          p.stroke(255, 0, 0, 30);
          p.line(x, y, x2, y2);
          //use drawArrow() from p5.org lerp() reference
          let v1 = p.createVector(x, y);
          let v2 = p.createVector(x2, y2);
          let v3 = p5.Vector.lerp(v1, v2, 0.7); // end arrow 70% to destination
          //let v3 = p.lerp(v1, v2, 0.7);
          p.drawArrow(v1, v3);
        }
      }
    }
  };

  p.drawLoop = function (_x, _y) {
    let opp = graphY - _y; // distance from vertical center of graph

    let adj = graphX - _x; // distance from horizontal center of graph
    if (adj == 0) {
      // dont' divide by zero!
      adj = 0.01;
    }
    let angle = p.atan(opp / adj);
    if(adj > 0){
      angle += p.PI; // correct for left side
    }    
    
    let apx1 = _x + p.cos(angle) * 20; // anchor point
    let apy1 = _y + p.sin(angle) * 20;
    
    p.push();
    p.translate(apx1, apy1);
    p.rotate(angle);

    let spread = p.PI / 2;
    let cpx1 = 40; // control 1
    let cpy1 = 40;
    let cpx2 = 40; // control 2
    let cpy2 = -40;

    p.stroke(0);
    p.strokeWeight(3);
    p.noFill();
    p.stroke(255, 0, 0, 50);
    p.beginShape();
      p.vertex(0, 0); // anchor point 1
      p.bezierVertex(cpx1, cpy1, cpx2, cpy2, 0, 0); // controls and anchor 2
    p.endShape();
    let v1 = p.createVector(0, 0);
    let v2 = p.createVector(cpx2, cpy2);
    let v3 = p5.Vector.lerp(v2, v1, 0.9);
    p.drawArrow(v3, v1);
    p.pop();
  };

  p.drawArrow = function (base, vec) {
    p.push();
    //p.stroke(myColor);
    p.strokeWeight(3);
    p.noFill();
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

  p.onButton = function (node) {
    for (let i = 0; i < nButtons.length; i++) {
      if (node == nButtons[i].node) {
        nButtons[i].playing = true;
      }
    }
    for (let i = 0; i < rButtons.length; i++) {
      if (node == rButtons[i].node) {
        rButtons[i].playing = true;
      }
    }
  };

  p.offButton = function (node) {
    for (let i = 0; i < nButtons.length; i++) {
      if (node == nButtons[i].node) nButtons[i].playing = false;
    }
    for (let i = 0; i < rButtons.length; i++) {
      if (node == rButtons[i].node) rButtons[i].playing = false;
    }
  };

  p.mousePressed = function () {
    if (playButton.clicked(p.mouseX, p.mouseY)) {
      if (Tone.getTransport().state == "stopped") {
        Tone.getTransport().start();
      }
      if (toneLoop && toneLoop.state == "stopped") {
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
        //tButton.col = p.color(0, 255, 0);
        playButton.playing = true;
      } else if (toneLoop && toneLoop.state == "started") {
        toneLoop.stop();
        //tButton.col = p.color(0, 200, 0);
        playButton.playing = false;
        for(let i = 0; i < nButtons.length; i++){
          nButtons[i].playing = false;
        }
        for(let i = 0; i < rButtons.length; i++){
          rButtons[i].playing = false;
        }
      }
    }
    if (matrixSelector.click(p.mouseX, p.mouseY)) {
      console.log(matrixSelector.showing);
    }

    let buttons = [];
    let nodeSet = {}
    if(matrixSelector.showing == "pitches"){
      buttons = nButtons;
      nodeSet = currentGraph.pitchSet;
    } else if (matrixSelector.showing == "rhythm"){
      buttons = rButtons;
      nodeSet = currentGraph.rhythmSet;
    }

    if (p.keyIsDown(p.SHIFT)) {
      for (let i = 0; i < buttons.length; i++) {
        // node buttons
        if(buttons[i].clicked(p.mouseX, p.mouseY)){
          console.log("clicked " + buttons[i].node);
          // get curent list of edges
          let n = buttons[i].node
          let e = nodeSet.matrix[n]; // array of edges
          console.log(e);
          buttons[i].playing = true;
          nodeToConnect = n;
          matrixToConnect = nodeSet.matrix
        } else {
          buttons[i].playing = false;
        }
      }
    } 
    
    if (nodeToConnect){
      let doneEditing = true;
      for(let i = 0; i < buttons.length; i++){
        if(buttons[i].clicked(p.mouseX, p.mouseY)){
          //'a' key is down
          if(p.keyIsDown(65)){
            // add to the list
            console.log("add " + buttons[i].node);
            matrixToConnect[nodeToConnect].push(buttons[i].node);
            console.log(matrixToConnect[nodeToConnect]); // new list
          } else if(p.keyIsDown(68)){
            // 'd' key
            console.log("delete " + buttons[i].node);
            if(matrixToConnect[nodeToConnect].includes(buttons[i].node)){

              let index = matrixToConnect[nodeToConnect].indexOf(buttons[i].node)
              console.log("included in list at " + index);
              matrixToConnect[nodeToConnect].splice(index, 1);
              console.log(matrixToConnect[nodeToConnect]);
            } else {
              console.log("not included in list")
            }
          }
          doneEditing = false;
        }
      }
      if(doneEditing){
        nodeToConnect = null;
        matrixToConnect = null;
        for(let i = 0; i < buttons.length; i++){
          buttons[i].playing = false;
        }
      }
    }

  };
};

var mPlayer = (p) => {
  //compact player interface for the entire library
  // allows for simultaneous playback
  var name = "default"
  var graph = {}
  var pNodes = [], rNodes = []
  var playButton;
  var pitch = "C4", rhythm = "4n"; // defaults
  var toneLoop = null;
  var noteLength = "legato";
  var instrument = null;
  var displayPitch = null, displayRhythm = null;
  var nextPindex = null, nextRindex = null;
  var delay; // Timer for animation
  
  p.setGraph = function(_graph){
    graph = _graph;    
    pitch = graph.pitchSet.state;
    rhythm = graph.rhythmSet.state;
    displayPitch = pitch;
    displayRhythm = rhythm;
    
    instrument = new Tone.PolySynth(Tone.Synth).toDestination();

    if (toneLoop) {
      toneLoop.stop(); // if the loop already exists, stop it
      toneLoop.dispose();
    }
    toneLoop = new Tone.Loop((time) => {
      let dur = rhythm; // duration may be scaled

      switch (noteLength) {
        case "legato": // full length
          dur = rhythm; 
          break;
        case "staccato": // 16th note or 0.7 * 16th note
          if (Tone.Time(rhythm).toSeconds() <= Tone.Time("16n").toSeconds()) {
            dur = Tone.Time(rhythm).toSeconds() * 0.7;
          } else {
            dur = "16n";
          }
          break;
        case "marcato": // dur is 0.7 * rhythmic value
          dur = Tone.Time(rhythm).toSeconds() * 0.7;
          break;
        default:
          dur = rhythm;
      }
      
      //let v = p.getVol();
      // add volume slider and reinstate this
      let v = 1; // for now
      
      // let instr = p.getInst();
      instrument.triggerAttackRelease(pitch, dur, time, v);
      // Tone.Transport.schedule
      toneLoop.interval = rhythm; // set the interval to a new value
      //p.onButton(pitch); // light it up!
      //p.onButton(rhythm);
      displayPitch = pitch;
      displayRhythm = rhythm;
      
      rhythm = p.markov(rhythm, graph.rhythmSet.matrix)[0]; // get the next duration value
      let mPitch = p.markov(pitch, graph.pitchSet.matrix); // get the next pitch value
      pitch = mPitch[0];
      nextPindex = mPitch[1];
      // set delay
      delay.start((0.5 * Tone.Time(rhythm).toSeconds()) * 1000)
    }, rhythm);
    toneLoop.state = "stopped";
  }
  
  p.setup = function(){
    let player = p.createCanvas(500, 100);
    playButton = new PlayButton(p, 40, 60);
    delay = new Timer(p, 250); // new delay timer for 1 8n @120bpm
  }
  
  p.draw = function(){
    p.background("lightblue");
    pNodes = Object.keys(graph.pitchSet.matrix);

    p.textAlign(p.LEFT, p.BOTTOM);
    p.text("Matrix player: " + graph.name, 10, 20);
    for(let i = 0; i < pNodes.length; i++){
      //p.text(pNodes[i] + ":", 100, 40 + (i * 15))
      //p.text(graph.pitchSet.matrix[pNodes[i]], 120, 40 + (i * 15))
    }
    p.push()
    p.translate(100, 60);
    p.noStroke();
    p.fill("red");
    p.rectMode(p.CENTER);
    p.rect(0, 0, 30, 30, 5)
    p.textAlign(p.CENTER, p.CENTER);
    p.fill("white");
    p.text(displayPitch, 0, 0);
    let transitions = []
    if(!graph.pitchSet.matrix.hasOwnProperty(displayPitch)){
      displayPitch = Object.keys(graph.pitchSet.matrix)[0];
    } 
    transitions = graph.pitchSet.matrix[displayPitch];
    for(let i = 0; i < transitions.length; i++){
      if(delay.isFinished() && nextPindex == i){
        p.fill("red");
      } else {
        p.fill("black");
      }
      p.rect(40 + (i * 30), 0, 25, 25, 5);
      p.fill("white")
      p.text(transitions[i], 40 + (i * 30), 0);
    }
    //p.text(transitions, 50, 0)
    //p.text(Array.isArray(transitions), 50, -20)
    p.pop();
    
    playButton.display();
  }
  
  p.mousePressed = function(){
    if (playButton.clicked(p.mouseX, p.mouseY)) {
      if (Tone.getTransport().state == "stopped") {
        Tone.getTransport().start();
      }
      if (toneLoop && toneLoop.state == "stopped") {
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
        //tButton.col = p.color(0, 255, 0);
        playButton.playing = true;
      } else if (toneLoop && toneLoop.state == "started") {
        toneLoop.stop();
        nextPindex = -1;
        //tButton.col = p.color(0, 200, 0);
        playButton.playing = false;
      }
    }
  }
  
  p.markov = function (state, matrix) {
    // takes a {pitchSet} or {rhythmSet} matrix and chooses a new state
    //console.log(obj.state); 
    let edge = -1;
    let nodes = Object.keys(matrix); // get a list of possible nodes in the matrix
    if(nodes.length > 0 && nodes.includes(state)){
      let i = nodes.indexOf(state); // find the position current state in the matrix list
      let edges = matrix[nodes[i]]; // get all the possible next values for a given state as an array
      if(edges.length > 0){
        edge = Math.floor(Math.random() * edges.length)
        state = edges[edge];
        // choose a value at random from the list & assign it as the next "state"
      } 
    }
    return [state, edge]; // return the value chosen for the loop
  };
}

class MatrixSelect {
  constructor(_p5, _x, _y) {
    this.p5 = _p5;
    this.x = _x;
    this.y = _y;
    this.w = 80;
    this.showing = "pitches";
  }
  click(_mX, _mY) {
    if (
      _mX > this.x &&
      _mX < this.x + this.w &&
      _mY > this.y &&
      _mY < this.y + this.w / 3
    ) {
      if (this.showing == "pitches") {
        this.showing = "rhythm";
      } else {
        this.showing = "pitches";
      }
      return true;
    } else {
      this.selected = false;
      return false;
    }
  }
  
  position(_x, _y){
    this.x = _x;
    this.y = _y;
  }

  display() {
    this.p5.push();
    this.p5.translate(this.x, this.y);
    this.p5.textSize(12);
    if (this.showing == "pitches") {
      this.p5.fill("gold");
      this.p5.rect(0, 0, this.w, this.w / 3);
      this.p5.fill("maroon");
      this.p5.noStroke();
      this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
      this.p5.text("show rhythm", 5, 8);
    } else {
      this.p5.fill("maroon");
      this.p5.rect(0, 0, this.w, this.w / 3);
      this.p5.fill("gold");
      this.p5.noStroke();
      this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
      this.p5.text("show pitches", 5, 8);
    }
    this.p5.pop();
  }
}

class Button {
  constructor(_p, X, Y, _lbl) {
    this.p = _p; // P5 object reference
    this.x = X;
    this.y = Y;
    this.w = 100;
    this.tSize = 12;
    this.label = _lbl
    this.col = this.p.color(this.p.random(100), this.p.random(100), this.p.random(100));
    this.playing = false;
    this.node = null; // will be replaced on instantiation
    this.durSymbols = ["𝅝", "𝅗𝅥.", "𝅗𝅥", "𝅘𝅥.", "𝅘𝅥", "𝅘𝅥𝅮.", "𝅘𝅥𝅮", "𝅘𝅥𝅯.", "𝅘𝅥𝅯"];
    this.durNames = ["1n", "2n.", "2n", "4n.", "4n", "8n.", "8n", "16n.", "16n"];
    
    if(this.durNames.includes(_lbl)){
      // its a duration from the rhythm set!
      let i = this.durNames.indexOf(_lbl);
      this.label = this.durSymbols[i];
      this.tSize = 18;
    }
  }

  clicked(_mX, _mY) {
    if(this.p.dist(_mX, _mY, this.x, this.y) < this.w / 2){
      return true;
    } else return false;
  }
  
  display() {
    this.p.strokeWeight(1);
    this.p.stroke(0);
    let c = this.col;
    if (this.playing) {
      this.p.strokeWeight(5);
      this.p.stroke(255);
      this.p.fill(
        this.p.red(this.col) * 3,
        this.p.green(this.col) * 3,
        this.p.blue(this.col) * 3
      );
    } else {
      this.p.fill(this.col);
      this.p.strokeWeight(1);
    }
    this.p.ellipse(this.x, this.y, this.w);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(this.tSize);
    this.p.strokeWeight(1);
    this.p.stroke(0);
    this.p.fill(255);
    if(this.durNames.includes(this.label)){
      this.p.text()
    }
    this.p.text(this.label, this.x, this.y);
  }
}

class Slider {
  constructor(_p, X, Y) {
    this.p = _p;
    this.x = X;
    this.y = Y;
    this.val = 1; // slider value
    this.pos = 50;
  }
  
  position(_x, _y){
    this.x = _x;
    this.y = _y;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.stroke(0);
    this.p.strokeWeight(5);
    this.p.line(-50, 0, 50, 0);
    this.p.strokeWeight(1);
    this.p.noStroke();
    this.p.fill(0);
    this.p.textSize(12);
    this.p.textAlign(this.p.CENTER);
    this.p.text("volume", 0, 20);
    this.p.fill("#4caf50"); //fader color
    this.p.rectMode(this.p.CENTER);
    //this.pos = this.p.map(this.val, 0, 1, -50, 50)
    this.p.rect(this.pos, 0, 10, 40);
    this.p.pop();
  }

  move(_pos) {
    this.pos = _pos;
    this.val = this.p.map(this.pos, -50, 50, 0, 1);
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

class Timer {
  constructor(_p, _time){
    this.p = _p;
    this.startTime = this.p.millis(); // find this when the clock starts
    this.elapsedTime = 0; // keep track of elapsed time
    this.time = _time; // incoming arg goes here
  }  
  start(_t) {
    this.time = _t;
    this.startTime = this.p.millis(); // get the current clock
  }
  
  isFinished() {
    //timer expired
    this.elapsedTime = this.p.millis() - this.startTime;
    if (this.elapsedTime > this.time) {
      return true; // time's up!
    } else {
      return false; // time's not up yet
    }
  }
}
