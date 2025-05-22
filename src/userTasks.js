export function loadUserTasks(email){
    const userKey = `tasks_${email}`;
    const tasks = JSON.parse(localStorage.getItem(userKey)) || [];
    // Removed saving to generic 'tasks' key
    return tasks; // Return the loaded tasks
}


export function initializeUserTasks(email){
    const userKey = `tasks_${email}`;
    localStorage.setItem(userKey, JSON.stringify([]));
    // Removed initializing generic 'tasks' key
}


export function saveUserTasks(email, tasks) {
    const userKey = `tasks_${email}`;
    localStorage.setItem(userKey, JSON.stringify(tasks));
}