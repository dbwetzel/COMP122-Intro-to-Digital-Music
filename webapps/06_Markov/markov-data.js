/**
 * Use this test graph to generate a player and test the form
 */
const testGraph = [
    {
        "name" : "bass",
        "pitchSet" : {
        "state" : "C3",
        "matrix" : {
          "C3" : ["C3", "C3", "G3", "B2"],
          "G3" : ["C3", "G3", "B2"],
          "B2" : ["C3"]
          }
        },
        "rhythmSet" : {
          "state" : "4n",
          "matrix" : {
            "4n" : ["4n", "16n"],
            "16n" : ["4n", "16n", "8n"],
            "8n" : ["4n", "16n", "8n"]
          }
        }
      }
];

const defaultGraph = {
    "name" : "Default Graph",
    "pitchSet" : {
        "state" : "C4", 
        "matrix" : {
            "C4" : ["C4"]
        }
    },
    "rhythmSet" : {
        "state" : "4n",
        "matrix" : {
        "4n" : ["4n"]
        }
    }
}

var synths = [
    {
        name: "Default Synth",
        type: "Synth",
        settings: {},
        polyphonic: true
      },
      {
        name: "Default FM Synth",
        type: "FMSynth",
        settings: {},
        polyphonic: true
      } 
]

synths[0].synth = new Tone.PolySynth(Tone.Synth).toDestination();
synths[1].synth = new Tone.PolySynth(Tone.FMSynth).toDestination();

const notes = ['Ab', 'A', 'A#', 'Bb', 'B', 'Cb', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'Fb', 'F', 'F#', 'Gb', 'G', 'G#'];
const durations = ['1n', '2n', '2n.', '4n', '4n.', '8n', '8n.', '16n']

var markovMusicGraph = []; // global model
const results = document.querySelector('.results pre');

getForms(); // display the markovMusicGraph object as empty array
/**
 * makovMusicGraph is a data representation of the entire graph. 
 * The form will operate directly on this array of objects. 
 * It will have the same structure as 'testGraph' (above)
 */

/**
 * This form creates a data structure that drives a Markov-chain music generator
 * 1. Add Graph
 * 1.1 Name
 * 1.2 Pitch Set
 * 1.2.1 Beginning state (drop-down list of pitch choices) - default "C4"
 * 1.2.2 Matrix (set transition possibilities)
 * 1.2.2.1 For each node (beginning with the "state" value), add transition choices (dropdown list)
 * 1.2.2.1b each choice generates a node if not represented already
 * 1.2.3 Add node option
 * 1.3 Rhythm Set
 * 1.3.1 Beginning state (drop-down list of pitch choices) - Default "4n"
 * 1.3.2 Matrix (set transition possibilities)
 * 1.3.2.1 For each node (beginning with the "state" value), add transition choices (dropdown list)
 * 1.3.2.1b each choice generates a node if not represented already
 * 1.3.3 Add node option
 */

//document.getElementById("fileSelect").addEventListener('click', ()=>{
  //parseUpload(testGraph);
 //})

/** Upload previous file */

const fileElem = document.getElementById("fileElem");
document.getElementById("fileSelect").addEventListener(
    "click",
    (e) => {
      if (fileElem) {
        fileElem.click();
      }
    },
    false,
);

fileElem.addEventListener("change", handleFiles, false);

