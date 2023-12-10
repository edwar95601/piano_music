const pianoKeys = document.querySelectorAll(".piano-keys .key"),
  volumeSlider = document.querySelector(".volume-slider input"),
  keysCheckbox = document.querySelector(".keys-checkbox input");

  function adjustPianoSize() {
    const piano = document.querySelector('.piano-keys');
    const windowWidth = window.innerWidth;
  
    if (windowWidth < 815) {
      // Dispositivo móvil
      piano.style.width = `${windowWidth}px`;
    } else {
      // Dispositivo de escritorio
      piano.style.width = ''; // Eliminar estilo inline para que se ajuste al contenedor
    }
  }
  
  // Llamar a la función cuando se carga la página y cuando se cambia el tamaño de la ventana
  window.addEventListener('DOMContentLoaded', adjustPianoSize);
  window.addEventListener('resize', adjustPianoSize);

  
let allKeys = [],
  audio = new Audio(`tunes/a.wav`);

const playTune = (key) => {
  audio.src = `tunes/${key}.wav`;
  audio.play();

  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  clickedKey.classList.add("active");
  setTimeout(() => {
    clickedKey.classList.remove("active");
  }, 150);
};

pianoKeys.forEach((key) => {
  allKeys.push(key.dataset.key);
  key.addEventListener("click", () => playTune(key.dataset.key));
});

const handleVolume = (e) => {
  audio.volume = e.target.value;
};

const showHideKeys = () => {
  pianoKeys.forEach((key) => key.classList.toggle("hide"));
};

const pressedKey = (e) => {
  if (allKeys.includes(e.key)) playTune(e.key);
};

keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);


"use strict"

var AudioContext = window.AudioContext || window.webkitAudioContext; // cross browser    
var audio_context
var oscillator
var gain

var my_play_button
var my_bpm_input
var my_volume_input

var my_tap_results

var char_to_increment = {}

var prev_tap_time = 0
var number_of_taps = 0
var accumulated_tap_time = 0

var beats = "1"
var current_beat = 1

var running = false

function my_onload() {

    char_to_increment.Q = 2
    char_to_increment.W = 4
    char_to_increment.E = 6
    char_to_increment.R = 8
    char_to_increment.T = 10

    char_to_increment.A = -2
    char_to_increment.S = -4
    char_to_increment.D = -6
    char_to_increment.F = -8
    char_to_increment.G = -10

    my_play_button = document.getElementById("my_play_button")
    my_bpm_input = document.getElementById("my_bpm_input")
    my_tap_results = document.getElementById("my_tap_results")
    my_volume_input = document.getElementById("my_volume_input")

}

function play_or_stop() {

    // can't do this in onload because browser wants an explicit user gesture
    if (audio_context == null) {
        audio_context = new AudioContext()

        // There's a "node graph"  oscillator->gain->destination
        oscillator = audio_context.createOscillator()
        oscillator.type = "sine"
        oscillator.frequency.value = 1000
        gain = audio_context.createGain()
        gain.gain.value = 0
        oscillator.connect(gain)
        gain.connect(audio_context.destination)
        oscillator.start()
    }

    if (my_play_button.innerText == "Start") {
        play()
        // toggle text
        my_play_button.innerText = "Stop"
        my_play_button.style.backgroundColor = "red"
    } else {
        stop_playing()
        // toggle text
        my_play_button.innerText = "Start"
        my_play_button.style.backgroundColor = "lightgreen"
    }
}

function stop_start() {
    current_beat = 1
    if (running) {
        stop_playing()
        play()
    }
}

function play() {

    running = true

    var volume

    var now = audio_context.currentTime

    // schedule click 1 a little in the future so that click 2 doesn't come right after the late click 1
    now += .5

    // Schedule 15 minutes of iterations
    // This seem to go bad if I schedule TOO many (race condition?)
    // I couldn't figure out a way to do this where the metronome would never run out. 
    var iterations = 15 * my_bpm_input.value

    // how much time from one click to the next
    var interval_in_seconds = 60.0 / my_bpm_input.value

    for (var i = 0; i < iterations; i++) {
        // calc how loud, calc if this beat should be the louder "accented" beat
        if (beats == "1") {
            volume = my_volume_input.value
            volume = volume / 10.0 // normal loudness
        }
        else {
            volume = calc_accented_volume(beats)
        }

        schedule_one_click(now + (i * interval_in_seconds), volume)
    }

}

function stop_playing() {
    running = false
    var time = audio_context.currentTime
    gain.gain.cancelScheduledValues(time)
    gain.gain.setValueAtTime(0, time)
}

function schedule_one_click(time, volume) {
    gain.gain.cancelScheduledValues(time)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(volume, time + .001);
    gain.gain.linearRampToValueAtTime(0, time + .001 + .01);
}



function change_frequency(el) {
    oscillator.frequency.value = el.value
    stop_start()
}

function change_bpm() {
    stop_start()
}

function change_beats(el) {
    beats = el.value
    stop_start()
}

function increment_bpm(increment) {
    // put focus back to play/stop otherwise spacebar affects last pressed button
    //my_play_button.focus()
    my_bpm_input.value = parseInt(my_bpm_input.value) + increment
    change_bpm()
    // so that the spacebar keeps working
    my_play_button.focus()
}