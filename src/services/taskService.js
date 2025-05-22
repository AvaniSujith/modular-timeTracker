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
        console.log("getTasks: No current user, returning empty array.");
        return []; 
    }
    const tasks = loadFromStorage(currentUser.email);
    return tasks;
}

function saveTasks(tasks){
    const currentUser = getCurrentUser(); 
    if (!currentUser) return; 
    saveToStorage(currentUser.email, tasks); 
}

export function addTask(task){
    const tasks = getTasks();
    const newTask = { ...task, id:Date.now().toString() };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

export function updateTask(updatedTask){
    const tasks = getTasks()
    const idx = tasks.findIndex(t => t.id === updatedTask.id);
    if(idx !== -1){
        tasks[idx] = updatedTask;
        saveTasks(tasks);
    }
}

export function deleteTask(id){
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);

    const activeTaskId = getActiveTaskId();
    if (activeTaskId === id) {
        clearActiveTask(); // Clear active task if the deleted task was active
    }
}


export function getActiveTask(){
    return getTasks().find(t => t.status === 'ongoing') || null;
}

export function setActiveTask(id){
    saveActiveTaskId(id);
}

export function clearActiveTask(){
    removeActiveTaskId();
}

export function getActiveTaskId(){
    return loadActiveTaskId();
}


export function getTaskById(id){
    return getTasks().find(task => task.id === id) || null;
}

export function resumeTask(id){
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if(task){
        // Pause any currently ongoing task
        const ongoingTask = tasks.find(t => t.status === 'ongoing');
        if (ongoingTask) {
            ongoingTask.status = 'paused';
            // Assuming saveTimerState is needed here to save the duration of the paused task
            // Need to ensure saveTimerState is imported and correctly implemented to handle this
            // For now, I will just update the status and save tasks.
            // saveTimerState(ongoingTask); // This might need to be called from the controller
        }

        task.status = 'ongoing';
        saveTasks(tasks);
        setActiveTask(id); // Set the resumed task as active
    }
}

export function completeTask(id){
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if(task){
        task.status = 'completed';
        task.endDate = todayISO();
        saveTasks(tasks);
        
        const activeTaskId = getActiveTaskId();
        if (activeTaskId === id) {
            clearActiveTask(); // Clear active task if the completed task was active
        }
    }
}
