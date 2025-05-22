function timerStart(){
    if(timer) return;

    timer = setInterval(updateTimer, 1000);
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;
    endTimerBtn.disabled = false;
}


function timerPause(){
    clearInterval(timer);
    timer = null;

    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    endTimerBtn.disabled = false;

}


function timerEnd(){
    clearInterval(timer)

    timer = null;
    seconds = 0;
    minutes = 0;
    hours = 0;
    timerDisplay.textContent = "00:00:00";
    
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    endTimerBtn.disabled = true;
}


function updateTimer() {
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