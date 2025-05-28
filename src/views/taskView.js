
import { todayISO } from "../utils/dateUtils.js";
import { formatTimeFragment } from "../utils/timeUtils.js";
import * as taskService from '../services/taskService.js';

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
                        <option value="medium" selected>Medium</option>
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
                    <label for="details">Details</label>
                    <textarea id="details" placeholder="Task details" rows="3"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" id="addTaskBtnModal" class="btn-primary">Add Task</button>
                    <button type="button" class="btn-secondary close-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector('.close').onclick = () => modal.remove();
    modal.querySelector('.close-btn').onclick = () => modal.remove();

    modal.querySelector('#newTaskForm').onsubmit = (e) => {
        e.preventDefault();
        const data = {
            name : modal.querySelector('#taskName').value.trim(),
            priority : modal.querySelector('#priority').value,
            tag : modal.querySelector('#tag').value.trim(),
            startDate: modal.querySelector('#startDate').value,
            status : modal.querySelector('#status').value,
            // targetDate : modal.querySelector('#targetDate').value,
            details : modal.querySelector('#details').value.trim(),
        };
        onSubmit(data);
        modal.remove();
    };
}

export function renderPausedTable(tasks, onMoreClick){
    console.log("renderPausedTable called with:", tasks.length, "tasks");
    
    const tbody = document.getElementById('pausedTaskTableBody');
    if(!tbody) {
        console.error("pausedTaskTableBody element not found");
        return;
    }
    tbody.innerHTML = '';

    tasks.forEach(task => {
        console.log("Rendering paused task:", task.id, task.name);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.name}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
            <td><span class="tag-badge">${task.tag}</span></td> 
            <td>${task.startDate}</td>
            <td>${task.timeTaken || "00:00:00"}</td>
            <td>${formatTimeFragment(task.timeFragments)}</td>
            <td>
                <button class="action-btn more-btn" data-task-id="${task.id}">More</button>
            </td>  
        `;

        const moreBtn = row.querySelector('.more-btn');
        moreBtn.onclick = (e) => {
            e.preventDefault();
            // console.log("More button clicked for task:", task.id);
            onMoreClick(task.id);
        };
        tbody.appendChild(row);
    });
}

export function renderCompletedTable(tasks, onMoreClick){
    console.log("renderCompletedTable called with:", tasks.length, "tasks");
    
    const tbody = document.getElementById('completedTaskTableBody');
    if(!tbody) {
        console.error("completedTaskTableBody element not found");
        return;
    }
    tbody.innerHTML = '';

    tasks.forEach(task => {
        console.log("Rendering completed task:", task.id, task.name);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.name}</td>
            <td><span class="priority-badge priority-${task.priority}">${task.priority}</span></td>
            <td><span class="tag-badge">${task.tag}</span></td> 
            <td>${task.startDate}</td>
            <td>${task.endDate || "--"}</td>
            <td>${task.timeTaken || "00:00:00"}</td>
            <td>
                <button class="action-btn more-btn" data-task-id="${task.id}">More</button>
            </td>  
        `;

        const moreBtn = row.querySelector('.more-btn');
        moreBtn.onclick = (e) => {
            e.preventDefault();
            console.log("More button clicked for task:", task.id);
            onMoreClick(task.id);
        };
        tbody.appendChild(row);    
    });
}

