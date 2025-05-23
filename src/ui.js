
import { renderCompletedTable, renderPausedTable } from "./views/taskView.js";
import { createGraph } from "./analytics.js";
import { renderTables } from "./controllers/taskController.js"; 

export function handlingNavLinks(){
    const navLinks = document.querySelectorAll('.nav-link[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const targetPage = link.getAttribute('data-page');

            
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            link.parentElement.classList.add('active');

            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            const targetPageElement = document.getElementById(`${targetPage}-page`);
            if(targetPageElement){
                targetPageElement.classList.add('active');
            }

        
            if(targetPage === 'works-done'){
                renderTables(); 
            } else if(targetPage === 'analytics'){
                setTimeout(createGraph, 100);
            } else if(targetPage === 'dashboard') {
                renderTables(); 
            }
        });
    });
}

export function openModal(modalId){
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add("show");
}

export function closeModal(modalId){
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove("show");
}


export function sideBarToggler(){
    const mainSidebar = document.querySelector('.sidebar-aside');
    const toggleBtn = document.querySelector(".toggler");

    if(toggleBtn && mainSidebar){
        toggleBtn.addEventListener("click", () => {
            mainSidebar.classList.toggle("collapse");
            console.log("Sidebar toggled")
        });
    }else{
        console.warn("sidebar btn not found")
    }
}
