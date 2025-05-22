export let timer = null;
let seconds = 0;
let minutes = 0; 
let hours = 0;


export function initializeTimer({ timerEl, startBtn, pauseBtn, endBtn }){
    timerDisplay = timerEl;
    startTimerBtn = startBtn;
    pauseTimerBtn = pauseBtn;
    endTimerBtn = endBtn;

    updateTimerDisplay();

}

let timerDisplay;
let startTimerBtn;
let pauseTimerBtn;
let endTimerBtn;


export function timerStart(){

    if(timer) return;
    timer = setInterval(updateTimerDisplay, 1000);

    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    endTimerBtn.disabled = false;

}

export function timerPause(){
    clearInterval(timer);
    timer = null;

    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    endTimerBtn.disabled = false;
}

export function timerEnd(){

    clearInterval(timer);
    timer = null;
    seconds = 0; 
    minutes = 0;
    hours = 0;
    timerDisplay.textContent = "00:00:00";

    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    endTimerBtn.disabled = true;

}


export function updateTimerDisplay(){
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function setTimerState(h, m, s) {
    hours = h;
    minutes = m;
    seconds = s;
    updateTimerDisplay(); // Update display immediately after setting state
}


export function resetTimerDisplay(){
    seconds = 0; 
    minutes = 0;
    hours = 0;

    timerDisplay.textContent = "00:00:00";
}
