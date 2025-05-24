// storage.js
export function saveTimerState(task){

    if (!task) return;
    
    const startTime = new Date(localStorage.getItem("timerStartTime") || new Date().toISOString());
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    const durationFormatted = formatTimeToSeconds(durationInSeconds);

    const timeFragment = {
        date: endTime.toISOString().split('T')[0],
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration: durationFormatted
    };

    task.timeFragments = task.timeFragments || [];
    task.timeFragments.push(timeFragment);

    if(!task.timeTaken || task.timeTaken === "00:00:00"){
        task.timeTaken = durationFormatted;
    } else {
        task.timeTaken = addTimes(task.timeTaken, durationFormatted);
    }
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
        tasks[index] = task;
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

export function updateTaskCounters(totalTimeElement){
    
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // console.log(tasks);
    // if(tasks.length > 0){
    //     console.log(typeof tasks[0].duration, tasks[0].duration);
    // } 

    const timerStack = [];
    let totalTime = 0;
    const totalCount = tasks.length;
    const pausedCount = tasks.filter(t => t.status === "paused").length;
    const completedCount = tasks.filter(t => t.status === "completed").length;

    for(let i = 0; i < totalCount; i++){
        timerStack.push(tasks[i].timeTaken);
    }

    for(let i = 0; i< timerStack.length; i++){
        totalTime += timeStringSpliting(timerStack[i]);
    }

    if(totalTime > 0){
        totalTimeElement.textContent = formatTimeToSeconds(totalTime);
    }

    const totalCountElement = document.getElementById("total-count");
    const completedCountElement = document.getElementById("completed-count");
    const pausedCountElement = document.getElementById("paused-count");


    if (totalCountElement) totalCountElement.textContent = totalCount;
    if (completedCountElement) completedCountElement.textContent = completedCount;
    if (pausedCountElement) pausedCountElement.textContent = pausedCount;
}


export function renderPausedTaskTable(){
    const pausedTableBody = document.getElementById('pausedTaskTableBody');
    if(!pausedTableBody) return;

    pausedTableBody.innerHTML = "";

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const pausedTasks = tasks.filter(t => t.status === "paused");

    pausedTasks.forEach(task => {

        const row = document.createElement("tr");
        const timeFragmentsHtml = formatTimeFragment(task.timeFragments);

        row.innerHTML = `
        
            <td>${task.name}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
            <td><span class="tag-badge">${task.tag}</span></td> 
            <td>${task.startDate}</td>
            <td>${task.targetDate || "--"}</td>
            <td>${task.timeTaken || "00:00:00"}</td>
            <td>${timeFragmentsHtml}</td>
            <td>
                <button class="action-btn more-btn" onclick="showDetailsModal('${task.id}')">More</button>
            </td>  
        `;
        pausedTableBody.appendChild(row);
    });
}


function addTimes(time1, time2){
    const [hours1, minutes1, seconds1] = time1.split(':').map(Number);
    const [hours2, minutes2, seconds2] = time2.split(':').map(Number);

    let totalSeconds = seconds1 + seconds2;
    let totalMinutes = minutes1 + minutes2 + Math.floor(totalSeconds / 60);
    totalSeconds %= 60;

    let totalHours = hours1 + hours2 + Math.floor(totalMinutes / 60);
    totalMinutes %= 60;

    return `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
}

function timeStringSpliting(time){
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}

function formatTimeToSeconds(time){
  
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

}

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

export function saveActiveTaskId(id){
    localStorage.setItem('activeTaskId', id);
}

export function loadActiveTaskId(){
    return localStorage.getItem('activeTaskId');
}

export function removeActiveTaskId(){
    localStorage.removeItem('activeTaskId');
}


export function saveTasks(email, tasks){
    const userKey = `tasks_${email}`;
    saveItem(userKey, tasks);
}

export function loadTasks(email){
    const userKey = `tasks_${email}`;
    return loadItem(userKey) || [];
}


export function loadTimerStateForTask(task) {
    if (!task || !task.timeTaken || task.timeTaken === "00:00:00") {
        return { hours: 0, minutes: 0, seconds: 0 };
    }

    const [hoursStr, minutesStr, secondsStr] = task.timeTaken.split(':');
    const hours = parseInt(hoursStr, 10) || 0;
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr, 10) || 0;

    return { hours, minutes, seconds };
}

function formatTimeFragment(fragments){
    if(!Array.isArray(fragments) || fragments.length === 0) return "--";

    const lastThree = fragments.slice(-3);
    return lastThree.map(frag => `${frag.date}: ${frag.duration}`).join("<br>");
}
