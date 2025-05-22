import { todayISO } from "../utils/dateUtils.js";
import {
    loadTasks as loadFromStorage,
    saveTasks as saveToStorage,
    saveActiveTaskId,
    loadActiveTaskId,
    removeActiveTaskId
} from "../storage.js";

// export function getTasks(){
//     try{
//         return JSON.parse(localStorage.getItem('tasks')) || [];
//     }catch(e){
//         console.error('Failed to get task from local Storage', e)
//         return [];
//     }
// }

export function getTasks(){
    return loadFromStorage();
}

// export function saveTasks(tasks){
//     localStorage.setItem('tasks', JSON.stringify(tasks));
// }

function saveTasks(tasks){
    saveToStorage(tasks);
}

export function addTask(task){
    // const tasks = getTasks();
    const tasks = getTasks();
    const newTask = { ...task, id:Date.now().toString() };
    // task.id = Date.now().toString();
    tasks.push(newTask);
    saveTasks(tasks);
}

export function updateTask(updatedTask){
    // const tasks = getTasks();
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
    // localStorage.setItem('activeTaskId', id);
    saveActiveTaskId(id);
}

export function clearActiveTask(){
    // localStorage.removeItem('activeTaskId');
    removeActiveTaskId(id);
}

export function getActiveTaskId(){
    // return localStorage.getItem('activeTaskId');
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
