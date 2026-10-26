const initGraph = {
    "name" : "Untitled",
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
}

let jsonData = []; // sequence library as JSON

// add the metronome
let metroDiv = document.getElementById("metronome");
metroDiv.style = "position:relative;";
let metro = new p5(metroGUI, metroDiv);

// add the main sequence editor
let editorDiv = document.getElementById("editor");
let markovEditor = new p5(mGUI, editorDiv);
markovEditor.setObj(structuredClone(initGraph));
//let container = document.getElementById("container");
markovEditor.setDiv("container");

setInterval(updateJSON, 1000); // update automatically every second

function updateJSON() {
  //jsonData = [{}]; // rebuild from p5 beat loops
  //jsonData = beatControl.getLibrary();
  const libraryJSON = document.querySelector(".data pre");
  libraryJSON.innerHTML = JSON.stringify(jsonData, null, 2);
}

// Download json file: sequences.json
const dl = document.getElementById("download");
dl.addEventListener("click", downloadZip);

function download() {
  let filename = "sequences.json";
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
  //updateJSON();
  var zip = new JSZip();
  let text = JSON.stringify(jsonData, null, 2);
  zip.folder("JSON").file("markov.json", text);
  // make a .zip and download it
  zip.generateAsync({ type: "blob" }).then(function (content) {
    // see FileSaver.js
    saveAs(content, "markovLibrary.zip");
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
        // send the file to sequence editor as a library
        jsonData = obj;
        markovEditor.setLibrary(jsonData);
      } else {
        console.log("wrong file format for sequences.json");
      }
      return obj;
    } catch (error) {
      let e =
        `error - invalid JSON file ${file.name}<br /> copy and paste your JSON to https://jsonlint.com`;
      console.log(e);
      return;
    }
  };
  reader.readAsText(file);
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
const jsonUrl = "JSON/markov.json"; // look for the library
getJsonFromUrl(jsonUrl).then((data) => {
  if (data) {
    // console.log("JSON data:", data);
    // You can now work with the 'data' object
    if (checkObject(data)) {
      console.log("data looks OK");
      jsonData = data;
      markovEditor.setLibrary(jsonData);
      // markovEditor gets a reference to the jsonData object
    } else if (Array.isArray(data) && data.length == 0) {
      jsonData = data
      console.log("empty markov library (markov.json)");
      // create a default library and load it
      jsonData.push(initGraph);
      markovEditor.setLibrary(jsonData);
    } else {
      console.log("not a valid markov.json file");
    }
  } else {
    console.log("No file " + jsonUrl);
    // create a default library and load it
    jsonData.push(initGraph);
    markovEditor.setLibrary(jsonData);
  }
  //seqEditor.setLibrary(jsonData);
});

function checkObject(obj) {
  // is this a valid sequence library?

  let flag = false;
  if (Array.isArray(obj) && obj.length > 0) {
    // library should be an array
    for (let i = 0; i < obj.length; i++) {
      if (obj[i].hasOwnProperty("pitchSet") && obj[i].hasOwnProperty("rhythmSet")) {
        if(obj[i].pitchSet.hasOwnProperty("matrix")) {
          flag = true;
        }
      } else flag = false;
    }
  }
  // console.log(obj);
  return flag;
}

let copyButton = document.getElementById("copy");
copyButton.addEventListener("click", copyToClipboard);


// * this function uses the now-deprecated document.execCommand('copy') because of the cross-origin frame in editor.p5js.org

function copyToClipboard() {
  console.log("copy json");
  // Get the text from the input field
  //let textToCopy = JSON.stringify(beatControl.getLibrary(), null, 2);
  let textToCopy = JSON.stringify(jsonData, null, 2); // temporary
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
