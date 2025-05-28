
import { initAuth } from "./controllers/authController.js";
import { initFilterController } from "./controllers/filterController.js";
import { initTaskController, pauseActiveTask, completeActiveTask, renderTables } from "./controllers/taskController.js";
import { getCurrentUser } from "./services/authService.js";
// import { createGraph } from "./analytics.js";
import { handlingNavLinks, sideBarToggler } from "./ui.js";
import { initProfileEdit } from "./views/authView.js";
// import * as authService from './services/authService.js';
import { initializeTimer, timerStart, timerEnd, resetTimerDisplay } from "./timer.js"; 
import { getActiveTask } from "./services/taskService.js"; 
// import { refreshAnalyticsData,createGraph } from "./analytics.js";
// import { setOngoingTask, clearOngoingTaskDisplay } from "./views/taskView.js"; 

import { 
    createGraph,
    refreshAnalyticsData,
    initializeAnalytics,
    convertTasksToGraphData,
    renderGraph
} from "./analytics/analytics.js";

window.onload = () => {
    console.log("window.onload fired in main.js");

    const mainSidebar = document.querySelector('.sidebar-aside');
    const mainNav = document.querySelector('.main-nav');
    const loginPage = document.getElementById('login-page');
    const mainContent = document.querySelector('main');
    const otherPages = document.querySelectorAll('main > .page');
    const addTaskBtn = document.getElementById('addTaskBtn');


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


    // console.log("Sidebar element:", mainSidebar);
    // console.log("Main nav element:", mainNav);
    // console.log("Login page element:", loginPage);
    // console.log("Main content element:", mainContent);
    // console.log("Other pages elements:", otherPages);
    // console.log("Add Task button:", addTaskBtn);


    const currentUser = getCurrentUser();
    console.log("Retrieved currentUser in main.js:", currentUser);

    const isValidUser = currentUser && typeof currentUser === 'object' && currentUser.email;

        if (isValidUser) {
            console.log("Valid user found, showing application UI.");
            if (mainSidebar) mainSidebar.classList.remove('hidden');
            if (mainNav) mainNav.classList.remove('hidden');
            if (mainContent) mainContent.classList.remove('hidden');
            if (loginPage) loginPage.classList.remove('active');
            otherPages.forEach(page => page.classList.remove('active'));
            const dashboardPage = document.getElementById('dashboard-page');
            if (dashboardPage) dashboardPage.classList.add('active');

            
            if (window.innerWidth <= 768) {
                if (mainSidebar) mainSidebar.classList.remove('show-menu');
                const sidebarNav = document.querySelector('.sidebar-nav');
                if (sidebarNav) sidebarNav.classList.remove('show-menu');
            }


            initTaskController({ startBtn: startTimerBtn, pauseBtn: pauseTimerBtn, endBtn: endTimerBtn }, addTaskBtn);
            initFilterController();
            renderTables();

        } else {
            console.log("No valid user found, showing login page.");
            if (mainSidebar) mainSidebar.classList.add('hidden');
            if (mainNav) mainNav.classList.add('hidden');
            if (mainContent) mainContent.classList.add('hidden');
            if (mainSidebar) mainSidebar.classList.add('hidden');
            if (mainNav) {
                mainNav.classList.add('hidden');
                console.log("User not logged in, mainNav hidden. mainNav element:", mainNav);
                console.log("mainNav classList:", mainNav.classList);
            }
            if (mainContent) mainContent.classList.add('hidden');
            if (loginPage) loginPage.classList.add('active');
            otherPages.forEach(page => page.classList.remove('active'));
        }

    console.log("Initializing auth and UI event handlers");
    initAuth(); 

    
    handlingNavLinks();
    sideBarToggler();

    // refreshAnalyticsData();

    window.addEventListener('beforeunload', () => {
        const activeTask = getActiveTask();
        if (activeTask) {
            pauseActiveTask();
        }
    });

    window.addEventListener("DOMContentLoaded", function () {
        const storedTaskList = JSON.parse(localStorage.getItem("taskData")) || [];
        
        // const graphData = convertTasksToGraphData(storedTaskList); 
        // renderGraph(document.getElementById("graph"), graphData);  
        if(storedTaskList.length > 0){
            const graphData = convertTasksToGraphData(storedTaskList);
            const graphElement = document.getElementById("graph");

            if(graphData && graphElement){
                renderGraph(graphElement, graphData);
            }
        }
    });

    setInterval(()=>{
        refreshAnalyticsData();
    }, 30000);

};