/** process upload, look for JSON */
function handleFiles() {
    const file = this.files[0]
    console.log("loading file: " + file.name + " file type: " + file.type);
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let obj = JSON.parse(e.target.result); // if JSON is valid, make an object
        //loadBeats(obj); // generate beats interface
        parseUpload(obj);
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

/** generate an populate the sequence form from an existing object */
function parseUpload(graphObject){
  if(Array.isArray(graphObject)){
    console.log("parseUpload()" + graphObject.length);
    for(let i = 0; i < graphObject.length; i++){
      addGraph(graphObject[i]);
    }
  }
}

document.getElementById('add').addEventListener('click', ()=>{
    addGraph(defaultGraph);
});
var sketches = []; // hold the Markov player P5 sketchs
//var pitchNodes = []; // keep track of existing nodes (multidimensional array)
//var rhythmNodes = []; // same as pitchNodes
// pitchNodes = [["C4", "B3", "G4"], ["C4"]] // list of nodes for

function addGraph(graph){
    // 'graph' is a single Markov graph with matrices for pitch and rhythm
    if(graph){
        //console.log(JSON.stringify(graph));
    }
    markovMusicGraph.push({}) // add an empty object to the array
    //getForms();
    //console.log("add Graph");
    // <section class="contact-form" id="input-form">
    const section = document.getElementById("input-form");
    let num = document.querySelectorAll(".graph-info").length; // count the current graphs
    let playerContainer = document.createElement("div");
    playerContainer.id = "playerContainer_" + num;
    section.appendChild(playerContainer); // holds the GUI
    // player div for Markov GUI player
    let player = document.createElement("div");
    player.className = "markov";
    player.id = "player_" + num;
    player.style = "position: relative;"
    //player.innerText = "player " + num + " update style.markov";
    playerContainer.appendChild(player);
    // create Markov Player GUI (P5 Sketch)
    let sketch = new p5(mGUI, player); // invoke p5 and add it to the div
    sketches.push(sketch); // add the sketch reference to the array for later
    sketch.setSynthLib(synths); // hand synth library to thge sketch
    sketch.setObj(defaultGraph);
    let update = document.createElement('button');
    update.innerText = "Update Player"
    update.addEventListener('click', () => {
        sketches[num].setObj(markovMusicGraph[num]);
    });
    playerContainer.appendChild(update);
    
    // create a form
    let f = document.createElement('form');
    //f.innerText = "Graph"
    f.className = "graph-info";
    f.id = "graph_" + num;
    section.appendChild(f); // add form to the section
    f.addEventListener('submit', function(event){
        event.preventDefault();
        event.stopPropagation();
        // console.log("submitting form " + num);
        // console.log(document.activeElement.id);
        //DispatchTab(); // tab insted of return to prevent reloading form
        //getForms();
      }, false)

    // Title div (collapse synth section)
    const titleDiv = document.createElement('div');
    titleDiv.id = "titleDiv_" + num;
    titleDiv.className = "synth-label";
    let sectionCollapseIndicator = document.createElement('span');
    sectionCollapseIndicator.innerHTML = " - ";
    sectionCollapseIndicator.className = "sci"; // change when collapsed
    titleDiv.appendChild(sectionCollapseIndicator);
    let graphName = document.createElement('span');
    graphName.innerHTML = "Graph #" + num + " data"; 
    titleDiv.appendChild(graphName);
    f.appendChild(titleDiv);
    let d = document.createElement("div"); // form inputs (d for "data")
    d.id = "graphDiv_" + num;
    d.style = "display: block;" // start visible
    //console.log("graph id = " + d.id);
    d.className = "input-group";
    //d.innerText = "Graph"; // temporary
    f.appendChild(d); // append to the form
  
    titleDiv.addEventListener('click', ()=>{
    // get graph div display value; toggle "block" and "none"
        if(d.style.display == "block"){
        // look for <span. element with classname "sci"
            titleDiv.querySelector('.sci').innerHTML = " + ";
            d.style.display = "none";
        } else {
            titleDiv.querySelector('.sci').innerHTML = " - ";
            d.style.display = "block";
        }
    });

    // name input
    let label = document.createElement("label");
    label.for = "name";
    label.innerText = "Name (displayed on the player interface)";
    d.appendChild(label); // add label for name
    let i = document.createElement("input");
    i.name = "name";
    i.type = "text";
    if(graph && graph.hasOwnProperty("name")){
        i.value = graph.name; 
    } else {
        i.value = "Graph " + num;
    }
    markovMusicGraph[num].name = i.value; // add to global object
    //console.log(JSON.stringify(markovMusicGraph[num]));
    i.addEventListener('change', (e)=>{
        let name = e.target.value;
        markovMusicGraph[num].name = name;
        getForms();
        //console.log("markovMusicGraph: " + JSON.stringify(markovMusicGraph));
    });
    d.appendChild(i); // add name input

    /** 2. Create a pitchSet section */
//    let pitchSet = {"state" : "C4", "matrix" : {"C4" : ["C4"]}}; // default new pitchset
    markovMusicGraph[num].pitchSet = {} // create property 'pitchset on the global object
    // console.log(JSON.stringify(markovMusicGraph[num]));
    // a. Make a container div
    let psDiv = document.createElement('fieldset');
    psDiv.style = "width: 100%; border: solid; padding: 2px;"
    let psLegend = document.createElement('legend');
    psLegend.innerText = "Pitch Set";
    psDiv.appendChild(psLegend);
    d.appendChild(psDiv);
    // b. create a 'pitchState' div
    let pitStateDiv = document.createElement('fieldset'); 
    pitStateDiv.style = "margin: 5px; border: solid; display: flex;"
    psDiv.appendChild(pitStateDiv);
    // c. find the 'state' property and make an input for it:
    label = document.createElement('legend');
    label.innerText = "State";
    //label.style = "margin-right: 10px;"
    pitStateDiv.appendChild(label);
   
    // pitchSet.state is a string with two parts. split it into the 'note' and 'ocatave'
    let pit, oct; //= pitchSet.state.split(/(\d)/, 2);
    let pitchState = "C4"; // default pitch
    if(graph && graph.pitchSet.hasOwnProperty("state")){
        pitchState = graph.pitchSet.state;
        pit = pitchState.split(/(\d)/, 2)[0]; //pit is pitch string
        oct = pitchState.split(/(\d)/, 2)[1]; //octave is number 
        // console.log(`state pitch : ${pit} octave ${oct}`);
        markovMusicGraph[num].pitchSet.state = pitchState;
        //console.log(markovMusicGraph[num])
    }
    var pitchStateSelect = document.createElement('select');
    pitchStateSelect.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < notes.length; i ++){
        let o = document.createElement('option');
        o.value = notes[i];
        o.text = notes[i];
        pitchStateSelect.add(o);
    }
    pitchStateSelect.value = pit // noteArr[0];
    pitchStateSelect.name = 'pitchSetState';
    pitStateDiv.appendChild(pitchStateSelect);
    
    // add a number box for the octave:
    var ocataveStateSelect = document.createElement('input');
    ocataveStateSelect.type = 'number';
    ocataveStateSelect.style = "width: 50px; padding: 3px;";
    ocataveStateSelect.min = 1;
    ocataveStateSelect.max = 7;
    ocataveStateSelect.step = 1;
    ocataveStateSelect.value = oct; //noteArr[1]; // from import or default
    ocataveStateSelect.addEventListener('change', ()=>{
        ocataveStateSelect.value = Math.trunc(ocataveStateSelect.value);
    })
    pitStateDiv.appendChild(ocataveStateSelect);

    // button to update the form
    let stateDummy = document.createElement('button')
    stateDummy.style = "display: none";
    let stateUpdate = document.createElement('button');
    stateUpdate.innerText = "update";
    pitStateDiv.appendChild(stateDummy);
    pitStateDiv.appendChild(stateUpdate);
    stateUpdate.addEventListener('click', ()=>{
        pitchState = "" + pitchStateSelect.value + ocataveStateSelect.value;
        //console.log("pitch state: " + pitchState);
        markovMusicGraph[num].pitchSet.state = pitchState;
        getForms();
    })

    // create a container to add a pitch node
    let addPitchNodeDiv = document.createElement('fieldset');
    addPitchNodeDiv.style = "margin: 5px; border: solid; display: flex;"
    psDiv.appendChild(addPitchNodeDiv);
    label = document.createElement('legend');
    label.innerText = "Add Pitch Node";
    addPitchNodeDiv.appendChild(label);

    // add a button to commit the added node
    let addNodeDummy = document.createElement('button')
    addNodeDummy.style = "display: none";
    let addNodeUpdate = document.createElement('button');
    addNodeUpdate.innerText = "ADD NODE:";
    addPitchNodeDiv.appendChild(addNodeDummy);
    addPitchNodeDiv.appendChild(addNodeUpdate);
    addNodeUpdate.addEventListener('click', ()=>{
        let addPitch = "" + addPitchMenu.value + addOctave.value;
        let object = {};
        object[addPitch] = [addPitch];
        if(!markovMusicGraph[num].pitchSet.matrix.hasOwnProperty(addPitch)){
            // if the new node is not already in the graph, proceed
            markovMusicGraph[num].pitchSet.matrix[addPitch] = [];
            addPitchNode(object, pitNodesDiv, num)
        }
        getForms();
    })
    // add a pitch selector
    var addPitchMenu = document.createElement('select');
    addPitchMenu.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < notes.length; i ++){
        let o = document.createElement('option');
        o.value = notes[i];
        o.text = notes[i];
        addPitchMenu.add(o);
    }
    addPitchMenu.value = "C";
    addPitchMenu.name = 'addPitchMenu';
    addPitchNodeDiv.appendChild(addPitchMenu);
    
    // add an octave selector
    var addOctave = document.createElement('input');
    addOctave.type = 'number';
    addOctave.style = "width: 50px; padding: 3px;";
    addOctave.min = 1;
    addOctave.max = 7;
    addOctave.step = 1;
    addOctave.value = 4; 
    addOctave.addEventListener('change', ()=>{
        addOctave.value = Math.trunc(addOctave.value);
    })
    addPitchNodeDiv.appendChild(addOctave);


    // create a div for the rhythm matrix
    let pitMatrixDiv = document.createElement('fieldset');
    pitMatrixDiv.style = "margin: 5px; border: 3px solid; display: flex; padding: 5px;"
    psDiv.appendChild(pitMatrixDiv);
    let legend = document.createElement('legend');
    legend.innerText = 'Pitch Matrix'
    legend.style = "margin-left: 5%"
    pitMatrixDiv.appendChild(legend);

    // add div for pitch nodes (will contain nodes and transitions list)
    let pitNodesDiv = document.createElement('div');
    pitNodesDiv.style = "width: 100%;"// border: solid";
    pitNodesDiv.id = "pitchNodesDiv_" + num;
    //pitNodesDiv.innerText = JSON.stringify(pitchSet.matrix);
    pitMatrixDiv.appendChild(pitNodesDiv);

    // how many nodes in the matrix?
    markovMusicGraph[num].pitchSet.matrix = {} // add matrix property
    let pitNodes = Object.keys(graph.pitchSet.matrix);
    for(let i = 0; i < pitNodes.length; i ++){
        let node = {};
        node[pitNodes[i]] = graph.pitchSet.matrix[pitNodes[i]];
        addPitchNode(node, pitNodesDiv, num);
    }
    //markovMusicGraph[num].pitchSet = pitchSet;
    
    // 3. create rhythmSet
    //let rhythmSet = {"state" : "4n", "matrix" : {"4n" : ["4n"]}};
    // markovMusicGraph[num].rhythmSet = rhythmSet; // add default rhythmSet to global object
    markovMusicGraph[num].rhythmSet = {} //add property for rhythmSet to global object
    let rsDiv = document.createElement('fieldset');
    rsDiv.style = "width: 100%; border: solid; padding: 2px;"
    label = document.createElement('legend');
    label.innerText = "Rhythm Set"
    rsDiv.appendChild(label);
    d.appendChild(rsDiv);

    // b. create a 'rhythmState' div
    let rhythmStateDiv = document.createElement('fieldset'); 
    rhythmStateDiv.style = "margin: 5px; border: solid; display: flex;"
    rsDiv.appendChild(rhythmStateDiv);
    // c. find the 'state' property and make an input for it:
    label = document.createElement('legend');
    label.innerText = "State";
    //label.style = "margin-right: 10px;"
    rhythmStateDiv.appendChild(label);
    
    // rhythmSet.state is a string
    let rhythmState = "4n"; // default rhythm
    if(graph && graph.rhythmSet.hasOwnProperty("state")){
        rhythmState = graph.rhythmSet.state;
        // console.log(`state rhythm : ${rhythmState}`);
        markovMusicGraph[num].rhythmSet.state = rhythmState;
        //console.log(markovMusicGraph[num])
    }
    var rhythmStateSelect = document.createElement('select');
    rhythmStateSelect.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < durations.length; i ++){
        let o = document.createElement('option');
        o.value = durations[i];
        o.text = durations[i];
        rhythmStateSelect.add(o);
    }
    rhythmStateSelect.value = rhythmState // noteArr[0];
    rhythmStateSelect.name = 'rhythmSetState';
    rhythmStateDiv.appendChild(rhythmStateSelect);
    rhythmStateSelect.addEventListener('change', (e)=>{
        markovMusicGraph[num].rhythmSet.state = e.target.value;
        getForms();
    })
        
    // fieldset for adding a rhythm node
    let addRNodeDiv = document.createElement('fieldset');
    addRNodeDiv.style = "margin: 5px; border: solid; display: flex;"
    label = document.createElement('legend');
    label.innerText = "Add Rhythm Node"
    addRNodeDiv.appendChild(label);
    rsDiv.appendChild(addRNodeDiv);

    let dummy = document.createElement('button');
    dummy.style = "display: none;"
    let addRNodeButton = document.createElement('button');
    addRNodeButton.innerText = "Add Node"
    addRNodeDiv.appendChild(dummy);
    addRNodeDiv.appendChild(addRNodeButton);
    addRNodeButton.addEventListener('click', ()=>{
        // add rhythm node
        let rhythm = addRNodeMenu.value;
        let node = {}
        node[rhythm] = [rhythm]; // e.g., {"4n" : ["4n"]} (adds itself as an edge)
        if(!markovMusicGraph[num].rhythmSet.matrix.hasOwnProperty(rhythm)){
            // check to make sure that node doesn't exist!
            addRhythmNode(node, rMatrixDiv, num);
            getForms();
        }
    })

    var addRNodeMenu = document.createElement('select')
    addRNodeMenu.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < durations.length; i ++){
        let o = document.createElement('option');
        o.value = durations[i];
        o.text = durations[i];
        addRNodeMenu.add(o);
    }
    addRNodeMenu.value = "4n" // default value
    addRNodeDiv.appendChild(addRNodeMenu);

    // create a rhythm matrix
    markovMusicGraph[num].rhythmSet.matrix = {}
    // and a div for the matrix:
    let rMatrixDiv = document.createElement("fieldset");
    rMatrixDiv.style = "margin: 5px; border: 3px solid; padding: 5px;"
    rMatrixDiv.id = "rhythmNodesDiv_" + num;
    rsDiv.appendChild(rMatrixDiv);
    legend = document.createElement('legend');
    legend.innerText = 'Rhythm Matrix';
    legend.style = "margin-left: 5%;";
    rMatrixDiv.appendChild(legend);

    // how many nodes in the matrix?
    let rNodes = Object.keys(graph.rhythmSet.matrix);
    for(let i = 0; i < rNodes.length; i ++){
        let node = {};
        node[rNodes[i]] = graph.rhythmSet.matrix[rNodes[i]];
        addRhythmNode(node, rMatrixDiv, num);
    }

    // console.log(JSON.stringify(markovMusicGraph));
    getForms(); // update output
}

