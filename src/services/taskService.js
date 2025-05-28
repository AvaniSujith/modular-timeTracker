
import { todayISO } from "../utils/dateUtils.js";

import {
    loadTasks as loadFromStorage,
    saveTasks as saveToStorage,
    saveActiveTaskId,
    loadActiveTaskId,
    removeActiveTaskId
} from "../storage.js";

import { getCurrentUser } from "./authService.js";

export function getTasks(){
    const currentUser = getCurrentUser(); 

    if (!currentUser) {
        console.log("getTasks: No current user");
        return []; 
    }
    const tasks = loadFromStorage(currentUser.email);
    console.log("Loaded task:", tasks);
    return tasks;
}

function saveTasks(tasks){
    const currentUser = getCurrentUser(); 
    if (!currentUser) return; 

    console.log("saveTasks:", tasks)
    saveToStorage(currentUser.email, tasks); 
}

export function addTask(task){
    const tasks = getTasks();
    const newTask = { 
        ...task, 
        id:Date.now().toString(),
        timeFragments: [],
        timeTaken: "00:00:00",
        totalSeconds: 0
    };
    tasks.push(newTask);
    saveTasks(tasks);
    console.log("addTask:", newTask);
    return newTask;
}

export function updateTask(updatedTask){
    console.log("updatedTask: ", updatedTask)
    const tasks = getTasks()
    const idx = tasks.findIndex(t => t.id === updatedTask.id);
    if(idx !== -1){
        // tasks[idx] = updatedTask;
        tasks[idx] = { ...tasks[idx], ...updatedTask };
        saveTasks(tasks);
        console.log("updateTask: ", tasks[idx]);
        return tasks[idx];
    }else{
        console.error("updatedTask not found ", updatedTask.id );
        return null;
    }
}

export function deleteTask(id){
    console.log("deleted task", id); 
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);

    const activeTaskId = getActiveTaskId();

    if (activeTaskId === id) {
        clearActiveTask();
    }
}


export function getActiveTask(){
    return getTasks().find(t => t.status === 'ongoing') || null;
}

export function setActiveTask(id){
    console.log("setArchive: setting active task id", id);
    saveActiveTaskId(id);
}

export function clearActiveTask(){
    console.log("clearActiveTask:")
    removeActiveTaskId();
}

export function getActiveTaskId(){
    const activeId = loadActiveTaskId();
    console.log("getActiveTaskId", activeId)
    return activeId;
}


export function getTaskById(id){
    const task = getTasks().find(task => task.id === id) || null;
    console.log("getTaskById", id, ":", task);
    return task;
}

export function resumeTask(id){
    console.log("resumeTask", id);
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if(task){
        
        const ongoingTask = tasks.find(t => t.status === 'ongoing');
        if (ongoingTask && ongoingTask.id !== id) {
            console.log("resumeTask", ongoingTask.id)
            ongoingTask.status = 'paused';
        }

        task.status = 'ongoing';
        saveTasks(tasks);
        setActiveTask(id); 

        console.log("resumeTaks:", task);
        return task;
    }else{
        console.log("resumeTask: task not found", id)
        return null;
    }
}

export function completeTask(id){
    console.log("completedTask", id);

    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if(task){
        task.status = 'completed';
        task.endDate = todayISO();
        saveTasks(tasks);
        
        const activeTaskId = getActiveTaskId();
        if (activeTaskId === id) {
            clearActiveTask();
        }
        console.log("completedTask", task);
        return task;   
    }else{
        console.error("completeTask", id);
        return null;
    }
}

export function updateTotalTime(task){
    const totalSeconds = calculateTotalSeconds(task.timeFragments);
    task.totalSeconds = totalSeconds;

    if(totalSeconds === 0){
        task.timeTaken = "00:00:00";
        return;
    }

    const hr = Math.floor(totalSeconds / 3600);
    const min = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    task.timeTaken = `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getDashboardStatus(){
    const tasks = getTasks();

    const pausedCount = tasks.filter(t => t.status === "paused").length;
    const completedCount = tasks.filter( t => t.status === "completed").length;
    const totalCount = tasks.length;


    let totalSeconds = 0;
    tasks.forEach(task => {
        totalSeconds += task.totalSeconds || 0;
    });

    
    const totalHoursFormatted = formatSecondsToHHMMSS(totalSeconds);

    console.log("getDashborad - total seconds", totalSeconds, "total time formatted", totalHoursFormatted);

    return{
        pausedCount,
        completedCount,
        totalCount,
        totalTimeFormatted: totalHoursFormatted
    };

}


function formatSecondsToHHMMSS(totalSeconds) {
    const hr = Math.floor(totalSeconds / 3600);
    const min = Math.floor((totalSeconds % 3600) / 60);
    const sec = totalSeconds % 60;

    return `${hr.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}


export function calculateTotalSeconds(timeFragments){
    if(!timeFragments || timeFragments.length === 0){
        return 0;
    }

    let totalSeconds = 0;
    timeFragments.forEach(fragment => {
        if(fragment.duration && typeof fragment.duration === 'string'){
            const parts = fragment.duration.split(":").map(Number);

            const hr = parts[0] || 0;
            const min = parts[1] || 0
            const sec = parts[2] || 0;

            totalSeconds += hr * 3600 + min * 60 + sec;
        }
    });

    return totalSeconds;
}
