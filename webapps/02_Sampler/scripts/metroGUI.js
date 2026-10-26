const metroGUI = p => {
    var tempoBox, transportStart, metroStart, tempoSlider, syncSlider, volSlider, tempo;
    const synthA = new Tone.FMSynth().toDestination();
    const synthB = new Tone.AMSynth().toDestination();
    const drumSampler = new Tone.Sampler(
        {
          urls: {
            "A3": "drums/Kick.wav",
            "A#3": "drums/Kick.wav",
            "B3": "drums/Snare.wav",
            "C4": "drums/Claps.wav",
            "C#4": "drums/Shot1.wav",
            "D#4": "drums/Shot2.wav",
            "D4": "drums/WhiteNoise.wav",
            "E4": "drums/ReverseCymbal.wav",
            "F4": "drums/HiHat_Closed.wav",
            "F#4": "drums/HiHat_Open.wav"
          },
        }
      );
    const gainNode = new Tone.Gain(0.8).toDestination();
    drumSampler.connect(gainNode);
    //play a note every quarter-note
    const loopA = new Tone.Loop((time) => {
        drumSampler.triggerAttackRelease("A3", "4n", time);
    }, "4n"); // kick

    const loopB = new Tone.Loop((time) => {
        drumSampler.triggerAttackRelease("C4", "4n", time);
    }, "2n"); // hand clap

    
    let patterns = [
        [
            {"time": 0, "pitch" : "A3", "dur" : "8n"},
            {"time": "0:1:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:2:0", "pitch" : "A3", "dur" : "8n"},
            {"time": "0:3:0", "pitch" : "A3", "dur" : "8n"}
        ],
        [
            {"time": 0, "pitch" : "F4", "dur" : "16n"},
            {"time": 0, "pitch" : "A3", "dur" : "4n"},
            {"time": "0:0:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:1:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:1:0", "pitch" : "C4", "dur" : "16n"},
            {"time": "0:1:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:2:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:2:0", "pitch" : "B3", "dur" : "16n"},
            {"time": "0:2:2", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:3:0", "pitch" : "F4", "dur" : "16n"},
            {"time": "0:3:0", "pitch" : "C4", "dur" : "16n"},
            {"time": "0:3:2", "pitch" : "F4", "dur" : "16n"}
        ],
    ]
    let pattern = 1; 

    const drumPart = new Tone.Part((time, val) => {
        drumSampler.triggerAttackRelease(val.pitch, val.dur, time)
    }, patterns[pattern])
    drumPart.loop = true;

    p.setup = function(){
        p.createCanvas(580, 90);

        transportStart = p.createButton("Start Transport");
        transportStart.style("font-size : 12px");
        transportStart.style("height: 25px;");
        transportStart.style("border: 3px solid rgb(128, 0, 0); border-radius: 8px");
        transportStart.style("color : rgb(128, 0, 0); background-color: #ffd700");
        transportStart.position(20, 29);
        transportStart.mousePressed(()=>{
            if(Tone.getTransport().state == "stopped" || Tone.getTransport().state == "paused"){
                Tone.getTransport().start();
                transportStart.html("Stop Transport");
                console.log("Transport " + Tone.getTransport().state)
            } else {
                Tone.getTransport().stop();  
                console.log("Transport " + Tone.getTransport().state)
                transportStart.html("Start Transport");
            }
        })

        // Metronome start/stop button
        metroStart = p.createButton("Start Metro");
        metroStart.style("font-size : 12px");
        metroStart.position(20, 55);  
        metroStart.style("height: 25px;");
        metroStart.style("border: 3px solid rgb(128, 0, 0); border-radius: 8px");
        metroStart.style("color : rgb(128, 0, 0); background-color: #ffd700");
        metroStart.mousePressed(()=>{
            //console.log("start metro");
            // await Tone.start();
            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
           // console.log(loopA.state);
//            if(loopA.state == "stopped"){
              if(drumPart.state == "stopped"){
//                loopA.start("+4n");
//                loopB.start("+2n");
                let t = Tone.getTransport().position;
                let times = t.split(':');
                times[2] = 0; // set to downbeat;
                times[1] = 0; // set to first beat
                times[0] = Number(times[0]) + 1; // move up to the next measure;
                t = times[0] + ":" + times[1] + ":" + times[2]; 
                drumPart.start(t);
                metroStart.html("stop metro");
            } else {
//                loopA.stop();
//                loopB.stop();
                drumPart.stop();
                metroStart.html("start metro");
            }
        });

        // Tempo indicator/input
        tempoBox = p.createInput("120", "number");
        tempoBox.position(200, 60); 
        tempoBox.style("font-size : 16px");
        tempoBox.style("color: rgb(128, 0, 0); background-color: #ffd700")
        tempoBox.style("border: 3px solid rgb(128, 0, 0); border-radius: 4px"); 
        tempoBox.size(45);
        tempoBox.changed(()=>{
            //console.log(Tone.getTransport().state)
            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
            console.log("tempo box: " + tempoBox.value());
            tempoSlider.value(tempoBox.value());
            Tone.getTransport().bpm.value = tempoBox.value();
            console.log("Tempo from tempo box: " + Tone.getTransport().bpm.value);
            tempo = Math.round(Tone.getTransport().bpm.value);
        });
        // volume slider
      volSlider = p.createSlider(0, 1, 0.8, 0.1);
      volSlider.position(20, 85);
      volSlider.size(90);
      volSlider.changed(()=>{
        console.log(`volume ${volSlider.value()}`);
        gainNode.gain.rampTo(volSlider.value(), 0.1);
      });
      
        // tempo change slider (change tempo on release)
        tempoSlider = p.createSlider(40, 200, 120, 1);
        tempoSlider.position(200, 35);
        tempoSlider.size(100);
        tempoSlider.changed(()=>{
            tempoBox.value(tempoSlider.value());
            // tempoBox.changed();
            //console.log(Tone.getTransport().state)

            if(Tone.getTransport().state == "stopped"){
                Tone.getTransport().start();
                console.log("Transport " + Tone.getTransport().state)
            }
           // console.log("tempo slider: " + tempoSlider.value());
            //Tone.getTransport().bpm.rampTo(tempoSlider.value(), 0.5);
            Tone.getTransport().bpm.value = tempoSlider.value();
            console.log(Tone.getTransport().bpm.value);
            tempo = Math.round(Tone.getTransport().bpm.value);
            
        });

        syncSlider = p.createSlider(-0.1, 0.1, 0, 0.01);
        syncSlider.position(465, 37);
        syncSlider.size(100);
        syncSlider.changed(()=>{
            syncSlider.value(0);
        });

        tempo = Math.round(Tone.getTransport().bpm.value);

    }

    p.draw = function(){
        p.background(200);
        p.textAlign(p.LEFT);
        p.textSize(18);
        p.text("Metronome", 10, 17);
        p.textAlign(p.CENTER);
        p.text("Tempo", 240, 17);
        p.textAlign(p.LEFT);
        p.text("BPM", 252, 72)
        p.textAlign(p.CENTER);
        p.text("Beat Sync", 510, 20);
//        p.text(Tone.getTransport().bpm.value, 450, 55)
        p.textSize(12);
        p.text(Math.round(Tone.getTransport().bpm.value) + " bpm", 510, 60); 
        Tone.getTransport().bpm.value = tempo + (tempo * syncSlider.value());
        let t = Tone.getTransport().position;
        let times = t.split(':');
        p.push()
        p.translate(380, 0); // Transport counter block
        p.textAlign(p.CENTER, p.CENTER);
        p.text("Transport", 0, 10);
        //p.rect(0, 0, 100, 20);
        p.textAlign(p.RIGHT, p.CENTER);        
        p.text(times[0] + ":", -5, 80);
        p.text(times[1] + ":", 5, 80);
        p.textAlign(p.LEFT, p.CENTER);        
        p.text(times[2], 5, 80);
        p.pop();
      p.push();
      p.translate(380, 45); // metro dial
      //p.rotate(times[1] * p.PI/2)
      let d = 40;
      let q = (times[1] * p.PI/2) - p.PI/2;
      let s = 0;
      if(times[2] > 2){
        s = q + (p.PI/4);
      } else {
        s = q;
      }
      p.fill(150);
      p.noStroke();
      p.ellipse(0, 0, d+5);
      p.fill("blue");
      p.ellipse(p.cos(s) * d/2, p.sin(s) * d/2, 5);
      if(times[1] == 0){
        p.fill("red");
        p.ellipse(p.cos(q) * d/2, p.sin(q) * d/2, 10);
      }

      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(18);
      p.fill(255)
      p.text(Number(times[1]) + 1, 0, 0);
    
      //p.fill("blue");
      //p.arc(0, 0, 50, 50, -p.PI/2, times[1] * p.PI/2);
      //p.line(0, 0, 0, -25);
      p.pop();

        if(p.frameCount % 60 == 0 && Tone.Transport.state == "started"){
            transportStart.html("Stop Transport");
        }

    }
}