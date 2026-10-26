
const sequences = [
    {"jump1" : [
        // G Maj
        {"time": "0:1:0", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "0:1:0", "pitch" : "B4", "duration" : "8n", "velocity" : .8},
        {"time": "0:1:0", "pitch" : "D5", "duration" : "8n", "velocity" : .8},
        // C Maj6
        {"time": "0:2:2", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "0:2:2", "pitch" : "C5", "duration" : "8n", "velocity" : .8},
        {"time": "0:2:2", "pitch" : "E5", "duration" : "8n", "velocity" : .8},
        // F Maj
        {"time": "1:0:0", "pitch" : "F4", "duration" : "8n", "velocity" : 1},
        {"time": "1:0:0", "pitch" : "A4", "duration" : "8n", "velocity" : 1},
        {"time": "1:0:0", "pitch" : "C5", "duration" : "8n", "velocity" : 1},
        // F Maj
        {"time": "1:1:2", "pitch" : "F4", "duration" : "8n", "velocity" : 1},
        {"time": "1:1:2", "pitch" : "A4", "duration" : "8n", "velocity" : 1},
        {"time": "1:1:2", "pitch" : "C5", "duration" : "8n", "velocity" : 1},
        // G Maj
        {"time": "1:2:2", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "1:2:2", "pitch" : "B4", "duration" : "8n", "velocity" : .8},
        {"time": "1:2:2", "pitch" : "D5", "duration" : "8n", "velocity" : .8},
        // G Maj
        {"time": "1:3:2", "pitch" : "G4", "duration" : "0:1:1", "velocity" : 1},
        {"time": "1:3:2", "pitch" : "B4", "duration" : "0:1:1", "velocity" : 1},
        {"time": "1:3:2", "pitch" : "D5", "duration" : "0:1:1", "velocity" : 1},
        // C Maj6
        {"time": "2:1:0", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "2:1:0", "pitch" : "C5", "duration" : "8n", "velocity" : .8},
        {"time": "2:1:0", "pitch" : "E5", "duration" : "8n", "velocity" : .8},
        // F Maj
        {"time": "2:2:2", "pitch" : "F4", "duration" : "8n", "velocity" : 1},
        {"time": "2:2:2", "pitch" : "A4", "duration" : "8n", "velocity" : 1},
        {"time": "2:2:2", "pitch" : "C5", "duration" : "8n", "velocity" : 1},
        // F Maj6 - C Maj
        {"time": "2:3:2", "pitch" : "F4", "duration" : "4n", "velocity" : 1},
        {"time": "2:3:2", "pitch" : "A4", "duration" : "4n", "velocity" : 1},
        {"time": "2:3:2", "pitch" : "C4", "duration" : "4n.", "velocity" : 1},
        {"time": "3:0:2", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "3:0:2", "pitch" : "E4", "duration" : "8n", "velocity" : .8},
        // G Sus
        {"time": "3:1:2", "pitch" : "C4", "duration" : "0:2:2", "velocity" : 1},
        {"time": "3:1:2", "pitch" : "D4", "duration" : "0:2:2", "velocity" : 1},
        {"time": "3:1:2", "pitch" : "G4", "duration" : "0:2:2", "velocity" : 1}
    ]},
    {"jump2" : [
        // F Maj
        {"time": "0:1:0", "pitch" : "C6", "duration" : "8n", "velocity" : .8},
        {"time": "0:1:0", "pitch" : "A5", "duration" : "8n", "velocity" : .8},
        {"time": "0:1:0", "pitch" : "F5", "duration" : "8n", "velocity" : .8},
        // F Maj6
        {"time": "0:2:2", "pitch" : "C6", "duration" : "8n", "velocity" : .8},
        {"time": "0:2:2", "pitch" : "A5", "duration" : "8n", "velocity" : .8},
        {"time": "0:2:2", "pitch" : "F5", "duration" : "8n", "velocity" : .8},
        // F Maj
        {"time": "1:0:0", "pitch" : "C6", "duration" : "8n", "velocity" : 1},
        {"time": "1:0:0", "pitch" : "A5", "duration" : "8n", "velocity" : 1},
        {"time": "1:0:0", "pitch" : "F5", "duration" : "8n", "velocity" : 1},
        // F Maj
        {"time": "1:1:2", "pitch" : "C6", "duration" : "8n", "velocity" : 1},
        {"time": "1:1:2", "pitch" : "A5", "duration" : "8n", "velocity" : 1},
        {"time": "1:1:2", "pitch" : "F5", "duration" : "8n", "velocity" : 1},
        // C Maj
        {"time": "1:3:0", "pitch" : "G5", "duration" : "0:1:1", "velocity" : 1},
        {"time": "1:3:0", "pitch" : "E5", "duration" : "0:1:1", "velocity" : 1},
        {"time": "1:3:0", "pitch" : "C5", "duration" : "0:1:1", "velocity" : 1},
        // F Maj
        {"time": "2:1:0", "pitch" : "C5", "duration" : "8n", "velocity" : 1},
        {"time": "2:1:0", "pitch" : "A4", "duration" : "8n", "velocity" : 1},
        {"time": "2:1:0", "pitch" : "F4", "duration" : "8n", "velocity" : 1},
        // F Maj6
        {"time": "2:2:2", "pitch" : "A4", "duration" : "8n", "velocity" : .8},
        {"time": "2:2:2", "pitch" : "F4", "duration" : "8n", "velocity" : .8},
        {"time": "2:2:2", "pitch" : "C4", "duration" : "8n", "velocity" : .8},
        // F Maj6 - C Maj
        {"time": "2:3:2", "pitch" : "F4", "duration" : "4n", "velocity" : 1},
        {"time": "2:3:2", "pitch" : "A4", "duration" : "4n", "velocity" : 1},
        {"time": "2:3:2", "pitch" : "C4", "duration" : "4n.", "velocity" : 1},
        {"time": "3:0:2", "pitch" : "G4", "duration" : "8n", "velocity" : .8},
        {"time": "3:0:2", "pitch" : "E4", "duration" : "8n", "velocity" : .8},
        // G Sus
        {"time": "3:1:2", "pitch" : "C4", "duration" : "0:2:2", "velocity" : 1},
        {"time": "3:1:2", "pitch" : "D4", "duration" : "0:2:2", "velocity" : 1},
        {"time": "3:1:2", "pitch" : "G4", "duration" : "0:2:2", "velocity" : 1}
    ]},
    {"scale" : [
        {"time": 0, "pitch" : "C4", "duration" : "4n", "velocity" : 1}
    ]}
];

