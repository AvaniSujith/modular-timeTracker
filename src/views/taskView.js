import { todayISO } from "../utils/dateUtils.js";
import { formatTimeFragment } from "../utils/timeUtils.js";

export function showNewTaskModal(onSubmit){
    
    const modal = document.createElement("div");
    modal.className = 'modal'; 
    modal.innerHTML = `
            <div class="modal-content">
            <span class="close">&times;</span>
            <h2>New Task</h2>
            <form id="newTaskForm" class="task-form">
                <div class="form-group">
                    <label for="taskName">Task Name</label>
                    <input type="text" id="taskName" placeholder="Enter task name" required>
                </div>

                <div class="form-group">
                    <label for="priority">Priority</label>
                    <select id="priority">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="tag">Tag</label>
                    <input type="text" id="tag" placeholder="Enter tag" required>
                </div>

                <div class="form-group">
                    <label for="startDate">Start Date</label>
                    <input type="date" id="startDate" value="${todayISO()}">
                </div>

                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status">
                        <option value="ongoing">Ongoing</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="targetDate">Target Date to Complete</label>
                    <input type="date" id="targetDate" required>
                </div>

                <div class="form-group">
                    <label for="details">Details</label>
                    <textarea id="details" placeholder="Task details" rows="3"></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" id="addTaskBtnModal" class="btn-primary">Add Task</button>
                    <button type="button" class="btn-secondary close-btn">Cancel</button>
                </div>
            </form>
        </div>

    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector('.close').onclick = () => modal.remove();
    modal.querySelector('.close-btn').onclick = () => modal.remove();


    modal.querySelector('#addTaskBtnModal').onclick = () => {
        const data = {
            name : modal.querySelector('#taskName').value.trim(),
            priority : modal.querySelector('#priority').value,
            tag : modal.querySelector('#tag').value.trim(),
            startDate: modal.querySelector('#startDate').value,
            status : modal.querySelector('#status').value,
            targetDate : modal.querySelector('#targetDate').value,
            details : modal.querySelector('#details').value.trim(),
        };
        onSubmit(data);
        modal.remove();
    };
}


export function renderPausedTable(tasks, onMoreClick){
    const tbody = document.getElementById('pausedTaskTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.name}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
            <td><span class="tag-badge">${task.tag}</span></td> 
            <td>${task.startDate}</td>
            <td>${task.targetDate || "--"}</td>
            <td>${task.timeTaken || "00:00:00"}</td>
            <td>${formatTimeFragment(task.timeFragments)}</td>
            <td>
            <button class="action-btn more-btn")">More</button>
            </td>  
        `;

        row.querySelector('.more-btn').onclick = () => onMoreClick(task.id);
        tbody.appendChild(row);
    });
}


export function renderCompletedTable(tasks, onMoreClick){
    const tbody = document.getElementById('completedTaskTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            
            <td>${task.name}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
            <td><span class="tag-badge">${task.tag}</span></td> 
            <td>${task.startDate}</td>
            <td>${task.targetDate}</td>
            <td>${task.endDate || "--"}</td>
            <td>${task.timeTaken || "00:00:00"}</td>
            <td>
                <button class="action-btn more-btn")">More</button>
            </td>  
        `;

        row.querySelector('.more-btn').onclick = () => onMoreClick(task.id);
        tbody.appendChild(row);    
    });
}


export function showDetailsModal(task, { resume, edit, complete, del }){

    let modal = document.getElementById('taskDetailsModal');
    if(!modal){
        modal = document.createElement('div');
        modal.id = 'taskDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" id="taskDetailsContent"></div>
        `;
        document.body.appendChild(modal);
    }

    const container = document.getElementById('taskDetailsContent');
    container.innerHTML = `
        <span class="close">&times;</span>
        <h2>${task.name}</h2>

        <div class="action-buttons">
            ${task.status === 'paused' ? '<button class="btn-primary" id="btnResume">Resume</button>' : ''}
            <button class="btn-secondary" id="btnEdit">Edit</button>
            ${task.status !== 'completed' ? '<button class="btn-success" id="btnComplete">Complete</button>' : ''}
            <button class="btn-danger" id="btnDelete">Delete</button>
        </div>
    `;

    modal.style.display = 'flex';
    container.querySelector('.close').onclick = () => (modal.style.display = 'none');
    if(task.status === 'paused') container.querySelector('#btnResume').onclick = () => resume(task.id);
    container.querySelector('#btnEdit').onclick = () => edit(task.id);
    if(task.status !== 'completed') container.querySelector('#btnComplete').onclick = () => complete(task.id);
    container.querySelector('#btnDelete').onclick = () => del(task.id);
}

export function editTask(taskId){

     
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(t => t.id === taskId); 
    
    if (!task) return;
    
    const editForm = document.createElement("div");
    editForm.classList.add("modal");
    
    editForm.innerHTML = `
        <div class="modal-content"> 
            <span class="close">&times;</span> 
            <h2>Edit Task</h2>
            
            <form id="editTaskForm" class="task-form"> 
                <div class="form-group">
                    <label for="editTaskName">Task Name</label>
                    <input type="text" id="editTaskName" value="${task.name}" placeholder="Task Name" required>
                </div>

                <div class="form-group">
                    <label for="editPriority">Priority</label>
                    <select id="editPriority">
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
            
                <div class="form-group">
                    <label for="editTag">Tag</label>
                    <input type="text" id="editTag" value="${task.tag}" placeholder="Tag" required>
                </div>
            
                <div class="form-group">
                    <label for="editStatus">Status</label>
                    <select id="editStatus">
                        <option value="ongoing" ${task.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                        <option value="paused" ${task.status === 'paused' ? 'selected' : ''}>Paused</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            
                <div class="form-group">
                    <label for="editTargetDate">Target Completion Date</label>
                    <input type="date" id="editTargetDate" value="${task.targetDate}" required>
                </div>
                
                <div class="form-group">
                    <label for="editDetails">Details</label>
                    <textarea id="editDetails" rows="3">${task.details || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" id="saveTaskBtn" class="btn-primary">Save Changes</button>
                    <button type="button" class="btn-secondary close-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editForm);
    editForm.style.display = "flex";

    editForm.querySelector(".close").addEventListener("click", () => {
        editForm.remove();
    });
    
    editForm.querySelector(".close-btn").addEventListener("click", () => {
        editForm.remove();
    });

    editForm.querySelector("#saveTaskBtn").addEventListener("click", () => {
        updateTaskData(taskId, editForm);
        editForm.remove();
    });

}