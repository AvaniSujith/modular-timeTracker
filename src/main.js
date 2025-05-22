import { initAuth } from "./controllers/authController.js";
import { initFilterController } from "./controllers/filterController.js";
import { initTaskController } from "./controllers/taskController.js";
import { updateTimerDisplay } from "./timer.js";
import { createGraph } from "./analytics.js";
import { handlingNavLinks, sideBarToggler } from "./ui.js";
import * as authService from './services/authService.js';
import { initializeTimer } from "./timer.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = authService.getCurrentUser();
    console.log("Current user:", user);

    const mainSidebar = document.querySelector('.sidebar-aside');
    const mainNav = document.querySelector('.main-nav');
    const loginPage = document.getElementById('login-page');
    const otherPages = document.querySelectorAll('main > .page');

    // console.log("Sidebar element:", mainSidebar);
    // console.log("Main nav element:", mainNav);
    // console.log("Login page element:", loginPage);
    // console.log("Other pages elements:", otherPages);

    if (!user) {
        if (mainSidebar) mainSidebar.style.display = 'none';
        if (mainNav) mainNav.style.display = 'none';
        if (loginPage) loginPage.classList.add('active');
        otherPages.forEach(page => page.classList.remove('active'));
    } else {
        if (mainSidebar) mainSidebar.style.display = '';
        if (mainNav) mainNav.style.display = '';
        if (loginPage) loginPage.classList.remove('active');
        const dashboardPage = document.getElementById('dashboard-page');
        otherPages.forEach(page => page.classList.remove('active'));
        if (dashboardPage) dashboardPage.classList.add('active');
    }

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

});