// add a node to the pitchSet
function addPitchNode(object, div, graphNum){
    // takes a node object {"C4" : ["C4"]}
    // div is the container for all the nodes and edges
    // console.log("add Pitch Node to Graph# " + graphNum);
    let key = Object.keys(object)[0]; // pitch name for the node
    markovMusicGraph[graphNum].pitchSet.matrix[key] = [];
    //console.log(markovMusicGraph[graphNum]);
    // console.log("addPitchNode: " + key);
    let nodes = div.querySelectorAll("div.pitchRow");
    let num = nodes.length;
    let pitchNodeDiv = document.createElement('div');
    // pitchNodeDiv contains the Node div and the edges div
    pitchNodeDiv.style = "display: flex; align-items: center; margin-left: 0;"
    pitchNodeDiv.className = "pitchRow"
    pitchNodeDiv.id = "pitchRow_" + graphNum + "." + num;
    div.appendChild(pitchNodeDiv);
    //nodeDiv.innerText = JSON.stringify(object);
    // create a div for the node (object key)
    let nodeDiv = document.createElement('fieldset');
    nodeDiv.style = "display: flex; padding: 5px; margin-right: 5px";
    nodeDiv.className = "pitchNode"
    nodeDiv.id = "pitchNode_" + graphNum + "." + key;
    pitchNodeDiv.appendChild(nodeDiv);
    let legend = document.createElement('legend');
    legend.innerText = "Node";
    nodeDiv.appendChild(legend);
    let noteArr = key.split(/(\d)/, 2);
    var select = document.createElement('select');
    select.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < notes.length; i ++){
        let o = document.createElement('option');
        o.value = notes[i];
        o.text = notes[i];
        select.add(o);
    }
    select.value = noteArr[0];
    select.name = 'nodePitch_' + num;
    select.addEventListener('change', ()=>{
        let newKey = "" + select.value + octave.value; // get the new key
        let id = nodeDiv.id.split("."); // pitch name is after the '.'
        let oldKey = id[1];
        console.log(`old key: ${oldKey}, new key: ${newKey}`);
        nodeDiv.id = "" + id[0] + "." + newKey; 
        //create a new pitch node and copy the old values over
        changePitchNode(oldKey, newKey, graphNum, div, pitchNodeDiv);
        getForms();
    })
    nodeDiv.appendChild(select);

    // add a number box for the octave:
    var octave = document.createElement('input');
    octave.type = 'number';
    octave.style = "width: 40px; padding: 3px;";
    octave.min = 1;
    octave.max = 7;
    octave.step = 1;
    octave.name = "nodePitchOctave_" + num;
    octave.value = noteArr[1]; // from import or default
    octave.addEventListener('change', ()=>{
        let newKey = "" + select.value + octave.value; // get the new key
        let id = nodeDiv.id.split("."); // pitch name is after the '.'
        let oldKey = id[1];
        console.log(`old key: ${oldKey}, new key: ${newKey}`);
        nodeDiv.id = "" + id[0] + "." + newKey; // update the div id
        //create a new pitch node and copy the old values over or combine nodes
        changePitchNode(oldKey, newKey, graphNum, div, pitchNodeDiv);
        getForms();
    })
    nodeDiv.appendChild(octave);

    let nodeDeleteButton = document.createElement('button');
    nodeDeleteButton.innerText = 'X';
    nodeDeleteButton.style = "margin: 4px 0 0 0; padding: 2px"
    nodeDiv.appendChild(nodeDeleteButton);
    nodeDeleteButton.addEventListener('click', ()=>{
        div.removeChild(pitchNodeDiv); // remove the entire node row
        let nodeToDelete = "" + select.value + octave.value;
        delete markovMusicGraph[graphNum].pitchSet.matrix[nodeToDelete];
        getForms();
    })

    //update the golobal object (empty edge array)
    //markovMusicGraph[graphNum].pitchSet.matrix[key] = [];

    // create another container div for the transitions
    var edgeDiv = document.createElement('fieldset'); 
    edgeDiv.style = "width: 330px; display: flex; border: solid; flex-wrap: wrap; margin-top:0; margin-right: 5px; padding: 5px;"
    edgeDiv.className = "pitchEdges";
    edgeDiv.id = "pitchEdgeDiv_" + graphNum +"."+ key;
    pitchNodeDiv.appendChild(edgeDiv);
    legend = document.createElement('legend');
    legend.innerText = "Edge Transitions"
    edgeDiv.appendChild(legend);
    if(Array.isArray(object[key])){
        for(let i = 0; i < object[key].length; i++){
            addPitch(object[key][i], edgeDiv, key, graphNum);
        }
    }

    //add a dummy button (invisible) to prevent triggering with "enter/return"
    let dummy = document.createElement('button');
    dummy.style="display:none;"
    pitchNodeDiv.appendChild(dummy);

    //add a div to contain the "add edge" button
    let addButtonDiv = document.createElement('div');
    addButtonDiv.style = "width: 50px; padding: 0";
    let addButton = document.createElement('button');
    addButton.innerText = "+";
    addButton.style = "margin: 0";
    addButtonDiv.appendChild(addButton);
    addButton.addEventListener('click', ()=>{
        addPitch("C4", edgeDiv, key, graphNum); // add a default note
        //markovMusicGraph[graphNum].pitchSet.matrix[key].push("C4");
        getForms(); // update data file
    });
    pitchNodeDiv.appendChild(addButtonDiv);

    let update = document.createElement('button');
    update.innerText = "update";
    update.style = "font-size: 8pt; width: 55px; padding: 5px; margin-left: 0";
    addButtonDiv.appendChild(update);
    update.addEventListener('click', getForms);
}

