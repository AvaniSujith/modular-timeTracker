
// import { addTimes } from "./utils/timeUtils.js";
import { getCurrentUser } from "./services/authService.js";
import { getDashboardStatus, updateTotalTime} from "./services/taskService.js"; 

export function saveItem(key, data){
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadItem(key){
    try{
        const data = localStorage.getItem(key);
        // console.log(`Loading item with key "${key}":`, data);
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

    if(timerValue === "00:00:00") return;

    const now = new Date();
    const timerStartTime = localStorage.getItem("timerStartTime") || now.toISOString();

    const timeFragment = {
        date: now.toISOString().split('T')[0],
        start: timerStartTime,
        end: now.toISOString(),
        duration: timerValue
    };
 
    task.timeFragments = task.timeFragments || [];
    task.timeFragments.push(timeFragment);

    updateTotalTime(task); 

    localStorage.removeItem("timerStartTime");

    const tasks = loadTasks(currentUser.email);
    const idx = tasks.findIndex(t => t.id === task.id);
    if(idx !== -1){
        tasks[idx] = task; 
        saveTasks(currentUser.email, tasks);
    }
}

export function loadTimerStateForTask(task) {
    // if (!task || !task.timeTaken || task.timeTaken === "00:00:00") {
    //     return { hours: 0, minutes: 0, seconds: 0 };
    // }

    // const [hoursStr, minutesStr, secondsStr] = task.timeTaken.split(':');
    // const hours = parseInt(hoursStr, 10) || 0;
    // const minutes = parseInt(minutesStr, 10) || 0;
    // const seconds = parseInt(secondsStr, 10) || 0;

    // return { hours, minutes, seconds };

    return { hours: 0, minutes: 0, seconds: 0 };
}


export function updateTaskCounters(totalTimeElement){
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const tasks = loadTasks(currentUser.email);
    const { totalCount, pausedCount, completedCount, totalTimeFormatted } = getDashboardStatus(); 

    const totalCountElement = document.getElementById("total-count");
    const completedCountElement = document.getElementById("completed-count");
    const pausedCountElement = document.getElementById("paused-count");


    if (totalTimeElement) {
        
        totalTimeElement.textContent = totalTimeFormatted; 
    }

    if (totalCountElement) totalCountElement.textContent = totalCount;
    if (completedCountElement) completedCountElement.textContent = completedCount;
    if (pausedCountElement) pausedCountElement.textContent = pausedCount;
}
