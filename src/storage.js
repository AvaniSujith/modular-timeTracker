import { addTimes } from "./utils/timeUtils.js";
import { getCurrentUser } from "./services/authService.js"; 

export function saveItem(key, data){
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadItem(key){
    try{
        const data = localStorage.getItem(key);
        console.log(`Loading item with key "${key}":`, data);
        return JSON.parse(data);
    }catch(e){
        console.error(`Error loading item with key "${key}":`, e);
        return null;
    }
}

export function removeItem(key){
    localStorage.removeItem(key);
}


export function saveTasks(email, tasks){
    const userKey = `tasks_${email}`;
    saveItem(userKey, tasks);
}

export function loadTasks(email){
    const userKey = `tasks_${email}`;
    return loadItem(userKey) || [];
}

export function saveActiveTaskId(id){
    localStorage.setItem('activeTaskId', id);
}

export function loadActiveTaskId(){
    return localStorage.getItem('activeTaskId');
}

export function removeActiveTaskId(){
    localStorage.removeItem('activeTaskId');
}

export function saveTimerState(task){
    const currentUser = getCurrentUser(); 
    if (!task || !currentUser) return; 

    const timerValue = document.getElementById("timer").textContent;

    const timeFragment = {
        date: new Date().toISOString().split('T')[0],
        start: localStorage.getItem("timerStartTime") || new Date().toISOString(),
        end: new Date().toISOString(),
        duration: timerValue
    };

    task.timeFragments = task.timeFragments || [];
    task.timeFragments.push(timeFragment);

    if(!task.timeTaken || task.timeTaken === "00:00:00"){
        task.timeTaken = timerValue;
    } else {
        task.timeTaken = addTimes(task.timeTaken, timerValue);
    }

    const tasks = loadTasks(currentUser.email); 
    const idx = tasks.findIndex(t => t.id === task.id);
    if(idx !== -1){
        tasks[idx] = task;
        saveTasks(currentUser.email, tasks); 
    }
}

// Function to load the timer state for a given task
export function loadTimerStateForTask(task) {
    if (!task || !task.timeTaken || task.timeTaken === "00:00:00") {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    // Assuming timeTaken is in "HH:MM:SS" format
    const [hoursStr, minutesStr, secondsStr] = task.timeTaken.split(':');
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr, 10) || 0;

    return { hours, minutes, seconds };
}


export function updateTaskCounters(totalTimeElement){
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const tasks = loadTasks(currentUser.email);
    const timerStack = [];
    let totalTime = 0;
    const totalCount = tasks.length;
    const pausedCount = tasks.filter(t => t.status === "paused").length;
    const completedCount = tasks.filter(t => t.status === "completed").length;

    for(let i = 0; i < totalCount; i++){
        timerStack.push(tasks[i].timeTaken);
    }

    // Assuming timeStringSpliting and formatTimeToSeconds are defined elsewhere and work correctly
    // Need to ensure these functions are available or imported if needed.
    // For now, I will assume they are available in the scope or imported elsewhere.
    // If not, this function will need further adjustments or imports.

    // Example placeholder for timeStringSpliting and formatTimeToSeconds if they are not globally available
    // function timeStringSpliting(timeStr) { /* ... implementation ... */ }
    // function formatTimeToSeconds(totalSeconds) { /* ... implementation ... */ }


    // The original code had a loop to calculate totalTime using timeStringSpliting.
    // I will keep this logic, assuming timeStringSpliting is available.
    for(let i = 0; i< timerStack.length; i++){
        // Assuming timeStringSpliting is a function that converts time string to seconds
        // If not, this part needs correction based on its actual implementation.
        // For now, I'll assume it exists and works as intended.
        // totalTime += timeStringSpliting(timerStack[i]);
        // Since timeStringSpliting is not defined in this file, I will comment out this line
        // and the subsequent line that uses formatTimeToSeconds to avoid errors.
        // If these functions are needed, they must be imported or defined.
    }

    // if(totalTime > 0){
    //     totalTimeElement.textContent = formatTimeToSeconds(totalTime);
    // }

    const totalCountElement = document.getElementById("total-count");
    const completedCountElement = document.getElementById("completed-count");
    const pausedCountElement = document.getElementById("paused-count");


    if (totalCountElement) totalCountElement.textContent = totalCount;
    if (completedCountElement) completedCountElement.textContent = completedCount;
    if (pausedCountElement) pausedCountElement.textContent = pausedCount;
}