function changePitchNode(oldKey, newKey, graphNum, div, pitchNodeDiv){
    // check if the new key exists. 
    // if so, concatenate the arrays and delete the old key
    // if not, simply replace the old key with the new one
    console.log("change pitch node")
    if(markovMusicGraph[graphNum].pitchSet.matrix.hasOwnProperty(newKey)){
        console.log("Node already exists!")
        //new Key already exists in the matrix
        let arr1 = markovMusicGraph[graphNum].pitchSet.matrix[newKey];
        let arr2 = markovMusicGraph[graphNum].pitchSet.matrix[oldKey]; // edge array associated with old key
        let arr3 = arr1.concat(arr2); // combine arrays
        // console.log(arr3);
        //markovMusicGraph[graphNum].pitchSet.matrix[newKey] = arr3;

        // add arr2 to the nodeDiv
        let edgeDiv = document.getElementById("pitchEdgeDiv_" + graphNum +"."+ newKey);
        for(let i = 0; i < arr2.length; i++){
            addPitch(arr2[i], edgeDiv, newKey, graphNum)
        }
        //delete the div from the form
        div.removeChild(pitchNodeDiv);
        delete markovMusicGraph[graphNum].pitchSet.matrix[oldKey]
        
        //key = newKey;
    } else {
        console.log("add new key to the list, copy array over, and delete old version")
        markovMusicGraph[graphNum].pitchSet.matrix[newKey] = markovMusicGraph[graphNum].pitchSet.matrix[oldKey];
        // delete the old value
        delete markovMusicGraph[graphNum].pitchSet.matrix[oldKey];
        //update the edge div id
        let edgeDiv = document.getElementById("pitchEdgeDiv_" + graphNum +"."+ oldKey);
        edgeDiv.id = "pitchEdgeDiv_" + graphNum +"."+ newKey;
    }
    getForms();
}

