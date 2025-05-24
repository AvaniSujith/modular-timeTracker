//taskController.js
import * as taskService from '../services/taskService.js';
import * as taskView from '../views/taskView.js';
import { setActiveTask, getActiveTaskId, clearActiveTask, getTaskById } from '../services/taskService.js';
import { setOngoingTask, clearOngoingTaskDisplay, updateDashboardStatus} from '../views/taskView.js';
import { timerStart, timerPause, timerEnd, resetTimerDisplay, setTimerState, getCurrentTime } from '../timer.js';
import { saveTimerState, loadTimerStateForTask } from '../storage.js';

let startTimerBtn;
let pauseTimerBtn;
let endTimerBtn;
let addTaskBtn;


function updateTimerButtonState(hasActiveTask, isPaused = false) {
    if (startTimerBtn && pauseTimerBtn && endTimerBtn) {
        if (hasActiveTask) {
            startTimerBtn.disabled = !isPaused;
            pauseTimerBtn.disabled = isPaused; 
            endTimerBtn.disabled = false;
        } else {
            startTimerBtn.disabled = true; 
            pauseTimerBtn.disabled = true; 
            endTimerBtn.disabled = true;
        }
    }
}

function updateAddTaskButtonState(hasActiveTask) {
    if (addTaskBtn) {
        addTaskBtn.disabled = hasActiveTask;
    }
}

export function renderTables(){
    const tasks = taskService.getTasks();

    console.log("renderTables: Tasks fetched from taskService.getTasks():", tasks);

    const paused = tasks.filter(t => t.status === 'paused');
    const completed = tasks.filter(t => t.status === 'completed');

    taskView.renderPausedTable(paused, handleMoreClick);
    taskView.renderCompletedTable(completed, handleMoreClick);

    updateDashboardStatus();
}


function handleMoreClick(taskId){
    console.log("handleMoreClick called with taskId:", taskId);
    
    taskView.showDetailsModal(taskId, {
        resume: () => {

            console.log("Resume action for task:", taskId);

            const currentActiveId = getActiveTaskId();
            if(currentActiveId && currentActiveId !== taskId){
                const currentTask = taskService.getTaskById(currentActiveId);
                if(currentTask){
                    saveTimerState(currentTask); 
                }
                timerPause();
            }

            taskService.resumeTask(taskId); 
            const resumedTask = taskService.getTaskById(taskId);

            if(resumedTask){

                setOngoingTask(resumedTask);

                // const { hours, minutes, seconds } = loadTimerStateForTask(resumedTask);
                // setTimerState(hours, minutes, seconds);

                setTimerState(0, 0, 0);
                resetTimerDisplay();
                
                timerStart();
                updateTimerButtonState(true, false);
                updateAddTaskButtonState(true); 
            }
            renderTables();
        },

        edit : (updatedData) => {
            
            console.log("Edit action called with:", updatedData);
            
            const oldTask = taskService.getTaskById(taskId);
            console.log("Old task before update:", oldTask);
            
            const updatedTask = taskService.updateTask(updatedData);
            console.log("Updated task after save:", updatedTask);

            if(!updatedTask){
                console.error("failed to update Task");
                return;
            }

            
            if (oldTask && oldTask.status !== updatedTask.status) {
                if (oldTask.status === 'ongoing') {
                    
                    saveTimerState(oldTask);

                    timerPause();
                    clearOngoingTaskDisplay();
                    clearActiveTask();
                    resetTimerDisplay();
                    updateTimerButtonState(false);
                    updateAddTaskButtonState(false);
                }

                if (updatedTask.status === 'ongoing') {
                    
                    const tasks = taskService.getTasks();
                    const otherOngoing = tasks.find(t => t.id !== taskId && t.status === 'ongoing');
                    
                    if(otherOngoing){
                        
                        saveTimerState(otherOngoing);
                        otherOngoing.status = 'paused';
                        taskService.updateTask(otherOngoing);
                    }
                    
                    setActiveTask(updatedTask.id);
                    
                    setOngoingTask(updatedTask);
                    const { hours, minutes, seconds } = loadTimerStateForTask(updatedTask);
                    setTimerState(hours, minutes, seconds);
                    timerStart();
                    updateTimerButtonState(true, false);
                    updateAddTaskButtonState(true);

                }else if(updatedTask.status === 'completed' && !updatedTask.endDate) {
                    
                    updatedTask.endDate = new Date().toISOString().split("T")[0];
                    taskService.updateTask(updatedTask);
                }
            } else if (updatedTask.status === 'ongoing') {
                
                setOngoingTask(updatedTask);

            }

            renderTables();
        },

        complete : () => {
            console.log("Complete action for task:", taskId);
            const wasActive = getActiveTaskId() === taskId;
            // taskService.completeTask(taskId);

            if (wasActive) {
                
                const activeTask = taskService.getTaskById(taskId);
                if(activeTask){
                     saveTimerState(activeTask);
                }

                clearOngoingTaskDisplay();
                timerEnd();
                resetTimerDisplay();
                updateTimerButtonState(false);
                updateAddTaskButtonState(false);
            }

            taskService.completeTask(taskId); 
            renderTables();
        },

        del : () => {
            console.log("Delete action for task:", taskId);
            const wasActive = getActiveTaskId() === taskId;

            if (wasActive) {
                
                clearOngoingTaskDisplay();
                timerEnd();
                resetTimerDisplay();
                updateTimerButtonState(false);
                updateAddTaskButtonState(false);
            }

            taskService.deleteTask(taskId);
            renderTables();
        }
    });
}


