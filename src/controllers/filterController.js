// import * as taskService from '../services/taskService.js';
// import * as taskView from '../views/taskView.js';

// function init() {
//   const filterSelect = document.getElementById('filter-select');

//   filterSelect.addEventListener('change', () => {
//     const value = filterSelect.value;
//     const tasks = taskService.getTasks();
//     let filtered;

//     if (value === 'all') {
//       filtered = tasks;
//     } else if (value === 'paused' || value === 'completed') {
//       filtered = tasks.filter(t => t.status === value);
//     } else {
//       filtered = tasks.filter(t => t.category === value || t.priority === value);
//     }

//     const paused = filtered.filter(t => t.status === 'paused');
//     const completed = filtered.filter(t => t.status === 'completed');
//     taskView.renderPausedTable(paused);
//     taskView.renderCompletedTable(completed);
//   });
// }

// export default { init };


import { getTasks } from "../services/taskService.js";
import { getFilteredTasks, renderSearchResults } from "../views/filterView.js";
import { getFilterValues } from "../services/filterService.js";

export function initFilterController(){
    const applyBtn = document.getElementById('applyFiltersBtn');
    
    if(applyBtn){
         applyBtn.addEventListener('click', () => {
            const allTasks = getTasks();
            const filters = getFilterValues();
            const filteredTasks = getFilteredTasks(allTasks, filters);
            renderSearchResults(filteredTasks);
        });
    }else{
        console.warn('Apply filter btn not found');
    }
   
}