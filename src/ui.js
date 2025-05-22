
export function handlingNavLinks(){
    const links = document.querySelectorAll(".nav-link"); // Corrected selector
    links.forEach(link => {
        link.addEventListener("click", (event) => { // Added event parameter
            event.preventDefault(); // Prevent default link behavior
            const targetId = link.getAttribute("data-page"); // Corrected attribute

            document.querySelectorAll(".page").forEach(page => {
                page.classList.remove("active");
            });

            document.getElementById(targetId)?.classList.add("active");
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