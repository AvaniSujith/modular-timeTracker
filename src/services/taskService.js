import { todayISO } from "../utils/dateUtils.js";
import {
    loadTasks as loadFromStorage,
    saveTasks as saveToStorage,
    saveActiveTaskId,
    loadActiveTaskId,
    removeActiveTaskId
} from "../storage.js";
import { getCurrentUser } from "./authService.js"; // Import getCurrentUser

export function getTasks(){
    const currentUser = getCurrentUser(); // Get current user
    if (!currentUser) return []; // Return empty array if no user
    return loadFromStorage(currentUser.email); // Load tasks for current user
}

function saveTasks(tasks){
    const currentUser = getCurrentUser(); // Get current user
    if (!currentUser) return; // Do not save if no user
    saveToStorage(currentUser.email, tasks); // Save tasks for current user
}

export function addTask(task){
    const tasks = getTasks();
    const newTask = { ...task, id:Date.now().toString() };
    tasks.push(newTask);
    saveTasks(tasks);
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
}


export function getActiveTask(){
    return getTasks().find(t => t.status === 'ongoing') || null;
}

export function setActiveTask(id){
    saveActiveTaskId(id);
}

export function clearActiveTask(){
    // The original code had removeActiveTaskId(id), but removeActiveTaskId in storage.js
    // does not take an argument. Correcting to call without argument.
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
        task.status = 'ongoing';
        saveTasks(tasks);
    }
}

export function completeTask(id){
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if(task){
        task.status = 'completed';
        task.endDate = todayISO();
        saveTasks(tasks);
    }
}