// add a transition to a node's list
function addPitch(note, div, key, graphNum){
    let edges = div.querySelectorAll("div.edgeNote"); // how many edges already?
    let index = edges.length; // this edge pitch's index
    markovMusicGraph[graphNum].pitchSet.matrix[key].push(note);
    let noteDiv = document.createElement('div');
    noteDiv.className = "edgeNote";
    noteDiv.style = "display: flex; margin-right: 0.25rem; margin-top: 2px;"
    noteDiv.id = "edgeNote_" + key + "." + index;
    div.appendChild(noteDiv);

    let noteArr = note.split(/(\d)/, 2);
    var select = document.createElement('select');
    select.style = "width: 40px; padding: 3px; font-size: 8pt";
    for(let i = 0; i < notes.length; i ++){
        let o = document.createElement('option');
        o.value = notes[i];
        o.text = notes[i];
        select.add(o);
    }
    select.value = noteArr[0];
    select.name = "edgePitch_" + key + "." + index;
    select.addEventListener('change', ()=>{
        let note = "" + select.value + octave.value;
        markovMusicGraph[graphNum].pitchSet.matrix[key][index] = note;
        //getForms();
    })
    //select.name = 'pitState_' + num;
    noteDiv.appendChild(select);

    // add a number box for the octave:
    var octave = document.createElement('input');
    octave.type = 'number';
    octave.style = "width: 35px; padding: 3px; font-size: 10pt";
    octave.min = 1;
    octave.max = 7;
    octave.step = 1;
    octave.value = noteArr[1]; // from import or default
    octave.name = "edgePitchOctave_" + key + "." + index;
    octave.addEventListener('change', ()=>{
        octave.value = Math.trunc(octave.value);
        let note = "" + select.value + octave.value;
        markovMusicGraph[graphNum].pitchSet.matrix[key][index] = note;
        //getForms();
    })
    noteDiv.appendChild(octave);

    // dummy button prevents onChange from hitting "delete"
    let dummy = document.createElement('button');
    dummy.style="display:none;"
    noteDiv.appendChild(dummy);

    //add a 'delete' button
    let delButton = document.createElement('button');
    delButton.style = "margin: .25rem 0 0 0; font-size: 10pt; padding: 5px";
    delButton.innerText = "X";
    noteDiv.appendChild(delButton);
    delButton.addEventListener('click', ()=>{
        div.removeChild(noteDiv);
        markovMusicGraph[graphNum].pitchSet.matrix[key].splice(index, 1);
        getForms();
    });
}