const testLibrary = [
    {
        "name": "Jump",
        "type": "Synth",
        "settings": {
         "volume": 0,
         "detune": 0,
         "portamento": "0",
         "envelope": {
          "attack": "0.055",
          "attackCurve": "linear",
          "decay": "0.1",
          "decayCurve": "exponential",
          "release": 1,
          "releaseCurve": "exponential",
          "sustain": "0.3"
         },
         "oscillator": {
          "partialCount": 0,
          "partials": [],
          "phase": 0,
          "type": "fatsawtooth",
          "count": 3,
          "spread": 20
         }
        }
       },
    {
        "name" : "Mellow",
        "type" : "Synth",
        "settings" : {}
    }
]

let kb = document.getElementById("kbGUI");
let keyboard = new p5(keyGUI, kb);

var synthLibrary = [] // store the complete JSON file as a library

// create a synth editor
let libDiv = document.getElementById("library");
let synthDiv = document.createElement('div');
synthDiv.id = "synthEditor";
synthDiv.className = "synthEditor";
synthDiv.style = "position:relative; width: 600px;"
libDiv.appendChild(synthDiv);
let p5synth = new p5(synthGUI, synthDiv);

// test the synth with this poly synth
let testDiv = document.getElementById("test");

// make a button to play Jump! part A
let jump1 = document.createElement("button");
jump1.innerHTML="Jump! A";
jump1.addEventListener('click', async ()=>{
    // console.log(sequences[0].jump1);
    Tone.start();
    p5synth.testSynth(sequences[0].jump1, 132);
})
testDiv.appendChild(jump1);

