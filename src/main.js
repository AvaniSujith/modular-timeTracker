import { initAuth } from "./controllers/authController.js";
import { initFilterController } from "./controllers/filterController.js";
import { initTaskController, pauseActiveTask, completeActiveTask } from "./controllers/taskController.js"; // Import initTaskController, pauseActiveTask, completeActiveTask
import { createGraph } from "./analytics.js";
import { handlingNavLinks, sideBarToggler } from "./ui.js";
import * as authService from './services/authService.js';
import { initializeTimer, timerStart, timerEnd, resetTimerDisplay } from "./timer.js"; // Import initializeTimer, timerStart, timerEnd, resetTimerDisplay
import { getActiveTask } from "./services/taskService.js"; // Import getActiveTask
import { setOngoingTask, clearOngoingTaskDisplay } from "./views/taskView.js"; // Import setOngoingTask, clearOngoingTaskDisplay

window.onload = () => {
    console.log("window.onload fired in main.js");

    const mainSidebar = document.querySelector('.sidebar-aside');
    const mainNav = document.querySelector('.main-nav');
    const loginPage = document.getElementById('login-page');
    const mainContent = document.querySelector('main');
    const otherPages = document.querySelectorAll('main > .page');
    const addTaskBtn = document.getElementById('addTaskBtn'); // Get Add Task button


    console.log("Sidebar element:", mainSidebar);
    console.log("Main nav element:", mainNav);
    console.log("Login page element:", loginPage);
    console.log("Main content element:", mainContent);
    console.log("Other pages elements:", otherPages);
    console.log("Add Task button:", addTaskBtn);


    // Initially hide protected content and show login page
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

    // Add event listeners for timer control buttons
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', () => {
            // Start timer only if there is an active task
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
            // Call the controller function to pause the active task
            pauseActiveTask();
        });
    }

    if (endTimerBtn) {
        endTimerBtn.addEventListener('click', () => {
            // Call the controller function to complete the active task
            completeActiveTask();
        });
    }


    initAuth();
    initTaskController({ startBtn: startTimerBtn, pauseBtn: pauseTimerBtn, endBtn: endTimerBtn }, addTaskBtn); // Pass button elements
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