// add a node to the rhythmSet
function addRhythmNode(node, matrixDiv, graphNum){
    // takes a node object {key:[]}
    // split the key off the node first
    let key = Object.keys(node);
    let edgeArray = node[key];
    console.log(`adding node ${key} : ${edgeArray} to rhythm matrix`)
    markovMusicGraph[graphNum].rhythmSet.matrix[key] = [];

    let rhythmRowDiv = document.createElement('div');
    rhythmRowDiv.style = "display: flex; align-items: center; margin-left: 0;"
    rhythmRowDiv.className = "rhythmRow"
    rhythmRowDiv.id = "rhythmRow_" + graphNum + "." + key;
    matrixDiv.appendChild(rhythmRowDiv);

    // Add Rhythm Node
    let nodeDiv = document.createElement('fieldset');
    nodeDiv.style = "display: flex; padding: 5px; margin-right: 5px";
    nodeDiv.className = "rhythmNode";
    nodeDiv.id = "rhythmNode_" + graphNum + "." + key; // "rhythmNode_0.4n"
    rhythmRowDiv.appendChild(nodeDiv);
    let legend = document.createElement('legend');
    legend.innerText = "Node";
    nodeDiv.appendChild(legend);
    var select = document.createElement('select');
    select.style = "width: 50px; padding: 3px;";
    for(let i = 0; i < durations.length; i ++){
        let o = document.createElement('option');
        o.value = durations[i];
        o.text = durations[i];
        select.add(o);
    }
    select.value = key;

    //Change a Rhythm Node (special handling!)
    select.addEventListener('change', (e)=>{
        // merge with existing node or create a new pitch node and copy the old values over 
        // key = changePitchNode(key, newKey, graphNum, div, pitchNodeDiv);
        let id = nodeDiv.id.split(".");
        let oldKey = id[1];
        let newKey = select.value;
        nodeDiv.id = "" + id[0] + "." + newKey; // re-assign div ID to new key
        let row = nodeDiv.parentElement; // get the row containing this element
        row.id = "rhythmRow_" + graphNum + "." + newKey; // update the container ID
        changeRhythmNode(oldKey, newKey, graphNum, matrixDiv, rhythmRowDiv);
        // pass the old key, new key, graph #, parent div, and row div
        getForms();
    })
    nodeDiv.appendChild(select);

    let nodeDeleteButton = document.createElement('button');
    nodeDeleteButton.innerText = 'X';
    nodeDeleteButton.style = "margin: 4px 0 0 0; padding: 2px"
    nodeDiv.appendChild(nodeDeleteButton);
    nodeDeleteButton.addEventListener('click', ()=>{
        matrixDiv.removeChild(rhythmRowDiv); // remove the entire node row
        let nodeToDelete = select.value;
        delete markovMusicGraph[graphNum].rhythmSet.matrix[nodeToDelete];
        getForms();
    })

    // add div for edge transition list
    var edgeDiv = document.createElement('fieldset'); 
    edgeDiv.style = "width: 360px; display: flex; border: solid; flex-wrap: wrap; margin-top:0; margin-right: 5px; padding: 5px;"
    edgeDiv.className = "rhythmEdges";
    edgeDiv.id = "rhythmEdgeDiv_" + graphNum +"."+ key;
    rhythmRowDiv.appendChild(edgeDiv);
    legend = document.createElement('legend');
    legend.innerText = "Edge Transitions"
    edgeDiv.appendChild(legend);
    if(Array.isArray(node[key])){
        for(let i = 0; i < node[key].length; i++){
            addRhythm(node[key][i], edgeDiv, nodeDiv, graphNum);
        }
    }
    //add a dummy button (invisible) to prevent triggering with "enter/return"
    let dummy = document.createElement('button');
    dummy.style="display:none;"
    rhythmRowDiv.appendChild(dummy);
    
    //add a div to contain the "add edge" button
    let addButtonDiv = document.createElement('div');
    addButtonDiv.style = "width: 50px; padding: 0;" 
    let addButton = document.createElement('button');
    addButton.style = "margin: 0;"
    addButton.innerText = "+";
    addButtonDiv.appendChild(addButton);
    addButton.addEventListener('click', ()=>{
        //addPitch("C4", edgeDiv, key, graphNum); // add a default note
        addRhythm("4n", edgeDiv, nodeDiv, graphNum);
        //markovMusicGraph[graphNum].pitchSet.matrix[key].push("C4");
        getForms(); // update data file
    });
    rhythmRowDiv.appendChild(addButtonDiv);
    
    let update = document.createElement('button');
    update.innerText = "update";
    update.style = "font-size: 8pt; width: 55px; padding: 5px; margin-left: 0";
    addButtonDiv.appendChild(update);
    update.addEventListener('click', getForms);
    
}