export function initTaskController(timerBtns, addBtn) {
    startTimerBtn = timerBtns.startBtn;
    pauseTimerBtn = timerBtns.pauseBtn;
    endTimerBtn = timerBtns.endBtn;
    addTaskBtn = addBtn;

    
    const activeTaskId = getActiveTaskId();
    if (activeTaskId) {
        const activeTask = getTaskById(activeTaskId);
        if (activeTask && activeTask.status === 'ongoing') {
            setOngoingTask(activeTask);
            const { hours, minutes, seconds } = loadTimerStateForTask(activeTask);
            setTimerState(hours, minutes, seconds);
            timerStart();
            updateTimerButtonState(true, false);
            updateAddTaskButtonState(true);

        }else if(activeTask && activeTask.status === 'paused'){
            setOngoingTask(activeTask);
            const { hours, minutes, seconds } = loadTimerStateForTask(activeTask);
            setTimerState(hours, minutes, seconds);
            updateTimerButtonState(true, true);
            updateAddTaskButtonState(true);
        
        } else {
            
            clearActiveTask();
            clearOngoingTaskDisplay();
            resetTimerDisplay();
            updateTimerButtonState(false);
            updateAddTaskButtonState(false);
        }
    } else {
        clearOngoingTaskDisplay();
        resetTimerDisplay();
        updateTimerButtonState(false);
        updateAddTaskButtonState(false);
    }


    // document.getElementById('addTaskBtn').addEventListener('click', () => {
    //     taskView.showNewTaskModal((formData) => {
    //         console.log("New task form data:", formData);
    //         const newTask = taskService.addTask(formData);
    //         console.log("New task created:", newTask);

    //         if (newTask && newTask.status === 'ongoing') {
    //             setActiveTask(newTask.id);
    //             setOngoingTask(newTask);
    //             timerStart();
    //             updateTimerButtonState(true);
    //             updateAddTaskButtonState(true);
    //         }

    //         renderTables();
    //     });
    // });

    // renderTables();

    const addTaskButton = document.getElementById('addTaskBtn');
    if(addTaskButton){
        addTaskButton.addEventListener('click', ()=>{
            taskView.showNewTaskModal((formData) => {
                console.log("new task form data", formData);

                const currentActiveId = getActiveTaskId();
                if(currentActiveId){
                    const currentTask = getTaskById(currentActiveId);
                    if(currentTask){
                        saveTimerState(currentTask); 
                        currentTask.status = 'paused';
                        taskService.updateTask(currentTask); 
                    }

                    timerPause();
                    clearActiveTask(); 

                }


                const newTask = taskService.addTask(formData);
                console.log("new task created", newTask);

                if(newTask && newTask.status === 'ongoing'){
                    setActiveTask(newTask.id);
                    setOngoingTask(newTask);
                    resetTimerDisplay();
                    timerStart();
                    updateTimerButtonState(true, false);
                    updateAddTaskButtonState(true);
                }else{
                    resetTimerDisplay();
                    updateTimerButtonState(false);
                    updateAddTaskButtonState(false);
                }

                renderTables();
            });
        });
    }

    renderTables();

    updateDashboardStatus();
}


export function pauseActiveTask() {
    const activeTaskId = getActiveTaskId();
    if (!activeTaskId) return;

    const activeTask = getTaskById(activeTaskId);
    if (activeTask) {
        
        saveTimerState(activeTask);
        activeTask.status = 'paused';
        taskService.updateTask(activeTask);

        timerPause();
        clearOngoingTaskDisplay();
        clearActiveTask();

        updateTimerButtonState(true, true); 
        updateAddTaskButtonState(false);

        renderTables();

        updateDashboardStatus();
    }
}

export function completeActiveTask() {
    const activeTaskId = getActiveTaskId();
    if (!activeTaskId) return;

    const activeTask = getTaskById(activeTaskId);
    if (activeTask) {
        
        saveTimerState(activeTask);
        activeTask.status = 'completed';
        activeTask.endDate = new Date().toISOString().split("T")[0];
        taskService.updateTask(activeTask);

        timerEnd();
        clearOngoingTaskDisplay();
        clearActiveTask();
        resetTimerDisplay();

        updateTimerButtonState(false);
        updateAddTaskButtonState(false);

        renderTables();
        updateDashboardStatus();

    }
}
