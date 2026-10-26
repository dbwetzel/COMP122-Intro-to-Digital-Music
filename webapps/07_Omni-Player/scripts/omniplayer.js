/** generate custom QR code leading to the hosted page (wherever it is) */
console.log(parent.location.href);
let qrLink = document.getElementById("QRLink");
let thisPage = "https://editor.p5js.org/dbwetzel/full/3R_7_GCXQ";
 console.log("this page: " + thisPage);

var qrcode = new QRCode(qrLink, { 
  text: thisPage,
  width: 100,
  height: 100,
  colorDark : "#000000",
  colorLight : "#ffffff",
  correctLevel : QRCode.CorrectLevel.H
});

// menu button expands the section
let qrdiv = document.getElementById("showQR");
qrdiv.addEventListener('click', ()=>{
  let qr = document.getElementById("QRLink");
  console.log(qr.style.display);
  if(qr.style.display == "block"){
    qr.style.display="none";
  } else {
    qr.style.display = "block";
  }
})

// add the metronome
let metroDiv = document.getElementById("metronome");
metroDiv.style = "position:relative; display:none;";
let metro = new p5(metroGUI, metroDiv);


// menu button expands the section
let metromenu = document.getElementById("metro-menu");
metromenu.addEventListener('click', ()=>{
  let metro = document.getElementById("metronome");
  //console.log(qr.style.display);
  if(metro.style.display == "flex"){
    metro.style.display="none";
  } else {
    metro.style.display = "flex";
    //metro.style = "position:relative;";
  }
})

// add the simple player
let simplePlayerDiv = document.getElementById("simplePlayer");
simplePlayerDiv.style = "position:relative; display:flex;";
let sp = new p5(simplePlayerGUI, simplePlayerDiv);
//sp.setMute(true);

// menu button expands the section
let simplemenu = document.getElementById("notepad-menu");
simplemenu.addEventListener('click', ()=>{
  let simple = document.getElementById("simplePlayer");
  //console.log(qr.style.display);
  if(simple.style.display == "flex"){
    simple.style.display="none";
    sp.setMute(true);
  } else {
    simple.style.display = "flex";
    sp.setMute(false);
    //metro.style = "position:relative;";
  }
})

// Load the JSON library:
// const jsonUrl = "JSON/simplePlayer.json"; // look for the library
getJsonFromUrl("JSON/simplePlayer.json").then((data) => {
  if (data) {
    // console.log("JSON data:", data);
    // You can now work with the 'data' object
    if (checkSimpleObj(data)) {
      console.log("data looks OK");
      //jsonData = data;
      sp.setLibrary(data);
      // markovEditor gets a reference to the jsonData object
    } else {
      console.log("not a valid simplePlayer.json file");
    }
  } else {
    console.log("No file " + jsonUrl);
  }
});

function checkSimpleObj(obj) {
  // is this a valid simplePlayer library?
  let flag = false;
  if (obj.hasOwnProperty("samples") && obj.hasOwnProperty("buttons")) {
    flag = true;
  }
  // console.log(obj);
  return flag;
}

async function getJsonFromUrl(url) {
  // generic function to get json data from the server
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