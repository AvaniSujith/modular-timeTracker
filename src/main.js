import { initAuth } from "./controllers/authController.js";
import { initFilterController } from "./controllers/filterController.js";
import { initTaskController } from "./controllers/taskController.js";
import { updateTimerDisplay } from "./timer.js";
import { createGraph } from "./analytics.js";
import { handlingNavLinks, sideBarToggler } from "./ui.js";
import * as authService from './services/authService.js';
import { initializeTimer } from "./timer.js";

window.onload = () => {
    console.log("window.onload fired in main.js");

    const mainSidebar = document.querySelector('.sidebar-aside');
    const mainNav = document.querySelector('.main-nav');
    const loginPage = document.getElementById('login-page');
    const mainContent = document.querySelector('main');
    const otherPages = document.querySelectorAll('main > .page');


    console.log("Sidebar element:", mainSidebar);
    console.log("Main nav element:", mainNav);
    console.log("Login page element:", loginPage);
    console.log("Main content element:", mainContent);
    console.log("Other pages elements:", otherPages);


    // Initially hide protected content and show login page
    if (mainSidebar) mainSidebar.classList.add('hidden');
    if (mainNav) mainNav.classList.add('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (loginPage) loginPage.classList.add('active');
    otherPages.forEach(page => page.classList.remove('active'));


    initializeTimer({
        timerEl: document.getElementById('timer'),
        startBtn: document.getElementById('startTimerBtn'),
        pauseBtn : document.getElementById('pauseTimerBtn'),
        endBtn: document.getElementById('endTimerBtn'),
    });

    initAuth();
    initTaskController();
    initFilterController();

    handlingNavLinks();
    updateTimerDisplay();
    createGraph();
    sideBarToggler();
};
