import * as taskService from '../services/taskService.js';
import * as taskView from '../views/taskView.js';
import { setActiveTask, getActiveTaskId, clearActiveTask, getTaskById } from '../services/taskService.js';
import { setOngoingTask, clearOngoingTaskDisplay } from '../views/taskView.js';
import { timerStart, timerPause, timerEnd, resetTimerDisplay, setTimerState } from '../timer.js';
import { saveTimerState, loadTimerStateForTask } from '../storage.js';

let startTimerBtn;
let pauseTimerBtn;
let endTimerBtn;
let addTaskBtn;

// Helper function to update the state of timer control buttons
function updateTimerButtonState(hasActiveTask, isPaused = false) {
    if (startTimerBtn && pauseTimerBtn && endTimerBtn) {
        if (hasActiveTask) {
            startTimerBtn.disabled = !isPaused; // Enable start only if paused
            pauseTimerBtn.disabled = isPaused; // Disable pause if paused
            endTimerBtn.disabled = false; // End is always enabled with an active task
        } else {
            startTimerBtn.disabled = true; // Disable start if no active task
            pauseTimerBtn.disabled = true; // Disable pause if no active task
            endTimerBtn.disabled = true; // Disable end if no active task
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
}

// THIS IS THE MISSING FUNCTION
function handleMoreClick(taskId){
    console.log("handleMoreClick called with taskId:", taskId);
    
    taskView.showDetailsModal(taskId, {
        resume: () => {
            console.log("Resume action for task:", taskId);
            taskService.resumeTask(taskId);
            const resumedTask = taskService.getTaskById(taskId);
            if (resumedTask) {
                setOngoingTask(resumedTask);
                const { hours, minutes, seconds } = loadTimerStateForTask(resumedTask);
                setTimerState(hours, minutes, seconds);
                timerStart();
                updateTimerButtonState(true, false); // Task is ongoing, not paused
                updateAddTaskButtonState(true); // Disable Add Task
            }
            renderTables();
        },
        edit : (updatedData) => {
            console.log("Edit action called with:", updatedData);
            
            const oldTask = taskService.getTaskById(taskId);
            console.log("Old task before update:", oldTask);
            
            // CRITICAL: Use the complete updatedData that preserves all fields
            taskService.updateTask(updatedData);
            
            const updatedTask = taskService.getTaskById(taskId);
            console.log("Updated task after save:", updatedTask);

            // Handle status changes
            if (oldTask && oldTask.status !== updatedTask.status) {
                if (oldTask.status === 'ongoing') {
                    timerPause();
                    clearOngoingTaskDisplay();
                    clearActiveTask();
                    updateTimerButtonState(false);
                    updateAddTaskButtonState(false);
                }

                if (updatedTask.status === 'ongoing') {
                    // Pause any other ongoing task first
                    const tasks = taskService.getTasks();
                    const otherOngoing = tasks.find(t => t.id !== taskId && t.status === 'ongoing');
                    if (otherOngoing) {
                        saveTimerState(otherOngoing);
                        otherOngoing.status = 'paused';
                        taskService.updateTask(otherOngoing);
                    }
                    
                    setActiveTask(updatedTask.id);
                    setOngoingTask(updatedTask);
                    timerStart();
                    updateTimerButtonState(true, false);
                    updateAddTaskButtonState(true);
                } else if (updatedTask.status === 'completed' && !updatedTask.endDate) {
                    // Set end date if completed
                    updatedTask.endDate = new Date().toISOString().split("T")[0];
                    taskService.updateTask(updatedTask);
                }
            } else if (updatedTask.status === 'ongoing') {
                // If status is still ongoing, update the display
                setOngoingTask(updatedTask);
            }

            renderTables();
        },
        complete : () => {
            console.log("Complete action for task:", taskId);
            const wasActive = getActiveTaskId() === taskId;
            taskService.completeTask(taskId);
            if (wasActive) {
                clearOngoingTaskDisplay();
                timerEnd();
                updateTimerButtonState(false);
                updateAddTaskButtonState(false);
            }
            renderTables();
        },
        del : () => {
            console.log("Delete action for task:", taskId);
            const wasActive = getActiveTaskId() === taskId;
            taskService.deleteTask(taskId);
            if (wasActive) {
                clearOngoingTaskDisplay();
                timerEnd();
                updateTimerButtonState(false);
                updateAddTaskButtonState(false);
            }
            renderTables();
        }
    });
}

// Modified initTaskController to accept button elements and set initial state
export function initTaskController(timerBtns, addBtn) {
    startTimerBtn = timerBtns.startBtn;
    pauseTimerBtn = timerBtns.pauseBtn;
    endTimerBtn = timerBtns.endBtn;
    addTaskBtn = addBtn;

    // Set initial state based on whether there's an active task
    const activeTaskId = getActiveTaskId();
    if (activeTaskId) {
        const activeTask = getTaskById(activeTaskId);
        if (activeTask) {
            setOngoingTask(activeTask);
            const { hours, minutes, seconds } = loadTimerStateForTask(activeTask);
            setTimerState(hours, minutes, seconds);
            timerStart();
            updateTimerButtonState(true, activeTask.status === 'paused');
            updateAddTaskButtonState(true);
        } else {
            // Handle case where active task ID exists but task data is missing
            clearActiveTask();
            resetTimerDisplay();
            updateTimerButtonState(false);
            updateAddTaskButtonState(false);
        }
    } else {
        resetTimerDisplay();
        updateTimerButtonState(false);
        updateAddTaskButtonState(false);
    }

    // Add Task button event listener
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        taskView.showNewTaskModal((formData) => {
            console.log("New task form data:", formData);
            const newTask = taskService.addTask(formData);
            console.log("New task created:", newTask);

            if (newTask && newTask.status === 'ongoing') {
                setActiveTask(newTask.id);
                setOngoingTask(newTask);
                timerStart();
                updateTimerButtonState(true);
                updateAddTaskButtonState(true);
            }

            renderTables();
        });
    });

    renderTables();
}

// Function to pause the currently active task
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

        updateTimerButtonState(true, true); // Task is paused: enable start/end, disable pause
        updateAddTaskButtonState(false); // Enable Add Task

        renderTables();
    }
}

// Function to complete the currently active task
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

        updateTimerButtonState(false);
        updateAddTaskButtonState(false);

        renderTables();
    }
}