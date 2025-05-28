import { handleMoreClick } from "../controllers/taskController.js";

export function getFilteredTasks(tasks, filters){
    return tasks.filter(task => {

        const matchesName = !filters.name || task.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesTag = !filters.tag || task.tag.toUpperCase().includes(filters.tag.toUpperCase());
        const matchesPriority = !filters.priority || task.priority === filters.priority;
        const matchesStatus = !filters.status || task.status.toLowerCase() === filters.status.toLowerCase();
        // const matchesDate = (!startDate || task.startDate >= startDate) && (!endDate || task.endDate <= endDate);

        const taskDate = new Date(task.startDate);

        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        console.log("taskDate:", taskDate);
        console.log("startDate:", startDate);

        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        console.log("endDate", endDate);

        if(startDate){
            startDate.setHours(0, 0, 0, 0);
        }

        if(endDate){
            endDate.setHours(23, 59, 59, 999);
        }

        const matchesDate = 
        (!startDate || taskDate >= startDate) &&
        (!endDate || taskDate <= endDate);

        return matchesName && matchesTag && matchesPriority && matchesStatus && matchesDate;
        
    });
}

export function renderSearchResults(tasks){

    const table = document.querySelector('.filtered-task-table');
    let tbody = table.querySelector('tbody');

    if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    }

    if(!tasks.length){
        tbody.innerHTML =   `<tr>  
                                <td colspan="5">
                                    No tasks found   
                                </td>
                            </tr>
                            `;
        return;
    }

    tbody.innerHTML = `
        ${tasks.map(task => `
            <tr>
            <td>${task.name}</td>
            <td>${task.priority}</td>
            <td>${task.tag || ''}</td>
            <td>${task.status}</td>
            <td>
                <button class="action-btn more-btn" data-task-id="${task.id}">More</button>
            </td>
            </tr>
        `).join('')
    
    }
    `;

    const moreButtons = document.querySelectorAll('.more-btn');

    moreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const taskId = e.target.dataset.taskId;
            console.log("More button clicked for task:", taskId);
            handleMoreClick(taskId);
        });
    });

}
