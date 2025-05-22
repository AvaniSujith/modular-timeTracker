export function getFilteredTasks(tasks, filters){
    return tasks.filter(task => {

        const matchesName = !filters.name || task.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesTag = !filters.tag || task.tag.toUpperCase().includes(filters.tag.toLowerCase());
        const matchesPriority = !filters.priority || task.priority === filters.priority;
        const matchesStatus = !filters.status || task.status.toLowerCase() === filters.status.toLowerCase();
        // const matchesDate = (!startDate || task.startDate >= startDate) && (!endDate || task.endDate <= endDate);

        const taskDate = new Date(task.createdAt);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        const matchesDate = 
        (!startDate || taskDate >= startDate) &&
        (!endDate || taskDate <= endDate);

        return matchesName && matchesTag && matchesPriority && matchesStatus && matchesDate;
        
    });
}

export function renderSearchResults(tasks){
    const container = document.getElementById('searchResultsContainer');
    container.innerHTML = '';

    if(!tasks.length){
        container.innerHTML = '<p> No tasks found </p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'filtered-task-table';

    table.innerHTML = `
        <thead>
        <tr>
            <th>Task Name</th>
            <th>Priority</th>
            <th>Tag</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        ${tasks.map(task => `
            <tr>
            <td>${task.name}</td>
            <td>${task.priority}</td>
            <td>${task.tag || ''}</td>
            <td>${task.status}</td>
            <td><!-- Add your buttons here --></td>
            </tr>
        `).join('')}
        </tbody>
    `;
    
    container.appendChild(table);
}

