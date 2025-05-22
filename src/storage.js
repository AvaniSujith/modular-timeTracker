import { addTimes } from "./utils/timeUtils.js";

export function saveItem(key, data){
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadItem(key){
    try{
        return JSON.parse(localStorage.getItem(key));
    }catch{
        return null;
    }
}

export function removeItem(key){
    localStorage.removeItem(key);
}

export function saveTasks(tasks){
    saveItem('tasks', tasks);
}

export function loadTasks(){
    return loadItem('tasks') || [];
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

    if (!task) return;
    
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
    

    const tasks = loadTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if(idx !== -1){
        tasks[idx] = task;
        saveTasks(tasks);
    }
}

export function updateTaskCounters(totalTimeElement){
    
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
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


// export function renderPausedTaskTable(){
//     const pausedTableBody = document.getElementById('pausedTaskTableBody');
//     if(!pausedTableBody) return;

//     pausedTableBody.innerHTML = "";

//     const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     const pausedTasks = tasks.filter(t => t.status === "paused");

//     pausedTasks.forEach(task => {

//         const row = document.createElement("tr");
//         const timeFragmentsHtml = formatTimeFragment(task.timeFragments);

//         row.innerHTML = `
        
//             <td>${task.name}</td>
//             <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
//             <td><span class="tag-badge">${task.tag}</span></td> 
//             <td>${task.startDate}</td>
//             <td>${task.targetDate || "--"}</td>
//             <td>${task.timeTaken || "00:00:00"}</td>
//             <td>${timeFragmentsHtml}</td>
//             <td>
//                 <button class="action-btn more-btn" onclick="showDetailsModal('${task.id}')">More</button>
//             </td>  
//         `;

//         pausedTableBody.appendChild(row);
//     });
// }



// function addTimes(time1, time2){
//     const [hours1, minutes1, seconds1] = time1.split(':').map(Number);
//     const [hours2, minutes2, seconds2] = time2.split(':').map(Number);

//     let totalSeconds = seconds1 + seconds2;
//     let totalMinutes = minutes1 + minutes2 + Math.floor(totalSeconds / 60);
//     totalSeconds %= 60;

//     let totalHours = hours1 + hours2 + Math.floor(totalMinutes / 60);
//     totalMinutes %= 60;

//     return `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
// }
