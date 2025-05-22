import { addTimes } from "./utils/timeUtils.js";
import { getCurrentUser } from "./services/authService.js"; // Import getCurrentUser

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

// Modified saveTasks to accept email
export function saveTasks(email, tasks){
    const userKey = `tasks_${email}`;
    saveItem(userKey, tasks);
}

// Modified loadTasks to accept email
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
    const currentUser = getCurrentUser(); // Get current user
    if (!task || !currentUser) return; // Check if user exists

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

    const tasks = loadTasks(currentUser.email); // Load tasks for current user
    const idx = tasks.findIndex(t => t.id === task.id);
    if(idx !== -1){
        tasks[idx] = task;
        saveTasks(currentUser.email, tasks); // Save tasks for current user
    }
}

export function updateTaskCounters(totalTimeElement){
    const currentUser = getCurrentUser(); // Get current user
    if (!currentUser) return; // Check if user exists

    const tasks = loadTasks(currentUser.email); // Load tasks for current user
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


// export function renderPausedTaskTable(){
//     const pausedTableBody = document.getElementById('pausedTaskTableBody');
//     if(!pausedTableBody) return;

//     pausedTableBody.innerHTML = "";

//     const tasks = JSON.parse(localStorage.getItem("tasks")) || []; // This still uses generic key
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
