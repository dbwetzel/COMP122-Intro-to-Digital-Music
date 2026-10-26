/**
 * Make a synth interface for basic sound design/patch editing
 * Synth is based on the capabilities of the Synth object in the Tone.js Web Audio framework
 * Synth interface design and coding by D. B. Wetzel for COMP/MUSC 122 Intro to Digital Music @ Loyola University Chicago
 * v. 0.1 Spring 2024
 * v. 0.2 Aug-Sept 2025
 */
const synthGUI = (p5) => {
  var libIndex = -1; // keep track of this synth's place in the library array
  // index -1 is an init patch not yet saved.
  // index >= 0 is an index in the library array
  var controller; // reference to a keyboard GUI; see setController() below
  var patchView; // text area for strigified current patch JSON data
  var nameBox; // DOM input for patch name
  var oscMenu,
    prefixMenu,
    partialBox,
    volSlider,
    detuneSlider,
    portamentoBox,
    phaseSlider; // DOM inputs
  var attBox, decBox, susBox, relBox, attCurve, decCurve, relCurve; // more DOM
  var fatOptions, fmOptions, amOptions, noOptions; // div elements for synth option blocks
  var fatCount, fatSpread, fmHarm, fmIndex, fmType, amHarm, amType; // DOM input boxes for osc options
  var envGraph, oscGraph; // Graphical display boxes
  var levelMeter; // RMS Meter object for audio level display
  const oscillators = ["sine", "square", "sawtooth", "triangle"];
  const oscPrefix = ["", "fat", "fm", "am"];
  const attackCurves = [
    "linear",
    "exponential",
    "sine",
    "cosine",
    "bounce",
    "ripple",
    "step",
  ];
  const decayCurves = ["linear", "exponential"];
  const releaseCurves = [
    "linear",
    "exponential",
    "sine",
    "cosine",
    "bounce",
    "ripple",
    "step",
  ];
  var ampEnvArray = []; // envelope array for graph display
  var oscArray = []; // waveform array for graph display
  var partials = [];
  var loadButton, newButton, saveButton, deleteButton, patchMenu;
  var loadFromPython; // special test button for Google Colab I/O
  var testButtonA, testButtonB, keyboardOnButton;
  var patchLibrary = [];
  const defaultSettings = {
    // default synth patch
    volume: 0,
    detune: 0,
    portamento: 0,
    envelope: {
      attack: 0.005,
      attackCurve: "linear",
      decay: 0.1,
      decayCurve: "exponential",
      release: 1,
      releaseCurve: "exponential",
      sustain: 0.3,
    },
    oscillator: {
      partialCount: 0,
      partials: [],
      phase: 0,
      type: "triangle",
    },
  };
  var synthSettings = structuredClone(defaultSettings); // store synth settings while working
  var jsonData = {
    patch: "untitled",
    type: "Synth",
    settings: {},
  }; // synth settings with preset name

  jsonData.settings = structuredClone(defaultSettings);

  const synth = new Tone.Synth(); // working model
  const polySynth = new Tone.PolySynth(Tone.Synth); // playable demo
  const meter = new Tone.Meter(); // dB levels
  polySynth.fan(meter, Tone.Destination); // connect multiple
  polySynth.set(synthSettings); // init
  // console.log("synth: " + JSON.stringify(polySynth.get()));

  var part = new Tone.Part((time, note) => {
    polySynth.triggerAttackRelease(note.pitch, note.duration, time);
  }, []).start();

  // Get the file synths.json
  p5.preload = function () {
    // get the file synths.json and send its data to p5.loadLibrary()
    //console.log("loading synths.json");
    //p5.loadJSON("JSON/synths.json", p5.stowJSON, p5.handleFailure);
  };

  // on successful preload, store data to synthLibrary
  p5.stowJSON = function (data) {
    // store JSON data from file before setup()
    patchLibrary = data;
    //console.log(JSON.stringify(patchLibrary));
  };

  // put up an alert if .json file is bad
  p5.handleFailure = function (e) {
    //alert(e);
    patchLibrary = [];
  };

  // create the basic synth interface, load the default patch
  p5.setup = function () {
    
    p5.createCanvas(800, 400);
    // p5.frameRate(5); // save some processing cycles, eh?
    envGraph = new Graph(p5, (p5.width * 3) / 4, p5.height / 3, [0, 1]);
    oscGraph = new Graph(p5, p5.width / 2, p5.height / 3, [-1, 1]);
    levelMeter = new RMS_Meter(p5, 490, 10);
    // text area for JSON view of patch
    patchView = p5.createElement("textarea");
    patchView.position(580, 20);
    patchView.size(212, 350);
    patchView.style("font-size: 11px");
    // synth patch name
    nameBox = p5.createInput("untitled");
    nameBox.id("nameBox");
    nameBox.style("font-size: 12px");
    nameBox.changed(() => {
      p5.updateSynth();
    });
    document.getElementById("nameBox").addEventListener("focus", () => {
      console.log("NameBox Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // oscillator prefix (none, fat, fnm, am)
    prefixMenu = p5.createSelect();
    prefixMenu.id("prefix");
    oscPrefix.forEach((element) => {
      prefixMenu.option(element);
    });
    prefixMenu.changed(() => {
      p5.updateSynth();
    });
    document.getElementById("prefix").addEventListener("focus", () => {
      console.log("NameBox Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });
    // oscillator type (sine, square, triangle, sawtooth)
    oscMenu = p5.createSelect();
    oscMenu.id("oscillator");
    oscillators.forEach((element) => {
      oscMenu.option(element);
    });
    oscMenu.value("triangle");
    oscMenu.changed(() => {
      p5.updateSynth();
    });
    document.getElementById("oscillator").addEventListener("focus", () => {
      console.log("NameBox Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });
    // number of partials
    partialBox = p5.createInput("0", "number");
    partialBox.size(38);
    partialBox.position(10, 10);
    partialBox.attribute("min", 0);
    partialBox.style("font-size: 11px;");
    partialBox.id("partials");
    partialBox.changed(() => {
      p5.updateSynth();
      //p5.addPartials();
    });
    document.getElementById("partials").addEventListener("focus", () => {
      console.log("Partials Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // overall volume
    volSlider = p5.createSlider(-96, 6, 0, 1);
    volSlider.size(80);
    volSlider.position(90, 22);
    volSlider.changed(() => {
      p5.updateSynth();
    });
    // global detune
    detuneSlider = p5.createSlider(-1200, 1200, 0);
    detuneSlider.size(80);
    detuneSlider.position(200, 22);
    //        detuneSlider.attribute("step", 10);
    detuneSlider.changed(p5.updateSynth);

    // Portamento input
    portamentoBox = p5.createInput("0", "number");
    portamentoBox.position(380, 22);
    portamentoBox.size(38);
    portamentoBox.style("font-size: 10px;");
    portamentoBox.changed(p5.updateSynth);
    portamentoBox.id("portamento");
    document.getElementById("portamento").addEventListener("focus", () => {
      console.log("Portamento Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // Oscillator phase
    phaseSlider = p5.createSlider(0, 360, 0);
    phaseSlider.size(50);
    phaseSlider.position(210, 78);
    phaseSlider.changed(p5.updateSynth);

    // Amp Envelope DOM elements
    attBox = p5.createInput("0.005", "number");
    attBox.id("attack");
    attBox.style("font-size: 10px");
    attBox.attribute("step", 0.01);
    attBox.attribute("min", 0.005);
    attBox.attribute("max", 2); // 2 second max attack time
    attBox.size(47);
    attBox.changed(p5.updateSynth);
    attBox.position(425, 115);
    document.getElementById("attack").addEventListener("focus", () => {
      console.log("Attack Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    attCurve = p5.createSelect();
    attCurve.id("attCurve");
    attackCurves.forEach((element) => {
      attCurve.option(element);
    });
    attCurve.style("font-size: 12px");
    attCurve.changed(p5.updateSynth);
    attCurve.position(470, 115);
    document.getElementById("attCurve").addEventListener("focus", () => {
      console.log("AttackCurve Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    decBox = p5.createInput("0.1", "number");
    decBox.id("decay");
    decBox.style("font-size: 10px");
    decBox.attribute("step", 0.01);
    decBox.attribute("min", 0.005);
    decBox.attribute("max", 2); // 2 second max decay time
    decBox.size(47);
    decBox.changed(p5.updateSynth);
    decBox.position(425, 135);
    document.getElementById("decay").addEventListener("focus", () => {
      console.log("Decay Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    decCurve = p5.createSelect();
    decCurve.id("decCurve");
    decayCurves.forEach((element) => {
      decCurve.option(element);
    });
    decCurve.value("exponential");
    decCurve.style("font-size: 12px");
    decCurve.changed(p5.updateSynth);
    decCurve.position(470, 135);
    document.getElementById("decCurve").addEventListener("focus", () => {
      console.log("DecayCurve Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    susBox = p5.createInput("0.3", "number");
    susBox.id("sustain");
    susBox.style("font-size: 10px");
    susBox.attribute("step", 0.1);
    susBox.attribute("min", 0.005);
    susBox.attribute("max", 1); // 2 second max attack time
    susBox.size(47);
    susBox.changed(p5.updateSynth);
    susBox.position(425, 155);
    document.getElementById("sustain").addEventListener("focus", () => {
      console.log("Sustain Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    relBox = p5.createInput("1", "number");
    relBox.id("release");
    relBox.style("font-size: 10px");
    relBox.attribute("step", 0.01);
    relBox.attribute("min", 0.005);
    relBox.attribute("max", 2); // 2 second max release time
    relBox.size(47);
    relBox.changed(p5.updateSynth);
    relBox.position(425, 175);
    document.getElementById("release").addEventListener("focus", () => {
      console.log("Release Focus!");
      if (controller.enabled) {
        keyboardOff();
        //keyboardOnButton.mousePressed();
      }
    });

    relCurve = p5.createSelect();
    relCurve.id("relCurve");
    releaseCurves.forEach((element) => {
      relCurve.option(element);
    });
    relCurve.value("exponential");
    relCurve.style("font-size: 12px");
    relCurve.changed(p5.updateSynth);
    relCurve.position(470, 175);
    document.getElementById("relCurve").addEventListener("focus", () => {
      //console.log("ReleaseCurve Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    synth.oscillator.asArray(256).then((values) => {
      oscArray = values;
    });
    synth.envelope.asArray(256).then((values) => {
      ampEnvArray = values;
    });
    // Fat Oscillator Options
    fatOptions = p5.createElement("div");
    fatOptions.position(20, 120);
    fatOptions.style(
      "border: solid 1.5px; width: 350px; height: 60px; font-size: 12px; display: block"
    );
    fatCount = p5.createInput("3", "number");
    fatCount.id("fatCount");
    fatCount.parent(fatOptions);
    fatCount.size(40);
    fatCount.attribute("min", 2);
    fatCount.style("font-size: 12px");
    fatCount.position(70, 15);
    fatCount.changed(p5.updateSynth);
    document.getElementById("fatCount").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });
    fatSpread = p5.createInput("20", "number");
    fatSpread.id("fatSpread");
    fatSpread.parent(fatOptions);
    fatSpread.size(40);
    fatSpread.attribute("min", 0);
    fatSpread.style("font-size: 12px");
    fatSpread.position(180, 15);
    fatSpread.changed(p5.updateSynth);
    document.getElementById("fatSpread").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    //FM Oscillator Options Div
    fmOptions = p5.createElement("div");
    fmOptions.position(20, 120);
    fmOptions.style(
      "border: solid 1.5px; width: 350px; height: 60px; font-size: 12px; display: block"
    );
    // number box for Harmonicity
    fmHarm = p5.createInput("1", "number");
    fmHarm.id("fmHarm");
    fmHarm.parent(fmOptions);
    fmHarm.size(40);
    fmHarm.attribute("min", 1);
    fmHarm.style("font-size: 12px");
    fmHarm.position(70, 15);
    fmHarm.changed(p5.updateSynth);
    document.getElementById("fmHarm").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // number box for FM Mod Index
    fmIndex = p5.createInput("2", "number");
    fmIndex.id("fmIndex");
    fmIndex.parent(fmOptions);
    fmIndex.size(40);
    fmIndex.attribute("min", 0);
    fmIndex.style("font-size: 12px");
    fmIndex.position(180, 15);
    fmIndex.changed(p5.updateSynth);
    document.getElementById("fmIndex").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // mod oscillator menu
    fmType = p5.createSelect();
    fmType.id("fmType");
    fmType.parent(fmOptions);
    oscillators.forEach((element) => {
      fmType.option(element);
    });
    fmType.value("square");
    fmType.position(270, 15);
    fmType.style("font-size: 12px;");
    fmType.changed(p5.updateSynth);
    document.getElementById("fmType").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    //AM Oscillator Options
    amOptions = p5.createElement("div");
    amOptions.position(20, 120);
    amOptions.style(
      "border: solid 1.5px; width: 350px; height: 60px; font-size: 12px; display: block"
    );
    // number box for Harmonicity
    amHarm = p5.createInput("1", "number");
    amHarm.id("amHarm");
    amHarm.parent(amOptions);
    amHarm.size(40);
    amHarm.attribute("min", 1);
    amHarm.style("font-size: 12px");
    amHarm.position(70, 15);
    amHarm.changed(p5.updateSynth);
    document.getElementById("amHarm").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    // mod oscillator menu
    amType = p5.createSelect();
    amType.id("amType");
    amType.parent(amOptions);
    oscillators.forEach((element) => {
      amType.option(element);
    });
    amType.value("square");
    amType.position(170, 15);
    amType.style("font-size: 12px;");
    amType.changed(p5.updateSynth);
    document.getElementById("amType").addEventListener("focus", () => {
      //console.log("fatcount Focus!");
      if (controller.enabled) {
        keyboardOff();
      }
    });

    noOptions = p5.createElement("div");
    noOptions.position(20, 120);
    noOptions.style(
      "border: solid 1.5px; width: 350px; height: 60px; font-size: 12px; display: block"
    );
    // This div describes the other options

    // Utility Buttons
    //loadButton = p5.createButton("Load Library");
    //loadButton.position(10, 200);
    //loadButton.mousePressed(getTestData);

    //loadFromPython = p5.createButton("From Python");
    //loadFromPython.position(10, 225);
    //loadFromPython.mousePressed(getDataFromPython);

    saveButton = p5.createButton("Download Library");
    saveButton.addClass("button");
    saveButton.position(100, 200);
    saveButton.mousePressed(downloadZip);

    newButton = p5.createButton("New Patch");
    newButton.addClass("button");
    newButton.position(200, 200);
    newButton.mousePressed(newPatch);

    patchMenu = p5.createSelect();
    patchMenu.addClass("menu");
    patchMenu.position(300, 200);
    patchMenu.id("patchMenu");
    patchMenu.option("-- Load Library --");

    deleteButton = p5.createButton("Delete");
    deleteButton.addClass("button");
    deleteButton.position(450, 200);
    deleteButton.mousePressed(deletePatch);

    // test synth

    controller = new KeyBoardGUI(p5, 110, 250);
    controller.buildKeys();

    //p5 DOM elements
    keyboardOnButton = p5.createButton("Keyboard Off");
    keyboardOnButton.addClass('button')
    keyboardOnButton.id("kbOn");
    keyboardOnButton.position(10, 250);
    keyboardOnButton.style(
      "background-color: red; width: 80px; border-radius: 4px;"
    );
    document.getElementById("kbOn").addEventListener("click", toggleKb);

    function toggleKb() {
      if (controller.enabled) {
        controller.disable();
        keyboardOnButton.html("Keyboard Off");
        keyboardOnButton.style("background-color: red;");
      } else {
        controller.enable();
        keyboardOnButton.html("Keyboard On");
        keyboardOnButton.style("background-color: green;");
      }
    }
    function keyboardOff() {
      controller.disable();
      keyboardOnButton.html("Keyboard Off");
      keyboardOnButton.style("background-color: red;");
    }

    testButtonA = p5.createButton("Jump A");
    testButtonA.addClass("button");
    testButtonA.position(10, 310);
    testButtonA.mousePressed(()=>{
      //console.log(testSequences[0].jump1);
      p5.testSynth(testSequences[0].jump1, 132);
    });

    testButtonB = p5.createButton("Jump B");
    testButtonB.addClass("button");
    testButtonB.position(10, 350);
    testButtonB.mousePressed(()=>{
      //console.log(testSequences[1].jump2);
      p5.testSynth(testSequences[1].jump2, 132);
    });

    p5.loadLibrary(patchLibrary); // load patch library from synths.json
  };

  // arrange the graphical interface
  p5.draw = function () {
    //mouse control of virtual keyboard
    if (p5.mouseIsPressed) {
      // send mouse location to controller to pick note
      let i = controller.mousePressed(p5.mouseX, p5.mouseY);
      if (i > -1 && !controller.keyboard[i].pressed) {
        console.log(i);
        p5.keyboardOn(); // turn on the keyboard
        p5.noteOn(controller.keyboard[i].noteName); // trigger once
        controller.keyboard[i].pressed = true; //close the door
      }
    }
    p5.background(200);
    p5.noStroke();
    p5.fill(0);
    p5.textSize(14);
    p5.textAlign(p5.LEFT);
    p5.text("Synth Designer", 10, 15);
    p5.textSize(11);

    // JSON view
    p5.text("Patch Data:", 580, 15);
    patchView.value(JSON.stringify(jsonData, null, 1));

    // Name
    p5.text("Name:", 140, 16);
    nameBox.position(180, 3);

    // library index
    let li = "";
    if (libIndex < 0) {
      li = "< not saved >";
    } else {
      li = "Patch library #" + libIndex;
    }
    p5.text(li, 350, 15);

    // Levels
    levelMeter.y = 25;
    levelMeter.x = 460;
    levelMeter.display(meter.getValue());

    // Volume
    volSlider.position(100, 22);
    p5.text("volume: " + volSlider.value() + " dB", 20, 35);

    // Detune
    detuneSlider.position(240, 22);
    p5.text("detune:", 200, 35);
    p5.textAlign(p5.CENTER);
    let sign = "";
    if (detuneSlider.value() > 0) {
      sign = "+";
    }
    p5.text(sign + detuneSlider.value(), 280, 50);
    p5.textAlign(p5.LEFT);

    //Portamento
    portamentoBox.position(400, 22);
    p5.text("portamento:", 333, 35);
    portamentoBox.attribute("step", 0.1);

    // oscillator block
    let oscx = 20,
      oscy = 60;
    p5.textSize(12);
    p5.text("Oscillator (Tone.js 'OmniOscillator')", oscx, oscy - 5);
    p5.textSize(10);
    p5.text("type:", oscx + 3, oscy + 17);
    prefixMenu.position(oscx + 30, oscy + 5);
    oscMenu.position(oscx + 70, oscy + 5);
    partialBox.position(oscx + 145, oscy + 5);
    // partial amps as bars
    //p5.rect(x + 30, y + 25, 160, 20);
    for (let i = 0; i < partials.length; i++) {
      let w = 160 / partials.length;
      p5.rect(
        oscx + 30 + w * i,
        oscy + 25 + (1 - Math.abs(partials[i])) * 20,
        w * 0.9,
        20 * partials[i]
      );
    }
    // bounding box
    p5.noFill();
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.rect(oscx, oscy, 350, 50);
    //osc waveshape graph
    oscGraph.display(oscArray, oscx + 250, oscy, 100, 50);
    // oscillator phase
    p5.noStroke();
    p5.fill(0);
    p5.text("phase:", oscx + 200, oscy + 15);
    //        phaseBox.position(220, 80);
    phaseSlider.position(210, 78);
    p5.textAlign(p5.CENTER);
    p5.text(phaseSlider.value() + "°", oscx + 220, oscy + 45);
    p5.textAlign(p5.LEFT);

    //Fat Oscillator Options
    //        if(prefixMenu.value() == "fat"){
    if (prefixMenu.value() == "fat") {
      // options for "fat" oscillator
      let x = 20,
        y = 130;
      fatOptions.style("display: block; height: 66px");
      fatOptions.position(x, y); // parent div
      p5.textSize(12);
      p5.text('"Fat" Oscillator Options', x + 2, y - 5);
      p5.text("Osc. count:", x + 10, y + 20);
      fatCount.position(73, 5); // position relative to parent div
      p5.text("Osc. Spread:", x + 130, y + 20);
      fatSpread.position(203, 5); // position relative to parent div
      p5.text("cents", x + 255, y + 20);
      p5.textSize(10);
      p5.text(
        "The Fat Oscillator creates a set of detuned oscillators of the same type. 'Count' is the number of oscillators (> 1); 'Spread' is the total detune amount. (e.g, 'count' = 3 & 'spread' = 40, three oscillators are detuned: [-20, 0, 20]).",
        x + 10,
        y + 28,
        350
      );
    } else {
      fatOptions.style("display: none;");
    }
    //FM Oscillator Options
    // if(prefixMenu.value() == "fm"){
    if (prefixMenu.value() == "fm") {
      let x = 20,
        y = 130;
      fmOptions.style("display: block; height: 66px");
      fmOptions.position(x, y);
      p5.textSize(12);
      p5.text("Frequency Modulation Options", x + 2, y - 5);
      p5.text("Harmonicity:", x + 10, y + 20);
      fmHarm.position(80, 5);
      p5.text("Index:", x + 135, y + 20);
      fmIndex.position(170, 5);
      p5.text("Type:", x + 225, y + 20);
      fmType.position(257, 7);
      p5.textSize(10);
      p5.text(
        "The FM Oscillator modulates (varies) the pitch of the main oscillator (carrier) with a second oscillator (modulator). Harmonicity: ratio of modulator to carrier frequency; Index: depth of modulation. Type: modulator waveform",
        x + 10,
        y + 28,
        340
      );
    } else {
      fmOptions.style("display: none;");
    }

    // AM Oscillator Options
    if (prefixMenu.value() == "am") {
      let x = 20,
        y = 130;
      amOptions.style("display: block; height: 66px");
      amOptions.position(x, y);
      p5.textSize(12);
      p5.text("Amplitude Modulation Options", x + 2, y - 5);
      p5.text("Harmonicity:", x + 10, y + 20);
      amHarm.position(80, 5);
      p5.text("Type:", x + 225, y + 20);
      amType.position(257, 7);
      p5.textSize(10);
      p5.text(
        "The AM Oscillator modulates (varies) the amplitude of the main oscillator (carrier) with a second oscillator (modulator). Harmonicity: ratio of modulator to carrier frequency; Type: modulator waveform",
        x + 10,
        y + 28,
        340
      );
    } else {
      amOptions.style("display: none;");
    }
    // Basic Oscillator Options
    if (prefixMenu.value() == "") {
      let x = 20,
        y = 130;
      noOptions.style("display: block; height: 66px");
      noOptions.position(x, y);
      p5.textSize(12);
      p5.text("OmniOscilltor Basic Version", x + 2, y - 5);
      p5.textSize(10);
      p5.text(
        "The OmniOscillator has options for multiple waveforms and modulation.",
        x + 10,
        y + 5,
        340
      );
      //
      p5.text(
        "For Oscillator type, add a number suffix to limit the oscillator's timbre to a set number of partials. Choose a prefix ('fat', 'fm', or 'am') to alter the oscillator's synthesis technique.",
        x + 10,
        y + 20,
        340
      );
    } else {
      noOptions.style("display: none;");
    }

    // Amp Envelope Section
    let envx = 400,
      envy = 60;
    // label and bounding box
    p5.text("amplitude envelope", envx, envy - 5);
    p5.noFill();
    p5.stroke(0);
    p5.rect(envx, envy, 160, 135);
    // envelope graph display
    envGraph.display(ampEnvArray, envx, envy, 160, 50);
    p5.fill(0);
    p5.noStroke();
    p5.text("A:", envx + 5, envy + 67);
    attBox.position(envx + 20, envy + 55);
    p5.text("D:", envx + 5, envy + 87);
    decBox.position(envx + 20, envy + 75);
    p5.text("S:", envx + 5, envy + 107);
    susBox.position(envx + 20, envy + 95);
    p5.text("A x S -> R", envx + 75, envy + 107);
    p5.text("R:", envx + 5, envy + 127);
    relBox.position(envx + 20, envy + 115);
    
    // position utility buttons
    patchMenu.position(20, 210);
    newButton.position(200, 205);
    deleteButton.position(300, 205);
    saveButton.position(400, 205);
    
    // show keyboard
    controller.display();
  };

  /**
   * Loading and selecting patches
   */

  // load patch library from JSON file
  p5.loadLibrary = function (synthData) {
    // load JSON file containing multiple patches
    if (p5.checkObject(synthData)) {
      //console.log("Library looks good");
      patchLibrary = synthData;
      updateMenu();
      patchMenu.selected(0); // load the first patch
      p5.loadPatch();
    } else if (Array.isArray(synthData) && synthData.length == 0) {
      // empty array
      console.log("empty file. Here's a new patch to get started");
      newPatch(); // make a new default patch
      updateMenu(); // update the menu
      patchMenu.selected(0); // select the new patch
    } else {
      console.log(JSON.stringify(synthData));
      console.error("invalid synth library");
    }
  };

  // check library for validity, even if legal JSON
  p5.checkObject = function (obj) {
    // is this a valid synth library?
    let flag = false;
    if (Array.isArray(obj)) {
      // library should be an array
      // console.log("object is an array of " + obj.length);
      for (let i = 0; i < obj.length; i++) {
        if (obj[i].hasOwnProperty("settings")) {
          //console.log("object " + i + " has property 'settings'");
          if (
            obj[i].settings.hasOwnProperty("oscillator") &&
            obj[i].settings.hasOwnProperty("envelope")
          ) {
            flag = true; // good enough!
          }
        }
      }
      // console.log(obj);
    }
    return flag;
  };

  // update the UI menu from loadLibrary() or updateSynth()
  function updateMenu() {
    patchMenu.remove();
    patchMenu = p5.createSelect();
    patchMenu.position(300, 200);
    patchMenu.id("patchMenu");
    patchMenu.option("-- Choose Patch --", -1);
    for (let i = 0; i < patchLibrary.length; i++) {
      if (patchLibrary[i].hasOwnProperty("patch")) {
        // add patch names to menu
        // console.log(synthData[i].patch);
        patchMenu.option(patchLibrary[i].patch, i);
      }
    }
    //patchMenu.disable(-1);
    patchMenu.changed(p5.loadPatch);
  }

  // make a new default patch and add to the menu
  function newPatch() {
    // Create a new init patch
    let init = {
      patch: "dafault patch",
      type: "Synth",
      settings: {},
    };
    init.settings = structuredClone(defaultSettings);
    // append it to the patchLibrary
    patchLibrary.push(init);
    // add it to the menu as "default patch"
    patchMenu.option(init.patch, patchLibrary.length - 1);
    patchMenu.selected(patchLibrary.length - 1);
    p5.loadPatch();
  }

  function deletePatch() {
    if (patchMenu.selected() > -1) {
      patchLibrary.splice(patchMenu.selected(), 1);
      console.log("delete patch " + patchMenu.selected());
    }
    updateMenu();
    if (patchLibrary.length > 0) {
      patchMenu.selected(0);
      p5.loadPatch();
    } else {
      newPatch();
    }
  }

  function download() {
    // download patchLibrary as "synths.json"
    let filename = "synths.json";
    console.log(filename);
    let text = JSON.stringify(patchLibrary, null, 2);

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
    let text = JSON.stringify(patchLibrary, null, 2);
    zip.folder("JSON").file("synths.json", text);
    // make a .zip and download it
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, "synthLibrary.zip");
    });
  }

  // load a patch from the UI menu
  p5.loadPatch = function () {
    if (patchMenu.selected() > -1) {
      patchMenu.disable("-1");
      let domElement = patchMenu.elt;
      let selectedText = domElement.options[domElement.selectedIndex].text;
      console.log("load patch " + patchMenu.selected() + ": " + selectedText);
      libIndex = patchMenu.selected();
      jsonData = patchLibrary[libIndex];
      polySynth.set(jsonData.settings); // send settings to synth
      synth.set(jsonData.settings); // for scope display
      p5.setSynthGUI(); // set interface controls
    }
  };

  //populate UI boxes with data from loaded patch
  p5.setSynthGUI = function () {
    //libIndex = _i;
    // parse the json object and set the controls
    //jsonData = _json;
    if (jsonData.hasOwnProperty("patch")) {
      nameBox.value(jsonData.patch);
    }
    if (jsonData.hasOwnProperty("settings")) {
      //synth.set(jsonData.settings);
      //polySynth.set(jsonData.settings);

      volSlider.value(jsonData.settings.volume);
      detuneSlider.value(jsonData.settings.detune);
      portamentoBox.value(jsonData.settings.portamento);
      if (jsonData.settings.hasOwnProperty("oscillator")) {
        let type = jsonData.settings.oscillator.type;
        let oscregx = /fm|am|fat|\d+/g;
        let osc = type.replace(oscregx, "");
        let prereg = /sine|square|triangle|sawtooth|\d+/g;
        let pre = type.replace(prereg, "");
        let partreg = /sine|square|triangle|sawtooth|fm|am|fat/g;
        let part = type.replace(partreg, "");
        if (part == "") {
          part = 0;
        }
        //console.log(type);
        //console.log(pre);
        prefixMenu.value(pre);
        //console.log(osc);
        oscMenu.value(osc);
        //console.log(part);
        partialBox.value(part);
        partials = jsonData.settings.oscillator.partials;
        switch (pre) {
          case "fat":
            fatCount.value(jsonData.settings.oscillator.count);
            fatSpread.value(jsonData.settings.oscillator.spread);
            break;
          case "fm":
            fmHarm.value(jsonData.settings.oscillator.harmonicity);
            fmIndex.value(jsonData.settings.oscillator.modulationIndex);
            fmType.value(jsonData.settings.oscillator.modulationType);
            break;
          case "am":
            amHarm.value(jsonData.settings.oscillator.harmonicity);
            amType.value(jsonData.settings.oscillator.modulationType);
            break;
        }
      }
      if (jsonData.settings.hasOwnProperty("envelope")) {
        attBox.value(jsonData.settings.envelope.attack);
        attCurve.value(jsonData.settings.envelope.attackCurve);
        decBox.value(jsonData.settings.envelope.decay);
        decCurve.value(jsonData.settings.envelope.decayCurve);
        susBox.value(jsonData.settings.envelope.sustain);
        relBox.value(jsonData.settings.envelope.release);
        relCurve.value(jsonData.settings.envelope.releaseCurve);
      }
    }
    synth.oscillator.asArray(256).then((values) => {
      oscArray = values; // new values used in draw()
    });
    synth.envelope.asArray(256).then((values) => {
      ampEnvArray = values;
    });
  };

  // transfer UI inputs to the synth instrument
  p5.updateSynth = function () {
    synthSettings.volume = volSlider.value();
    synthSettings.detune = detuneSlider.value();
    synthSettings.portamento = portamentoBox.value();
    synthSettings.oscillator.phase = phaseSlider.value();
    synthSettings.oscillator.type = prefixMenu.value() + oscMenu.value();
    synthSettings.envelope.attack = attBox.value();
    synthSettings.envelope.decay = decBox.value();
    synthSettings.envelope.sustain = susBox.value();
    synthSettings.envelope.release = relBox.value();
    synthSettings.envelope.attackCurve = attCurve.value();
    synthSettings.envelope.decayCurve = decCurve.value();
    synthSettings.envelope.releaseCurve = relCurve.value();
    if (partialBox.value() > 0) {
      // console.log("add partials");
      synthSettings.oscillator.type += partialBox.value();
    }

    synth.set(synthSettings);
    synthSettings = synth.get(); // transformed by the synth in some cases

    /**
     *  * special options: Partials, Fat, FM, AM
     */
    // partials
    if (synthSettings.oscillator.partialCount > 0) {
      partials = synthSettings.oscillator.partials;
    } else {
      partials = [];
      synthSettings.oscillator.partials = [];
    }
    // Fat Oscillator Options
    if (prefixMenu.value() == "fat") {
      console.log(
        "fat options: count " +
          fatCount.value() +
          " spread " +
          fatSpread.value()
      );
      synthSettings.oscillator.count = Number(fatCount.value());
      synthSettings.oscillator.spread = Number(fatSpread.value());
    }
    // FM Oscillator Options
    if (synthSettings.oscillator.type.includes("fm")) {
      console.log(
        "FM Synth: Harm. " +
          fmHarm.value() +
          ", Ind. " +
          fmIndex.value() +
          ", Type " +
          fmType.value()
      );
      synthSettings.oscillator.harmonicity = Number(fmHarm.value());
      synthSettings.oscillator.modulationIndex = Number(fmIndex.value());
      synthSettings.oscillator.modulationType = fmType.value();
    }
    // AM Oscillator Options
    if (synthSettings.oscillator.type.includes("am")) {
      console.log("AM Synth");
      synthSettings.oscillator.harmonicity = Number(amHarm.value());
      synthSettings.oscillator.modulationType = amType.value();
    }
    // load the new settings
    synth.set(synthSettings);
    polySynth.set(synthSettings);

    // console.log("working synth settings:");
    // console.log(synth.get());
    /**
     * Get the new oscillator and envelope arrays for the graph
     */
    synth.oscillator.asArray(256).then((values) => {
      oscArray = values; // new values used in draw()
    });
    synth.envelope.asArray(256).then((values) => {
      ampEnvArray = values;
    });

    jsonData.patch = nameBox.value();
    jsonData.settings = synth.get();

    // also update patch library menu
    updateMenu();
    patchMenu.selected(libIndex);
  };

  /*
   * Retrieve information from the synth
   */

  // return currently loaded patch data
  p5.getJSON = function () {
    return jsonData;
  };

  // return currently loaded synth parameters
  p5.getSettings = function () {
    return synth.get();
  };

  // get synth data plus current index (as Array)
  p5.getForLibrary = function () {
    // get library index plus JSON data
    return [libIndex, jsonData];
    // if libIndex is < 0 this is a new patch
  };

  // retrieve the entire synth library as JSON for save/download
  p5.getSynthLibrary = function () {
    return patchLibrary;
  };
  /*
   * Playing the synth
   * Keyboard controller on/off
   * Note on/off
   */
  // connect synth to virtual keyboard (deprecated)
  p5.setController = function (p5Controller) {
    //controller = p5Controller;
    //controller.setKeyInput(true);
    // get a reference to the p5 keyboard GUI
    // when the synth input boxes have focus, disable the keyboard QUERTY input
    // use controller.setKeyInput(false) when "focus" event detected
    // controller.setKeyInput(true); on "blur"
  };

  // enable the keyboard interface (when not editing parameters)
  p5.keyboardOn = function () {
    controller.enable();
    keyboardOnButton.html("Keyboard On");
    keyboardOnButton.style("background-color: green;");
  };

  // all notes off on mouse realease (for safety)
  p5.mouseReleased = function () {
    // all notes off when the mouse is released
    for (let i = 0; i < 127; i++) {
      p5.noteOff(i);
    }
    controller.allOff();
  };

  // play a test sequence
  p5.testSynth = function (_seq, _bpm) {
    //console.log("test synth" + JSON.stringify(_seq));
    if (Tone.getTransport().state == "stopped") {
      Tone.getTransport().start();
      // console.log("starting transport");
    }
    Tone.getTransport().bpm.value = _bpm;
    part.stop();
    part = new Tone.Part((time, note) => {
      polySynth.triggerAttackRelease(note.pitch, note.duration, time);
    }, _seq).start();
  };

  // turn on a note
  p5.noteOn = function (_pitch) {
    polySynth.triggerAttack(_pitch, Tone.now());
  };

  //turn off a note
  p5.noteOff = function (_pitch) {
    polySynth.triggerRelease(_pitch, Tone.now());
  };

  // QWERTY note on
  p5.keyPressed = function () {
    if (controller.enabled && controller.keyPressed(p5.key)) {
      console.log("On " + controller.keyPressed(p5.key));
      p5.noteOn(controller.keyPressed(p5.key));
    }
  };

  //QWERTY note off
  p5.keyReleased = function () {
    if (controller.enabled && controller.keyReleased(p5.key)) {
      console.log("Off " + controller.keyReleased(p5.key));
      p5.noteOff(controller.keyReleased(p5.key));
    }
  };
};

class Graph {
  constructor(_p5, _x, _y, _r) {
    this.p5 = _p5;
    this.x = _x;
    this.y = _y;
    this.w = 150;
    this.h = 90;
    this.range = _r;
  }

  display(arr) {
    if (arguments.length > 1) {
      switch (arguments.length) {
        case 2:
          this.x = arguments[1];
          break;
        case 3:
          this.x = arguments[1];
          this.y = arguments[2];
          break;
        case 4:
          this.x = arguments[1];
          this.y = arguments[2];
          this.w = arguments[3];
          break;
        case 5:
          this.x = arguments[1];
          this.y = arguments[2];
          this.w = arguments[3];
          this.h = arguments[4];
          break;
      }
    }
    this.p5.push();
    this.p5.translate(this.x, this.y);
    this.p5.fill(150);
    this.p5.rect(0, 0, this.w, this.h);
    this.p5.stroke(255);
    this.p5.strokeWeight(2);
    this.p5.beginShape();
    for (let i = 0; i < arr.length; i++) {
      this.p5.vertex(
        this.p5.map(i, 0, arr.length, 2, this.w - 2),
        this.p5.map(arr[i], this.range[0], this.range[1], this.h - 2, 2)
      );
    }
    this.p5.endShape();
    this.p5.pop();
  }
}

class RMS_Meter {
  constructor(_p, _x, _y) {
    this.p = _p;
    this.x = _x;
    this.y = _y;
  }

  display(value) {
    this.p.push();
    this.p.translate(this.x, this.y);
    let rms = this.p.map(value, -96, 0, 0, 100);
    if (rms < 0) {
      rms = 0;
    }
    this.p.fill("gray");
    this.p.rect(0, 0, 100, 15); // meter background
    let blocks = Math.ceil(rms / 5); // 5px meter segments
    //this.p.stroke("white");
    for (let i = 0; i < blocks; i++) {
      if (i < 15) {
        this.p.fill("green");
      } else if (i >= 15 && i < 18) {
        this.p.fill("yellow");
      } else if (i >= 18) {
        this.p.fill("red");
      }
      this.p.rect(i * 5, 0, 5, 15);
    }

    let mval = value;
    if (mval < -96) {
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

class Knob {
  constructor(_p5, _x, _y) {
    this.p5 = _p5;
    this.x = _x;
    this.y = _y;
  }
}

class KeyBoardGUI {
  constructor(_p, _x, _y) {
    this.p = _p;
    this.x = _x;
    this.y = _y;
    this.keyInput = false; // enable/disable QUERTY input
    this.keyboard = []; // an array of keys
    this.whiteKeys = [0, 2, 4, 5, 7, 9, 11];
    this.size = 18; // how many keys?
    this.start = 57; // lowest key (MIDI note #57 is A3)
    this.enabled = false;
    //QWERTY keymap
    this.keyMap = [
      "a",
      "w",
      "s",
      "d",
      "r",
      "f",
      "t",
      "g",
      "h",
      "u",
      "j",
      "i",
      "k",
      "o",
      "l",
      ";",
      "[",
      "'",
    ];
  }

  enable() {
    this.enabled = true;
    console.log("keyboard enabled? " + this.enabled);
  }

  disable() {
    this.enabled = false;
    console.log("keyboard enabled? " + this.enabled);
  }

  mousePressed(_x, _y) {
    let index = -1;
    for (let i = 0; i < this.keyboard.length; i++) {
      if (this.keyboard[i].clicked(_x, _y)) {
        index = i;
      }
    }
    return index;
  }

  allOff() {
    // let go of all notes when the mouse is released
    for (let i = 0; i < this.keyboard.length; i++) {
      this.keyboard[i].pressed = false;
    }
  }

  keyPressed(key) {
    let i = this.keyMap.indexOf(key);
    if (i > -1) {
      //console.log(this.keyboard[this.keyMap.indexOf(key)].noteName);
      this.keyboard[i].pressed = true;
      return this.keyboard[i].noteName;
    } else {
      return false;
    }
  }

  keyReleased(key) {
    let i = this.keyMap.indexOf(key);
    if (i > -1) {
      //console.log(this.keyboard[this.keyMap.indexOf(key)].noteName);
      this.keyboard[i].pressed = false;
      return this.keyboard[i].noteName;
    } else {
      return false;
    }
  }
  buildKeys() {
    for (let i = 0; i < this.size; i++) {
      this.keyboard.push(
        new PianoKey(
          this.p,
          this.x,
          this.y,
          this.keyMap[i],
          this.start,
          this.start + i
        )
      );
      // console.log(this.keyboard[i].noteNum);
    }
  }

  display() {
    for (let i = 0; i < this.keyboard.length; i++) {
      this.keyboard[i].displayW();
      // this.keyboard[i].displayB();
    }
    for (let i = 0; i < this.keyboard.length; i++) {
      // this.keyboard[i].displayW();
      this.keyboard[i].displayB();
    }
    this.p.fill(0);
    this.p.stroke(0);
    this.p.rect(this.x, this.y, 440, 10);
  }
}

class PianoKey {
  constructor(_p, X, Y, _QWERTY, _start, _note) {
    this.p = _p; //P5 instance
    this.x = X; // screen position
    this.y = Y;
    this.w = 30;
    this.h = 30;
    this.whiteKeys = [0, 2, 4, 5, 7, 9, 11];
    this.white = this.whiteKeys.includes(_note % 12);
    this.qwerty = _QWERTY; // key to press
    this.px = X; // target for mouse press
    this.py = Y; // move these in .display() methods
    this.noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    this.noteNum = _note; // MIDI note number passed in
    this.letter = this.noteNames[_note % 12];
    this.octave = Math.trunc(_note / 12) - 1;
    this.noteName = this.letter + this.octave.toString();
    this.pressed = false;
    this.size = 40;
    this.instrument = new Tone.PolySynth(Tone.Synth).toDestination();
    //this.p5synth;

    let octOffset = Math.trunc((_note - _start) / 12);
    if (this.white) {
      let i = this.whiteKeys.indexOf(_note % 12);
      let j = this.whiteKeys.indexOf(_start % 12);
      let step = (i + (this.whiteKeys.length - j)) % this.whiteKeys.length;
      // console.log("octOffset: " + octOffset);
      //console.log("octOffset: " + octOffset);
      this.x += (step + octOffset * this.whiteKeys.length) * this.size;
    } else {
      let index = ((_note - _start) % 12) + octOffset * 12;
      // console.log("black key: " + index);
      let wk = 0; // white keys
      for (let i = _start; i < _note; i++) {
        // count the white keys
        if (this.whiteKeys.indexOf(i % 12) >= 0) {
          wk++;
        }
      }
      // console.log("wk " + wk);
      this.x += wk * this.size - ((this.size / 2) * 4) / 5;
    }
  }

  setSynth(synth) {
    //console.log("setSynth " + this.noteName);
    //this.p5synth = synth;
  }

  clicked(_x, _y) {
    // receives mouse coordinates and reports
    if (this.p.dist(_x, _y, this.px, this.py) < this.w / 2) {
      // console.log(this.noteName);
      // this.pressed = true;
      return true;
    }
    return false;
  }

  displayW() {
    //display white keys
    if (this.white) {
      if (this.pressed) {
        this.p.fill(200);
      } else this.p.fill(255);
      this.w = this.size;
      this.h = this.size * 3.2;
      this.p.stroke(0);
      this.p.rect(this.x, this.y, this.w, this.h, 5);
      //      fill(255, 0, 0, 100);
      this.px = this.x + this.w / 2;
      this.py = this.y + this.h - this.w / 2;
      //this.p.ellipse(this.px, this.py, 40);
      this.p.textAlign(this.p.CENTER);
      this.p.fill(0);
      this.p.noStroke();
      this.p.text(this.noteNum, this.x + this.size / 2, this.y + (this.h - 30));
      this.p.text(
        this.noteName,
        this.x + this.size / 2,
        this.y + (this.h - 18)
      );
      this.p.text(
        "(" + this.qwerty + ")",
        this.x + this.size / 2,
        this.y + (this.h - 6)
      );
    }
  }
  displayB() {
    if (!this.white) {
      if (this.pressed) {
        this.p.fill(100); //gray
      } else this.p.fill(0);
      this.w = (this.size * 4) / 5;
      this.h = this.size * 2;
      this.p.rect(this.x, this.y, this.w, this.h, 5);
      this.p.fill(255, 0, 0, 100);
      this.px = this.x + this.w / 2;
      this.py = this.y + this.h - this.w / 2;
      // this.p.ellipse(this.px, this.py, 40);
      this.p.textAlign(this.p.CENTER);
      this.p.fill(255); // white text
      this.p.text(this.noteNum, this.x + this.w / 2, this.y + this.h - 30);
      this.p.text(this.noteName, this.x + this.w / 2, this.y + this.h - 18);
      this.p.text(
        "(" + this.qwerty + ")",
        this.x + this.w / 2,
        this.y + this.h - 6
      );
    }
  }
}

// create a div and place the P5 interface instance in it
let synthDiv = document.createElement("div");
document.body.appendChild(synthDiv);
synthDiv.style = "position: relative;";
let sketch = new p5(synthGUI, synthDiv);

// display the full synth library data
let libraryDiv = document.createElement("div");
libraryDiv.id = "libraryDiv";
document.body.appendChild(libraryDiv);
let title = document.createElement("p");
title.innerText = "Patch Library Data (JSON):";
libraryDiv.appendChild(title);
let dataPre = document.createElement("pre");
libraryDiv.appendChild(dataPre);

setInterval(updateJSON, 500);

function updateJSON() {
  let lib = sketch.getSynthLibrary();
  dataPre.innerText = JSON.stringify(lib, null, 2);
}

function getTestData() {
  sketch.loadLibrary(testLibrary);
}

async function getJsonFromUrl(url) {
  try {
    const response = await fetch(url); // Make the HTTP request
    if (!response.ok) { // Check if the request was successful
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
const jsonUrl = "JSON/synths.json"; // look for the synth library
getJsonFromUrl(jsonUrl)
  .then(data => {
    if (data) {
      console.log("JSON data:", data);
      // You can now work with the 'data' object
      sketch.loadLibrary(data);
    } else {
      console.log("No file " + jsonUrl);
    }
  });

async function getDataFromPython() {
  try {
    const jsonData = await google.colab.kernel.invokeFunction(
      "getJSONfile_callback"
    );
    //console.log(jsonData.data["text/plain"]);
    synthData = jsonData.data["text/plain"];
    synthData = synthData.replace(/'/g, '"'); // massage the json
    console.log(synthData);
    sketch.loadLibrary(JSON.parse(synthData));
  } catch (err) {
    document.body.appendChild(document.createTextNode("Error: " + err));
    console.log("File not found", err);
  }
}

const testLibrary = [
  {
    patch: "Foo Synth",
    type: "Synth",
    settings: {
      detune: "0",
      portamento: "0.5",
      volume: "-10",
      oscillator: {
        type: "amsine",
        harmonicity: "2",
        phase: 0,
        partialCount: "0",
        partials: [],
        modulationType: "square",
      },
      envelope: {
        attack: "0.01",
        attackCurve: "linear",
        decay: "0.07",
        decayCurve: "exponential",
        sustain: "0.5",
        release: "2.5",
        releaseCurve: "exponential",
      },
    },
  },
  {
    patch: "Bar Synth",
    type: "Synth",
    settings: {
      detune: "0",
      portamento: "0.5",
      volume: "-20",
      oscillator: {
        type: "fmsine",
        harmonicity: "1.5",
        phase: 0,
        partialCount: "0",
        partials: [],
        modulationType: "sine",
        modulationIndex: "10",
      },
      envelope: {
        attack: "1.2",
        attackCurve: "exponential",
        decay: "0.2",
        decayCurve: "exponential",
        sustain: "0.8",
        release: "2.5",
        releaseCurve: "exponential",
      },
    },
  },
];

const testSequences = [
  {
    jump1: [
      // G Maj
      { time: "0:1:0", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "0:1:0", pitch: "B4", duration: "8n", velocity: 0.8 },
      { time: "0:1:0", pitch: "D5", duration: "8n", velocity: 0.8 },
      // C Maj6
      { time: "0:2:2", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "0:2:2", pitch: "C5", duration: "8n", velocity: 0.8 },
      { time: "0:2:2", pitch: "E5", duration: "8n", velocity: 0.8 },
      // F Maj
      { time: "1:0:0", pitch: "F4", duration: "8n", velocity: 1 },
      { time: "1:0:0", pitch: "A4", duration: "8n", velocity: 1 },
      { time: "1:0:0", pitch: "C5", duration: "8n", velocity: 1 },
      // F Maj
      { time: "1:1:2", pitch: "F4", duration: "8n", velocity: 1 },
      { time: "1:1:2", pitch: "A4", duration: "8n", velocity: 1 },
      { time: "1:1:2", pitch: "C5", duration: "8n", velocity: 1 },
      // G Maj
      { time: "1:2:2", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "1:2:2", pitch: "B4", duration: "8n", velocity: 0.8 },
      { time: "1:2:2", pitch: "D5", duration: "8n", velocity: 0.8 },
      // G Maj
      { time: "1:3:2", pitch: "G4", duration: "0:1:1", velocity: 1 },
      { time: "1:3:2", pitch: "B4", duration: "0:1:1", velocity: 1 },
      { time: "1:3:2", pitch: "D5", duration: "0:1:1", velocity: 1 },
      // C Maj6
      { time: "2:1:0", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "2:1:0", pitch: "C5", duration: "8n", velocity: 0.8 },
      { time: "2:1:0", pitch: "E5", duration: "8n", velocity: 0.8 },
      // F Maj
      { time: "2:2:2", pitch: "F4", duration: "8n", velocity: 1 },
      { time: "2:2:2", pitch: "A4", duration: "8n", velocity: 1 },
      { time: "2:2:2", pitch: "C5", duration: "8n", velocity: 1 },
      // F Maj6 - C Maj
      { time: "2:3:2", pitch: "F4", duration: "4n", velocity: 1 },
      { time: "2:3:2", pitch: "A4", duration: "4n", velocity: 1 },
      { time: "2:3:2", pitch: "C4", duration: "4n.", velocity: 1 },
      { time: "3:0:2", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "3:0:2", pitch: "E4", duration: "8n", velocity: 0.8 },
      // G Sus
      { time: "3:1:2", pitch: "C4", duration: "0:2:2", velocity: 1 },
      { time: "3:1:2", pitch: "D4", duration: "0:2:2", velocity: 1 },
      { time: "3:1:2", pitch: "G4", duration: "0:2:2", velocity: 1 },
    ],
  },
  {
    jump2: [
      // F Maj
      { time: "0:1:0", pitch: "C6", duration: "8n", velocity: 0.8 },
      { time: "0:1:0", pitch: "A5", duration: "8n", velocity: 0.8 },
      { time: "0:1:0", pitch: "F5", duration: "8n", velocity: 0.8 },
      // F Maj6
      { time: "0:2:2", pitch: "C6", duration: "8n", velocity: 0.8 },
      { time: "0:2:2", pitch: "A5", duration: "8n", velocity: 0.8 },
      { time: "0:2:2", pitch: "F5", duration: "8n", velocity: 0.8 },
      // F Maj
      { time: "1:0:0", pitch: "C6", duration: "8n", velocity: 1 },
      { time: "1:0:0", pitch: "A5", duration: "8n", velocity: 1 },
      { time: "1:0:0", pitch: "F5", duration: "8n", velocity: 1 },
      // F Maj
      { time: "1:1:2", pitch: "C6", duration: "8n", velocity: 1 },
      { time: "1:1:2", pitch: "A5", duration: "8n", velocity: 1 },
      { time: "1:1:2", pitch: "F5", duration: "8n", velocity: 1 },
      // C Maj
      { time: "1:3:0", pitch: "G5", duration: "0:1:1", velocity: 1 },
      { time: "1:3:0", pitch: "E5", duration: "0:1:1", velocity: 1 },
      { time: "1:3:0", pitch: "C5", duration: "0:1:1", velocity: 1 },
      // F Maj
      { time: "2:1:0", pitch: "C5", duration: "8n", velocity: 1 },
      { time: "2:1:0", pitch: "A4", duration: "8n", velocity: 1 },
      { time: "2:1:0", pitch: "F4", duration: "8n", velocity: 1 },
      // F Maj6
      { time: "2:2:2", pitch: "A4", duration: "8n", velocity: 0.8 },
      { time: "2:2:2", pitch: "F4", duration: "8n", velocity: 0.8 },
      { time: "2:2:2", pitch: "C4", duration: "8n", velocity: 0.8 },
      // F Maj6 - C Maj
      { time: "2:3:2", pitch: "F4", duration: "4n", velocity: 1 },
      { time: "2:3:2", pitch: "A4", duration: "4n", velocity: 1 },
      { time: "2:3:2", pitch: "C4", duration: "4n.", velocity: 1 },
      { time: "3:0:2", pitch: "G4", duration: "8n", velocity: 0.8 },
      { time: "3:0:2", pitch: "E4", duration: "8n", velocity: 0.8 },
      // G Sus
      { time: "3:1:2", pitch: "C4", duration: "0:2:2", velocity: 1 },
      { time: "3:1:2", pitch: "D4", duration: "0:2:2", velocity: 1 },
      { time: "3:1:2", pitch: "G4", duration: "0:2:2", velocity: 1 },
    ],
  },
  { scale: [{ time: 0, pitch: "C4", duration: "4n", velocity: 1 }] },
];
