// import * as authService from '../services/authService.js';
// import * as authView from '../views/authView.js';
import { initAuthUI, showError, showLogoutButton } from '../views/authView.js';
import { login, signup, logout } from '../services/authService.js';
import { getActiveTask } from '../services/taskService.js'; 
import { pauseActiveTask, initTaskController, renderTables } from './taskController.js';

export function initAuth(){
        initAuthUI({
            login : ({ email, password }) => {
                console.log('loginclicked');
                const user = login(email, password);
                console.log('user', user)
                if(!user){
                    showError('login', 'Invalid email or password');
                    return;
                }

                const mainSidebar = document.querySelector('.sidebar-aside');
                const mainNav = document.querySelector('.main-nav');
                const loginPage = document.getElementById('login-page');
                const mainContent = document.querySelector('main');
                const dashboardPage = document.getElementById('dashboard-page');
                const otherPages = document.querySelectorAll('main > .page');


                if (mainSidebar) mainSidebar.classList.remove('hidden');
                if (mainNav) mainNav.classList.remove('hidden');
                if (mainContent) mainContent.classList.remove('hidden');
                if (loginPage) loginPage.classList.remove('active');
                otherPages.forEach(page => page.classList.remove('active'));
                if (dashboardPage) dashboardPage.classList.add('active');

                
                initTaskController();
                renderTables();

            },
            signup: ( userData ) => {
                const newUser =  signup(userData);
               if(!newUser){
                    showError('signUp', 'user exxists');
                    return;
                }

                const mainSidebar = document.querySelector('.sidebar-aside');
                const mainNav = document.querySelector('.main-nav');
                const loginPage = document.getElementById('login-page');
                const mainContent = document.querySelector('main');
                const dashboardPage = document.getElementById('dashboard-page');
                const otherPages = document.querySelectorAll('main > .page');


                if (mainSidebar) mainSidebar.classList.remove('hidden');
                if (mainNav) mainNav.classList.remove('hidden');
                if (mainContent) mainContent.classList.remove('hidden');
                if (loginPage) loginPage.classList.remove('active');
                otherPages.forEach(page => page.classList.remove('active'));
                if (dashboardPage) dashboardPage.classList.add('active');

            
                initTaskController();
                renderTables();
            }
        });

        showLogoutButton(() => {
            
            const activeTask = getActiveTask();
            if (activeTask) {
                pauseActiveTask();
            }

            logout();
            const mainSidebar = document.querySelector('.sidebar-aside');
            const mainNav = document.querySelector('.main-nav');
            const loginPage = document.getElementById('login-page');
            const mainContent = document.querySelector('main');
            const otherPages = document.querySelectorAll('main > .page');

            if (mainSidebar) mainSidebar.classList.add('hidden');
            if (mainNav) mainNav.classList.add('hidden');
            if (mainContent) mainContent.classList.add('hidden');
            if (loginPage) loginPage.classList.add('active');
            otherPages.forEach(page => page.classList.remove('active'));
        });
}