let jump2 = document.createElement("button");
jump2.innerHTML="Jump! B";
jump2.addEventListener('click', async ()=>{
    // console.log(sequences[0].jump1);
    Tone.start();
    p5synth.testSynth(sequences[1].jump2, 132);
})
testDiv.appendChild(jump2);

let c4on = document.createElement("button");
c4on.innerText="C4 On";
c4on.addEventListener('click', ()=>{
    p5synth.noteOn("C4");
})
// testDiv.appendChild(c4on);

let c4off = document.createElement("button");
c4off.innerText="C4 Off";
c4off.addEventListener('click', ()=>{
    p5synth.noteOff("C4");
})
// testDiv.appendChild(c4off);

// show working synth code in dropdown block
const workingCode = document.querySelector('.code pre');
workingCode.style = "display: none;"
updateCode();
function updateCode(){
    workingCode.innerHTML = JSON.stringify(p5synth.getJSON(), null, 1);
    let synth = p5synth.getJSON();
    //keyboard.setSynth(synth.settings); // update keyboard GUI
    // connect the keyboard to the synth editor
    keyboard.setP5synth(p5synth);
    p5synth.setController(keyboard);
}
//update code view every 250ms to reflecs changes
const codeUpdateInterval = setInterval(updateCode, 250);
// { } View Code: show/hide the working code block
const viewCode = document.getElementById("viewCode");
viewCode.addEventListener('click', ()=>{
    if(workingCode.style.display == "block"){
        workingCode.style.display = "none";
        viewCode.innerHTML = "{ } View Code"
    } else {
        workingCode.style.display = "block";
        viewCode.innerHTML = "{ } Hide Code";
    }
});

// New Synth Patch: button creates a new init patch and resets the menu to 0
const newPatch = document.getElementById("newPatch");
newPatch.addEventListener('click', makeNewPatch);

function makeNewPatch(){
    patchMenu.selectedIndex = 0; // reset patch menu
    // delete the existing synth and make a new one:
    libDiv = document.getElementById("library");
    synthDiv = document.getElementById("synthEditor");
    libDiv.removeChild(synthDiv);
    synthDiv = document.createElement('div')
    synthDiv.style = "position:relative; width: 600px;";
    synthDiv.id = "synthEditor";
    libDiv.appendChild(synthDiv);
    p5synth = new p5(synthGUI, synthDiv);
}

// Save to Library: button to save the patch to library (synth.json)
let savePatch = document.getElementById("savePatch");
savePatch.addEventListener('click', ()=>{
    let libEntry = p5synth.getForLibrary();
    if(Array.isArray(libEntry) && libEntry.length > 1){
        //console.log(libEntry[0]); // index
        //console.log(libEntry[1]); // json 
        if(libEntry[0] < 0){
            // add to the library data object
            synthLibrary.push(libEntry[1]);
            //update display
            updateJSON();
            // reload to the synth with the new index number
            p5synth.loadSynth(synthLibrary.length - 1, libEntry[1]);
            // add to menu
            console.log(libEntry[1].name);
            let opt = document.createElement("option");
            opt.value = synthLibrary.length - 1;
            opt.text = libEntry[1].name;
            patchMenu.add(opt);
            patchMenu.selectedIndex = synthLibrary.length; // set to new option

        } else if (libEntry[0] < synthLibrary.length){
            // index is in the library already?
            synthLibrary[libEntry[0]] = libEntry[1];
            updateJSON();
            // check if new patch name and set menu item
            console.log(libEntry[1].name);
            let opt = patchMenu.item(libEntry[0]+1)
            opt.text = libEntry[1].name;

        }   
    }

});

