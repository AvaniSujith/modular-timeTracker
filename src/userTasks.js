export function loadUserTasks(email){
    const userKey = `tasks_${email}`;
    const tasks = JSON.parse(localStorage.getItem(userKey)) || [];

    return tasks; 
}


export function initializeUserTasks(email){
    const userKey = `tasks_${email}`;
    localStorage.setItem(userKey, JSON.stringify([]));
    
}


export function saveUserTasks(email, tasks) {
    const userKey = `tasks_${email}`;
    localStorage.setItem(userKey, JSON.stringify(tasks));
}