export function showDetailsModal(taskId, actions = {}){
    
    console.log("Looking for task ID:", taskId, "Type:", typeof taskId);
    
    const task = taskService.getTaskById(taskId);
    
    if(!task) {
        console.error("Task not found with ID:", taskId);
        console.log("Available tasks:", taskService.getTasks());
        return;
    }

    console.log("Found task:", task);

    const existingModal = document.getElementById("taskDetailsModal");
    if (existingModal) {
        existingModal.remove();
    }

    const modalElement = document.createElement("div");
    modalElement.id = "taskDetailsModal";
    modalElement.classList.add("modal");
    
    modalElement.innerHTML = `
        <div class="modal-content" id="taskDetailsContent">
            <span class="close">&times;</span>
            <h2>${task.name}</h2>
            <div class="task-details">
                <div>
                    <p class="modal-label"><strong>Priority:</strong> </p>
                    <p class="priority-badge priority-${task.priority} modal-description">${task.priority}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>Tag:</strong></p>
                    <p class="tag-badge modal-description">${task.tag}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>Status:</strong></p>
                    <p class="status-badge status-${task.status} modal-description">${task.status}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>Start Date:</strong></p>
                    <p class="start-date modal-description">${task.startDate}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>End Date:</strong></p>
                    <p class="end-date modal-description">${task.endDate || "--"}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>Total Time Taken:</strong></p>
                    <p class="time-taken modal-description">${task.timeTaken || "00:00:00"}</p>
                </div>
                <div>
                    <p class="modal-label"><strong>Description:</strong></p>
                    <p class="task-description modal-description">${task.details || "No description"}</p>
                </div>

                <h3>Time Details</h3>
                <section class="time-fragments">
                    <div class="table-container">
                        <table class="time-fragment-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(task.timeFragments || []).map(f => `
                                    <tr>
                                        <td>${f.date}</td>
                                        <td>${f.duration}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </section>
                
                <div class="action-buttons">
                    ${task.status === "paused" ? `<button class="btn-resume" data-action="resume">Resume Task</button>` : ''}
                    <button class="btn-edit" data-action="edit">Edit Task</button>
                    ${task.status !== "completed" ? `<button class="btn-completed" data-action="complete">Complete Task</button>` : ''}
                    <button class="btn-delete" data-action="delete">Delete Task</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalElement);
    
    const closeBtn = modalElement.querySelector(".close");
    closeBtn.addEventListener("click", () => {
        modalElement.remove();
    });

    modalElement.addEventListener("click", (e) => {
        if (e.target === modalElement) {
            modalElement.remove();
        }
    });

    const actionButtons = modalElement.querySelectorAll("[data-action]");
    actionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const action = button.getAttribute("data-action");
            
            switch(action) {
                case "resume":
                    if (actions.resume) actions.resume();
                    break;
                case "edit":
                    if (actions.edit) {
                        editTask(task.id, actions.edit);
                    }
                    break;
                case "complete":
                    if (actions.complete) actions.complete();
                    break;
                case "delete":
                    if (actions.del) actions.del();
                    break;
            }
            
            modalElement.remove();
        });
    });
    
    modalElement.style.display = "flex";
}

 export function editTask(taskId, onSave) {
    const task = taskService.getTaskById(taskId);
    
    if (!task) {
        console.error("Task not found for editing:", taskId);
        return;
    }
    
    console.log("Editing task:", task);
    
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
        
        const updatedData = {
            ...task, 
            name: editForm.querySelector("#editTaskName").value.trim(),
            priority: editForm.querySelector("#editPriority").value,
            tag: editForm.querySelector("#editTag").value.trim(),
            status: editForm.querySelector("#editStatus").value,
            // targetDate: editForm.querySelector("#editTargetDate").value,
            details: editForm.querySelector("#editDetails").value.trim()
        };
        
        console.log("Saving updated task data:", updatedData);
        console.log("Original task:", task);
        
        if (onSave) {
            onSave(updatedData);
        }
        
        editForm.remove();
    });
}

export function setOngoingTask(task){
    if (!task) return;
    
    const displayMap = {
        "displayTaskName": task.name,
        "displayTag": task.tag,
        "displayPriority": task.priority,
        "displayStartDate": task.startDate,
        "displayStatus": task.status,
        // "displayTargetTime": task.targetDate
    };
    
    for (const [id, value] of Object.entries(displayMap)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    const activePanel = document.getElementById("activeTaskPanel");
    const noActivePanel = document.getElementById("noActiveTaskPanel");
    
    if (activePanel) {
        activePanel.classList.remove("hidden");
    }
    
    if (noActivePanel) {
        noActivePanel.classList.add("hidden");
    }
}

export function clearOngoingTaskDisplay(){
    const displayElements = [
        "displayTaskName", 
        "displayTag", 
        "displayPriority", 
        "displayStartDate", 
        "displayStatus"
    ];
    
    displayElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = " -- ";
        }
    });

    const activePanel = document.getElementById("activeTaskPanel");
    const noActivePanel = document.getElementById("noActiveTaskPanel");
    
    if (activePanel) {
        activePanel.classList.add("hidden");
    }
    
    if (noActivePanel) {
        noActivePanel.classList.remove("hidden");
    }
}

export function updateDashboardStatus(){
    const status = taskService.getDashboardStatus();

    const timeElement = document.querySelectorAll('#time-total');
    const pausedElement = document.querySelectorAll('#paused-count');
    const completedElement = document.querySelectorAll('#completed-count');
    const totalElement = document.querySelectorAll('#total-count');

    timeElement.forEach(el => {
        if(el) el.textContent = status.totalTimeFormatted; 

    });

    pausedElement.forEach(el => {
        if(el) el.textContent = status.pausedCount;
    });

    completedElement.forEach(el => {
        if(el) el.textContent = status.completedCount;
    });

    totalElement.forEach(el => {
        if(el) el.textContent = status.totalCount;
    });
}