// Drop-down menu of saved synth patches to load
const patchMenu = document.getElementById("patchMenu");
patchMenu.addEventListener('change', ()=>{
    let i = patchMenu.selectedIndex-1;
    console.log(synthLibrary[i]);
    p5synth.loadSynth(i, synthLibrary[i]);
});

// Delete a patch from the library
const deletePatch = document.getElementById("deletePatch");
deletePatch.addEventListener('click', ()=>{
    if(patchMenu.selectedIndex > 0){
        let i = patchMenu.selectedIndex - 1;
        console.log("delete patch " + i);
        // remove from menu also
        patchMenu.remove(patchMenu.selectedIndex);
        //remove from data file
        synthLibrary.splice(i, 1);
        // replace with init patch
        makeNewPatch();
        // update data file display
        updateJSON();
    }
})

// display/hide instructions
let instructionsMenu = document.getElementById("instructions");
instructionsMenu.addEventListener('click', ()=>{
    let it = document.getElementById("instructionsTitle");
    let details = document.getElementById("details");
    if(details.style.display == "none"){
        details.style.display = "block";
        it.innerText = "▼ Hide Instructions";
    } else {
        details.style.display = "none";
        it.innerText = "► Show Instructions";
    }
})

// Display library as JSON file
const libraryJSON = document.querySelector('.data pre');
updateJSON();
function updateJSON(){
    libraryJSON.innerHTML = JSON.stringify(synthLibrary, null, 1);
}
// const jsonUpdateInterval = setInterval(updateJSON, 500);

// Download json file: synth.json
const dl = document.getElementById("download");
dl.addEventListener("click", download);

function download() {
  let filename = "synths.json"
  console.log(filename);
  let text = JSON.stringify(synthLibrary, null, 2);

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const fileSelect = document.getElementById("upload");
const fileElem = document.getElementById("fileElem");

fileSelect.addEventListener(
    "click",
    (e) => {
      if (fileElem) {
        fileElem.click();
      }
    },
    false,
  );

  fileElem.addEventListener("change", handleFiles, false);

  function handleFiles() {
    const file = this.files[0]
    console.log("loading file: " + file.name + " file type: " + file.type);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let obj = JSON.parse(e.target.result); // if JSON is valid, make an object
        if (checkObject(obj)){
            console.log("checks out OK");
            // replace the current library
            synthLibrary = obj;
            updateJSON();
            // clear the menu
            // patchMenu.remove(i)
            let length = patchMenu.options.length;
            for(let i = length-1; i > 0; i--){
                patchMenu.remove(i);
            }
            for(let i = 0; i < obj.length; i++){
                if(obj[i].hasOwnProperty("name")){
                    // add patch names to menu
                    let opt = document.createElement("option");
                    opt.value = i;
                    opt.text = obj[i].name;
                    patchMenu.add(opt);
                }
            }
        } // make sure it's a valid library
        return obj;
      }
      catch (error) {
        let e = 'error - invalid JSON file ${file.name}<br /> copy and paste your JSON to <a href = "https://jsonlint.com/" target="_blank">jsonlint.com</a>';
        console.log(e);
        return;
      }
    };
    reader.readAsText(file);
  }

  function checkObject(obj){
    // is this a valid synth library?
    let flag = false
    if(Array.isArray(obj) && obj.length > 0){
        // library should be an array
        for(let i = 0; i < obj.length; i++){
            if(obj[i].hasOwnProperty("settings")){
                if(obj[i].settings.hasOwnProperty("oscillator") &&
            obj[i].settings.hasOwnProperty("envelope")){
                    flag = true;
                }
            }
        }
        // console.log(obj);
    } 
    return flag; 
  }