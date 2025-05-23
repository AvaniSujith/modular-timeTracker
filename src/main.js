import { initAuth } from "./controllers/authController.js";
import { initFilterController } from "./controllers/filterController.js";
import { initTaskController, pauseActiveTask, completeActiveTask } from "./controllers/taskController.js"; 
import { createGraph } from "./analytics.js";
import { handlingNavLinks, sideBarToggler } from "./ui.js";
import * as authService from './services/authService.js';
import { initializeTimer, timerStart, timerEnd, resetTimerDisplay } from "./timer.js"; 
import { getActiveTask } from "./services/taskService.js"; 
import { setOngoingTask, clearOngoingTaskDisplay } from "./views/taskView.js"; 

window.onload = () => {
    console.log("window.onload fired in main.js");

    const mainSidebar = document.querySelector('.sidebar-aside');
    const mainNav = document.querySelector('.main-nav');
    const loginPage = document.getElementById('login-page');
    const mainContent = document.querySelector('main');
    const otherPages = document.querySelectorAll('main > .page');
    const addTaskBtn = document.getElementById('addTaskBtn'); 

    // console.log("Sidebar element:", mainSidebar);
    // console.log("Main nav element:", mainNav);
    // console.log("Login page element:", loginPage);
    // console.log("Main content element:", mainContent);
    // console.log("Other pages elements:", otherPages);
    // console.log("Add Task button:", addTaskBtn);

    if (mainSidebar) mainSidebar.classList.add('hidden');
    if (mainNav) mainNav.classList.add('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (loginPage) loginPage.classList.add('active');
    otherPages.forEach(page => page.classList.remove('active'));


    const timerEl = document.getElementById('timer');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const pauseTimerBtn = document.getElementById('pauseTimerBtn');
    const endTimerBtn = document.getElementById('endTimerBtn');

    initializeTimer({ timerEl, startBtn: startTimerBtn, pauseBtn: pauseTimerBtn, endBtn: endTimerBtn });

    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', () => {

            const activeTask = getActiveTask();
            if (activeTask) {
                timerStart();
            } else {
                console.warn("No active task to start timer for.");
            }
        });
    }

    if (pauseTimerBtn) {
        pauseTimerBtn.addEventListener('click', () => {
            pauseActiveTask();
        });
    }

    if (endTimerBtn) {
        endTimerBtn.addEventListener('click', () => {
            completeActiveTask();
        });
    }


    initAuth();
    initTaskController({ startBtn: startTimerBtn, pauseBtn: pauseTimerBtn, endBtn: endTimerBtn }, addTaskBtn);
    initFilterController();

    handlingNavLinks();
    createGraph();
    sideBarToggler();

    // The initial state of the timer and buttons is now handled within initTaskController.
    // Removing redundant logic here.

    // Add event listener to pause the active task when the user leaves the page
    window.addEventListener('beforeunload', () => {
        const activeTask = getActiveTask();
        if (activeTask) {
            pauseActiveTask();
        }
    });
};
