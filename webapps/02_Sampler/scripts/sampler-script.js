/***
* Get sampler data from JSON file: JSON/samples.json
* Load sampler players (P5 GUI) with makeSampler()
* Load sound files if found in samples/ folder
***/

var samplers = []; // sampler instruments
var samples = []; // sample files for download
var json = []; // a place to store the data while working

let m = document.getElementById("metronome");
let metro = new p5(metroGUI2, m); // add metro GUI
let jsonData = [];
let testjsonData = [
  { foo: "bar", file: "nunya.wav", bpm: 120, loop: "1m" },
  { boo: "baz", file: "biznis.wav", bpm: 120, loop: "2m" },
];

const testSample = {
  name: "Apollo 1",
  url: "samples/Apollo01-Guitar_75bpm_Bb.mp3",
  bpm: 75,
  loop: "4m",
  transpose: 0,
  tune: 0,
  grain: 0.1,
  overlap: 0.05,
};

let addSample = document.getElementById("addSample");
let newSample = document.createElement("button");
newSample.className = "button"
newSample.innerHTML = "add new sample player";
addSample.appendChild(newSample);
newSample.addEventListener("click", makeSampler);

const data = document.querySelector(".data pre");
data.innerHTML = JSON.stringify(testjsonData, null, 1);

updateJSON();

function updateJSON() {
  // scan the sampler interface for changes and update the data file
  json = [];
  for (let i = 0; i < samplers.length; i++) {
    let obj = samplers[i].getObj();
    let sampleJSON = {};
    if (obj.url.length > 0) {
      sampleJSON.name = obj.name;
      let fn = obj.fileName;
      // sampleJSON.file = "samples/" + fn.replace(/\s/g, "_");
      sampleJSON.file = "samples/" + fn;
      sampleJSON.bpm = obj.bpm;
      sampleJSON.transpose = obj.transpose;
      sampleJSON.tuning = obj.tuning;
      sampleJSON.loop = obj.loop;
      sampleJSON.grain = obj.grainSize;
      sampleJSON.overlap = obj.overlap;
      json.push(sampleJSON); // add to the array
    }
  }
  data.innerHTML = JSON.stringify(json, null, 1);
}

let instructions = document.getElementById("instructions");
let update = document.createElement("button");
update.innerHTML = "Update JSON";
//instructions.appendChild(update);
update.addEventListener("click", updateJSON);

function makeSampler() {
  // create a sampler editor and add it to the "Library" div
  let i = samplers.length; // add on to current array
  let library = document.getElementById("library");
  let e = createEditor(i);
  library.appendChild(e); // add the editor to the library div

  // make a sampler interface
  let s = document.createElement("div");
  s.id = "sample_" + i;
  s.className = "sampler";
  samplers.push(new p5(sampleGUI, s));
  //samples.push(null); // add a null placeholder for a file object
  console.log("samples.length: " + samples.length);
  // console.log(samples);
  let del = document.createElement("button");

  library.appendChild(s);
  samplers[i].setPartNum(i); // number the samplers
}