function changeRhythmNode(oldKey, newKey, graphNum, div, rhythmNodeDiv){
    // check if the new key exists. 
    // if so, concatenate the arrays and delete the old key
    // if not, simply replace the old key with the new one

    if(markovMusicGraph[graphNum].rhythmSet.matrix.hasOwnProperty(newKey)){
        //new Key already exists in the matrix
        let arr1 = markovMusicGraph[graphNum].rhythmSet.matrix[newKey];
        let arr2 = markovMusicGraph[graphNum].rhythmSet.matrix[oldKey];
        let arr3 = arr1.concat(arr2); // combine arrays
//        markovMusicGraph[graphNum].rhythmSet.matrix[newKey] = arr3;
        delete markovMusicGraph[graphNum].rhythmSet.matrix[oldKey];
        // add arr2 to the nodeDiv
        let edgeDiv = document.getElementById("rhythmEdgeDiv_" + graphNum +"."+ newKey);
        let container = document.getElementById("rhythmRow_" + graphNum + "." + newKey);
        for(let i = 0; i < arr2.length; i++){
            addRhythm(arr2[i], edgeDiv, container, graphNum);
        }
        //delete the div from the form
        div.removeChild(rhythmNodeDiv);
 
    } else {
        // create a new key, copy its contents
        markovMusicGraph[graphNum].rhythmSet.matrix[newKey] = markovMusicGraph[graphNum].rhythmSet.matrix[oldKey]
        // delete the old value
        delete markovMusicGraph[graphNum].rhythmSet.matrix[oldKey];
        //update the edge div id
        let edgeDiv = document.getElementById("rhythmEdgeDiv_" + graphNum +"."+ oldKey);
        edgeDiv.id = "rhythmEdgeDiv_" + graphNum +"."+ newKey;
  
    }
}

