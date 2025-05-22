// import { loadTasks } from "./taskService";

// export function filterTasks({ name = '', tag = '', priority = '', status = '', startDate = '', endDate = ''} = {}){
//     const allTasks = loadTasks();
//     const nameLower = name.trim().toLowerCase();
//     const tagLower = tag.trim().toLowerCase();

//     return allTasks.filter(task => {

//         const matchesName = !name || task.name.toLowerCase().includes(nameLower);
//         const matchesTag = !tag || task.tag.toUpperCase().includes(tagLower);
//         const matchesPriority = !priority || task.priority === priority;
//         const matchesStatus = !status || task.status === status;
//         const matchesDate = (!startDate || task.startDate >= startDate) && (!endDate || task.endDate <= endDate);

//         return matchesName && matchesTag && matchesPriority && matchesStatus && matchesDate;
        
//     });
// }


export function getFilterValues(){
    return {
        name: document.getElementById('filterName')?.value.trim(),
        tag: document.getElementById('filterTag')?.value.trim(),
        priority: document.getElementById('filterPriority')?.value,
        status: document.getElementById('filterStatus')?.value,
        startDate: document.getElementById('filterStartDate')?.value,
        endDate: document.getElementById('filterEndDate')?.value,
    };
}