function createEditor(i) {
  let e = document.createElement("div"); // editor div
  e.className = "editor";
  e.id = "editor_" + i;
  // e.innerHTML = "editor_" + i;

  // invisible file element that uploads and processes a sound file
  let fileElem = document.createElement("input");
  fileElem.type = "file";
  fileElem.style = "display:none";
  fileElem.accept = "audio/*";
  fileElem.addEventListener(
    "change",
    () => {
      let sampleFile = fileElem.files[0];
      let fileSizeInBytes = sampleFile.size;
      let fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      if (fileSizeInMB > 5) {
        fileElem.value = "";
        console.log("File size is too big. Choose an audio file under 5MB");
        alert("File size is too big. Choose an audio file under 5MB");
      } else {
        if (i >= samples.length) {
          samples.push(sampleFile);
        } else {
          samples[i] = sampleFile; // hold on to the file reference for download
        }

        console.log(
          "loading file: " + sampleFile.name + " file type: " + sampleFile.type
        );
        let sampleURL = window.URL.createObjectURL(sampleFile);
        // console.log("url: " + sampleURL);
        samplers[i].setSample(sampleURL);
        samplers[i].setFile(sampleFile.name);
        samplers[i].setType(sampleFile.type);
        updateJSON();
      }
    },
    false
  );
  e.appendChild(fileElem);
  // visible button for selecting a file
  let fileSelect = document.createElement("button");
  fileSelect.innerHTML = "Load File";
  fileSelect.style = "font-size:10px";
  fileSelect.name = "load";
  fileSelect.addEventListener(
    "click",
    (e) => {
      if (fileElem) {
        fileElem.click();
      }
    },
    false
  );
  let label = document.createElement("label");
  label.for = "load";
  label.innerText = "Sample: ";
  label.style = "font-size:10px";
  e.appendChild(label);

  e.appendChild(fileSelect);

  // add line break
  let br;
  e.appendChild(document.createElement("br"));

  // add title input
  let n = document.createElement("input");
  n.className = "nameInput";
  n.style = "font-size:10px;";
  n.placeholder = "Unititled";
  n.size = 14;
  n.name = "name";
  n.addEventListener("change", (event) => {
    samplers[i].setName(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "name";
  label.innerText = "Name: ";
  label.style = "font-size:10px";

  e.appendChild(label);
  e.appendChild(n);
  e.appendChild(document.createElement("br"));

  // set base tempo for each sample
  let bpmInput = document.createElement("input");
  bpmInput.type = "number";
  bpmInput.className = "bpmInput";
  bpmInput.min = 40;
  bpmInput.max = 200;
  bpmInput.step = 1;
  bpmInput.style = "font-size:10px";
  bpmInput.value = 120;
  bpmInput.name = "bpmInput";
  bpmInput.addEventListener("change", (event) => {
    if (event.target.value < 40) {
      event.target.value = 40;
    }
    if (event.target.value > 200) {
      event.target.value = 200;
    }
    console.log("new tempo: " + event.target.value);
    samplers[i].setBPM(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "bpmInput";
  label.innerText = "BPM: ";
  label.style = "font-size:10px";
  e.appendChild(label);
  e.appendChild(bpmInput);
  e.appendChild(document.createElement("br"));

  // add transposition input
  let tpInput = document.createElement("input");
  tpInput.type = "number";
  tpInput.step = 1;
  tpInput.min = -48;
  tpInput.max = 48;
  tpInput.className = "tpInput";
  tpInput.style = "font-size:10px";
  tpInput.placeholder = "0";
  tpInput.size = 6;
  tpInput.name = "tpInput";
  tpInput.addEventListener("change", (event) => {
    samplers[i].setTP(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "tpInput";
  label.innerText = "Transpose: ";
  label.style = "font-size:10px";
  e.appendChild(label);
  e.appendChild(tpInput);
  e.appendChild(document.createElement("br"));

  // add fine tuning input
  let tuningInput = document.createElement("input");
  tuningInput.type = "number";
  tuningInput.step = 1;
  tuningInput.min = -100;
  tuningInput.max = 100;
  tuningInput.className = "tuningInput";
  tuningInput.style = "font-size:10px";
  tuningInput.placeholder = "0";
  tuningInput.size = 6;
  tuningInput.name = "tuningInput";
  tuningInput.addEventListener("change", (event) => {
    samplers[i].setTuning(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "tuningInput";
  label.innerText = "Fine tuning: ";
  label.style = "font-size:10px";
  e.appendChild(label);
  e.appendChild(tuningInput);
  e.appendChild(document.createElement("br"));

  // add loop duration input
  let loop = document.createElement("input");
  loop.className = "loopInput";
  loop.style = "font-size:10px";
  loop.placeholder = "2m";
  loop.size = 6;
  loop.name = "loop";
  loop.addEventListener("change", (event) => {
    samplers[i].setLoop(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "loop";
  label.innerText = "Loop: ";
  label.style = "font-size:10px";
  e.appendChild(label);
  e.appendChild(loop);
  e.appendChild(document.createElement("br"));

  let grain = document.createElement("input");
  grain.className = "grainInput";
  grain.type = "number";
  grain.min = 0.001;
  grain.max = 0.2;
  grain.step = 0.01;
  grain.style = "font-size:9px";
  grain.value = "0.1";
  grain.name = "grain";
  grain.addEventListener("change", (event) => {
    samplers[i].setGrain(event.target.value);
    updateJSON();
  });
  label = document.createElement("label");
  label.for = "grain";
  label.innerText = "Grain size: ";
  label.style = "font-size:9px";
  e.appendChild(label);
  e.appendChild(grain);
  e.appendChild(document.createElement("br"));

  let overlap = document.createElement("input");
  overlap.type = "number";
  overlap.className = "overlapInput";
  overlap.min = 0.001;
  overlap.max = 0.2;
  overlap.step = 0.01;
  overlap.style = "font-size: 9px";
  overlap.value = 0.05;
  overlap.name = "overlap";
  overlap.addEventListener("change", (event) => {
    samplers[i].setOverlap(event.target.value);
    updateJSON();
  });

  label = document.createElement("label");
  label.for = "overlap";
  label.innerText = "Overlap: ";
  label.style = "font-size:9px";
  e.appendChild(label);
  e.appendChild(overlap);

  let del = document.createElement("button");
  del.style = "font-size:10px; color:red;";
  del.innerText = "delete this sample";
  del.addEventListener("click", () => {
    deleteSample(i);
    updateJSON();
  });
  e.appendChild(del);

  return e; // returns the <div> node
}

function initEditor(_obj, _i) {
  let e_names = document.querySelectorAll(".nameInput");
  e_names[_i].value = _obj.name;

  let e_bpm = document.querySelectorAll(".bpmInput");
  e_bpm[_i].value = _obj.bpm;

  let e_tp = document.querySelectorAll(".tpInput");
  e_tp[_i].value = _obj.transpose;

  let e_tuning = document.querySelectorAll(".tuningInput");
  e_tuning[_i].value = _obj.tuning;

  let e_loop = document.querySelectorAll(".loopInput");
  e_loop[_i].value = _obj.loop;

  let e_grain = document.querySelectorAll(".grainInput");
  e_grain[_i].value = _obj.grain;

  let e_overlap = document.querySelectorAll(".overlapInput");
  e_overlap[_i].value = _obj.overlap;
}

function deleteSample(_i) {
  console.log("deleteSample()");
  updateJSON();
  if (Array.isArray(json)) {
    samplers.splice(_i, 1);
    console.log("remove 1 from the array");
    updateJSON();
  }
  console.log(`delete sample ${_i}`);
  let e = document.querySelectorAll("div.editor");
  console.log(e.length);
  let s = document.querySelectorAll("div.sampler");
  console.log(s.length);
  let library = document.getElementById("library");
  library.removeChild(e[_i]);
  library.removeChild(s[_i]);
  e = document.querySelectorAll("div.editor"); // get the new list
  for (let i = 0; i < samplers.length; i++) {
    samplers[i].setPartNum(i);
    //e[i] = createEditor(i);
    library.replaceChild(createEditor(i), e[i]);
    initEditor(samplers[i].getObj(), i);
  }
}
/**
 * Button for testing JSON import
 * delete this button when the feature is tested and confirmed
 */
let title = document.getElementById("title");
let testJSONButton = document.createElement("button");
testJSONButton.innerHTML = "Test JSON load";
testJSONButton.style = "font-size: 10px";
testJSONButton.addEventListener("click", () => {
  console.log("test JSON Load " + 0);
  //  samplers[0].loadfromJSON(testSample);
  loadSamplerData("JSON/samples.json");
});
//title.appendChild(testJSONButton);

// get samples and data from server
loadSamplerData("JSON/samples.json");

async function loadSamplerData(file) {
  /** read a JSON file (from a url) that contains an array of objects;
   * each object refers to a sound file with a url;
   * fetch each sample file referenced in the JSON;
   * extract the file name and type;
   * create/load sampler GUI objects from this info
   * Tone.GranSampler has yet another async load to do
   * */
  const response = await fetch(file); // find the JSON file
  console.log("json file fetch OK?: " + response.ok);
  if (!response.ok) {
    let e = "Error: file not found";
    // document.getElementById("sampler").innerHTML = e;
    console.log(e);
    return;
  }
  const text = await response.text();
  try {
    let obj = JSON.parse(text); // if JSON is valid, make an object
    console.log("sampler-script.js updated 2026-09-21");
    /* 
    2026-09-21 update: move async function out of for() loop 
    due to new P5 editor behavior that times out for loops after 100ms.
    Was throwing "infinite loop" error while trying to load samples from the
    server asynchronously. 
    */
    const entries = obj.filter(o => o.hasOwnProperty("file"));
    
    const blobs = await Promise.all(
      entries.map(async (o) => {
        const res = await fetch(o.file);
        return await res.blob();
      })
    );

    for (let i = 0; i < entries.length; i++) {
      makeSampler();
      let newObj = entries[i];
      newObj.url = newObj.file;
      newObj.fileName = newObj.url.split("/").pop();
      newObj.fileType = blobs[i].type;
      samples.push(new File([blobs[i]], newObj.fileName, {
        type: blobs[i].type,
        lastModified: Date.now(),
      }));
      samplers[i].loadfromJSON(newObj);
      initEditor(newObj, i);
    }
/*  
// this loop was throwing an "infinite loop" error when running on editor.p5js.org due to async function
    for (let i = 0; Array.isArray(obj) && i < obj.length; i++) {
      makeSampler();
      //console.log("processing sample object " + i);
      if (obj[i].hasOwnProperty("file")) {
        //console.log("object has property 'file'");
        let newObj = obj[i];
        newObj.url = obj[i].file;
        //console.log("url: " + newObj.url);
        let response = await fetch(newObj.url);
        //console.log("fetched");
        let data = await response.blob();
        //console.log("blobbed");
        newObj.fileName = newObj.url.split("/").pop(); // Extract filename from URL
        let soundFile = new File([data], newObj.fileName, {
          type: data.type,
          lastModified: Date.now(),
        });
        samples.push(soundFile); // for .zip download
        //console.log("sample file " + newObj.fileName + " type " + data.type);
        newObj.fileType = data.type;
        samplers[i].loadfromJSON(newObj);
        initEditor(newObj, i);
      }
    }
*/
    updateJSON();
    return obj;
  } catch (error) {
    let e =
      "error - invalid JSON file (samples.json)<br /> copy and paste your JSON to <a href = 'https://jsonlint.com/' target='_blank'>jsonlint.com</a>";
    // document.getElementById("sampler").innerHTML = e;
    console.log(e);
    return;
  }
  //console.log(JSON.stringify(data));
  updateJSON();
}

/** Download JSON data */
/*
const dl = document.createElement("button");
dl.innerHTML = "Download JSON";
instructions.appendChild(dl);
dl.addEventListener("click", download);

function download() {
  let filename = "samples.json";
  console.log(filename);
  let text = JSON.stringify(json, null, 2);
  console.log(text);

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

*/
// Download .zip file
const dlZip = document.createElement("button");
dlZip.innerHTML = "Download .zip";
dlZip.className = "button";
instructions.appendChild(dlZip);
dlZip.addEventListener("click", downloadZip);

function downloadZip() {
  updateJSON();
  var zip = new JSZip();
  let text = JSON.stringify(json, null, 2);
  zip.folder("JSON").file("samples.json", text);
  var samplesFolder = zip.folder("samples");
  // loop through all the loaded sample files and add them
  for (let i = 0; i < samples.length; i++) {
    // success!
    if (samples[i] != null) {
      console.log(samples[i].name);
      let sName = samples[i].name;
      //           samplesFolder.file(sName.replace(/\s/g, "_"), samples[i]);
      samplesFolder.file(sName, samples[i]);
    }
  }
  // make a .zip and download it
  zip.generateAsync({ type: "blob" }).then(function (content) {
    // see FileSaver.js
    saveAs(content, "sampler.zip");
  });
}
