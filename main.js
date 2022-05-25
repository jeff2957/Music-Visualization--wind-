let dragging = false;
let minFrequency = 0.5;
let maxFrequency = 2;
let minAmplitude = 0.05;
let maxAmplitude = 0.5;

let amplitude;
let frequency;

let isPressed = false
let fft
let peakDetect
let startTime, endTime
let isThicken = false
let thickness = 0
var time = 0
var anim = 0
var timeDifference = 0
var bpm = 1
let canvas, canvas2

// Included in index.html
// This is an alternative to p5.js builtin 'noise' function,
// It provides 4D noise and returns a value between -1 and 1
const simplex = new SimplexNoise();

function preload() {
  audio = loadSound('audio/Neon Glory.wav')
}

// Create a new canvas to the browser size
function setup () {
  canvas = createCanvas(windowWidth, windowHeight);
  // canvas.center('vertical')
  // canvas.center('horizontal')
  canvas2 = createGraphics(300, 300)
  canvas2.background(255, 0 ,0)
  // canvas2.clear()
  canvas2.center('vertical')
  canvas2.center('horizontal')
  startTime = new Date()

  //text
  textSize(32)
  textAlign(CENTER, CENTER + 250)

  userStartAudio()
  
  mouseX = width / 2;
  mouseY = height / 2;

  fft = new p5.FFT()
  peakDetect = new p5.PeakDetect(80, 150, 0.7)
//   peakDetect.onPeak(peakDetected)
}

// On window resize, update the canvas size
function windowResized () {
  resizeCanvas(windowWidth, windowHeight)
  canvas.center('vertical')
  canvas.center('horizontal')
}

// Render loop that draws shapes with p5
function draw (){
  //image(canvas2, 0, 0)

  background(0);
  fft.analyze()
  peakDetect.update(fft)

 
  
  stroke(0,0,255)
  noFill()
  text('BEATTAPE #142', CENTER, CENTER)
  textSize(60)

  const waveform = fft.waveform()
  
  for(i = 0; i < waveform.length; i++) {
      const waveX = map(i, 0, waveform.length, 0, width)
      const waveY = map(waveform[i], -1, 1, 0.25, 100)
      frequency = lerp(minFrequency, maxFrequency, waveX / width)
      amplitude = lerp(minAmplitude, maxAmplitude, waveY / height);
  }

  


//   const frequency = lerp(minFrequency, maxFrequency, mouseX / width);
//   const amplitude = lerp(minAmplitude, maxAmplitude, mouseY / height);

//   console.log('freq: ' + frequency + 'amp: ' + amplitude)
  
  const dim = Math.min(width, height);

  // Get time in seconds
  time = millis() / 1000; 
  
  // Draw the background
  noFill();
  stroke(255);
  strokeWeight(Math.max(dim * 0.0075, thickness));
  

  const rows = 10;

  peakDetect.onPeak(peakDetected)

  // Draw each line
  for (let y = 0; y < rows; y++) {
    // Determine the Y position of the line
    const v = rows <= 1 ? 0.5 : y / (rows - 1);
    const py = v * height;
    drawNoiseLine({
      v,
      start: [ 0, py ],
      end: [ width, py ],
      amplitude: amplitude * height * 2.2,
      frequency,
      time: time * 0.5,
      steps: 150
    });
  }

  noFill();
  stroke(210);
  strokeWeight(dim * 0.0015)
  for (let y = 0; y < rows; y++) {
    // Determine the Y position of the line
    const v = rows <= 1 ? 0.5 : y / (rows - 1);
    const py = v * height;
    drawNoiseLine({
      v,
      start: [ 0, py * 1.3 ],
      end: [ width, py * 1.3 ],
      amplitude: height * (amplitude * 2.8),
      frequency,
      time: time * 0.5,
      steps: 50
    });
  }

  noFill();
  stroke(180, 250, 250);
  strokeWeight(dim * 0.0009)
  for (let y = 0; y < rows; y++) {
    // Determine the Y position of the line
    const v = rows <= 1 ? 0.5 : y / (rows - 1);
    const py = v * height;
    drawNoiseLine({
      v,
      start: [ 0, py * 1.6 ],
      end: [ width, py * 1.6 ],
      amplitude: height * (amplitude * 0.8),
      frequency,
      time: time * 0.5,
      steps: 100
    });
  }

  
  // text(text, 0, 0)
}

function drawNoiseLine (opt = {}) {
  const {
    v,
    start,
    end,
    steps = 10,
    frequency = 1,
    time = 0,
    amplitude = 1
  } = opt;
  
  const [ xStart, yStart ] = start;
  const [ xEnd, yEnd ] = end;

  // Create a line by walking N steps and interpolating
  // from start to end point at each interval
  beginShape();
  for (let i = 0; i < steps; i++) {
    // Get interpolation factor between 0..1
    const t = steps <= 1 ? 0.5 : i / (steps - 1);

    // Interpolate X position
    const x = lerp(xStart, xEnd, t);
    
    // Interpolate Y position
    let y = lerp(yStart, yEnd, t);
    
    // Offset Y position by noise
    y += (simplex.noise3D(t * frequency + time, v * frequency, time)) * amplitude;
    
    // Place vertex
    vertex(x, y);
  }
  endShape();
}

function mousePressed() {
    if (isPressed) {
      audio.pause()
      isPressed = false
    }
    else {
      isPressed = true
      audio.loop()
    }
  }

function peakDetected() {

    // How long we want the loop to be (of one full cycle)
    const duration = 5;

    // Get a 'playhead' from 0..1
    // We use modulo to keep it within 0..1
    const playhead = time / duration % 1;

    // Get an animated value from 0..1
    // We use playhead * 2PI to get a full rotation
    anim = sin(playhead * 0.5);

    const t = map(anim, -1, 1, -20, 50)
    // Create an animated thickness for the stroke that
    thickness = t
    
    console.log('got thick, ' + thickness )

    setTimeout(function() {
      thickness = thickness - (thickness * 0.2)

      console.log('not got thick, ' + thickness )
    }, 600)
  
}