// add a transition to a rhythm node
function addRhythm(edge, edgeDiv, container, graphNum){
    //dynamically find the key by querying the row container div
    let key = container.querySelector("select").value;
    
    //create a container for the rhythm menu and its delete button
    let index = markovMusicGraph[graphNum].rhythmSet.matrix[key].length;
    let rDiv = document.createElement('div');
    rDiv.className = "edgeNote";
    rDiv.style = "display: flex; margin-right: 0.25rem; margin-top: 2px;"
    rDiv.id = "edgeNote_"+ graphNum + "." + key + "[" + index + "]";
    edgeDiv.appendChild(rDiv);

    var select = document.createElement('select');
    select.style = "width: 45px; padding: 3px; font-size: 8pt";
    for(let i = 0; i < durations.length; i ++){
        let o = document.createElement('option');
        o.value = durations[i];
        o.text = durations[i];
        select.add(o);
    }
    select.value = edge;
    select.name = "edgeRhythm_" + key + "." + index;
    select.addEventListener('change', ()=>{
        let edges = edgeDiv.querySelectorAll("select"); // edges are the select inputs in the div
        let edgeArray = [];
        for(let i = 0; i < edges.length; i++){
            edgeArray.push(edges[i].value); // get actual values of edges in the div
        }
        markovMusicGraph[graphNum].rhythmSet.matrix[key] = edgeArray; // replace
        getForms();
    })
    rDiv.appendChild(select);

    let edges = edgeDiv.querySelectorAll("select"); // edges are the select inputs in the div
    let edgeArray = [];
    for(let i = 0; i < edges.length; i++){
        edgeArray.push(edges[i].value); // get actual values of remaining edges
    }
    markovMusicGraph[graphNum].rhythmSet.matrix[key] = edgeArray; // replace

    // dummy button prevents onChange from hitting "delete"
    let dummy = document.createElement('button');
    dummy.style="display:none;"
    rDiv.appendChild(dummy);
    
    //add a 'delete' button
    let delButton = document.createElement('button');
    delButton.style = "margin: .25rem 0 0 0; font-size: 10pt; padding: 5px";
    delButton.innerText = "X";
    rDiv.appendChild(delButton);
    delButton.addEventListener('click', ()=>{
        edgeDiv.removeChild(rDiv);
        let key = container.querySelector("select").value; // double check
        let edges = edgeDiv.querySelectorAll("select"); // edges are the select inputs in the div
        console.log(edges.length + " edges left in list for " + key);
        let edgeArray = []; // make a new array
        for(let  i =0; i < edges.length; i++){
            // console.log(edges[i].value);
            edgeArray.push(edges[i].value); // get actual values of remaining edges
        }
        markovMusicGraph[graphNum].rhythmSet.matrix[key] = edgeArray; // replace
        getForms();
    });

}
// process the forms and update JSON
function getForms(){
    console.log("get Forms ()");
    // console.log(JSON.stringify(markovMusicGraph))
    // check to make sure state property is represented by a node property in the matrix
    for(let i = 0; i < markovMusicGraph.length; i++){
        let state = markovMusicGraph[i].pitchSet.state;
        let rstate = markovMusicGraph[i].rhythmSet.state;
        let pitNodesDiv = document.getElementById("pitchNodesDiv_" + i);
        let rNodesDiv = document.getElementById("rhythmNodesDiv_" + i);
        if(!markovMusicGraph[i].pitchSet.matrix.hasOwnProperty(state)){
            console.log("no pitch node to match pitch state!")
            let node = {}
            node[state] = ["" + state];
            markovMusicGraph[i].pitchSet.matrix[state] = ["" + state];
            addPitchNode(node, pitNodesDiv, i);
        }
        if(!markovMusicGraph[i].rhythmSet.matrix.hasOwnProperty(rstate)){
            console.log("no rhythm node to match state!")
            let node = {}
            node[rstate] = ["" + rstate]; // e.g., {"4n" : ["4n"]}
            markovMusicGraph[i].rhythmSet.matrix[rstate] = ["" + rstate];
            addRhythmNode(node, rNodesDiv, i);
        }        // check for edges not represented by nodes
        let keys = Object.keys(markovMusicGraph[i].pitchSet.matrix)
        for(let j = 0; j < keys.length; j++){
            let edges = markovMusicGraph[i].pitchSet.matrix[keys[j]]; // grab the array of edges
            // console.log("checking edges: " + keys[j]+":"+ edges);
            for(let k = 0; k < edges.length; k++){
                if(!markovMusicGraph[i].pitchSet.matrix.hasOwnProperty(edges[k])){
                    console.log("edge " + edges[k] + " not found. Adding pitch node");
                    let node = {};
                    node[edges[k]] = ["" + edges[k]];
                    markovMusicGraph[i].pitchSet.matrix[edges[k]] = ["" + edges[k]];
                    addPitchNode(node, pitNodesDiv, i);
                }
            }
        }
        let rkeys = Object.keys(markovMusicGraph[i].rhythmSet.matrix)
        for(let j = 0; j < rkeys.length; j++){
            let edges = markovMusicGraph[i].rhythmSet.matrix[rkeys[j]]; // grab the array of edges
            // console.log("checking edges: " + keys[j]+":"+ edges);
            for(let k = 0; k < edges.length; k++){
                if(!markovMusicGraph[i].rhythmSet.matrix.hasOwnProperty(edges[k])){
                    console.log("edge " + edges[k] + " not found. Adding rhythm node");
                    let node = {};
                    node[edges[k]] = ["" + edges[k]];
                    // markovMusicGraph[i].rhythmSet.matrix[edges[k]] = ["" + edges[k]];
                    addRhythmNode(node, rNodesDiv, i);
                }
            }
        }
        // send markovMusicGraph[i] to sketches[i]
        sketches[i].setObj(markovMusicGraph[i]);
    }
    results.innerText = JSON.stringify(markovMusicGraph, null, 2);

}

let submit = document.getElementById('submit')
submit.addEventListener('click', getForms);

const dl = document.getElementById("download");
dl.addEventListener("click", download);

function download() {
  let filename = "markov.json"
  console.log(filename);
  let text = JSON.stringify(markovMusicGraph, null, 2);

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}